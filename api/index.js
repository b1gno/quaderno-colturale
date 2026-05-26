// Entry point serverless per Vercel (esporta una funzione handler lambda)
const serverless = require('serverless-http');
const connectDB = require('../backend/config/db');
const app = require('../backend/app');

// Cache dell'handler serverless per evitare di ricrearlo a ogni richiesta
let cachedHandler;

module.exports = async (req, res) => {
  // 1. Connetti al DB (la cache interna di db.js evita connessioni multiple)
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ error: 'Errore connessione DB' });
  }

  // 2. Crea l'handler serverless-http al primo avvio (lo riutilizza dopo)
  if (!cachedHandler) {
    cachedHandler = serverless(app);
  }

  // 3. Esegui la richiesta attraverso l'handler serverless
  return cachedHandler(req, res);
};