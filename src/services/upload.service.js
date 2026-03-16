const AppError = require('../utils/appError');

function getWordCount(text) {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return 0;
  }

  return normalizedText.split(/\s+/).length;
}

function analyzeUploadedFile(file) {
  if (!file) {
    throw new AppError('A file is required in field "file"', 400);
  }

  if (file.buffer.includes(0)) {
    throw new AppError('Uploaded file must contain plain text data only', 400);
  }

  const content = file.buffer.toString('utf8');

  return {
    fileName: file.originalname,
    fileSize: file.size,
    wordCount: getWordCount(content)
  };
}

module.exports = {
  analyzeUploadedFile
};