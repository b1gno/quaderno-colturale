const mongoose = require('mongoose');

// Schema Coltivazione: rappresenta una coltura piantata in un campo specifico
const coltivazioneSchema = new mongoose.Schema({
  id_utente:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Utente che gestisce la coltivazione
  id_campo:     { type: mongoose.Schema.Types.ObjectId, ref: 'Campo', required: true }, // Campo in cui avviene la coltivazione
  tipo_coltura: { type: String, required: [true, 'Il tipo di coltura è obbligatorio'], trim: true }, // Es. "Pomodori", "Grano", "Mais"
  data_semina:  Date, // Data in cui è stata seminata la coltura
  periodo:      { type: String, enum: ['Primavera-Estate','Autunno-Inverno','Annuale', null] }, // Periodo stagionale di coltivazione
  stato:        { type: String, default: 'In preparazione', // Stato del ciclo colturale
                  enum: ['In preparazione','Seminato','In crescita','In produzione','In raccolta','Completato'] },
}, { timestamps: true }); // createdAt = data creazione, updatedAt = data ultima modifica

module.exports = mongoose.model('Coltivazione', coltivazioneSchema);