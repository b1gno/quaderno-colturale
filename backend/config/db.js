require('dotenv').config();
const mongoose = require('mongoose');

const getMongoUri = () => {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;

  const host = process.env.DB_HOST;
  const dbName = process.env.DB_NAME || 'quaderno_campo';
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASSWORD;

  if (!host) return null;

  const credentials = user ? `${encodeURIComponent(user)}${pass ? `:${encodeURIComponent(pass)}` : ''}@` : '';
  return `mongodb://${credentials}${host}/${dbName}`;
};

const MONGODB_URI = getMongoUri();
const cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

const connectDB = async () => {
    console.log("Tentativo di connessione a:", MONGODB_URI ? MONGODB_URI.split('@')[1] : "URL MANCANTE");
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI non definito. Aggiungi backend/.env con MONGODB_URI oppure imposta DB_HOST/DB_NAME.');
  }

  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    }).then((conn) => {
      cached.conn = conn;
      console.log('✅ MongoDB connesso');
      return conn;
    });
  }

  return cached.promise;
};

module.exports = connectDB;