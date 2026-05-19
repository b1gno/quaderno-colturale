const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const Prodotto = require('../models/Prodotto');
const AppError = require('../utils/AppError');

const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

exports.getMovimenti = async (req, res) => {
  const movimenti = await MovimentoMagazzino.find(userFilter(req))
    .populate('id_prodotto', 'nome unita_misura')
    .sort('-createdAt');
  res.json(movimenti);
};

exports.getStatistiche = async (req, res) => {
  const prodotti = await Prodotto.find(userFilter(req));
  const totaleProdotti = prodotti.length;
  const prodottiSottoScorta = prodotti.filter(p => p.quantita_disponibile <= p.scorta_minima).length;

  res.json({ totale_prodotti: totaleProdotti, prodotti_sotto_scorta: prodottiSottoScorta });
};

exports.carico = async (req, res) => {
  const prodotto = await Prodotto.findOne({ _id: req.body.id_prodotto, ...userFilter(req) });
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);

  await Prodotto.findByIdAndUpdate(prodotto._id, {
    $inc: { quantita_disponibile: req.body.quantita }
  });

  const movimento = await MovimentoMagazzino.create({
    id_utente: req.user._id,
    id_prodotto: req.body.id_prodotto,
    tipo_movimento: 'carico',
    quantita: req.body.quantita,
    note: req.body.note || ''
  });

  res.status(201).json({ message: 'Carico registrato', movimento });
};

exports.scarico = async (req, res) => {
  const prodotto = await Prodotto.findOne({ _id: req.body.id_prodotto, ...userFilter(req) });
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  if (prodotto.quantita_disponibile < req.body.quantita)
    throw new AppError('Quantità insufficiente', 400);

  await Prodotto.findByIdAndUpdate(prodotto._id, {
    $inc: { quantita_disponibile: -req.body.quantita }
  });

  const movimento = await MovimentoMagazzino.create({
    id_utente: req.user._id,
    id_prodotto: req.body.id_prodotto,
    tipo_movimento: 'scarico',
    quantita: req.body.quantita,
    note: req.body.note || ''
  });

  res.status(201).json({ message: 'Scarico registrato', movimento });
};
