const ComplaintService = require('../../service/v1/ComplaintService');
const statusCodes = require('../../utils/status-codes');


const submitComplaint = async (req, res, next) => {
    try {
        const complaintService = new ComplaintService();
        const data = await complaintService.submitComplaint(req.user.id, req.body, req.files);
        res.status(statusCodes.CREATED).json({
            success: true,
            data,
            message: 'Complaint submitted successfully'
        });
    } catch (error) {
        next(error);
    }
};

const getComplaint = async (req, res, next) => {
    try {
        const { trackingId } = req.params;
        const complaintService = new ComplaintService();
        const data = await complaintService.getComplaintByTrackingId(trackingId);
        if (!data) {
            return res.status(statusCodes.NOT_FOUND).json({
                success: false,
                message: 'Complaint not found'
            });
        }
        res.status(statusCodes.SUCCESS).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

const getWardComplaints = async (req, res, next) => {
    try {
        const { wardNo } = req.user;
        const complaintService = new ComplaintService();
        const data = await complaintService.getWardComplaints(wardNo);
        res.status(statusCodes.SUCCESS).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;
        const complaintService = new ComplaintService();
        const data = await complaintService.updateStatus(id, req.user.id, status, comment);
        res.status(statusCodes.SUCCESS).json({
            success: true,
            data,
            message: 'Status updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

const getAnalytics = async (req, res, next) => {
    try {
        const complaintService = new ComplaintService();
        const data = await complaintService.getAnalytics();
        res.status(statusCodes.SUCCESS).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { submitComplaint, getComplaint, getWardComplaints, updateStatus, getAnalytics };
