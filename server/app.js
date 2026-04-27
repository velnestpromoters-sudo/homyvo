const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const requestRoutes = require('./routes/requestRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.status(200).send('<h2>Bnest API Backend is Live & Running!</h2><p>Base endpoints: /api/auth, /api/properties</p>');
});

const interactionRoutes = require('./routes/interactionRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/interactions', interactionRoutes);

// Error Handling Middleware
app.use(errorHandler);

module.exports = app;
