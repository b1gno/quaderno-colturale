// Modulo di routing per l'autenticazione degli utenti
const router = require('express').Router();
const ctrl = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// POST /api/auth/register - Registrazione nuovo utente (pubblica, non richiede auth)
router.post('/register', ctrl.register);
// POST /api/auth/login - Accesso utente esistente (pubblica, non richiede auth)
router.post('/login', ctrl.login);
// GET /api/auth/me - Ottiene dati utente corrente (richiede autenticazione JWT)
router.get('/me', auth, ctrl.me);

module.exports = router;
