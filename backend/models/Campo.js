const mongoose = require('mongoose');

// Schema Campo: rappresenta un appezzamento di terra dell'utente
const campoSchema = new mongoose.Schema({
  id_utente:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Riferimento all'utente proprietario
  nome:         { type: String, required: [true, 'Il nome è obbligatorio'], trim: true }, // Nome del campo
  superficie:   { type: Number, min: 0 }, // Superficie in ettari (o unità scelta dall'utente)
  tipo_terreno: { type: String, enum: ['Argilloso','Sabbioso','Medio impasto','Limoso','Franco', null] }, // Tipologia di terreno

  note:         String, // Note opzionali sul campo
}, { timestamps: true });

module.exports = mongoose.model('Campo', campoSchema);