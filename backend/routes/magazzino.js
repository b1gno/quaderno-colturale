const router = require('express').Router();
const ctrl = require('../controllers/magazzinoController');
const { validateCarico } = require('../middleware/validate');
const wrap = require('../middleware/asyncWrapper');

router.get('/movimenti',    wrap(ctrl.getMovimenti));
router.get('/statistiche',  wrap(ctrl.getStatistiche));
router.post('/carico',      validateCarico, wrap(ctrl.carico));
router.post('/scarico',     validateCarico, wrap(ctrl.scarico));

module.exports = router;