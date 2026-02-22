/**
 * socket.js — Socket.IO initializer
 * Real-time notifications for complaint status updates.
 */
const { Server } = require('socket.io');

module.exports = function initSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: { origin: '*', methods: ['GET', 'POST'] }
    });

    io.on('connection', (socket) => {
        // Citizen / Official joins their own room by userId
        socket.on('join', (userId) => {
            socket.join(`user:${userId}`);
        });
    });

    // Attach to app so controllers can emit events via req.app.get('io')
    httpServer._events?.request?.set?.('io', io);

    console.log('[Socket.IO] Real-time server initialized.');
    return io;
};
