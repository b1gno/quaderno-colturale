const router = require('express').Router();
const ctrl = require('../controllers/reportController');
const { auth } = require('../middleware/auth');
const wrap = require('../middleware/asyncWrapper');

router.use(auth);

router.get('/pdf', wrap(ctrl.pdfReport));

module.exports = router;
