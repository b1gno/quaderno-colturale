const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

// Serve i file statici (frontend) SOLO in locale
app.use(express.static(path.join(__dirname, '..', 'public')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/campi', require('./routes/campi'));
app.use('/api/coltivazioni', require('./routes/coltivazioni'));
app.use('/api/prodotti', require('./routes/prodotti'));
app.use('/api/attivita', require('./routes/attivita'));
app.use('/api/magazzino', require('./routes/magazzino'));
app.use('/api/report', require('./routes/report'));

app.get('/api/test', (req, res) => res.json({ message: 'API OK', timestamp: new Date() }));

// Fallback 404 per rotte API non trovate
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Rotta ${req.url} non trovata` });
});

app.use(errorHandler);

module.exports = app;
