const router = require('express').Router();
const ctrl = require('../controllers/prodottiController');
const { validateProdotto } = require('../middleware/validate');
const wrap = require('../middleware/asyncWrapper');

router.get('/',              wrap(ctrl.getAll));
router.get('/sotto-scorta',  wrap(ctrl.getSottoScorta));  // ← prima di /:id
router.get('/:id',           wrap(ctrl.getById));
router.get('/:id/movimenti', wrap(ctrl.getMovimenti));
router.post('/',   validateProdotto, wrap(ctrl.create));
router.put('/:id', validateProdotto, wrap(ctrl.update));
router.delete('/:id',        wrap(ctrl.delete));

module.exports = router;