const Attivita = require('../models/Attivita');
const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const Prodotto = require('../models/Prodotto');
const AppError = require('../utils/AppError');

// Filtro per isolare i dati dell'utente corrente
const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

// Ottiene tutte le attivita con riferimenti popolati
// Riceve: req.user per filtro
// Restituisce: array di Attivita con populate di id_campo, id_coltivazione, prodotti_usati
exports.getAll = async (req, res) => {
  const attivita = await Attivita.find(userFilter(req))
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura')
    .populate('prodotti_usati.id_prodotto', 'nome unita_misura')
    .sort('-data'); // piu' recenti prima
  res.json(attivita);
};

// Ottiene dettaglio di una attivita per ID
// Riceve: req.params.id
// Restituisce: oggetto Attivita completo di riferimenti
exports.getById = async (req, res) => {
  const attivita = await Attivita.findOne({ _id: req.params.id, ...userFilter(req) })
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura')
    .populate('prodotti_usati.id_prodotto', 'nome unita_misura');
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json(attivita);
};

// Ottiene tutte le attivita relative a uno specifico campo
// Riceve: req.params.id (ID campo)
// Restituisce: array di Attivita filtrato e ordinato
exports.getByCampo = async (req, res) => {
  const attivita = await Attivita.find({ id_campo: req.params.id, ...userFilter(req) })
    .populate('id_campo', 'nome')
    .sort('-data');
  res.json(attivita);
};

// Crea una nuova attivita e scarica automaticamente i prodotti usati dal magazzino
// Riceve: dati attivita nel body (include opzionalmente array prodotti con quantita_utilizzata)
// Restituisce: attivita creata e numero di prodotti effettivamente scaricati
exports.create = async (req, res) => {
  let prodottiScaricati = 0;
  const prodottiUsati = req.body.prodotti || [];

  // Prepara i dati per la creazione dell'attivita'
  const attivitaData = { ...req.body, id_utente: req.user._id, prodotti_usati: prodottiUsati };

  const attivita = await Attivita.create(attivitaData);

  // Ciclo per scaricare ogni prodotto usato, se disponibile in quantita' sufficiente
  for (const p of prodottiUsati) {
    const prodotto = await Prodotto.findOne({ _id: p.id_prodotto, ...userFilter(req) });
    // Verifica esistenza prodotto e quantita' disponibile
    if (prodotto && prodotto.quantita_disponibile >= p.quantita_utilizzata) {
      // Decrementa la quantita' disponibile
      await Prodotto.findByIdAndUpdate(prodotto._id, {
        $inc: { quantita_disponibile: -p.quantita_utilizzata }
      });
      // Registra il movimento di scarico
      await MovimentoMagazzino.create({
        id_utente: req.user._id,
        id_prodotto: p.id_prodotto,
        tipo_movimento: 'scarico',
        quantita: p.quantita_utilizzata,
        note: `Scarico automatico da attività: ${req.body.tipo_attivita || ''}`,
        data: req.body.data
      });
      prodottiScaricati++;
    }
  }

  res.status(201).json({ message: 'Attività creata', attivita, prodotti_scaricati: prodottiScaricati });
};

// Aggiorna una attivita esistente
// NOTA: non modifica automaticamente il magazzino per i prodotti
// Riceve: req.params.id e dati aggiornati
// Restituisce: attivita aggiornata
exports.update = async (req, res) => {
  const attivita = await Attivita.findOneAndUpdate(
    { _id: req.params.id, ...userFilter(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json({ message: 'Attività aggiornata', attivita });
};

// Elimina una attivita per ID
// NOTA: non ripristina automaticamente i prodotti nel magazzino
// Riceve: req.params.id
// Restituisce: messaggio conferma
exports.delete = async (req, res) => {
  const attivita = await Attivita.findOneAndDelete({ _id: req.params.id, ...userFilter(req) });
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json({ message: 'Attività eliminata' });
};
