const uploadService = require('../services/upload.service');

async function uploadFile(req, res, next) {
  try {
    const result = uploadService.analyzeUploadedFile(req.file);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  uploadFile
};