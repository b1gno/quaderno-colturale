// Modulo di routing per la gestione del magazzino
const router = require('express').Router();
const ctrl = require('../controllers/magazzinoController');
const { validateCarico } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/asyncWrapper');

// Applica middleware di autenticazione a tutte le route
router.use(auth);

// GET /api/magazzino/movimenti - Ottiene storico completo dei movimenti di magazzino
router.get('/movimenti',   wrap(ctrl.getMovimenti));
// GET /api/magazzino/statistiche - Ottiene statistiche e previsioni di consumo
router.get('/statistiche', wrap(ctrl.getStatistiche));
// GET /api/magazzino/previsioni - Ottiene previsioni dettagliate di esaurimento scorte
router.get('/previsioni',  wrap(ctrl.getPrevisioni));
// POST /api/magazzino/carico - Registra un carico di merce (con validazione)
router.post('/carico',  validateCarico, wrap(ctrl.carico));
// POST /api/magazzino/scarico - Registra uno scarico di merce
router.post('/scarico',                 wrap(ctrl.scarico));

module.exports = router;
