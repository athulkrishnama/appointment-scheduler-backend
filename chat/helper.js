const Chat = require("../models/chat");
const Quotation = require("../models/Quotations");
const types = require("../constants/chatType");
const sender = require("../constants/sender");
const saveTextMessage = async (data) => {
    try {
        const chat = await new Chat({
            messageType: types.text,
            message: data.message,
            serviceRequest: data.room,
            sender: data.sender === "client" ? sender.client : sender.serviceProvider,
            senderId: data.senderId,
            receiverId: data.receiverId
        })
        const newChat = await chat.save();
        return newChat;
    } catch (err) {
        console.log(err);
    }
}

const saveQuotation = async (data) => {
    try {
        const quotation = await new Quotation({
            serviceRequest: data.room,
            amountBreakdown: data.amountBreakdown
        })
        const newQuotation = await quotation.save();
        if(!newQuotation){
            return null;
        }
        const chat = await new Chat({
            messageType: types.quotation,
            message: newQuotation._id,
            serviceRequest: data.room,
            sender: data.sender === "client" ? sender.client : sender.serviceProvider,
            senderId: data.senderId,
            receiverId: data.receiverId
        })
        const newChat = await chat.save();
        
        newChat.message = newQuotation;
        return newChat;
    } catch (err) {
        console.log(err);
    }
}
module.exports = {
    saveTextMessage,
    saveQuotation
}