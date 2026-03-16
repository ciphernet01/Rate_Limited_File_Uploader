const express = require('express');
const uploadController = require('../controllers/upload.controller');
const uploadRateLimiter = require('../middlewares/uploadRateLimiter');
const uploadParser = require('../middlewares/uploadParser');

const router = express.Router();

router.post('/', uploadRateLimiter, uploadParser.single('file'), uploadController.uploadFile);

module.exports = router;