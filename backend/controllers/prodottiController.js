const Prodotto = require('../models/Prodotto');
const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const AppError = require('../utils/AppError');

// Filtro utente per isolare i dati di ogni utente (admin visualizza tutto)
const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

// Ottiene tutti i prodotti dell'utente ordinati per nome
// Riceve: req.user per il filtro
// Restituisce: array di Prodotto
exports.getAll = async (req, res) => {
  const prodotti = await Prodotto.find(userFilter(req)).sort('nome');
  res.json(prodotti);
};

// Ottiene dettaglio di un singolo prodotto
// Riceve: req.params.id
// Restituisce: oggetto Prodotto o 404
exports.getById = async (req, res) => {
  const prodotto = await Prodotto.findOne({ _id: req.params.id, ...userFilter(req) });
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  res.json(prodotto);
};

// Ottiene tutti i prodotti in esaurimento (quantita <= scorta minima)
// Riceve: req.user per filtro
// Restituisce: array di prodotti sotto scorta
exports.getSottoScorta = async (req, res) => {
  // Filtro che confronta due campi dello stesso documento
  const filter = {
    ...userFilter(req),
    $expr: { $lte: ['$quantita_disponibile', '$scorta_minima'] }
  };
  const prodotti = await Prodotto.find(filter).sort('nome');
  res.json(prodotti);
};

// Crea un nuovo prodotto
// Riceve: dati nel body + id_utente da req.user
// Restituisce: prodotto creato
exports.create = async (req, res) => {
  const prodotto = await Prodotto.create({ ...req.body, id_utente: req.user._id });
  res.status(201).json({ message: 'Prodotto creato con successo', prodotto });
};

// Aggiorna un prodotto esistente
// Riceve: req.params.id + dati nel body
// Restituisce: prodotto aggiornato
exports.update = async (req, res) => {
  const prodotto = await Prodotto.findOneAndUpdate(
    { _id: req.params.id, ...userFilter(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  res.json({ message: 'Prodotto aggiornato', prodotto });
};

// Elimina un prodotto e tutti i suoi movimenti associati
// Riceve: req.params.id
// Restituisce: messaggio conferma
exports.delete = async (req, res) => {
  const prodotto = await Prodotto.findOneAndDelete({ _id: req.params.id, ...userFilter(req) });
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  // Elimina anche lo storico dei movimenti per questo prodotto
  await MovimentoMagazzino.deleteMany({ id_prodotto: req.params.id });
  res.json({ message: 'Prodotto eliminato' });
};

// Ottiene lo storico dei movimenti per un prodotto specifico
// Riceve: req.params.id (ID prodotto)
// Restituisce: array di MovimentoMagazzino ordinato per data decrescente
exports.getMovimenti = async (req, res) => {
  const movimenti = await MovimentoMagazzino.find({
    id_prodotto: req.params.id,
    ...userFilter(req)
  }).populate('id_prodotto', 'nome unita_misura').sort('-createdAt');
  res.json(movimenti);
};
