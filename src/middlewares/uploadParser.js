const path = require('path');
const multer = require('multer');
const AppError = require('../utils/appError');

const allowedExtensions = new Set(['.txt', '.csv']);
const allowedMimeTypes = new Set([
  'text/plain',
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel'
]);

function fileFilter(req, file, callback) {
  const fileExtension = path.extname(file.originalname || '').toLowerCase();
  const hasValidExtension = allowedExtensions.has(fileExtension);
  const hasValidMimeType = allowedMimeTypes.has(file.mimetype);

  if (!hasValidExtension || !hasValidMimeType) {
    return callback(new AppError('Only .txt and .csv files are allowed', 400));
  }

  return callback(null, true);
}

const uploadParser = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024,
    files: 1
  },
  fileFilter
});

module.exports = uploadParser;