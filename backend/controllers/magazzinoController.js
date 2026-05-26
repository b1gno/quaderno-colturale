const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const Prodotto = require('../models/Prodotto');
const AppError = require('../utils/AppError');

// Filtro per la sicurezza: ogni utente vede solo i propri dati (admin vede tutto)
const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

// Ottiene lo storico completo dei movimenti di magazzino
// Riceve: req.user per filtro
// Restituisce: array di MovimentoMagazzino con riferimento al prodotto
exports.getMovimenti = async (req, res) => {
  const movimenti = await MovimentoMagazzino.find(userFilter(req))
    .populate('id_prodotto', 'nome unita_misura')
    .sort('-createdAt'); // piu' recenti prima
  res.json(movimenti);
};

// Calcola statistiche generali del magazzino e previsioni di consumo
// Basato sui consumi degli ultimi 90 giorni
// Riceve: req.user per filtro
// Restituisce: obj con totale_prodotti, prodotti_sotto_scorta, previsioni per prodotto
exports.getStatistiche = async (req, res) => {
  const prodotti = await Prodotto.find(userFilter(req));
  const totaleProdotti = prodotti.length;
  // Conta quanti prodotti hanno quantita disponibile inferiore o uguale alla soglia
  const prodottiSottoScorta = prodotti.filter(p => p.quantita_disponibile <= p.scorta_minima).length;

  // Calcola data di riferimento per consumi ultimi 90 giorni
  const novantaGiorniFa = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  // Estrai tutti gli scarichi in questo periodo
  const scarichi = await MovimentoMagazzino.find({
    ...userFilter(req),
    tipo_movimento: 'scarico',
    createdAt: { $gte: novantaGiorniFa }
  });

  // Accumula consumi per ogni prodotto
  const consumi = {};
  scarichi.forEach(m => {
    const id = String(m.id_prodotto);
    consumi[id] = (consumi[id] || 0) + m.quantita;
  });

  // Per ogni prodotto calcola previsioni di esaurimento
  const previsioni = prodotti.map(p => {
    const id = String(p._id);
    const totaleConsumato = consumi[id] || 0;
    const consumoGiornaliero = totaleConsumato / 90;
    let giorniRimanenti = null;
    // Calcola giorni rimanenti solo se c'e' consumo attivo e scorte disponibili
    if (consumoGiornaliero > 0 && p.quantita_disponibile > 0) {
      giorniRimanenti = Math.floor(p.quantita_disponibile / consumoGiornaliero);
    }
    return {
      _id: p._id,
      nome: p.nome,
      unita_misura: p.unita_misura,
      quantita_disponibile: p.quantita_disponibile,
      scorta_minima: p.scorta_minima,
      consumo_giornaliero: Math.round(consumoGiornaliero * 100) / 100, // arrotonda a 2 decimali
      giorni_rimanenti: giorniRimanenti,
      sotto_scorta: p.quantita_disponibile <= p.scorta_minima
    };
  });

  res.json({ totale_prodotti: totaleProdotti, prodotti_sotto_scorta: prodottiSottoScorta, previsioni });
};

// Calcola previsioni dettagliate di esaurimento scorte
// Simile a getStatistiche ma ritorna solo l'array di previsioni con info aggiuntive
// Riceve: req.user per filtro
// Restituisce: array di previsioni con data_esaurimento calcolata
exports.getPrevisioni = async (req, res) => {
  const prodotti = await Prodotto.find(userFilter(req));
  const novantaGiorniFa = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const scarichi = await MovimentoMagazzino.find({
    ...userFilter(req),
    tipo_movimento: 'scarico',
    createdAt: { $gte: novantaGiorniFa }
  });

  // Accumula consumi storici per prodotto
  const consumi = {};
  scarichi.forEach(m => {
    const id = String(m.id_prodotto);
    consumi[id] = (consumi[id] || 0) + m.quantita;
  });

  // Calcola previsioni per ogni prodotto
  const previsioni = prodotti.map(p => {
    const id = String(p._id);
    const totaleConsumato = consumi[id] || 0;
    const consumoGiornaliero = totaleConsumato / 90;
    let giorniRimanenti = null;
    if (consumoGiornaliero > 0 && p.quantita_disponibile > 0) {
      giorniRimanenti = Math.floor(p.quantita_disponibile / consumoGiornaliero);
    }
    return {
      _id: p._id,
      nome: p.nome,
      unita_misura: p.unita_misura,
      categoria: p.categoria,
      quantita_disponibile: p.quantita_disponibile,
      scorta_minima: p.scorta_minima,
      consumo_giornaliero: Math.round(consumoGiornaliero * 100) / 100,
      giorni_rimanenti: giorniRimanenti,
      // Calcola data stimata di esaurimento (solo se giorniRimanenti e' noto)
      data_esaurimento: giorniRimanenti !== null ? new Date(Date.now() + giorniRimanenti * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
      sotto_scorta: p.quantita_disponibile <= p.scorta_minima
    };
  });

  res.json(previsioni);
};

// Registra un carico di magazzino (aggiunta di quantita ad un prodotto)
// Riceve nel body: id_prodotto, quantita, note (opzionale)
// Restituisce: movimento creato e messaggio conferma
exports.carico = async (req, res) => {
  const prodotto = await Prodotto.findOne({ _id: req.body.id_prodotto, ...userFilter(req) });
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);

  // Incrementa la quantita disponibile
  await Prodotto.findByIdAndUpdate(prodotto._id, {
    $inc: { quantita_disponibile: req.body.quantita }
  });

  // Registra il movimento per lo storico
  const movimento = await MovimentoMagazzino.create({
    id_utente: req.user._id,
    id_prodotto: req.body.id_prodotto,
    tipo_movimento: 'carico',
    quantita: req.body.quantita,
    note: req.body.note || ''
  });

  res.status(201).json({ message: 'Carico registrato', movimento });
};

// Registra uno scarico di magazzino (rimozione di quantita da un prodotto)
// Riceve nel body: id_prodotto, quantita, note (opzionale)
// Restituisce: movimento creato o errore se quantita insufficiente
exports.scarico = async (req, res) => {
  const prodotto = await Prodotto.findOne({ _id: req.body.id_prodotto, ...userFilter(req) });
  if (!prodotto) throw new AppError('Prodotto non trovato', 404);
  // Verifica che la quantita richiesta sia disponibile
  if (prodotto.quantita_disponibile < req.body.quantita)
    throw new AppError('Quantità insufficiente', 400);

  // Decrementa la quantita disponibile
  await Prodotto.findByIdAndUpdate(prodotto._id, {
    $inc: { quantita_disponibile: -req.body.quantita }
  });

  // Registra il movimento per lo storico
  const movimento = await MovimentoMagazzino.create({
    id_utente: req.user._id,
    id_prodotto: req.body.id_prodotto,
    tipo_movimento: 'scarico',
    quantita: req.body.quantita,
    note: req.body.note || ''
  });

  res.status(201).json({ message: 'Scarico registrato', movimento });
};
