const router = require('express').Router();
const ctrl = require('../controllers/campiController');
const { validateCampo } = require('../middleware/validate');
const wrap = require('../middleware/asyncWrapper');

router.get('/',                 wrap(ctrl.getAll));
router.get('/:id',              wrap(ctrl.getById));
router.get('/:id/coltivazioni', wrap(ctrl.getColtivazioni));
router.post('/',    validateCampo, wrap(ctrl.create));
router.put('/:id',  validateCampo, wrap(ctrl.update));
router.delete('/:id',           wrap(ctrl.delete));

module.exports = router;