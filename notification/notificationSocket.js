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

    io.on('connection', (socket)=>{
        onlineUsers.set(socket.userId, socket.id)
        console.log("online ", onlineUsers)

        socket.on('disconnect', () => {
            onlineUsers.delete(socket.userId)
            console.log("online ", onlineUsers)
        })
    })
}





module.exports = {notficationSocket, onlineUsers}