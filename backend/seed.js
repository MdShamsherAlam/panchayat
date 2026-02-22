require('dotenv').config();
const { sequelize } = require('./config/db');

// Load ALL models in FK dependency order before sync
const { Role, User, Complaint, Attachment, History } = require('./models/index');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        // Sync all tables (create if not exist, no data loss)
        await sequelize.sync({ alter: true });
        console.log('[SEED] All tables synced.');

        // ── Roles ──────────────────────────────────────────────────────────────
        const roles = [
            { name: 'Administrator', slug: 'admin' },
            { name: 'Panchayat Official', slug: 'official' },
            { name: 'Citizen', slug: 'citizen' }
        ];
        for (const roleData of roles) {
            await Role.findOrCreate({ where: { slug: roleData.slug }, defaults: roleData });
        }
        console.log('[SEED] Roles seeded.');

        // ── Default Admin ──────────────────────────────────────────────────────
        const adminRole = await Role.findOne({ where: { slug: 'admin' } });
        const adminEmail = 'admin@panchayat.gov.in';
        const DEFAULT_PASS = process.env.DEFAULT_ADMIN_PASSWORD || '123456';

        const [, created] = await User.findOrCreate({
            where: { email: adminEmail },
            defaults: {
                name: process.env.DEFAULT_ADMIN_NAME || 'System Admin',
                email: adminEmail,
                password: await bcrypt.hash(adminPassword, 10),
                roleId: adminRole.id
            }
        });

        console.log(created ? `[SEED] Admin created: ${adminEmail}` : '[SEED] Admin already exists.');
        process.exit(0);
    } catch (error) {
        console.error('[SEED] Seeding failed:', error.message);
        process.exit(0); // non-fatal — DB may already be seeded
    }
};

seed();
