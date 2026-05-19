const express = require('express');
const cors = require('cors');
const path = require('path');
// Rimuovi dotenv.config() qui, lo gestiamo nel db.js o Vercel lo fa da solo

const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

// ATTENZIONE: Se api/index.js riceve già da /api, 
// qui dobbiamo mappare le rotte in modo relativo
app.use('/campi', require('./routes/campi'));
app.use('/coltivazioni', require('./routes/coltivazioni'));
app.use('/prodotti', require('./routes/prodotti'));
app.use('/attivita', require('./routes/attivita'));
app.use('/magazzino', require('./routes/magazzino'));

app.get('/test', (req, res) => res.json({ message: 'API OK', timestamp: new Date() }));

// Fallback per rotte non trovate
app.use((req, res) => {
  res.status(404).json({ error: `Rotta ${req.url} non trovata su Express` });
});

app.use(errorHandler);

module.exports = app;