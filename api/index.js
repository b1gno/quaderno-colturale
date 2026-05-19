const serverless = require('serverless-http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'backend', '.env') });
const connectDB = require('../backend/config/db');
const app = require('../backend/app');

let handler;

module.exports = async (req, res) => {
  if (!handler) {
    try {
      await connectDB();
      handler = serverless(app);
    } catch (err) {
      console.error('MongoDB connection error:', err);
      res.status(500).json({ error: 'Errore di connessione al database' });
      return;
    }
  }

  return handler(req, res);
};
