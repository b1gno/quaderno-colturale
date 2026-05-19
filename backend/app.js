const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/campi', require('./routes/campi'));
app.use('/api/coltivazioni', require('./routes/coltivazioni'));
app.use('/api/prodotti', require('./routes/prodotti'));
app.use('/api/attivita', require('./routes/attivita'));
app.use('/api/magazzino', require('./routes/magazzino'));

app.get('/api/test', (req, res) => res.json({ message: 'OK', timestamp: new Date() }));
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route non trovata' });
});

// Error handler — SEMPRE ULTIMO
app.use(errorHandler);

module.exports = app;
