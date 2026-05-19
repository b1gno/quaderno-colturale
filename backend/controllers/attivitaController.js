const Attivita = require('../models/Attivita');
const Prodotto = require('../models/Prodotto');
const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');

exports.getAll = async (req, res) => {
  const attivita = await Attivita.find()
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura stato')
    .sort('-data');
  res.json(attivita);
};

exports.getById = async (req, res) => {
  const attivita = await Attivita.findById(req.params.id)
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura')
    .populate('prodotti_usati.id_prodotto', 'nome unita_misura');
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json(attivita);
};

exports.create = async (req, res) => {
  const { data, id_campo, id_coltivazione, tipo_attivita, descrizione, prodotti } = req.body;

  // Usa una sessione MongoDB per la transazione
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Verifica disponibilità per ogni prodotto
    for (const p of (prodotti || [])) {
      const prodotto = await Prodotto.findById(p.id_prodotto).session(session);
      if (!prodotto) throw new AppError(`Prodotto non trovato: ${p.id_prodotto}`, 404);
      if (prodotto.quantita_disponibile < p.quantita_utilizzata)
        throw new AppError(`Quantità insufficiente per "${prodotto.nome}". Disponibile: ${prodotto.quantita_disponibile}`, 400);
    }

    // Crea attività
    const [attivita] = await Attivita.create([{
      data, id_campo,
      id_coltivazione: id_coltivazione || null,
      tipo_attivita, descrizione,
      prodotti_usati: (prodotti || []).map(p => ({
        id_prodotto: p.id_prodotto,
        quantita_utilizzata: p.quantita_utilizzata,
      })),
    }], { session });

    // Scarico magazzino + movimento per ogni prodotto
    for (const p of (prodotti || [])) {
      await Prodotto.findByIdAndUpdate(
        p.id_prodotto,
        { $inc: { quantita_disponibile: -p.quantita_utilizzata } },
        { session }
      );
      await MovimentoMagazzino.create([{
        id_prodotto: p.id_prodotto,
        tipo_movimento: 'scarico',
        quantita: p.quantita_utilizzata,
        note: `Attività: ${descrizione || tipo_attivita || 'non specificata'}`,
      }], { session });
    }

    await session.commitTransaction();
    res.status(201).json({
      id: attivita._id,
      message: 'Attività creata e magazzino aggiornato',
      prodotti_scaricati: (prodotti || []).length,
    });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.getByCampo = async (req, res) => {
  const attivita = await Attivita.find({ id_campo: req.params.id })
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura stato')
    .sort('-data');
  res.json(attivita);
};

exports.update = async (req, res) => {
  const attivita = await Attivita.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json({ message: 'Attività aggiornata', attivita });
};

exports.delete = async (req, res) => {
  const attivita = await Attivita.findByIdAndDelete(req.params.id);
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json({ message: 'Attività eliminata' });
};