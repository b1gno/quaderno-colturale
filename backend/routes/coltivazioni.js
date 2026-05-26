// Modulo di routing per la gestione delle coltivazioni
const router = require('express').Router();
const ctrl = require('../controllers/coltivazioniController');
const { validateColtivazione } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/asyncWrapper');

// Applica middleware di autenticazione a tutte le route
router.use(auth);

// GET /api/coltivazioni - Ottiene lista di tutte le coltivazioni con riferimento al campo
router.get('/',                    wrap(ctrl.getAll));
// GET /api/coltivazioni/:id - Ottiene dettagli di una coltivazione specifica
router.get('/:id',                 wrap(ctrl.getById));
// POST /api/coltivazioni - Crea una nuova coltivazione (con validazione)
router.post('/',   validateColtivazione, wrap(ctrl.create));
// PUT /api/coltivazioni/:id - Aggiorna una coltivazione esistente
router.put('/:id', validateColtivazione, wrap(ctrl.update));
// DELETE /api/coltivazioni/:id - Elimina una coltivazione
router.delete('/:id',              wrap(ctrl.delete));

module.exports = router;
