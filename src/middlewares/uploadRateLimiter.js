const AppError = require('../utils/appError');

const WINDOW_MS = 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 5;
const uploadAttempts = new Map();

function getClientKey(req) {
  if (req.user && req.user.id) {
    return `user:${req.user.id}`;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) {
      return `ip:${firstIp}`;
    }
  }

  return `ip:${req.ip}`;
}

function uploadRateLimiter(req, res, next) {
  const now = Date.now();
  const clientKey = getClientKey(req);
  const attempts = uploadAttempts.get(clientKey) || [];

  const activeAttempts = attempts.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (activeAttempts.length >= MAX_UPLOADS_PER_WINDOW) {
    return next(new AppError('Upload limit exceeded. Maximum 5 uploads per minute.', 429));
  }

  activeAttempts.push(now);
  uploadAttempts.set(clientKey, activeAttempts);

  return next();
}

uploadRateLimiter._resetForTests = () => {
  uploadAttempts.clear();
};

module.exports = uploadRateLimiter;