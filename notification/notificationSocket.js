const helper = require('./helper')
const {verifyToken} = require('../notification/tokenVerify')
const onlineUsers = new Map();
const notficationSocket = (io) => {

    io.use(async (socket, next) => {
        try {
            const { token } = socket.handshake.auth
            const { success, userId } = await verifyToken(token)
            socket.userId = userId
            next()
        } catch (error) {
            next(error)
        }
    })

    io.on('connection', async(socket)=>{
        onlineUsers.set(socket.userId, socket.id)
        console.log("online", onlineUsers)
        const pendingNotification = await helper.getPendingNotification(socket.userId)
        if(pendingNotification.length > 0) await helper.sendNotifications(socket, pendingNotification)

        socket.on('disconnect', () => {
            onlineUsers.delete(socket.userId)
            console.log("online ", onlineUsers)
        })
    })
}





module.exports = {notficationSocket, onlineUsers}