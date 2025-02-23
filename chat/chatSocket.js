const helper = require("./helper");
const {getSocketId, getName} = require('../notification/helper');
const chatType = require("../constants/chatType");
const Notification = require("../models/notification");
const {onlineUsers} = require('../notification/notificationSocket')

const chatSocket = (io, notificationIo)=>{
    io.on("connection", (socket)=>{
        console.log("a user connected");
        socket.emit("new", "new");

        socket.on("sendMessage", async (data, callback)=>{
            try{
                const newChat = await helper.saveTextMessage(data);
                io.to(data.room).emit("receiveMessage", newChat);
                const receiverSocketId = getSocketId(data.receiverId, onlineUsers);
                if(receiverSocketId){
                    const senderName = await getName(data.senderId);
                    notificationIo.to(receiverSocketId).emit("newNotification", {id:newChat._id,serviceRequest: data.room, sender: senderName, messageType: chatType.text});                    
                }else{
                    const senderName = await getName(data.senderId);
                    // saving notification to database if user is offline
                    const notification = new Notification({
                        userId: data.receiverId,
                        message: `You have a new message from ${senderName}`,
                        type: chatType.text,
                        senderName,
                        serviceRequest: data.room
                    })
                    notification.save();
                }
                callback({success:true, chat: newChat});

            }catch(err){
                console.log(err);
                callback({success:false, message: err.message});
            }
        })

        socket.on("quotationCreate", async (data, callback)=>{
            try{
                const newChat = await helper.saveQuotation(data);
                if(!newChat){
                    return callback({success:false, message: "Something went wrong"});
                }
                io.to(data.room).emit("receiveMessage", newChat);
                const receiverSocketId = getSocketId(data.receiverId, onlineUsers);
                if(receiverSocketId){
                    const senderName = await getName(data.senderId);
                    notificationIo.to(receiverSocketId).emit("newNotification", {id:newChat._id,serviceRequest: data.room, sender: senderName, messageType: chatType.quotation});                    
                }else{
                    const senderName = await getName(data.senderId);
                    // saving notification to database if user is offline
                    const notification = new Notification({
                        userId: data.receiverId,
                        message: `You have a new quotation from ${senderName}`,
                        serviceRequest: data.room,
                        type: chatType.quotation,
                        senderName,
                    })
                    notification.save();
                }
                callback({success:true, chat: newChat});
            }catch(err){
                console.log(err);
                callback({success:false, message: err.message});
            }
        })

        socket.on("joinRoom", (data)=>{
            socket.join(data.room);
            console.log("a user joined a room", data.room, data.name);
        })

        socket.on("disconnect", (data)=>{
            socket.leave(data.room);

            console.log("a user disconnected", data);
        })
    })
}


module.exports = chatSocket;