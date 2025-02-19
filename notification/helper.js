const User = require("../models/user");
// const {onlineUsers} = require("../notification/notificationSocket");
const Notification = require("../models/notification");


const getName = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.fullname;
    } catch (error) {
        console.log(error)
    }
}

const getSocketId = (userId, onlineUsers) => {
    const socketId = onlineUsers.get(userId)
    return socketId ? socketId : null
}

const getPendingNotification = async (userId) => {
    const notifications = await Notification.find({ userId: userId, isRead: false })
    return notifications
}

const sendNotifications = async (socket, notifications) => {

    // timeout function
    const withTimeOut = (onSuccess, onTimeout, time) => {
        let called = false;
        const timeout = setTimeout(() => {
            if (called) return
            called = true;
            onTimeout()
        }, time)

        return (...args) => {
            if (called) return
            called = true;
            clearTimeout(timeout)
            onSuccess(...args)
        }
    }

    notifications.forEach(async (notification) => {
        const onSuccess = async (success) => {
            if (success) {
                console.log("success")
                await Notification.findByIdAndUpdate(notification._id, { isRead: true }, { new: true })
            }
        }
        const onError = () => {
            console.log("error sending notification")
        }
        socket.emit("newNotification",
            { sender: notification.senderName, id: notification.id, messageType: notification.type, serviceRequest: notification.serviceRequest },
            withTimeOut(onSuccess, onError, 7000)
        )
    })
}


module.exports = {
    getName,
    getSocketId,
    getPendingNotification,
    sendNotifications
};