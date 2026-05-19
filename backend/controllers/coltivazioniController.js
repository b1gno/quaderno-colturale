const Coltivazione = require('../models/Coltivazione');
const AppError = require('../utils/AppError');

const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

exports.getAll = async (req, res) => {
  const coltivazioni = await Coltivazione.find(userFilter(req))
    .populate('id_campo', 'nome superficie')
    .sort('-data_semina');
  res.json(coltivazioni);
};

exports.getById = async (req, res) => {
  const coltivazione = await Coltivazione.findOne({ _id: req.params.id, ...userFilter(req) })
    .populate('id_campo', 'nome superficie');
  if (!coltivazione) throw new AppError('Coltivazione non trovata', 404);
  res.json(coltivazione);
};

exports.create = async (req, res) => {
  const coltivazione = await Coltivazione.create({ ...req.body, id_utente: req.user._id });
  res.status(201).json({ message: 'Coltivazione creata con successo', coltivazione });
};

exports.update = async (req, res) => {
  const coltivazione = await Coltivazione.findOneAndUpdate(
    { _id: req.params.id, ...userFilter(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!coltivazione) throw new AppError('Coltivazione non trovata', 404);
  res.json({ message: 'Coltivazione aggiornata', coltivazione });
};

exports.delete = async (req, res) => {
  const coltivazione = await Coltivazione.findOneAndDelete({ _id: req.params.id, ...userFilter(req) });
  if (!coltivazione) throw new AppError('Coltivazione non trovata', 404);
  res.json({ message: 'Coltivazione eliminata' });
};
