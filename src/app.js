const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/appError');
const { corsOrigin } = require('./config/env');

const app = express();

app.use(helmet());
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '50kb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Resilient Core API',
    docs: {
      health: '/api/health',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      projects: '/api/projects (requires auth)',
      uploads: 'POST /api/uploads (multipart/form-data, field: file)'
    }
  });
});

app.use('/api', routes);

app.use((req, res, next) => {
  next(new AppError('Route not found', 404));
});

app.use(errorHandler);

module.exports = app;
