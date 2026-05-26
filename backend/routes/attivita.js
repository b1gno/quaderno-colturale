// Modulo di routing per la gestione delle attivita agricole
const router = require('express').Router();
const ctrl = require('../controllers/attivitaController');
const { validateAttivita } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/asyncWrapper');

// Applica middleware di autenticazione a tutte le route
router.use(auth);

// GET /api/attivita - Ottiene lista di tutte le attivita con riferimenti popolati
router.get('/',                 wrap(ctrl.getAll));
// GET /api/attivita/campo/:id - Ottiene attivita filtrate per specifico campo
router.get('/campo/:id',        wrap(ctrl.getByCampo));
// GET /api/attivita/:id - Ottiene dettagli di una attivita specifica
router.get('/:id',              wrap(ctrl.getById));
// POST /api/attivita - Crea nuova attivita (con validazione e scarico automatico prodotti)
router.post('/',  validateAttivita, wrap(ctrl.create));
// PUT /api/attivita/:id - Aggiorna una attivita esistente
router.put('/:id', validateAttivita, wrap(ctrl.update));
// DELETE /api/attivita/:id - Elimina una attivita
router.delete('/:id',           wrap(ctrl.delete));

module.exports = router;
