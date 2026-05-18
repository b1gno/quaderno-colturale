const Prodotto = require('../models/Prodotto');
const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res) => {
  const prodotti = await Prodotto.find().sort('nome');
  res.json(prodotti);
};

exports.getSottoScorta = async (req, res) => {
  const prodotti = await Prodotto.find({
    $expr: { $lte: ['$quantita_disponibile', '$scorta_minima'] }
  }).sort('nome');
  res.json(prodotti);
};

exports.getById = async (req, res) => {
  const prodotto = await Prodotto.findById(req.params.id);
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  res.json(prodotto);
};

exports.getMovimenti = async (req, res) => {
  const movimenti = await MovimentoMagazzino
    .find({ id_prodotto: req.params.id })
    .sort('-createdAt');
  res.json(movimenti);
};

exports.create = async (req, res) => {
  const prodotto = await Prodotto.create(req.body);
  res.status(201).json({ id: prodotto._id, message: 'Prodotto creato', prodotto });
};

exports.update = async (req, res) => {
  const prodotto = await Prodotto.findByIdAndUpdate(
    req.params.id, req.body,
    { new: true, runValidators: true }
  );
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  res.json({ message: 'Prodotto aggiornato', prodotto });
};

exports.delete = async (req, res) => {
  const prodotto = await Prodotto.findByIdAndDelete(req.params.id);
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  res.json({ message: 'Prodotto eliminato' });
};