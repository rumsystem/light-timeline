const SocketIo = require('socket.io');

let io;

const init = (server) => {
  io = SocketIo(server, {
    cors: {
      origin: "*",
      methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
    }
  });
  io.on("connection", (socket) => {
    socket.on("disconnect", (reason) => {
      for (const [key, socketId] of Object.entries(userToSocketId)) {
        if (socketId === socket.id) {
          delete userToSocketId[key];
        }
      }
    });

    socket.on("authenticate", (data) => {
      const {
        groupId,
        userAddress
      } = data;
      if (!groupId) {
        socket.emit('authenticateResult', 'groupId is required');
      }
      if (!userAddress) {
        socket.emit('authenticateResult', 'userAddress is required');
      }
      userToSocketId[groupId + userAddress] = socket.id;
      socket.join(groupId);
      socket.emit('authenticateResult', 'socket connected');
    });
  });
}

const userToSocketId = {};

const trySendSocket = async (groupId, userAddress, event, data) => {
  try {
    const socketId = userToSocketId[groupId + userAddress];
    if (socketId) {
      io.to(socketId).emit(event, data);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  init,
  getSocketIo: () => io,
  trySendSocket
};
