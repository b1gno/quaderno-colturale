module.exports = (err, req, res, next) => {
  // Errore di validazione Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  // ObjectId non valido (es. /campi/abc)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID non valido' });
  }

  const status = err.statusCode || 500;
  const message = err.message || 'Errore interno del server';
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({ error: message });
};