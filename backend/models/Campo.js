const mongoose = require('mongoose');

const campoSchema = new mongoose.Schema({
  nome:         { type: String, required: [true, 'Il nome è obbligatorio'], trim: true },
  superficie:   { type: Number, min: 0 },
  tipo_terreno: { type: String, enum: ['Argilloso','Sabbioso','Medio impasto','Limoso','Franco', null] },
  note:         String,
}, { timestamps: true });

module.exports = mongoose.model('Campo', campoSchema);