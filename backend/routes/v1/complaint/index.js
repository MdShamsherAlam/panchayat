const express = require('express');
const router = express.Router();
const complaintController = require('../../../controllers/v1/complaint.controller');
const auth = require('../../../middleware/auth');
const upload = require('../../../middleware/upload');

// Citizen routes
router.post('/submit', auth(['citizen']), upload.array('photos', 5), complaintController.submitComplaint);
router.get('/track/:trackingId', complaintController.getComplaint);

// Official/Admin routes
router.get('/ward', auth(['official']), complaintController.getWardComplaints);
router.patch('/:id/status', auth(['official']), complaintController.updateStatus);

// Admin routes
router.get('/analytics', auth(['admin']), complaintController.getAnalytics);

module.exports = router;
