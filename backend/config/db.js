const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

const connectDB = async () => {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((conn) => {
      cached.conn = conn;
      console.log('✅ MongoDB connesso');
      return conn;
    });
  }

  return cached.promise;
};

module.exports = connectDB;