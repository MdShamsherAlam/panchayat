require('dotenv').config();
const { sequelize } = require('./config/db');
const Role = require('./models/Role');
const User = require('./models/User');
const bcrypt = require('bcryptjs');


const seed = async () => {
    try {
        await sequelize.sync({ force: false }); // Don't drop existing data

        const roles = [
            { name: 'Administrator', slug: 'admin' },
            { name: 'Panchayat Official', slug: 'official' },
            { name: 'Citizen', slug: 'citizen' }
        ];

        for (const roleData of roles) {
            await Role.findOrCreate({
                where: { slug: roleData.slug },
                defaults: roleData
            });
        }

        console.log('Roles seeded.');

        const adminRole = await Role.findOne({ where: { slug: 'admin' } });
        const adminEmail = 'admin@panchayat.gov.in';
        const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

        const [adminUser, created] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                name: process.env.DEFAULT_ADMIN_NAME || 'System Admin',
                email: adminEmail,
                password: await bcrypt.hash(adminPassword, 10),
                roleId: adminRole.id
            }
        });

        if (created) {
            console.log('Default admin created:', adminEmail);
        } else {
            console.log('Admin already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed (non-fatal):', error.message);
        process.exit(0); // Non-fatal: continue even if seeding fails (e.g., already seeded)
    }
};

seed();
