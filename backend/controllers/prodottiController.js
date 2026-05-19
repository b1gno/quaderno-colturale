const Prodotto = require('../models/Prodotto');
const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const AppError = require('../utils/AppError');

const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

exports.getAll = async (req, res) => {
  const prodotti = await Prodotto.find(userFilter(req)).sort('nome');
  res.json(prodotti);
};

exports.getById = async (req, res) => {
  const prodotto = await Prodotto.findOne({ _id: req.params.id, ...userFilter(req) });
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  res.json(prodotto);
};

exports.getSottoScorta = async (req, res) => {
  const filter = {
    ...userFilter(req),
    $expr: { $lte: ['$quantita_disponibile', '$scorta_minima'] }
  };
  const prodotti = await Prodotto.find(filter).sort('nome');
  res.json(prodotti);
};

exports.create = async (req, res) => {
  const prodotto = await Prodotto.create({ ...req.body, id_utente: req.user._id });
  res.status(201).json({ message: 'Prodotto creato con successo', prodotto });
};

exports.update = async (req, res) => {
  const prodotto = await Prodotto.findOneAndUpdate(
    { _id: req.params.id, ...userFilter(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  res.json({ message: 'Prodotto aggiornato', prodotto });
};

exports.delete = async (req, res) => {
  const prodotto = await Prodotto.findOneAndDelete({ _id: req.params.id, ...userFilter(req) });
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  await MovimentoMagazzino.deleteMany({ id_prodotto: req.params.id });
  res.json({ message: 'Prodotto eliminato' });
};

exports.getMovimenti = async (req, res) => {
  const movimenti = await MovimentoMagazzino.find({
    id_prodotto: req.params.id,
    ...userFilter(req)
  }).populate('id_prodotto', 'nome unita_misura').sort('-createdAt');
  res.json(movimenti);
};
