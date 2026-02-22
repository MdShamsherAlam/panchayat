const { sequelize } = require('../../config/db');


const ExampleService = require('../../service/v1/ExampleService');

const exampleMethod = async (req, res, next) => {
    try {
        let data = [];
        await sequelize.transaction(async (t1) => {
            const service = new ExampleService();
            data = await service.getHomepageData();
        });
        return data;
    } catch (error) {
        next(error);
    }
};

module.exports = { exampleMethod };
