const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Complaint = require('./Complaint');
const User = require('./User');

const History = sequelize.define('History', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    event: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    previousStatus: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    newStatus: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    complaintId: {
        type: DataTypes.INTEGER,
        references: {
            model: Complaint,
            key: 'id',
        },
    },
    performedById: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
    }
}, {
    tableName: 'history',
    timestamps: true,
});

module.exports = History;
