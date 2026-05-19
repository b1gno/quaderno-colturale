const Attivita = require('../models/Attivita');
const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const Prodotto = require('../models/Prodotto');
const AppError = require('../utils/AppError');

const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

exports.getAll = async (req, res) => {
  const attivita = await Attivita.find(userFilter(req))
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura')
    .populate('prodotti_usati.id_prodotto', 'nome unita_misura')
    .sort('-data');
  res.json(attivita);
};

exports.getById = async (req, res) => {
  const attivita = await Attivita.findOne({ _id: req.params.id, ...userFilter(req) })
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura')
    .populate('prodotti_usati.id_prodotto', 'nome unita_misura');
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json(attivita);
};

exports.getByCampo = async (req, res) => {
  const attivita = await Attivita.find({ id_campo: req.params.id, ...userFilter(req) })
    .populate('id_campo', 'nome')
    .sort('-data');
  res.json(attivita);
};

exports.create = async (req, res) => {
  let prodottiScaricati = 0;
  const prodottiUsati = req.body.prodotti || [];

  const attivita = await Attivita.create({ ...req.body, id_utente: req.user._id, prodotti_usati: prodottiUsati });

  for (const p of prodottiUsati) {
    const prodotto = await Prodotto.findOne({ _id: p.id_prodotto, ...userFilter(req) });
    if (prodotto && prodotto.quantita_disponibile >= p.quantita_utilizzata) {
      await Prodotto.findByIdAndUpdate(prodotto._id, {
        $inc: { quantita_disponibile: -p.quantita_utilizzata }
      });
      await MovimentoMagazzino.create({
        id_utente: req.user._id,
        id_prodotto: p.id_prodotto,
        tipo_movimento: 'scarico',
        quantita: p.quantita_utilizzata,
        note: `Scarico automatico da attività: ${req.body.tipo_attivita || ''}`,
        data: req.body.data
      });
      prodottiScaricati++;
    }
  }

  res.status(201).json({ message: 'Attività creata', attivita, prodotti_scaricati: prodottiScaricati });
};

exports.update = async (req, res) => {
  const attivita = await Attivita.findOneAndUpdate(
    { _id: req.params.id, ...userFilter(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json({ message: 'Attività aggiornata', attivita });
};

exports.delete = async (req, res) => {
  const attivita = await Attivita.findOneAndDelete({ _id: req.params.id, ...userFilter(req) });
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json({ message: 'Attività eliminata' });
};
