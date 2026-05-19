const mongoose = require('mongoose');

const movimentoSchema = new mongoose.Schema({
  id_utente:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id_prodotto:    { type: mongoose.Schema.Types.ObjectId, ref: 'Prodotto', required: true },
  tipo_movimento: { type: String, enum: ['carico','scarico'], required: true },
  quantita:       { type: Number, required: true, min: 0.01 },
  note:           String,
}, { timestamps: true });

module.exports = mongoose.model('MovimentoMagazzino', movimentoSchema);