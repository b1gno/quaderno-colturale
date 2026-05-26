// Modulo di routing per la gestione dei campi agricoli
const router = require('express').Router();
const ctrl = require('../controllers/campiController');
const { validateCampo } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/asyncWrapper');

// Applica middleware di autenticazione a tutte le route di questo modulo
router.use(auth);

// GET /api/campi - Ottiene lista di tutti i campi dell'utente
router.get('/',                 wrap(ctrl.getAll));
// GET /api/campi/:id - Ottiene dettagli di un campo specifico per ID
router.get('/:id',              wrap(ctrl.getById));
// GET /api/campi/:id/coltivazioni - Ottiene tutte le coltivazioni associate a un campo
router.get('/:id/coltivazioni', wrap(ctrl.getColtivazioni));
// POST /api/campi - Crea un nuovo campo (con validazione dei dati)
router.post('/',    validateCampo, wrap(ctrl.create));
// PUT /api/campi/:id - Aggiorna un campo esistente (con validazione)
router.put('/:id',  validateCampo, wrap(ctrl.update));
// DELETE /api/campi/:id - Elimina un campo e le relative coltivazioni
router.delete('/:id',           wrap(ctrl.delete));

module.exports = router;
