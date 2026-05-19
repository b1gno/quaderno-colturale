const Campo = require('../models/Campo');
const Coltivazione = require('../models/Coltivazione');
const AppError = require('../utils/AppError');

const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

exports.getAll = async (req, res) => {
  const campi = await Campo.find(userFilter(req)).sort('nome');
  res.json(campi);
};

exports.getById = async (req, res) => {
  const campo = await Campo.findOne({ _id: req.params.id, ...userFilter(req) });
  if (!campo) throw new AppError('Campo non trovato', 404);
  res.json(campo);
};

exports.create = async (req, res) => {
  const campo = await Campo.create({ ...req.body, id_utente: req.user._id });
  res.status(201).json({ id: campo._id, message: 'Campo creato con successo', campo });
};

exports.update = async (req, res) => {
  const campo = await Campo.findOneAndUpdate(
    { _id: req.params.id, ...userFilter(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!campo) throw new AppError('Campo non trovato', 404);
  res.json({ message: 'Campo aggiornato', campo });
};

exports.delete = async (req, res) => {
  const campo = await Campo.findOneAndDelete({ _id: req.params.id, ...userFilter(req) });
  if (!campo) throw new AppError('Campo non trovato', 404);
  await Coltivazione.deleteMany({ id_campo: req.params.id });
  res.json({ message: 'Campo eliminato' });
};

exports.getColtivazioni = async (req, res) => {
  const coltivazioni = await Coltivazione.find({ id_campo: req.params.id, ...userFilter(req) }).sort('-data_semina');
  res.json(coltivazioni);
};
