const { Sequelize } = require('sequelize');
const cls = require('cls-hooked');
const namespace = cls.createNamespace('transaction-namespace');
Sequelize.useCLS(namespace);

const sequelize = new Sequelize(
  process.env.DB_NAME || 'panchayat_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (msg, duration) => {
      if (duration > (process.env.SLOW_QUERY_THRESHOLD || 500)) {
        console.warn(`[SLOW QUERY] ${duration}ms - ${msg}`);
      }
    },
    benchmark: true,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Override query to sanitize undefined values
const originalQuery = sequelize.query;
sequelize.query = function (sql, options = {}) {
  if (options.replacements) {
    Object.keys(options.replacements).forEach(key => {
      if (options.replacements[key] === undefined) {
        options.replacements[key] = null;
      }
    });
  }
  return originalQuery.apply(this, [sql, options]);
};

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Load ALL models in FK dependency order before sync
    const { Role, User } = require('../models/index');

    // Auto-create / alter tables to match current model definitions
    await sequelize.sync({ alter: true });
    console.log('All database tables synced successfully.');

    // ── Seed roles (idempotent) ────────────────────────────────────────────
    const roles = [
      { name: 'Administrator', slug: 'admin' },
      { name: 'Panchayat Official', slug: 'official' },
      { name: 'Citizen', slug: 'citizen' }
    ];
    for (const r of roles) {
      await Role.findOrCreate({ where: { slug: r.slug }, defaults: r });
    }
    console.log('Roles ready.');

    // ── Seed default admin (always sync password to .env) ─────────────────
    const bcrypt = require('bcryptjs');
    const adminRole = await Role.findOne({ where: { slug: 'admin' } });
    const adminEmail = 'admin@panchayat.gov.in';
    const adminPass = process.env.DEFAULT_ADMIN_PASSWORD || '123456';
    const hashedPass = await bcrypt.hash(adminPass, 10);

    const [adminUser, created] = await User.findOrCreate({
      where: { email: adminEmail },
      defaults: {
        name: process.env.DEFAULT_ADMIN_NAME || 'System Admin',
        email: adminEmail,
        password: hashedPass,
        roleId: adminRole.id
      }
    });
    // Always update password so it matches current .env (handles re-seed)
    if (!created) {
      await adminUser.update({ password: hashedPass, roleId: adminRole.id });
    }
    console.log(created ? `Default admin created: ${adminEmail}` : `Default admin password synced: ${adminEmail}`);


  } catch (error) {
    console.error('Unable to connect or sync the database:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB, namespace };
