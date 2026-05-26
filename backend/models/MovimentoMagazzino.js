const mongoose = require('mongoose');

// Schema MovimentoMagazzino: registra un'entrata (carico) o uscita (scarico) di prodotto
const movimentoSchema = new mongoose.Schema({
  id_utente:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Utente che registra il movimento
  id_prodotto:    { type: mongoose.Schema.Types.ObjectId, ref: 'Prodotto', required: true }, // Prodotto movimentato
  tipo_movimento: { type: String, enum: ['carico','scarico'], required: true }, // carico = acquisto/ingresso, scarico = consumo/uscita
  quantita:       { type: Number, required: true, min: 0.01 }, // Quantità movimentata
  note:           String, // Note opzionali sul movimento
}, { timestamps: true }); // createdAt = data del movimento

module.exports = mongoose.model('MovimentoMagazzino', movimentoSchema);