function errorHandler(err, req, res, next) {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (!err.isOperational) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message
  });
}

module.exports = errorHandler;
