const mongoose = require('mongoose');

// Schema Prodotto: rappresenta un prodotto utilizzato in agricoltura (fitosanitari, concimi, ecc.)
const prodottoSchema = new mongoose.Schema({
  id_utente:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Utente proprietario
  nome:                 { type: String, required: [true, 'Il nome è obbligatorio'], trim: true }, // Nome del prodotto
  categoria:            { type: String, default: 'altro', // Categoria merceologica
                          enum: ['fitosanitario','concime','diserbante','altro'] },
  unita_misura:         { type: String, default: 'kg' }, // Unità di misura (kg, l, pezzi, ecc.)
  scorta_minima:        { type: Number, default: 0, min: 0 }, // Soglia minima di scorta per avvisi
  quantita_disponibile: { type: Number, default: 0, min: 0 }, // Quantità attualmente in magazzino
}, { timestamps: true });

module.exports = mongoose.model('Prodotto', prodottoSchema);