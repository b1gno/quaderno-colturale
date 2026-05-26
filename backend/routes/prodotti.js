// Modulo di routing per la gestione dei prodotti di magazzino
const router = require('express').Router();
const ctrl = require('../controllers/prodottiController');
const { validateProdotto } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/asyncWrapper');

// Applica middleware di autenticazione a tutte le route
router.use(auth);

// GET /api/prodotti - Ottiene lista di tutti i prodotti ordinati per nome
router.get('/',                    wrap(ctrl.getAll));
// GET /api/prodotti/sotto-scorta - Ottiene prodotti con quantita <= scorta minima
router.get('/sotto-scorta',        wrap(ctrl.getSottoScorta));
// GET /api/prodotti/:id - Ottiene dettagli di un prodotto specifico
router.get('/:id',                 wrap(ctrl.getById));
// GET /api/prodotti/:id/movimenti - Ottiene storico movimenti per un prodotto
router.get('/:id/movimenti',       wrap(ctrl.getMovimenti));
// POST /api/prodotti - Crea un nuovo prodotto (con validazione)
router.post('/',   validateProdotto, wrap(ctrl.create));
// PUT /api/prodotti/:id - Aggiorna un prodotto esistente
router.put('/:id', validateProdotto, wrap(ctrl.update));
// DELETE /api/prodotti/:id - Elimina un prodotto e i relativi movimenti
router.delete('/:id',              wrap(ctrl.delete));

module.exports = router;
