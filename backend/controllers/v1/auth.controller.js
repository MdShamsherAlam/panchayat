const AuthService = require('../../service/v1/AuthService');
const statusCodes = require('../../utils/status-codes');


const register = async (req, res, next) => {
    try {
        const authService = new AuthService();
        const token = await authService.register(req.body);
        res.status(statusCodes.CREATED).json({
            success: true,
            data: { token },
            message: 'User registered successfully'
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const authService = new AuthService();
        const token = await authService.login(email, password);
        res.status(statusCodes.SUCCESS).json({
            success: true,
            data: { token },
            message: 'Login successful'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { register, login };
