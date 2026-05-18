const mongoose = require('mongoose');

const prodottoUsatoSchema = new mongoose.Schema({
  id_prodotto:        { type: mongoose.Schema.Types.ObjectId, ref: 'Prodotto', required: true },
  quantita_utilizzata: { type: Number, required: true, min: 0.01 },
}, { _id: false });

const attivitaSchema = new mongoose.Schema({
  data:             { type: Date, required: [true, 'La data è obbligatoria'] },
  id_campo:         { type: mongoose.Schema.Types.ObjectId, ref: 'Campo', required: true },
  id_coltivazione:  { type: mongoose.Schema.Types.ObjectId, ref: 'Coltivazione', default: null },
  tipo_attivita:    String,
  descrizione:      String,
  prodotti_usati:   [prodottoUsatoSchema],  // array embedded di references
}, { timestamps: true });

module.exports = mongoose.model('Attivita', attivitaSchema);