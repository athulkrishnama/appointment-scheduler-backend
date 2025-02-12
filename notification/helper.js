const User = require("../models/user");
const {onlineUsers} = require("../notification/notificationSocket");


const getName = async (userId) => {
    try{
        const user = await User.findById(userId);
        return user.fullname;
    }catch(error){
        console.log(error)
    }
}

const getSocketId = (userId)=>{
    const socketId = onlineUsers.get(userId)
    return socketId ? socketId : null
}

module.exports = {
  getName,
  getSocketId,
};