require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const statusCodes = require('./utils/status-codes');
const { connectDB } = require('./config/db');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Request Correlation
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Panchayat API', status: 'ok' });
});

// ─── Routes (mounted AFTER db sync in www.js) ─────────────────────────────────
const v1Routes = require('./routes/v1');
app.use('/api/v1', v1Routes);

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || statusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message || 'Internal Server Error',
        requestId: req.requestId
    });
});

// ─── DB Init + Export ──────────────────────────────────────────────────────────
// connectDB is called from bin/www.js BEFORE server.listen()
// so all tables are guaranteed to exist at boot.
app.connectDB = connectDB;

module.exports = app;
