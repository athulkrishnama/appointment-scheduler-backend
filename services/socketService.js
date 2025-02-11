const chatSocket = require("../chat/chatSocket");
const {instrument} = require('@socket.io/admin-ui')
const origins = require("../constants/origins");

const initializeSocket = (server) => {
    const io = require("socket.io")(server, {
        cors: {
            origin:[ origins.client, origins.service, origins.admin, origins.socket],
            credentials: true,
        },
    });

    chatSocket(io);
    instrument(io, {
        auth: {
            type:"basic",
            username:process.env.SOCKET_USERNAME,
            password:process.env.SOCKET_PASSWORD
        },
        // namespacename:"/socket"
        mode:'development',
    })
    
    return io;
}

module.exports = initializeSocket;