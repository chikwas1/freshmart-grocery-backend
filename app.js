// app.js
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

// Root-level path imports (matching your exact folder structure)
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Security headers and disabling X-Powered-By
app.disable('x-powered-by');
app.use(helmet());

// Explicit CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body payload limits
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// API Routes
app.use('/auth', authRoutes);
app.use('/categories', categoryRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
