const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const BaseService = require('./BaseService');
const User = require('../../models/User');
const Role = require('../../models/Role');

class AuthService extends BaseService {
    async register(userData) {
        const { name, email, password, roleSlug, wardNo } = userData;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw new Error('User already exists');
        }

        const role = await Role.findOne({ where: { slug: roleSlug } });
        if (!role) {
            throw new Error('Invalid role');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            roleId: role.id,
            wardNo: roleSlug === 'citizen' ? wardNo : null
        });

        return this.generateToken(user, role.slug);
    }

    async login(email, password) {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role }]
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            throw new Error('Invalid email or password');
        }

        return this.generateToken(user, user.Role.slug);
    }

    generateToken(user, roleSlug) {
        const payload = {
            id: user.id,
            email: user.email,
            role: roleSlug,
            wardNo: user.wardNo
        };

        return jwt.sign(payload, process.env.JWT_SECRET || 'secret_key', {
            expiresIn: '24h'
        });
    }
}

module.exports = AuthService;
