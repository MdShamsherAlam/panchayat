#!/usr/bin/env node
'use strict';
require('dotenv').config();

const http = require('http');
const app = require('../app');

const PORT = normalizePort(process.env.PORT || '3000');
app.set('port', PORT);

// ─── Start ─────────────────────────────────────────────────────────────────────
(async () => {
    // 1. Connect DB + sync all tables FIRST, then start HTTP server
    await app.connectDB();

    const server = http.createServer(app);

    // socket.io (graceful fallback if file missing)
    try {
        const initSocket = require('../socket');
        initSocket(server);
    } catch { /* socket.js is optional */ }

    // Track open sockets for graceful shutdown
    const sockets = new Set();
    server.on('connection', s => { sockets.add(s); s.on('close', () => sockets.delete(s)); });

    server.listen(PORT, () => {
        const env = process.env.NODE_ENV || 'development';
        console.log(`Server listening on port ${PORT} [${env.toUpperCase()}]`);

        // Phase 7: SLA background job (check every 5 mins)
        setInterval(async () => {
            try {
                const ComplaintService = require('../service/v1/ComplaintService');
                const svc = new ComplaintService();
                const count = await svc.checkAndEscalateSLA();
                if (count > 0) console.log(`[SLA] ${count} complaints auto-escalated.`);
            } catch (err) {
                console.error('[SLA Error]', err.message);
            }
        }, 5 * 60000);
    });

    server.on('error', (err) => {
        if (err.syscall !== 'listen') throw err;
        const bind = `Port ${PORT}`;
        if (err.code === 'EACCES') { console.error(`${bind} requires elevated privileges`); process.exit(1); }
        if (err.code === 'EADDRINUSE') { console.error(`${bind} is already in use`); process.exit(1); }
        throw err;
    });

    // Graceful shutdown
    const shutdown = (signal) => {
        console.log(`\n[${signal}] Shutting down gracefully...`);
        server.close(() => { console.log('HTTP server closed.'); process.exit(0); });
        setTimeout(() => { for (const s of sockets) { try { s.destroy(); } catch { } } process.exit(0); }, 8000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
})();

function normalizePort(val) {
    const p = parseInt(val, 10);
    if (Number.isNaN(p)) return val;
    return p >= 0 ? p : false;
}
