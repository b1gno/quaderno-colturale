const mongoose = require('mongoose');
const Prodotto = require('../models/Prodotto');
const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const AppError = require('../utils/AppError');

exports.getMovimenti = async (req, res) => {
  const movimenti = await MovimentoMagazzino
    .find()
    .populate('id_prodotto', 'nome unita_misura')
    .sort('-createdAt')
    .limit(100);
  res.json(movimenti);
};

exports.getStatistiche = async (req, res) => {
  const [totali] = await Prodotto.aggregate([
    {
      $group: {
        _id: null,
        totale_prodotti: { $sum: 1 },
        prodotti_sotto_scorta: {
          $sum: { $cond: [{ $lte: ['$quantita_disponibile', '$scorta_minima'] }, 1, 0] }
        },
        prodotti_esauriti: {
          $sum: { $cond: [{ $eq: ['$quantita_disponibile', 0] }, 1, 0] }
        },
      }
    }
  ]);

  const unMeseFa = new Date();
  unMeseFa.setDate(unMeseFa.getDate() - 30);
  const movimenti_ultimo_mese = await MovimentoMagazzino.countDocuments({
    createdAt: { $gte: unMeseFa }
  });

  res.json({ ...totali, movimenti_ultimo_mese });
};

exports.carico = async (req, res) => {
  const { id_prodotto, quantita, note } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const prodotto = await Prodotto.findByIdAndUpdate(
      id_prodotto,
      { $inc: { quantita_disponibile: quantita } },
      { new: true, session }
    );
    if (!prodotto) throw new AppError('Prodotto non trovato', 404);

    const [movimento] = await MovimentoMagazzino.create([{
      id_prodotto, tipo_movimento: 'carico', quantita, note: note || null,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ id: movimento._id, message: 'Carico registrato', prodotto });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

exports.scarico = async (req, res) => {
  const { id_prodotto, quantita, note } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const prodotto = await Prodotto.findById(id_prodotto).session(session);
    if (!prodotto) throw new AppError('Prodotto non trovato', 404);
    if (prodotto.quantita_disponibile < quantita)
      throw new AppError(`Quantità insufficiente. Disponibile: ${prodotto.quantita_disponibile}`, 400);

    await Prodotto.findByIdAndUpdate(
      id_prodotto,
      { $inc: { quantita_disponibile: -quantita } },
      { session }
    );

    const [movimento] = await MovimentoMagazzino.create([{
      id_prodotto, tipo_movimento: 'scarico', quantita, note: note || null,
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ id: movimento._id, message: 'Scarico registrato' });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};