const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const BaseService = require('./BaseService');
// Import via central index — all associations guaranteed
const { User, Role } = require('../../models/index');

// Helper: create an error with HTTP status code attached
function httpError(message, status) {
    const err = new Error(message);
    err.status = status;
    return err;
}

class AuthService extends BaseService {

    async register(userData) {
        const { name, email, password, roleSlug, wardNo } = userData;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) throw httpError('User already exists', 409);

        const role = await Role.findOne({ where: { slug: roleSlug } });
        if (!role) throw httpError('Invalid role selected', 400);

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            roleId: role.id,
            wardNo: roleSlug === 'citizen' ? (wardNo || null) : null
        });

        return this.generateToken(user, role.slug);
    }

    async login(email, password) {
        // Find user WITHOUT include to avoid association issues, then fetch role separately
        const user = await User.findOne({ where: { email } });
        if (!user) throw httpError('Invalid email or password', 401);

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw httpError('Invalid email or password', 401);

        // Fetch role separately (safe, no include needed)
        const role = await Role.findByPk(user.roleId);
        if (!role) throw httpError('User role not found', 500);

        return this.generateToken(user, role.slug);
    }

    generateToken(user, roleSlug) {
        const payload = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: roleSlug,
            wardNo: user.wardNo
        };
        return jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '24h' }
        );
    }
}

module.exports = AuthService;
