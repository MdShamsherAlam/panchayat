const express = require('express');
const router = express.Router();
const complaintController = require('../../../controllers/v1/complaint.controller');
const auth = require('../../../middleware/auth');
const upload = require('../../../middleware/upload');

// Citizen routes
router.post('/submit', auth(['citizen']), upload.array('photos', 5), complaintController.submitComplaint);
router.get('/track/:trackingId', complaintController.getComplaint);
router.patch('/track/:trackingId/review', auth(['citizen']), complaintController.reviewResolution);


// Official/Admin routes
router.get('/ward', auth(['official', 'admin']), complaintController.getWardComplaints);
router.patch('/:id/status', auth(['official', 'admin']), upload.array('photos', 5), complaintController.updateStatus);
router.patch('/:id/assign', auth(['official', 'admin']), complaintController.assignStaff);
router.patch('/:id/escalate', auth(['official', 'admin']), complaintController.escalateComplaint);

// Admin routes
router.get('/analytics', auth(['admin']), complaintController.getAnalytics);


module.exports = router;
