// ============================================================
// Configurazione
// ============================================================
const API_URL = window.location.protocol === 'file:'
  ? 'http://localhost:3000/api'
  : '/api';

// ============================================================
// Auth
// ============================================================
// Recupera il token JWT dal localStorage
function getToken() { return localStorage.getItem('token'); }
// Restituisce gli header HTTP con Content-Type e token Bearer (se presente)
function getAuthHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = 'Bearer ' + t;
  return h;
}
// Reindirizza al login se il token non esiste; ritorna false se non autenticato
function requireAuth() {
  if (!getToken()) { location.href = 'login.html'; return false; }
  return true;
}
// Rimuove token, dati utente e preferenza tema dal localStorage, poi reindirizza al login
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('darkMode');
  location.href = 'login.html';
}
// Se l'errore è di autenticazione (401, Accesso negato, Token scaduto), esegue il logout
function handleAuthError(err) {
  if (err.message && (err.message.includes('401') || err.message.includes('Accesso negato') || err.message.includes('Token'))) logout();
  throw err;
}

// ============================================================
// Dark Mode
// ============================================================
// Applica il tema scuro/chiaro leggendo la preferenza salvata nel localStorage
function initTheme() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.documentElement.classList.toggle('dark', isDark);
}
// Alterna tra tema scuro e chiaro e salva la scelta nel localStorage
function toggleDark() {
  const d = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', d);
}
initTheme();

// ============================================================
// Utility formattazione
// ============================================================
// Converte una data ISO in formato italiano GG/MM/AAAA; ritorna '-' se il valore è vuoto
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
// Converte una data in formato ISO (YYYY-MM-DD) per l'uso in input type="date"
function formatDateForInput(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}
// Arrotonda un numero con il numero di decimali specificato; ritorna '-' se nullo o indefinito
function formatNumber(number, decimals = 2) {
  if (number === null || number === undefined) return '-';
  return Number(number).toFixed(decimals);
}

// ============================================================
// Notifiche
// ============================================================
// Mostra una notifica di successo (verde) all'inizio del <main>, rimossa automaticamente dopo 3 secondi
function showSuccess(message) {
  const a = document.createElement('div');
  a.className = 'bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-medium px-4 py-3 rounded-lg mb-4 shadow-sm';
  a.textContent = message;
  const c = document.querySelector('main');
  if (c) c.insertBefore(a, c.firstChild);
  setTimeout(() => a.remove(), 3000);
}
// Mostra una notifica di errore (rossa) all'inizio del <main>, rimossa automaticamente dopo 5 secondi
function showError(message) {
  const a = document.createElement('div');
  a.className = 'bg-red-100 border border-red-300 text-red-800 text-sm font-medium px-4 py-3 rounded-lg mb-4 shadow-sm';
  a.textContent = message;
  const c = document.querySelector('main');
  if (c) c.insertBefore(a, c.firstChild);
  setTimeout(() => a.remove(), 5000);
}
// Mostra una finestra di conferma nativa del browser; ritorna true/frase in base alla scelta dell'utente
function confirmAction(message) { return confirm(message); }

// ============================================================
// Modal
// ============================================================
// Apre una modale aggiungendo la classe 'active' al suo elemento
function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('active'); }
// Chiude una modale rimuovendo la classe 'active' dal suo elemento
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('active'); }
// Chiude la modale cliccando sullo sfondo (overlay) fuori dal contenuto
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) e.target.classList.remove('active');
});

// ============================================================
// API calls
// ============================================================
// Effettua una chiamata API generica con autenticazione; parametri: metodo HTTP, endpoint, body opzionale
async function apiFetch(method, endpoint, data) {
  try {
    const opts = { method, headers: getAuthHeaders() };
    if (data) opts.body = JSON.stringify(data);
    const r = await fetch(`${API_URL}${endpoint}`, opts);
    if (!r.ok) {
      if (r.status === 401) { logout(); return; }
      const e = await r.json().catch(() => ({}));
      throw new Error(e.error || `HTTP ${r.status}`);
    }
    return await r.json();
  } catch (err) {
    if (err.name !== 'TypeError') handleAuthError(err);
    console.error(`API ${method} Error:`, err);
    throw err;
  }
}
// Wrapper per chiamate API con metodo specifico (GET, POST, PUT, DELETE)
const apiGet    = (e) => apiFetch('GET', e);
const apiPost   = (e, d) => apiFetch('POST', e, d);
const apiPut    = (e, d) => apiFetch('PUT', e, d);
const apiDelete = (e) => apiFetch('DELETE', e);

// ============================================================
// CSV Export
// ============================================================
// Esporta una tabella HTML in file CSV (codifica UTF-8 con BOM); parametri: ID tabella, nome file base
function exportCSV(tableId, filename) {
  const table = document.getElementById(tableId);
  if (!table || !table.rows.length) return showError('Nessun dato da esportare');
  const rows = [...table.querySelectorAll('tr')];
  if (!rows.length) return;
  const csv = rows.map(r => [...r.querySelectorAll('th, td')].map(c => '"' + (c.textContent.trim().replace(/"/g, '""')) + '"').join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename + '_' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  showSuccess('CSV scaricato');
}

// ============================================================
// Ricerca (filtra righe tabella)
// ============================================================
// Collega un campo input al filtro live delle righe di una tabella (ricerca lato client)
function setupSearch(inputId, tableId) {
  const input = document.getElementById(inputId);
  const tbody = document.getElementById(tableId);
  if (!input || !tbody) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    [...tbody.querySelectorAll('tr')].forEach(tr => {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}

// ============================================================
// Select
// ============================================================
// Popola un elemento <select> con opzioni a partire da un array di oggetti; parametri: ID select, dati, campi valore/testo, placeholder
function populateSelect(selectId, items, valueKey, textKey, placeholder = 'Seleziona...') {
  const s = document.getElementById(selectId);
  if (!s) return;
  s.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach(item => {
    const o = document.createElement('option');
    o.value = item[valueKey] ?? item._id ?? item.id ?? '';
    o.textContent = item[textKey] ?? '';
    s.appendChild(o);
  });
}

// ============================================================
// Validazione
// ============================================================
// Verifica che un campo obbligatorio non sia vuoto; mostra errore e ritorna false se non valido
function validateRequired(value, fieldName) {
  if (!value || value.trim() === '') { showError(`Il campo ${fieldName} è obbligatorio`); return false; }
  return true;
}
// Verifica che un valore sia un numero positivo; mostra errore se non valido
function validateNumber(value, fieldName) {
  if (isNaN(value) || value < 0) { showError(`Il campo ${fieldName} deve essere un numero positivo`); return false; }
  return true;
}

// ============================================================
// Init comune (protezione + navbar + dark + logout)
// ============================================================
// === Inizializzazione all'avvio: verifica autenticazione, costruzione navbar, toggle tema e pulsante logout ===
document.addEventListener('DOMContentLoaded', () => {
  // Auth check (salta login.html)
  if (!window.location.pathname.includes('login.html')) {
    if (!requireAuth()) return;
  }

  const nav = document.querySelector('nav ul');
  if (nav) {
    // Dark mode toggle
    const darkLi = document.createElement('li');
    darkLi.innerHTML = `<a href="#" onclick="toggleDark();return false" class="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors" id="dark-btn" title="Tema scuro">🌓</a>`;
    nav.appendChild(darkLi);

    // Logout
    const outLi = document.createElement('li');
    outLi.innerHTML = `<a href="#" onclick="logout()" class="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors" style="cursor:pointer" title="Esci">Esci</a>`;
    nav.appendChild(outLi);
  }
});
