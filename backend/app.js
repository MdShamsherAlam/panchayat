require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const statusCodes = require('./utils/status-codes');
const { connectDB } = require('./config/db');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Request Correlation (Observability)
app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || `req-${Date.now()}`;
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
});

// Database Connection
connectDB();

// Routes
const v1Routes = require('./routes/v1');
app.use('/api/v1', v1Routes);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Panchayat API' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || statusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message || 'Internal Server Error',
        requestId: req.requestId
    });
});

module.exports = app;
