const serverless = require('serverless-http');
const connectDB = require('../backend/config/db');
const app = require('../backend/app');

let cachedHandler;

module.exports = async (req, res) => {
  // 1. Connetti al DB
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ error: 'Errore connessione DB' });
  }

  // 2. Gestisci l'handler
  if (!cachedHandler) {
    cachedHandler = serverless(app);
  }

  // 3. Esegui
  return cachedHandler(req, res);
};