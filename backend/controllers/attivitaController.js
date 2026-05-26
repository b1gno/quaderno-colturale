const Attivita = require('../models/Attivita');
const Campo = require('../models/Campo');
const MovimentoMagazzino = require('../models/MovimentoMagazzino');
const Prodotto = require('../models/Prodotto');
const AppError = require('../utils/AppError');

const WMO_CODES = {
  0: 'Sereno', 1: 'Prevalentemente sereno', 2: 'Parzialmente nuvoloso', 3: 'Coperto',
  45: 'Nebbia', 48: 'Nebbia con depositi',
  51: 'Pioviggine leggera', 53: 'Pioviggine moderata', 55: 'Pioviggine intensa',
  56: 'Pioviggine gelata', 57: 'Pioviggine gelata intensa',
  61: 'Pioggia leggera', 63: 'Pioggia moderata', 65: 'Pioggia intensa',
  66: 'Pioggia gelata', 67: 'Pioggia gelata intensa',
  71: 'Neve leggera', 73: 'Neve moderata', 75: 'Neve intensa',
  77: 'Granelli di neve',
  80: 'Rovescio leggero', 81: 'Rovescio moderato', 82: 'Rovescio intenso',
  85: 'Rovescio di neve leggero', 86: 'Rovescio di neve intenso',
  95: 'Temporale', 96: 'Temporale con grandine', 99: 'Temporale con grandine intensa'
};

async function fetchMeteo(lat, lng, date) {
  try {
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code&timezone=Europe/Rome`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.daily) return null;
    const idx = 0;
    return {
      temperatura_max: data.daily.temperature_2m_max[idx],
      temperatura_min: data.daily.temperature_2m_min[idx],
      precipitazioni: data.daily.precipitation_sum[idx],
      codice_meteo: data.daily.weather_code[idx],
      descrizione: WMO_CODES[data.daily.weather_code[idx]] || 'N/A'
    };
  } catch { return null; }
}

const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

exports.getAll = async (req, res) => {
  const attivita = await Attivita.find(userFilter(req))
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura')
    .populate('prodotti_usati.id_prodotto', 'nome unita_misura')
    .sort('-data');
  res.json(attivita);
};

exports.getById = async (req, res) => {
  const attivita = await Attivita.findOne({ _id: req.params.id, ...userFilter(req) })
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura')
    .populate('prodotti_usati.id_prodotto', 'nome unita_misura');
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json(attivita);
};

exports.getByCampo = async (req, res) => {
  const attivita = await Attivita.find({ id_campo: req.params.id, ...userFilter(req) })
    .populate('id_campo', 'nome')
    .sort('-data');
  res.json(attivita);
};

exports.create = async (req, res) => {
  let prodottiScaricati = 0;
  const prodottiUsati = req.body.prodotti || [];

  const attivitaData = { ...req.body, id_utente: req.user._id, prodotti_usati: prodottiUsati };

  const campo = await Campo.findOne({ _id: req.body.id_campo, ...(req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id }) });
  if (campo && campo.latitudine && campo.longitudine) {
    const meteo = await fetchMeteo(campo.latitudine, campo.longitudine, req.body.data);
    if (meteo) attivitaData.meteo = meteo;
  }

  const attivita = await Attivita.create(attivitaData);

  for (const p of prodottiUsati) {
    const prodotto = await Prodotto.findOne({ _id: p.id_prodotto, ...userFilter(req) });
    if (prodotto && prodotto.quantita_disponibile >= p.quantita_utilizzata) {
      await Prodotto.findByIdAndUpdate(prodotto._id, {
        $inc: { quantita_disponibile: -p.quantita_utilizzata }
      });
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

exports.update = async (req, res) => {
  const attivita = await Attivita.findOneAndUpdate(
    { _id: req.params.id, ...userFilter(req) },
    req.body,
    { new: true, runValidators: true }
  );
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json({ message: 'Attività aggiornata', attivita });
};

exports.delete = async (req, res) => {
  const attivita = await Attivita.findOneAndDelete({ _id: req.params.id, ...userFilter(req) });
  if (!attivita) throw new AppError('Attività non trovata', 404);
  res.json({ message: 'Attività eliminata' });
};
