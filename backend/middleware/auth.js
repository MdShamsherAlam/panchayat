const jwt = require('jsonwebtoken');
const statusCodes = require('../utils/status-codes');

const auth = (roles = []) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(statusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
            req.user = decoded;

            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(statusCodes.FORBIDDEN).json({
                    success: false,
                    message: 'Access denied. Insufficient permissions.',
                });
            }

            next();
        } catch (ex) {
            res.status(statusCodes.BAD_REQUEST).json({
                success: false,
                message: 'Invalid token.',
            });
        }
    };
};

module.exports = auth;
