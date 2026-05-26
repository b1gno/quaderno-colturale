const mongoose = require('mongoose');

// Su Vercel non serve caricare dotenv con un path, le variabili sono già in process.env
const MONGODB_URI = process.env.MONGODB_URI;

// Gestione della cache per evitare di aprire troppe connessioni (importante per Vercel)
const cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

// Funzione che connette a MongoDB con caching per ambienti serverless (Vercel)
const connectDB = async () => {
  // Log di debug (vedrai solo la parte del server, non la password)
  console.log("Tentativo di connessione a:", MONGODB_URI ? MONGODB_URI.split('@')[1] : "URL MANCANTE");

  // Se manca la stringa di connessione, lancia errore
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI non trovato nelle variabili d\'ambiente di Vercel.');
  }

  // Se c'è già una connessione attiva in cache, la riutilizza
  if (cached.conn) {
    return cached.conn;
  }

  // Se non c'è già una promessa in corso, avvia la connessione
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 15000, // Timeout selezione server: 15 secondi
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB connesso con successo');
      return mongooseInstance;
    });
  }

  // Attende che la promessa si risolva e salva la connessione in cache
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    // In caso di errore resetta la promessa per tentativi futuri
    cached.promise = null;
    console.error('❌ Errore durante la connessione a MongoDB:', e);
    throw e;
  }

  return cached.conn;
};

module.exports = connectDB;