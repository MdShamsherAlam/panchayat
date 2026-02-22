const ComplaintService = require('../../service/v1/ComplaintService');
const statusCodes = require('../../utils/status-codes');

// ── Submit ─────────────────────────────────────────────────────────────────────
const submitComplaint = async (req, res, next) => {
    try {
        const svc = new ComplaintService();
        const data = await svc.submitComplaint(req.user.id, req.body, req.files);
        res.status(statusCodes.CREATED).json({ success: true, data, message: 'Complaint submitted' });
    } catch (error) { next(error); }
};

// ── Track ──────────────────────────────────────────────────────────────────────
const getComplaint = async (req, res, next) => {
    try {
        const svc = new ComplaintService();
        const data = await svc.getComplaintByTrackingId(req.params.trackingId);
        if (!data) return res.status(statusCodes.NOT_FOUND).json({ success: false, message: 'Complaint not found' });
        res.status(statusCodes.SUCCESS).json({ success: true, data });
    } catch (error) { next(error); }
};

// ── Ward List ─────────────────────────────────────────────────────────────────
const getWardComplaints = async (req, res, next) => {
    try {
        const svc = new ComplaintService();
        // official: filter by their ward; admin: optional ?wardNo query param
        const wardNo = req.user.role === 'admin'
            ? (req.query.wardNo || undefined)
            : req.user.wardNo;
        const data = await svc.getWardComplaints(wardNo);
        res.status(statusCodes.SUCCESS).json({ success: true, data });
    } catch (error) { next(error); }
};

// ── Status Update ─────────────────────────────────────────────────────────────
const updateStatus = async (req, res, next) => {
    try {
        const { status, comment } = req.body;
        const svc = new ComplaintService();
        const data = await svc.updateStatus(req.params.id, req.user.id, status, comment, req.files);
        res.status(statusCodes.SUCCESS).json({ success: true, data, message: 'Status updated' });
    } catch (error) { next(error); }
};

// ── Assign Field Staff ────────────────────────────────────────────────────────
const assignStaff = async (req, res, next) => {
    try {
        const { staffName } = req.body;
        if (!staffName) return res.status(400).json({ success: false, message: 'staffName is required' });
        const svc = new ComplaintService();
        const data = await svc.assignStaff(req.params.id, req.user.id, staffName);
        res.status(statusCodes.SUCCESS).json({ success: true, data, message: 'Staff assigned' });
    } catch (error) { next(error); }
};

// ── Escalate ──────────────────────────────────────────────────────────────────
const escalateComplaint = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const svc = new ComplaintService();
        const data = await svc.escalateComplaint(req.params.id, req.user.id, reason);
        res.status(statusCodes.SUCCESS).json({ success: true, data, message: 'Escalated' });
    } catch (error) { next(error); }
};

// ── Citizen Review (Phase 6) ──────────────────────────────────────────────────
const reviewResolution = async (req, res, next) => {
    try {
        const { action, reason } = req.body;
        const svc = new ComplaintService();
        const data = await svc.reviewResolution(req.params.trackingId, req.user.id, action, reason);
        const msg = action === 'accept' ? 'Shikayat Closed ho gayi' : 'Shikayat Reopen ho gayi';
        res.status(statusCodes.SUCCESS).json({ success: true, data, message: msg });
    } catch (error) { next(error); }
};

// ── Analytics ─────────────────────────────────────────────────────────────────
const getAnalytics = async (req, res, next) => {
    try {
        const svc = new ComplaintService();
        const data = await svc.getAnalytics();
        res.status(statusCodes.SUCCESS).json({ success: true, data });
    } catch (error) { next(error); }
};

module.exports = { submitComplaint, getComplaint, getWardComplaints, updateStatus, assignStaff, escalateComplaint, reviewResolution, getAnalytics };

