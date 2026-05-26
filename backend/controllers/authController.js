const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

// Genera token JWT con scadenza 7 giorni a partire dai dati utente
const signToken = (user) => jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

// Registra un nuovo utente
// Riceve nel body: email, password, nome (tutti obbligatori)
// Restituisce: token JWT e dati utente creato, oppure errore se email gia' registrata
exports.register = async (req, res) => {
  const { email, password, nome } = req.body;
  // Verifica che tutti i campi obbligatori siano presenti
  if (!email || !password || !nome)
    return res.status(400).json({ error: 'email, password e nome sono obbligatori' });

  // Controlla che l'email non sia gia' nel database
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ error: 'Email già registrata' });

  // Crea nuovo utente e restituisci token
  const user = await User.create({ email, password, nome });
  res.status(201).json({ token: signToken(user), user });
};

// Effettua il login di un utente esistente
// Riceve nel body: email, password
// Restituisce: token JWT e dati utente, oppure errore se credenziali non valide
exports.login = async (req, res) => {
  const { email, password } = req.body;
  // Verifica campi obbligatori
  if (!email || !password)
    return res.status(400).json({ error: 'email e password sono obbligatori' });

  // Cerca utente per email (case insensitive)
  const user = await User.findOne({ email: email.toLowerCase() });
  // Verifica esistenza utente e correttezza password
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ error: 'Credenziali non valide' });

  // Login riuscito: restituisci token
  res.json({ token: signToken(user), user });
};

// Ottiene i dati dell'utente corrente (autenticato tramite JWT)
// Riceve: req.user popolato dal middleware di autenticazione
// Restituisce: oggetto utente completo
exports.me = async (req, res) => {
  res.json(req.user);
};
