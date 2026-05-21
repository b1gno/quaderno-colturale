// ============================================================
// Configurazione
// ============================================================
const API_URL = window.location.protocol === 'file:'
  ? 'http://localhost:3000/api'
  : '/api';

// ============================================================
// Auth
// ============================================================
function getToken() { return localStorage.getItem('token'); }
function getAuthHeaders() {
  const h = { 'Content-Type': 'application/json' };
  const t = getToken();
  if (t) h['Authorization'] = 'Bearer ' + t;
  return h;
}
function requireAuth() {
  if (!getToken()) { location.href = 'login.html'; return false; }
  return true;
}
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('darkMode');
  location.href = 'login.html';
}
function handleAuthError(err) {
  if (err.message && (err.message.includes('401') || err.message.includes('Accesso negato') || err.message.includes('Token'))) logout();
  throw err;
}

// ============================================================
// Dark Mode
// ============================================================
function initTheme() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  document.documentElement.classList.toggle('dark', isDark);
}
function toggleDark() {
  const d = document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', d);
}
initTheme();

// ============================================================
// Utility formattazione
// ============================================================
function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatDateForInput(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}
function formatNumber(number, decimals = 2) {
  if (number === null || number === undefined) return '-';
  return Number(number).toFixed(decimals);
}

// ============================================================
// Notifiche
// ============================================================
function showSuccess(message) {
  const a = document.createElement('div');
  a.className = 'bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-medium px-4 py-3 rounded-lg mb-4 shadow-sm';
  a.textContent = message;
  const c = document.querySelector('main');
  if (c) c.insertBefore(a, c.firstChild);
  setTimeout(() => a.remove(), 3000);
}
function showError(message) {
  const a = document.createElement('div');
  a.className = 'bg-red-100 border border-red-300 text-red-800 text-sm font-medium px-4 py-3 rounded-lg mb-4 shadow-sm';
  a.textContent = message;
  const c = document.querySelector('main');
  if (c) c.insertBefore(a, c.firstChild);
  setTimeout(() => a.remove(), 5000);
}
function confirmAction(message) { return confirm(message); }

// ============================================================
// Modal
// ============================================================
function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('active'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('active'); }
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) e.target.classList.remove('active');
});

// ============================================================
// API calls
// ============================================================
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
const apiGet    = (e) => apiFetch('GET', e);
const apiPost   = (e, d) => apiFetch('POST', e, d);
const apiPut    = (e, d) => apiFetch('PUT', e, d);
const apiDelete = (e) => apiFetch('DELETE', e);

// ============================================================
// CSV Export
// ============================================================
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
function validateRequired(value, fieldName) {
  if (!value || value.trim() === '') { showError(`Il campo ${fieldName} è obbligatorio`); return false; }
  return true;
}
function validateNumber(value, fieldName) {
  if (isNaN(value) || value < 0) { showError(`Il campo ${fieldName} deve essere un numero positivo`); return false; }
  return true;
}

// ============================================================
// Init comune (protezione + navbar + dark + logout)
// ============================================================
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
