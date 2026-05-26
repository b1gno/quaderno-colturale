// Configurazione dell'app Express: middleware globali e montaggio delle route
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const app = express();
// Abilita CORS per richieste da domini diversi (frontend)
app.use(cors());
// Parsing automatico del corpo JSON delle richieste
app.use(express.json());

// Serve i file statici (frontend) SOLO in locale
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---- Montaggio delle route API ----
app.use('/api/auth', require('./routes/auth'));         // Autenticazione (login/registrazione)
app.use('/api/campi', require('./routes/campi'));       // Gestione campi
app.use('/api/coltivazioni', require('./routes/coltivazioni')); // Coltivazioni nei campi
app.use('/api/prodotti', require('./routes/prodotti')); // Prodotti e fitosanitari
app.use('/api/attivita', require('./routes/attivita')); // Attività svolte nei campi
app.use('/api/magazzino', require('./routes/magazzino')); // Movimenti di magazzino
app.use('/api/report', require('./routes/report'));     // Reportistica

// Route di test per verificare che l'API sia attiva
app.get('/api/test', (req, res) => res.json({ message: 'API OK', timestamp: new Date() }));

// Fallback 404 per rotte API non trovate
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Rotta ${req.url} non trovata` });
});

// Middleware globale per la gestione degli errori (va dopo tutte le route)
app.use(errorHandler);

module.exports = app;
