// Modulo di routing per la generazione dei report
const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/asyncWrapper');

// Applica middleware di autenticazione a tutte le route
router.use(auth);

// GET /api/report/pdf - Genera report PDF del quaderno di campo
// Parametri query opzionali: mese, anno, stagione per filtrare le attivita
router.get('/pdf', wrap(ctrl.pdfReport));

module.exports = router;
