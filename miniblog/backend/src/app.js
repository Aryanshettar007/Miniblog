const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');
const errorHandler = require('./middleware/error');

// Route imports
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Swagger API Documentation
try {
  const swaggerDocument = YAML.load(path.join(__dirname, 'docs', 'swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.log('Swagger document not found, skipping api-docs setup.');
}

// Map routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/posts', postRoutes);

// Root endpoint message
app.get('/', (req, res) => {
  res.redirect('/api-docs'); // Point root right to documentation
});

// Explicit handle for /api/v1
app.get('/api/v1', (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome to MiniBlog API v1. Check /api-docs for endpoints.' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
