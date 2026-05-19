const mongoose = require('mongoose');

// Su Vercel non serve caricare dotenv con un path, le variabili sono già in process.env
const MONGODB_URI = process.env.MONGODB_URI;

// Gestione della cache per evitare di aprire troppe connessioni (importante per Vercel)
const cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

const connectDB = async () => {
  // Log di debug (vedrai solo la parte del server, non la password)
  console.log("Tentativo di connessione a:", MONGODB_URI ? MONGODB_URI.split('@')[1] : "URL MANCANTE");

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI non trovato nelle variabili d\'ambiente di Vercel.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB connesso con successo');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Errore durante la connessione a MongoDB:', e);
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;