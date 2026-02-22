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
    }
}, {
    tableName: 'complaints',
    timestamps: true,
});

Complaint.belongsTo(User, { as: 'citizen', foreignKey: 'citizenId' });
Complaint.belongsTo(User, { as: 'official', foreignKey: 'officialId' });

module.exports = Complaint;
