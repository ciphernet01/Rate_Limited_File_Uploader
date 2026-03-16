const express = require('express');
const authRoutes = require('./auth.routes');
const projectRoutes = require('./project.routes');
const uploadRoutes = require('./upload.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy'
  });
});

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
