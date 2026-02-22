const BaseService = require('./BaseService');
const { sequelize } = require('../../config/db');

class ExampleService extends BaseService {
    async getHomepageData() {
        // Example of raw query as requested (sequelize.query)
        // In a real app, you would have a 'settings' or 'hero' table
        const result = await sequelize.query(
            'SELECT "Welcome to Panchayat" as title, "Connecting communities together." as description',
            { type: sequelize.QueryTypes.SELECT }
        );
        return result[0];
    }
}

module.exports = ExampleService;
