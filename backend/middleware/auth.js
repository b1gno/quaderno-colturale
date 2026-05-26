const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Chiave segreta per firmare/verificare i token JWT (da sovrascrivere in produzione)
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret-dev-key-change-in-production';

// Middleware di autenticazione: estrae e verifica il token JWT dall'header Authorization
const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  // Controlla che l'header Authorization esista e sia nel formato "Bearer <token>"
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ error: 'Accesso negato — token mancante' });

  try {
    // Verifica il token e decodifica il payload (contiene l'id utente)
    const decoded = jwt.verify(header.split(' ')[1], JWT_SECRET);
    // Carica l'utente dal database e lo attacca alla richiesta
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).json({ error: 'Utente non trovato' });
    next(); // Utente autenticato: passa al prossimo middleware/route
  } catch {
    res.status(401).json({ error: 'Token non valido o scaduto' });
  }
};

// Middleware per restringere l'accesso ai soli amministratori
const adminOnly = (req, res, next) => {
  if (req.user.ruolo !== 'admin')
    return res.status(403).json({ error: 'Accesso riservato agli amministratori' });
  next();
};

module.exports = { auth, adminOnly, JWT_SECRET };
