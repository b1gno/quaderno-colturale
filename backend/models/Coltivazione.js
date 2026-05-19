const mongoose = require('mongoose');

const coltivazioneSchema = new mongoose.Schema({
  id_utente:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  id_campo:     { type: mongoose.Schema.Types.ObjectId, ref: 'Campo', required: true },
  tipo_coltura: { type: String, required: [true, 'Il tipo di coltura è obbligatorio'], trim: true },
  data_semina:  Date,
  periodo:      { type: String, enum: ['Primavera-Estate','Autunno-Inverno','Annuale', null] },
  stato:        { type: String, default: 'In preparazione',
                  enum: ['In preparazione','Seminato','In crescita','In produzione','In raccolta','Completato'] },
}, { timestamps: true });

module.exports = mongoose.model('Coltivazione', coltivazioneSchema);