const BaseService = require('./BaseService');
const Complaint = require('../../models/Complaint');
const Attachment = require('../../models/Attachment');
const History = require('../../models/History');
const User = require('../../models/User');
const Role = require('../../models/Role');
const { Op, fn, col, literal } = require('sequelize');

class ComplaintService extends BaseService {

    // ── Submit (Phase 2 + 3: auto-assign officer) ──────────────────────────────
    async submitComplaint(citizenId, complaintData, files) {
        const { title, description, geoTag, wardNo, priority } = complaintData;

        const slaDeadline = new Date();
        slaDeadline.setDate(slaDeadline.getDate() + 7);
        const trackingId = `COMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Phase 3: Auto-assign — find an official for this ward
        let autoOfficialId = null;
        try {
            const officialRole = await Role.findOne({ where: { slug: 'official' } });
            if (officialRole) {
                const official = await User.findOne({
                    where: { roleId: officialRole.id, wardNo }
                });
                autoOfficialId = official ? official.id : null;
            }
        } catch { /* auto-assign is best-effort, don't fail the submit */ }

        const complaint = await Complaint.create({
            trackingId,
            title,
            description,
            geoTag: typeof geoTag === 'string' ? JSON.parse(geoTag) : (geoTag || null),
            wardNo,
            priority: priority || 'Medium',
            citizenId,
            officialId: autoOfficialId,
            slaDeadline,
            status: 'Open'
        });

        if (files && files.length > 0) {
            await Attachment.bulkCreate(files.map(f => ({
                url: `/uploads/${f.filename}`,
                filename: f.filename,
                fileType: f.mimetype,
                complaintId: complaint.id
            })));
        }

        const autoAssignMsg = autoOfficialId ? ' — Officer auto-assigned' : '';
        await History.create({
            event: `Shikayat Darj Ki Gayi${autoAssignMsg}`,
            newStatus: 'Open',
            complaintId: complaint.id,
            performedById: citizenId
        });

        return complaint;
    }

    // ── Track (public) ────────────────────────────────────────────────────────
    async getComplaintByTrackingId(trackingId) {
        return Complaint.findOne({
            where: { trackingId },
            include: [
                { model: Attachment },
                {
                    model: History,
                    include: [{ model: User, as: 'performedBy', attributes: ['name', 'email'] }]
                },
                { model: User, as: 'citizen', attributes: ['name', 'wardNo'] },
                { model: User, as: 'official', attributes: ['name', 'email'], required: false }
            ],
            order: [[History, 'createdAt', 'ASC']]
        });
    }

    // ── Ward list for Officials ───────────────────────────────────────────────
    async getWardComplaints(wardNo) {
        const where = wardNo ? { wardNo } : {};
        return Complaint.findAll({
            where,
            include: [
                { model: Attachment },
                { model: User, as: 'citizen', attributes: ['name', 'email', 'wardNo'] },
                { model: User, as: 'official', attributes: ['name', 'email'], required: false }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    // ── Status Update (Phase 4/5: supports resolution photo) ──────────────────
    async updateStatus(complaintId, officialId, newStatus, comment, files) {
        const complaint = await Complaint.findByPk(complaintId);
        if (!complaint) throw Object.assign(new Error('Complaint not found'), { status: 404 });

        const previousStatus = complaint.status;
        complaint.status = newStatus;
        complaint.officialId = officialId;
        await complaint.save();

        if (files && files.length > 0) {
            await Attachment.bulkCreate(files.map(f => ({
                url: `/uploads/${f.filename}`,
                filename: f.filename,
                fileType: f.mimetype,
                complaintId: complaint.id,
                // Add a comment or flag if we had a resolution flag in model, 
                // but for now we link it to the complaint
            })));
        }

        await History.create({
            event: `Status badla: ${previousStatus} → ${newStatus}${files?.length ? ' (Resolution photos uploaded)' : ''}`,
            comment,
            previousStatus,
            newStatus,
            complaintId,
            performedById: officialId
        });

        return complaint;
    }

    // ── Assign Field Staff (Phase 4) ──────────────────────────────────────────
    async assignStaff(complaintId, officialId, staffName) {
        const complaint = await Complaint.findByPk(complaintId);
        if (!complaint) throw Object.assign(new Error('Complaint not found'), { status: 404 });

        const prev = complaint.status;
        complaint.assignedStaff = staffName;
        complaint.officialId = officialId;
        if (complaint.status === 'Open') complaint.status = 'In Progress';
        await complaint.save();

        await History.create({
            event: `Field Staff Assigned: ${staffName}`,
            previousStatus: prev,
            newStatus: complaint.status,
            complaintId,
            performedById: officialId
        });

        return complaint;
    }

    // ── Manual Escalate ───────────────────────────────────────────────────────
    async escalateComplaint(complaintId, officialId, reason) {
        const complaint = await Complaint.findByPk(complaintId);
        if (!complaint) throw Object.assign(new Error('Complaint not found'), { status: 404 });

        complaint.isEscalated = true;
        complaint.escalatedAt = new Date();
        await complaint.save();

        await History.create({
            event: `Escalate Kiya Gaya: ${reason || 'Urgent attention needed'}`,
            complaintId,
            performedById: officialId
        });

        return complaint;
    }

    // ── Phase 6: Citizen Accept (Close) or Reject (Reopen) ───────────────────
    async reviewResolution(trackingId, citizenId, action, reason) {
        const complaint = await Complaint.findOne({ where: { trackingId, citizenId } });
        if (!complaint) throw Object.assign(new Error('Complaint not found or not yours'), { status: 404 });
        if (complaint.status !== 'Resolved')
            throw Object.assign(new Error('Complaint is not in Resolved state yet'), { status: 400 });

        if (action === 'accept') {
            complaint.status = 'Closed';
            await complaint.save();
            await History.create({
                event: 'Nagarik ne Samadhan Swikar Kiya — Closed',
                previousStatus: 'Resolved',
                newStatus: 'Closed',
                complaintId: complaint.id,
                performedById: citizenId
            });
        } else if (action === 'reject') {
            complaint.status = 'Open';
            complaint.isEscalated = true;
            complaint.escalatedAt = new Date();
            await complaint.save();
            await History.create({
                event: `Nagarik ne Reject Kiya — Reopen: ${reason || 'Issue not resolved'}`,
                previousStatus: 'Resolved',
                newStatus: 'Open',
                complaintId: complaint.id,
                performedById: citizenId
            });
        } else {
            throw Object.assign(new Error('Invalid action — use accept or reject'), { status: 400 });
        }

        return complaint;
    }

    // ── Phase 9 + 10: Enhanced Analytics ─────────────────────────────────────
    async getAnalytics() {
        // Status breakdown
        const stats = await Complaint.findAll({
            attributes: [
                'status',
                [fn('COUNT', col('id')), 'total']
            ],
            group: ['status'],
            raw: true
        });

        // Ward-wise complaint density
        const wardStats = await Complaint.findAll({
            attributes: [
                'wardNo',
                [fn('COUNT', col('id')), 'total'],
                [fn('SUM', literal("CASE WHEN status IN ('Resolved','Closed') THEN 1 ELSE 0 END")), 'resolved'],
                [fn('SUM', literal("CASE WHEN isEscalated = 1 THEN 1 ELSE 0 END")), 'escalated']
            ],
            group: ['wardNo'],
            order: [[fn('COUNT', col('id')), 'DESC']],
            raw: true
        });

        // Escalated count
        const escalatedCount = await Complaint.count({ where: { isEscalated: true } });

        // Average resolution time (in hours) — for resolved/closed
        const avgResolutionRaw = await Complaint.findAll({
            attributes: [
                [fn('AVG', literal('TIMESTAMPDIFF(HOUR, createdAt, updatedAt)')), 'avgHours']
            ],
            where: { status: { [Op.in]: ['Resolved', 'Closed'] } },
            raw: true
        });
        const avgResolutionHours = Math.round(parseFloat(avgResolutionRaw[0]?.avgHours || 0));

        // Officer performance (count resolved by each official)
        const officerPerformance = await Complaint.findAll({
            attributes: [
                'officialId',
                [fn('COUNT', col('Complaint.id')), 'total'],
                [fn('SUM', literal("CASE WHEN status IN ('Resolved','Closed') THEN 1 ELSE 0 END")), 'resolved']
            ],
            include: [{ model: User, as: 'official', attributes: ['name', 'email'], required: true }],
            group: ['officialId', 'official.id'],
            order: [[fn('COUNT', col('Complaint.id')), 'DESC']],
            limit: 10
        });

        // Total counts
        const total = await Complaint.count();
        const resolved = await Complaint.count({ where: { status: { [Op.in]: ['Resolved', 'Closed'] } } });
        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        return {
            stats,
            wardStats,
            officerPerformance,
            escalatedCount,
            avgResolutionHours,
            total,
            resolved,
            resolutionRate
        };
    }

    // ── Auto-Escalate SLA (called externally if needed) ───────────────────────
    async checkAndEscalateSLA() {
        const now = new Date();
        const breached = await Complaint.findAll({
            where: {
                status: { [Op.notIn]: ['Resolved', 'Closed'] },
                slaDeadline: { [Op.lt]: now },
                isEscalated: false
            }
        });
        for (const c of breached) {
            c.isEscalated = true;
            c.escalatedAt = now;
            await c.save();
            await History.create({
                event: 'SLA Deadline Exceed — Auto Escalated',
                complaintId: c.id,
                performedById: null
            });
        }
        return breached.length;
    }
}

module.exports = ComplaintService;
