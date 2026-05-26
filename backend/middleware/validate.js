const AppError = require('../utils/AppError');

// Funzione di utilità: lancia un AppError se la condizione è vera
const check = (condition, message) => {
  if (condition) throw new AppError(message, 400);
};

// Validazione per la creazione/aggiornamento di un campo
exports.validateCampo = (req, res, next) => {
  check(!req.body.nome?.trim(), 'Il nome del campo è obbligatorio');
  next();
};

// Validazione per la creazione/aggiornamento di una coltivazione
exports.validateColtivazione = (req, res, next) => {
  check(!req.body.id_campo, 'Il campo è obbligatorio');
  check(!req.body.tipo_coltura?.trim(), 'Il tipo di coltura è obbligatorio');
  next();
};

// Validazione per la creazione/aggiornamento di un prodotto
exports.validateProdotto = (req, res, next) => {
  check(!req.body.nome?.trim(), 'Il nome del prodotto è obbligatorio');
  next();
};

// Validazione per la creazione/aggiornamento di un'attività
exports.validateAttivita = (req, res, next) => {
  check(!req.body.data, 'La data è obbligatoria');
  check(!req.body.id_campo, 'Il campo è obbligatorio');
  next();
};

// Validazione per la registrazione di un carico/scarico di magazzino
exports.validateCarico = (req, res, next) => {
  check(!req.body.id_prodotto, 'Il prodotto è obbligatorio');
  check(!req.body.quantita || req.body.quantita <= 0, 'Quantità non valida');
  next();
};