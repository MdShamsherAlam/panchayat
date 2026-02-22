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
      // Integration with performance monitoring
      if (duration > (process.env.SLOW_QUERY_THRESHOLD || 100)) {
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
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, connectDB, namespace };
