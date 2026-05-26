// Classe personalizzata per errori operativi con codice HTTP
// Permette di lanciare errori con uno status code specifico (es. 400, 404, 403)
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode; // Codice HTTP associato all'errore
  }
}
module.exports = AppError;