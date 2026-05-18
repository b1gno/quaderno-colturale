const mongoose = require('mongoose');

const prodottoSchema = new mongoose.Schema({
  nome:                 { type: String, required: [true, 'Il nome è obbligatorio'], trim: true },
  categoria:            { type: String, default: 'altro',
                          enum: ['fitosanitario','concime','diserbante','altro'] },
  unita_misura:         { type: String, default: 'kg' },
  scorta_minima:        { type: Number, default: 0, min: 0 },
  quantita_disponibile: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Prodotto', prodottoSchema);