const Campo = require('../models/Campo');
const Coltivazione = require('../models/Coltivazione');
const AppError = require('../utils/AppError');

// Crea filtro per le query: admin vede tutto, utenti normali solo i propri dati
const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

// Ottiene tutti i campi dell'utente corrente, ordinati per nome
// Riceve: req.user per determinare il filtro
// Restituisce: array di oggetti Campo
exports.getAll = async (req, res) => {
  const campi = await Campo.find(userFilter(req)).sort('nome');
  res.json(campi);
};

// Ottiene un singolo campo tramite il suo ID
// Riceve: req.params.id (ID campo) e req.user per il filtro
// Restituisce: oggetto Campo o errore 404 se non trovato
exports.getById = async (req, res) => {
  const campo = await Campo.findOne({ _id: req.params.id, ...userFilter(req) });
  if (!campo) throw new AppError('Campo non trovato', 404);
  res.json(campo);
};

// Crea un nuovo campo associato all'utente corrente
// Riceve: dati campo nel req.body e req.user._id per l'associazione
// Restituisce: ID campo creato, messaggio e oggetto completo
exports.create = async (req, res) => {
  const campo = await Campo.create({ ...req.body, id_utente: req.user._id });
  res.status(201).json({ id: campo._id, message: 'Campo creato con successo', campo });
};

// Aggiorna un campo esistente
// Riceve: req.params.id (ID campo), dati aggiornati nel req.body
// Restituisce: messaggio e oggetto campo aggiornato, o 404 se non trovato
exports.update = async (req, res) => {
  const campo = await Campo.findOneAndUpdate(
    { _id: req.params.id, ...userFilter(req) },
    req.body,
    { new: true, runValidators: true } // new: restituisce documento aggiornato
  );
  if (!campo) throw new AppError('Campo non trovato', 404);
  res.json({ message: 'Campo aggiornato', campo });
};

// Elimina un campo e tutte le sue coltivazioni collegate
// Riceve: req.params.id (ID campo da eliminare)
// Restituisce: messaggio di conferma, o 404 se non trovato
exports.delete = async (req, res) => {
  const campo = await Campo.findOneAndDelete({ _id: req.params.id, ...userFilter(req) });
  if (!campo) throw new AppError('Campo non trovato', 404);
  // Elimina anche tutte le coltivazioni collegate a questo campo
  await Coltivazione.deleteMany({ id_campo: req.params.id });
  res.json({ message: 'Campo eliminato' });
};

// Ottiene tutte le coltivazioni associate a uno specifico campo
// Riceve: req.params.id (ID campo)
// Restituisce: array di Coltivazione ordinato per data_semina decrescente
exports.getColtivazioni = async (req, res) => {
  const coltivazioni = await Coltivazione.find({ id_campo: req.params.id, ...userFilter(req) }).sort('-data_semina');
  res.json(coltivazioni);
};
