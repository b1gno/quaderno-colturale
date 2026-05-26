const mongoose = require('mongoose');

// Sotto-schema per i prodotti usati durante un'attività (incorporato, senza _id proprio)
const prodottoUsatoSchema = new mongoose.Schema({
  id_prodotto:        { type: mongoose.Schema.Types.ObjectId, ref: 'Prodotto', required: true }, // Prodotto utilizzato
  quantita_utilizzata: { type: Number, required: true, min: 0.01 }, // Quantità usata
}, { _id: false }); // _id: false evita di creare un ObjectId per ogni elemento

// Schema Attivita: registra un'operazione svolta in un campo (es. irrigazione, raccolta, trattamento)
const attivitaSchema = new mongoose.Schema({
  id_utente:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Utente che ha svolto l'attività
  data:             { type: Date, required: [true, 'La data è obbligatoria'] }, // Data in cui è stata svolta
  id_campo:         { type: mongoose.Schema.Types.ObjectId, ref: 'Campo', required: true }, // Campo interessato
  id_coltivazione:  { type: mongoose.Schema.Types.ObjectId, ref: 'Coltivazione', default: null }, // Coltivazione coinvolta (opzionale)
  tipo_attivita:    String, // Tipo: "irrigazione", "concimazione", "raccolta", "trattamento", ecc.
  descrizione:      String, // Descrizione testuale libera dell'attività
  prodotti_usati:   [prodottoUsatoSchema], // Elenco di prodotti utilizzati con relative quantità
}, { timestamps: true });

module.exports = mongoose.model('Attivita', attivitaSchema);