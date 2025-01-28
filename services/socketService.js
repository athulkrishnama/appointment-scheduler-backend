const chatSocket = require("../chat/chatSocket");

const initializeSocket = (server) => {
    const io = require("socket.io")(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    chatSocket(io);
    return io;
}

module.exports = initializeSocket;