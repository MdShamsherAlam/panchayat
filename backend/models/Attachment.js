const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Complaint = require('./Complaint');

const Attachment = sequelize.define('Attachment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    fileType: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    complaintId: {
        type: DataTypes.INTEGER,
        references: {
            model: Complaint,
            key: 'id',
        },
    }
}, {
    tableName: 'attachments',
    timestamps: true,
});

Complaint.hasMany(Attachment, { foreignKey: 'complaintId' });
Attachment.belongsTo(Complaint, { foreignKey: 'complaintId' });

module.exports = Attachment;
