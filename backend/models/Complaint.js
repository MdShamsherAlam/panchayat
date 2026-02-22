const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Complaint = sequelize.define('Complaint', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    trackingId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    geoTag: {
        type: DataTypes.JSON, // { lat: number, lng: number }
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('Open', 'In Progress', 'Resolved', 'Closed'),
        defaultValue: 'Open',
    },
    wardNo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    citizenId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id',
        },
    },
    officialId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: User,
            key: 'id',
        },
    },
    slaDeadline: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    isEscalated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    escalatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // Field staff assignment
    assignedStaff: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Name/contact of field worker assigned to this complaint',
    },
    priority: {
        type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
        defaultValue: 'Medium',
    },

}, {
    tableName: 'complaints',
    timestamps: true,
});

module.exports = Complaint;
