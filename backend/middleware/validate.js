const AppError = require('../utils/AppError');

const check = (condition, message) => {
  if (condition) throw new AppError(message, 400);
};

exports.validateCampo = (req, res, next) => {
  check(!req.body.nome?.trim(), 'Il nome del campo è obbligatorio');
  next();
};

exports.validateColtivazione = (req, res, next) => {
  check(!req.body.id_campo, 'Il campo è obbligatorio');
  check(!req.body.tipo_coltura?.trim(), 'Il tipo di coltura è obbligatorio');
  next();
};

exports.validateProdotto = (req, res, next) => {
  check(!req.body.nome?.trim(), 'Il nome del prodotto è obbligatorio');
  next();
};

exports.validateAttivita = (req, res, next) => {
  check(!req.body.data, 'La data è obbligatoria');
  check(!req.body.id_campo, 'Il campo è obbligatorio');
  next();
};

exports.validateCarico = (req, res, next) => {
  check(!req.body.id_prodotto, 'Il prodotto è obbligatorio');
  check(!req.body.quantita || req.body.quantita <= 0, 'Quantità non valida');
  next();
};