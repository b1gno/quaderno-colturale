const Campo = require('../models/Campo');
const Coltivazione = require('../models/Coltivazione');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res) => {
  const campi = await Campo.find().sort('nome');
  res.json(campi);
};

exports.getById = async (req, res) => {
  const campo = await Campo.findById(req.params.id);
  if (!campo) throw new AppError('Campo non trovato', 404);
  res.json(campo);
};

exports.create = async (req, res) => {
  const campo = await Campo.create(req.body);
  res.status(201).json({ id: campo._id, message: 'Campo creato con successo', campo });
};

exports.update = async (req, res) => {
  const campo = await Campo.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!campo) throw new AppError('Campo non trovato', 404);
  res.json({ message: 'Campo aggiornato', campo });
};

exports.delete = async (req, res) => {
  const campo = await Campo.findByIdAndDelete(req.params.id);
  if (!campo) throw new AppError('Campo non trovato', 404);
  await Coltivazione.deleteMany({ id_campo: req.params.id }); // cascade
  res.json({ message: 'Campo eliminato' });
};

exports.getColtivazioni = async (req, res) => {
  const coltivazioni = await Coltivazione.find({ id_campo: req.params.id }).sort('-data_semina');
  res.json(coltivazioni);
};