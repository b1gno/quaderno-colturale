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

  const novantaGiorniFa = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const scarichi = await MovimentoMagazzino.find({
    ...userFilter(req),
    tipo_movimento: 'scarico',
    createdAt: { $gte: novantaGiorniFa }
  });

  const consumi = {};
  scarichi.forEach(m => {
    const id = String(m.id_prodotto);
    consumi[id] = (consumi[id] || 0) + m.quantita;
  });

  const previsioni = prodotti.map(p => {
    const id = String(p._id);
    const totaleConsumato = consumi[id] || 0;
    const consumoGiornaliero = totaleConsumato / 90;
    let giorniRimanenti = null;
    if (consumoGiornaliero > 0 && p.quantita_disponibile > 0) {
      giorniRimanenti = Math.floor(p.quantita_disponibile / consumoGiornaliero);
    }
    return {
      _id: p._id,
      nome: p.nome,
      unita_misura: p.unita_misura,
      quantita_disponibile: p.quantita_disponibile,
      scorta_minima: p.scorta_minima,
      consumo_giornaliero: Math.round(consumoGiornaliero * 100) / 100,
      giorni_rimanenti: giorniRimanenti,
      sotto_scorta: p.quantita_disponibile <= p.scorta_minima
    };
  });

  res.json({ totale_prodotti: totaleProdotti, prodotti_sotto_scorta: prodottiSottoScorta, previsioni });
};

exports.getPrevisioni = async (req, res) => {
  const prodotti = await Prodotto.find(userFilter(req));
  const novantaGiorniFa = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const scarichi = await MovimentoMagazzino.find({
    ...userFilter(req),
    tipo_movimento: 'scarico',
    createdAt: { $gte: novantaGiorniFa }
  });

  const consumi = {};
  scarichi.forEach(m => {
    const id = String(m.id_prodotto);
    consumi[id] = (consumi[id] || 0) + m.quantita;
  });

  const previsioni = prodotti.map(p => {
    const id = String(p._id);
    const totaleConsumato = consumi[id] || 0;
    const consumoGiornaliero = totaleConsumato / 90;
    let giorniRimanenti = null;
    if (consumoGiornaliero > 0 && p.quantita_disponibile > 0) {
      giorniRimanenti = Math.floor(p.quantita_disponibile / consumoGiornaliero);
    }
    return {
      _id: p._id,
      nome: p.nome,
      unita_misura: p.unita_misura,
      categoria: p.categoria,
      quantita_disponibile: p.quantita_disponibile,
      scorta_minima: p.scorta_minima,
      consumo_giornaliero: Math.round(consumoGiornaliero * 100) / 100,
      giorni_rimanenti: giorniRimanenti,
      data_esaurimento: giorniRimanenti !== null ? new Date(Date.now() + giorniRimanenti * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      sotto_scorta: p.quantita_disponibile <= p.scorta_minima
    };
  });

  res.json(previsioni);
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
