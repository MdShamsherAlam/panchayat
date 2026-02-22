const express = require('express');
const router = express.Router();
const dispatcher = require('../../../middleware/dispatcher');
const { exampleMethod } = require('../../../controllers/v1/example.controller');

// Naming Convention: router.post("/save", (req, res, next) => dispatcher(req, res, next, save));
router.get('/test', (req, res, next) => dispatcher(req, res, next, exampleMethod));

module.exports = router;
