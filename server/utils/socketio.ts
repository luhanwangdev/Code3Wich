import { Server, Socket } from 'socket.io';

export const userSocketMap: Record<string, string> = {};

export const socketIo = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    socket.on('register', (user, callback) => {
      userSocketMap[user] = socket.id;
      callback('success');
    });

    socket.on('projectStatus', (data) => {
      socket.broadcast.emit('projectStatus', data);
    });
  });
};
