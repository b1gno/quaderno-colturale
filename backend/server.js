const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files dal frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Test connessione database
const db = require('./config/db');

// Import routes
const campiRoutes = require('./routes/campi');
const coltivazioniRoutes = require('./routes/coltivazioni');
const prodottiRoutes = require('./routes/prodotti');
const attivitaRoutes = require('./routes/attivita');
const magazzinoRoutes = require('./routes/magazzino');

// Use routes
app.use('/api/campi', campiRoutes);
app.use('/api/coltivazioni', coltivazioniRoutes);
app.use('/api/prodotti', prodottiRoutes);
app.use('/api/attivita', attivitaRoutes);
app.use('/api/magazzino', magazzinoRoutes);

// Route di test
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API Quaderno di Campo funzionante',
        timestamp: new Date()
    });
});

// Route principale - serve l'index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Gestione errori 404 - Solo per API, non per file statici
app.use((req, res) => {
    // Se la richiesta è per /api, restituisci JSON
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: 'Route API non trovata' });
    } else {
        // Altrimenti, prova a servire come file statico o redirect a home
        res.status(404).sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// Avvio server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server avviato su http://localhost:${PORT}`);
    console.log(`📚 API disponibili su http://localhost:${PORT}/api`);
});