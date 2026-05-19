const router = require('express').Router();
const ctrl = require('../controllers/coltivazioniController');
const { validateColtivazione } = require('../middleware/validate');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/asyncWrapper');

router.use(auth);

router.get('/',                    wrap(ctrl.getAll));
router.get('/:id',                 wrap(ctrl.getById));
router.post('/',   validateColtivazione, wrap(ctrl.create));
router.put('/:id', validateColtivazione, wrap(ctrl.update));
router.delete('/:id',              wrap(ctrl.delete));

module.exports = router;
