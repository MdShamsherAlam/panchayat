const BaseService = require('./BaseService');
const Complaint = require('../../models/Complaint');
const Attachment = require('../../models/Attachment');
const History = require('../../models/History');
const User = require('../../models/User');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

class ComplaintService extends BaseService {
    async submitComplaint(citizenId, complaintData, files) {
        const { title, description, geoTag, wardNo } = complaintData;

        // SLA: 7 days from now
        const slaDeadline = new Date();
        slaDeadline.setDate(slaDeadline.getDate() + 7);

        const trackingId = `COMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const complaint = await Complaint.create({
            trackingId,
            title,
            description,
            geoTag: typeof geoTag === 'string' ? JSON.parse(geoTag) : geoTag,
            wardNo,
            citizenId,
            slaDeadline
        });

        if (files && files.length > 0) {
            const attachments = files.map(file => ({
                url: `/uploads/${file.filename}`,
                filename: file.filename,
                fileType: file.mimetype,
                complaintId: complaint.id
            }));
            await Attachment.bulkCreate(attachments);
        }

        await History.create({
            event: 'Complaint Submitted',
            complaintId: complaint.id,
            performedById: citizenId,
            newStatus: 'Open'
        });

        return complaint;
    }

    async getComplaintByTrackingId(trackingId) {
        return await Complaint.findOne({
            where: { trackingId },
            include: [
                { model: Attachment },
                { model: History, include: [{ model: User, attributes: ['name', 'email'] }] }
            ]
        });
    }

    async getWardComplaints(wardNo) {
        return await Complaint.findAll({
            where: { wardNo },
            include: [{ model: Attachment }],
            order: [['createdAt', 'DESC']]
        });
    }

    async updateStatus(complaintId, officialId, newStatus, comment) {
        const complaint = await Complaint.findByPk(complaintId);
        if (!complaint) throw new Error('Complaint not found');

        const previousStatus = complaint.status;
        complaint.status = newStatus;
        complaint.officialId = officialId;
        await complaint.save();

        await History.create({
            event: `Status updated to ${newStatus}`,
            comment,
            previousStatus,
            newStatus,
            complaintId,
            performedById: officialId
        });

        return complaint;
    }

    async getAnalytics() {
        const stats = await Complaint.findAll({
            attributes: [
                [Complaint.sequelize.fn('COUNT', Complaint.sequelize.col('id')), 'total'],
                'status'
            ],
            group: ['status']
        });

        const escalatedCount = await Complaint.count({ where: { isEscalated: true } });

        return { stats, escalatedCount };
    }

    async checkAndEscalateSLA() {
        const now = new Date();
        const breechedComplaints = await Complaint.findAll({
            where: {
                status: { [Op.notIn]: ['Resolved', 'Closed'] },
                slaDeadline: { [Op.lt]: now },
                isEscalated: false
            }
        });

        for (const complaint of breechedComplaints) {
            complaint.isEscalated = true;
            complaint.escalatedAt = now;
            await complaint.save();

            await History.create({
                event: 'SLA Breached - Auto Escalated',
                complaintId: complaint.id,
                performedById: null // System
            });
        }

        return breechedComplaints.length;
    }
}

module.exports = ComplaintService;
