const express = require('express');
const router = express.Router();
const exampleRoutes = require('./example');
const authRoutes = require('./auth');
const complaintRoutes = require('./complaint');

router.use('/example', exampleRoutes);
router.use('/auth', authRoutes);
router.use('/complaint', complaintRoutes);

module.exports = router;
