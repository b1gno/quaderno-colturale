const PDFDocument = require('pdfkit');
const Attivita = require('../models/Attivita');
const Prodotto = require('../models/Prodotto');
const Campo = require('../models/Campo');

// Filtro sicurezza: ogni utente vede solo i propri dati
const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

// Genera un report PDF completo del quaderno di campo
// Parametri query opzionali:
// - mese (1-12): filtra attivita per mese specifico
// - anno (YYYY): anno di riferimento (default: anno corrente)
// - stagione: "primavera", "estate", "autunno", "inverno" per filtro stagionale
// Restituisce: stream PDF come download diretto
exports.pdfReport = async (req, res) => {
  const { mese, anno, stagione } = req.query;
  const now = new Date();
  const year = parseInt(anno) || now.getFullYear();
  const month = mese ? parseInt(mese) - 1 : null; // converti mese 1-based a 0-based per Date

  // Costruisce il filtro data in base ai parametri ricevuti
  let dateFilter = {};
  if (month !== null) {
    // Filtro per mese specifico: da primo giorno mese a primo giorno mese successivo
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    dateFilter = { data: { $gte: start, $lt: end } };
  } else if (stagione) {
    // Definisci intervalli date per ogni stagione
    const spring = { $gte: new Date(year, 2, 1), $lt: new Date(year, 5, 1) };   // marzo-maggio
    const summer = { $gte: new Date(year, 5, 1), $lt: new Date(year, 8, 1) };   // giugno-agosto
    const fall = { $gte: new Date(year, 8, 1), $lt: new Date(year, 11, 1) };    // settembre-novembre
    const winter = { $gte: new Date(year, 11, 1), $lt: new Date(year + 1, 2, 1) }; // dicembre-febbraio
    const map = { primavera: spring, estate: summer, autunno: fall, inverno: winter };
    // Usa la stagione selezionata o default all'anno intero
    dateFilter = map[stagione] || { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) };
  } else {
    // Default: anno intero
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    dateFilter = { data: { $gte: start, $lt: end } };
  }

  // Estrai dati con riferimenti popolati per il report
  const attivita = await Attivita.find({ ...userFilter(req), ...dateFilter })
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura')
    .populate('prodotti_usati.id_prodotto', 'nome unita_misura')
    .sort('data'); // in ordine cronologico nel PDF

  const campi = await Campo.find(userFilter(req)).sort('nome');
  const prodotti = await Prodotto.find(userFilter(req)).sort('nome');

  // Inizializza documento PDF
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  // Imposta headers per il download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=quaderno_${year}_${month !== null ? month + 1 : 'annuale'}.pdf`);
  // Collega lo stream PDF alla risposta HTTP
  doc.pipe(res);

  // Costanti per lo stile del documento
  const primary = '#15803d';   // verde
  const gray = '#64748b';
  const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

  // Funzione per aggiungere footer con numero pagina
  let pageNum = 1;
  const addFooter = () => {
    doc.save();
    doc.fontSize(8).font('Helvetica').fillColor(gray)
      .text(`Pagina ${pageNum}`, 50, 750, { align: 'center' });
    doc.restore();
  };
  // Aggiorna contatore e aggiungi footer ad ogni nuova pagina creata automaticamente
  doc.on('pageAdded', () => { pageNum++; addFooter(); });

  // Sezione: Intestazione documento
  doc.fontSize(22).font('Helvetica-Bold').fillColor(primary).text('Quaderno di Campo Digitale', { align: 'center' });
  doc.fontSize(12).font('Helvetica').fillColor(gray).text(`Report ${stagione ? stagione.charAt(0).toUpperCase() + stagione.slice(1) : (month !== null ? monthNames[month] : 'ANNUALE')} ${year}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(9).fillColor(gray).text(`Generato il ${now.toLocaleDateString('it-IT')} — ${req.user.nome || req.user.email}`, { align: 'center' });
  doc.moveDown(2);

  // Sezione: Riepilogo numeri
  doc.fontSize(14).font('Helvetica-Bold').fillColor(primary).text('Riepilogo');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#1e293b');
  doc.text(`Campi attivi: ${campi.length}`);
  doc.text(`Attività registrate: ${attivita.length}`);
  doc.text(`Prodotti in magazzino: ${prodotti.length}`);
  doc.moveDown(1.5);

  // Sezione: Elenco attivita
  doc.fontSize(14).font('Helvetica-Bold').fillColor(primary).text('Registro Attività');
  doc.moveDown(0.5);
  if (!attivita.length) {
    doc.fontSize(10).font('Helvetica').fillColor(gray).text('Nessuna attività nel periodo selezionato.');
  } else {
    for (const a of attivita) {
      const data = a.data ? new Date(a.data).toLocaleDateString('it-IT') : '-';
      const campo = a.id_campo?.nome || '-';
      const tipo = a.tipo_attivita || 'Generico';
      const descr = a.descrizione || '';

      // Linea separatrice orizzontale
      let y = doc.y;
      doc.rect(50, y, 495, 1).fill(primary);
      doc.moveDown(0.3);

      // Intestazione attivita
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text(`${data} — ${tipo} — ${campo}`);
      if (descr) doc.fontSize(9).font('Helvetica').fillColor(gray).text(descr, { indent: 10 });

      // Elenco prodotti usati nell'attivita'
      if (a.prodotti_usati && a.prodotti_usati.length > 0) {
        doc.fontSize(8).font('Helvetica').fillColor('#1e293b').text('   Prodotti:', { indent: 10 });
        a.prodotti_usati.forEach(p => {
          doc.fontSize(8).fillColor(gray)
            .text(`     • ${p.id_prodotto?.nome || '-'}: ${p.quantita_utilizzata} ${p.id_prodotto?.unita_misura || ''}`, { indent: 10 });
        });
      }
      doc.moveDown(0.8);

      // Paginazione automatica se contenuto supera margine inferiore
      if (doc.y > 700) doc.addPage();
    }
  }

  // Sezione: Magazzino prodotti
  // Vai a nuova pagina se spazio insufficiente
  if (doc.y > 650) doc.addPage();
  else doc.moveDown(2);
  doc.fontSize(14).font('Helvetica-Bold').fillColor(primary).text('Magazzino');
  doc.moveDown(0.5);
  if (!prodotti.length) {
    doc.fontSize(10).font('Helvetica').fillColor(gray).text('Nessun prodotto in magazzino.');
  } else {
    prodotti.forEach(p => {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text(`${p.nome}`);
      doc.fontSize(9).font('Helvetica').fillColor(gray)
        .text(`   Quantità: ${p.quantita_disponibile} ${p.unita_misura} — Scorta min: ${p.scorta_minima} — ${p.categoria || 'altro'}`);
      doc.moveDown(0.3);
    });
  }

  // Aggiungi footer alla prima pagina (l'evento pageAdded non si attiva per la pagina iniziale)
  addFooter();

  // Finalizza il documento PDF e invialo
  doc.end();
};
