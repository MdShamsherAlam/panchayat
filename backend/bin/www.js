#!/usr/bin/env node
require('dotenv').config();

const http = require('http');
const debug = require('debug')('panchayat:server');
const app = require('../app');
const initSocket = require('../socket');

const PORT = normalizePort(process.env.PORT || '3000');
app.set('port', PORT);

const server = http.createServer(app);
initSocket(server);

// Track sockets for graceful shutdown
const sockets = new Set();
server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
});

server.listen(PORT);
server.on('error', onError);
server.on('listening', onListening);

// Graceful shutdown
const graceful = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });
    // Force close after 8s
    setTimeout(() => {
        for (const s of sockets) { try { s.destroy(); } catch { } }
        process.exit(0);
    }, 8000).unref();
};

process.on('SIGTERM', () => graceful('SIGTERM'));
process.on('SIGINT', () => graceful('SIGINT'));

function normalizePort(val) {
    const p = parseInt(val, 10);
    if (Number.isNaN(p)) return val;
    if (p >= 0) return p;
    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') throw error;
    const bind = typeof PORT === 'string' ? `Pipe ${PORT}` : `Port ${PORT}`;
    if (error.code === 'EACCES') {
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
    } else if (error.code === 'EADDRINUSE') {
        console.error(`${bind} is already in use`);
        process.exit(1);
    } else {
        throw error;
    }
}

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    console.log(`Server listening on ${bind} [${process.env.NODE_ENV || 'development'}]`);
    debug(`Listening on ${bind}`);
}
