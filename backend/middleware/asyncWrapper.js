// Wrapper per gestire le eccezioni nelle route asincrone:
// cattura eventuali errori lanciati da funzioni async e li passa al middleware errorHandler
module.exports = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);