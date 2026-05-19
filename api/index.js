const serverless = require('serverless-http');
const connectDB = require('../backend/config/db');
const app = require('../backend/app');

let cachedHandler;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    try {
      // Si connette al database usando la variabile salvata su Vercel
      await connectDB();
      cachedHandler = serverless(app);
    } catch (err) {
      console.error('Errore critico durante l\'inizializzazione:', err);
      return res.status(500).json({ error: 'Errore connessione database' });
    }
  }
  
  // Gestisce la richiesta
  return cachedHandler(req, res);
};