// Middleware globale per la gestione centralizzata degli errori
// Riceve 4 parametri: Express lo riconosce come error-handler
module.exports = (err, req, res, next) => {
  // Errore di validazione Mongoose (campi obbligatori mancanti, enum errati, ecc.)
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join(', ') });
  }
  // ObjectId non valido (es. richiesta /campi/abc con ID malformato)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'ID non valido' });
  }

  // Errore generico: usa lo statusCode dell'AppError o 500 come default
  const status = err.statusCode || 500;
  const message = err.message || 'Errore interno del server';
  if (process.env.NODE_ENV !== 'production') console.error(err); // Log solo in sviluppo
  res.status(status).json({ error: message });
};