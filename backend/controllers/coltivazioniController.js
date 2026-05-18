const Coltivazione = require('../models/Coltivazione');
const Campo = require('../models/Campo');
const AppError = require('../utils/AppError');

exports.getAll = async (req, res) => {
  const coltivazioni = await Coltivazione
    .find()
    .populate('id_campo', 'nome superficie')
    .sort('-data_semina');
  res.json(coltivazioni);
};

exports.getById = async (req, res) => {
  const coltivazione = await Coltivazione
    .findById(req.params.id)
    .populate('id_campo', 'nome superficie');
  if (!coltivazione) throw new AppError('Coltivazione non trovata', 404);
  res.json(coltivazione);
};

exports.create = async (req, res) => {
  const campo = await Campo.findById(req.body.id_campo);
  if (!campo) throw new AppError('Campo non trovato', 404);

  const coltivazione = await Coltivazione.create(req.body);
  res.status(201).json({ id: coltivazione._id, message: 'Coltivazione creata', coltivazione });
};

exports.update = async (req, res) => {
  const coltivazione = await Coltivazione.findByIdAndUpdate(
    req.params.id, req.body,
    { new: true, runValidators: true }
  );
  if (!coltivazione) throw new AppError('Coltivazione non trovata', 404);
  res.json({ message: 'Coltivazione aggiornata', coltivazione });
};

exports.delete = async (req, res) => {
  const coltivazione = await Coltivazione.findByIdAndDelete(req.params.id);
  if (!coltivazione) throw new AppError('Coltivazione non trovata', 404);
  res.json({ message: 'Coltivazione eliminata' });
};