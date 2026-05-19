const router = require('express').Router();
const ctrl = require('../controllers/attivitaController');
const { validateAttivita } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/asyncWrapper');

router.use(auth);

router.get('/',                 wrap(ctrl.getAll));
router.get('/campo/:id',        wrap(ctrl.getByCampo));
router.get('/:id',              wrap(ctrl.getById));
router.post('/',  validateAttivita, wrap(ctrl.create));
router.put('/:id', validateAttivita, wrap(ctrl.update));
router.delete('/:id',           wrap(ctrl.delete));

module.exports = router;
