// Carica le variabili d'ambiente dal file .env nella root del progetto
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const connectDB = require('./config/db');
const app = require('./app');

// Porta del server: usa la variabile d'ambiente PORT o default 3000
const PORT = process.env.PORT || 3000;
// Connette MongoDB e, solo dopo, avvia il server HTTP
connectDB().then(() => app.listen(PORT, () =>
  console.log(`🚀 Server su http://localhost:${PORT}`)
));
