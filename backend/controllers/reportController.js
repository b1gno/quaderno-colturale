const PDFDocument = require('pdfkit');
const Attivita = require('../models/Attivita');
const Prodotto = require('../models/Prodotto');
const Campo = require('../models/Campo');

const userFilter = (req) => req.user.ruolo === 'admin' ? {} : { id_utente: req.user._id };

exports.pdfReport = async (req, res) => {
  const { mese, anno, stagione } = req.query;
  const now = new Date();
  const year = parseInt(anno) || now.getFullYear();
  const month = mese ? parseInt(mese) - 1 : null;

  let dateFilter = {};
  if (month !== null) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 1);
    dateFilter = { data: { $gte: start, $lt: end } };
  } else if (stagione) {
    const spring = { $gte: new Date(year, 2, 1), $lt: new Date(year, 5, 1) };
    const summer = { $gte: new Date(year, 5, 1), $lt: new Date(year, 8, 1) };
    const fall = { $gte: new Date(year, 8, 1), $lt: new Date(year, 11, 1) };
    const winter = { $gte: new Date(year, 11, 1), $lt: new Date(year + 1, 2, 1) };
    const map = { primavera: spring, estate: summer, autunno: fall, inverno: winter };
    dateFilter = map[stagione] || { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) };
  } else {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    dateFilter = { data: { $gte: start, $lt: end } };
  }

  const attivita = await Attivita.find({ ...userFilter(req), ...dateFilter })
    .populate('id_campo', 'nome')
    .populate('id_coltivazione', 'tipo_coltura')
    .populate('prodotti_usati.id_prodotto', 'nome unita_misura')
    .sort('data');

  const campi = await Campo.find(userFilter(req)).sort('nome');
  const prodotti = await Prodotto.find(userFilter(req)).sort('nome');

  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=quaderno_${year}_${month !== null ? month + 1 : 'annuale'}.pdf`);
  doc.pipe(res);

  const primary = '#15803d';
  const gray = '#64748b';
  const monthNames = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

  // Aggiunge footer a ogni nuova pagina (senza totale pagine, non noto prima dello stream)
  let pageNum = 1;
  const addFooter = () => {
    doc.save();
    doc.fontSize(8).font('Helvetica').fillColor(gray)
      .text(`Pagina ${pageNum}`, 50, 750, { align: 'center' });
    doc.restore();
  };
  doc.on('pageAdded', () => { pageNum++; addFooter(); });

  // Intestazione
  doc.fontSize(22).font('Helvetica-Bold').fillColor(primary).text('Quaderno di Campo Digitale', { align: 'center' });
  doc.fontSize(12).font('Helvetica').fillColor(gray).text(`Report ${stagione ? stagione.charAt(0).toUpperCase() + stagione.slice(1) : (month !== null ? monthNames[month] : 'ANNUALE')} ${year}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(9).fillColor(gray).text(`Generato il ${now.toLocaleDateString('it-IT')} — ${req.user.nome || req.user.email}`, { align: 'center' });
  doc.moveDown(2);

  // Riepilogo
  doc.fontSize(14).font('Helvetica-Bold').fillColor(primary).text('Riepilogo');
  doc.moveDown(0.5);
  doc.fontSize(10).font('Helvetica').fillColor('#1e293b');
  doc.text(`Campi attivi: ${campi.length}`);
  doc.text(`Attività registrate: ${attivita.length}`);
  doc.text(`Prodotti in magazzino: ${prodotti.length}`);
  doc.moveDown(1.5);

  // Attività
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

      let y = doc.y;
      doc.rect(50, y, 495, 1).fill(primary);
      doc.moveDown(0.3);

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#1e293b').text(`${data} — ${tipo} — ${campo}`);
      if (descr) doc.fontSize(9).font('Helvetica').fillColor(gray).text(descr, { indent: 10 });

      if (a.meteo) {
        const m = a.meteo;
        doc.fontSize(8).font('Helvetica-Oblique').fillColor(gray)
          .text(`   ${m.descrizione || ''} ${m.temperatura_max != null ? m.temperatura_max + '°C' : ''} ${m.precipitazioni != null ? m.precipitazioni + 'mm' : ''}`, { indent: 10 });
      }

      if (a.prodotti_usati && a.prodotti_usati.length > 0) {
        doc.fontSize(8).font('Helvetica').fillColor('#1e293b').text('   Prodotti:', { indent: 10 });
        a.prodotti_usati.forEach(p => {
          doc.fontSize(8).fillColor(gray)
            .text(`     • ${p.id_prodotto?.nome || '-'}: ${p.quantita_utilizzata} ${p.id_prodotto?.unita_misura || ''}`, { indent: 10 });
        });
      }
      doc.moveDown(0.8);

      if (doc.y > 700) doc.addPage();
    }
  }

  // Prodotti (solo se non siamo già in una pagina nuova dopo attività)
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

  // Footer per prima pagina (pageAdded non si attiva per la pagina iniziale)
  addFooter();

  doc.end();
};
