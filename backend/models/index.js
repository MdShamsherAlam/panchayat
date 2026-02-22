/**
 * models/index.js
 * Central model loader — imports all models in FK dependency order
 * and defines ALL cross-model associations in one place.
 */

// ── 1. No FKs ─────────────────────────────────────────────────────────────────
const Role = require('./Role');

// ── 2. Depends on Role ────────────────────────────────────────────────────────
const User = require('./User');

// ── 3. Depends on User ───────────────────────────────────────────────────────
const Complaint = require('./Complaint');

// ── 4. Depends on Complaint + User ────────────────────────────────────────────
const Attachment = require('./Attachment');
const History = require('./History');

// ═══════════════════ ASSOCIATIONS ═════════════════════════════════════════════

// Role ↔ User
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

// User ↔ Complaint
User.hasMany(Complaint, { foreignKey: 'citizenId', as: 'citizenComplaints' });
User.hasMany(Complaint, { foreignKey: 'officialId', as: 'officialComplaints' });
Complaint.belongsTo(User, { as: 'citizen', foreignKey: 'citizenId' });
Complaint.belongsTo(User, { as: 'official', foreignKey: 'officialId' });

// Complaint ↔ Attachment
Complaint.hasMany(Attachment, { foreignKey: 'complaintId' });
Attachment.belongsTo(Complaint, { foreignKey: 'complaintId' });

// Complaint ↔ History
Complaint.hasMany(History, { foreignKey: 'complaintId' });
History.belongsTo(Complaint, { foreignKey: 'complaintId' });

// History ↔ User (performedBy) — THIS WAS MISSING
History.belongsTo(User, { as: 'performedBy', foreignKey: 'performedById' });
User.hasMany(History, { as: 'actions', foreignKey: 'performedById' });

module.exports = { Role, User, Complaint, Attachment, History };
