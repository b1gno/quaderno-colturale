const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret-dev-key-change-in-production';

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Accesso negato — token mancante' });

  try {
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: 'Utente non trovato' });
    next();
  } catch {
    res.status(401).json({ error: 'Token non valido o scaduto' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.ruolo !== 'admin')
    return res.status(403).json({ error: 'Accesso riservato agli amministratori' });
  next();
};

module.exports = { auth, adminOnly, JWT_SECRET };
