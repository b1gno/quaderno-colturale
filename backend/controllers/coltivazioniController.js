const Coltivazione = require('../models/Coltivazione');
const AppError = require('../utils/AppError');

// Filtro che limita l'accesso ai soli dati dell'utente corrente (admin vede tutto)
const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

// Ottiene tutte le coltivazioni dell'utente con riferimento al campo
// Riceve: req.user per il filtro
// Restituisce: array di Coltivazione con populate di id_campo (nome, superficie)
exports.getAll = async (req, res) => {
  const coltivazioni = await Coltivazione.find(userFilter(req))
    .populate('id_campo', 'nome superficie')
    .sort('-data_semina'); // piu' recenti prima
  res.json(coltivazioni);
};

// Ottiene dettaglio di una singola coltivazione per ID
// Riceve: req.params.id
// Restituisce: oggetto Coltivazione con populate di id_campo
exports.getById = async (req, res) => {
  const coltivazione = await Coltivazione.findOne({ _id: req.params.id, ...userFilter(req) })
    .populate('id_campo', 'nome superficie');
  if (!coltivazione) throw new AppError('Coltivazione non trovata', 404);
  res.json(coltivazione);
};

// Crea una nuova coltivazione associata all'utente corrente
// Riceve: dati nel req.body + req.user._id
// Restituisce: messaggio e oggetto coltivazione creato
exports.create = async (req, res) => {
  const coltivazione = await Coltivazione.create({ ...req.body, id_utente: req.user._id });
  res.status(201).json({ message: 'Coltivazione creata con successo', coltivazione });
};

// Aggiorna una coltivazione esistente
// Riceve: req.params.id e dati aggiornati nel body
// Restituisce: messaggio e oggetto aggiornato
exports.update = async (req, res) => {
  const coltivazione = await Coltivazione.findOneAndUpdate(
    { _id: req.params.id, ...userFilter(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!coltivazione) throw new AppError('Coltivazione non trovata', 404);
  res.json({ message: 'Coltivazione aggiornata', coltivazione });
};

// Elimina una coltivazione per ID
// Riceve: req.params.id
// Restituisce: messaggio di conferma o errore 404
exports.delete = async (req, res) => {
  const coltivazione = await Coltivazione.findOneAndDelete({ _id: req.params.id, ...userFilter(req) });
  if (!coltivazione) throw new AppError('Coltivazione non trovata', 404);
  res.json({ message: 'Coltivazione eliminata' });
};
