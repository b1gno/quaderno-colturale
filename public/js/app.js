// Configurazione API
const API_URL = window.location.protocol === 'file:'
    ? 'http://localhost:3000/api'
    : '/api';

// Auth helpers
function getToken() { return localStorage.getItem('token'); }

function getAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  return headers;
}

function requireAuth() {
  if (!getToken()) {
    location.href = 'login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  location.href = 'login.html';
}

function handleAuthError(err) {
  if (err.message && (err.message.includes('401') || err.message.includes('Accesso negato') || err.message.includes('Token'))) {
    logout();
    return;
  }
  throw err;
}

// Utility: Formattazione data
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Utility: Formattazione data per input
function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Utility: Mostra messaggio di successo
function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'bg-emerald-100 border border-emerald-300 text-emerald-800 text-sm font-medium px-4 py-3 rounded-lg mb-4 shadow-sm';
    alert.textContent = message;

    const container = document.querySelector('main');
    if (container) container.insertBefore(alert, container.firstChild);

    setTimeout(() => alert.remove(), 3000);
}

// Utility: Mostra messaggio di errore
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'bg-red-100 border border-red-300 text-red-800 text-sm font-medium px-4 py-3 rounded-lg mb-4 shadow-sm';
    alert.textContent = message;

    const container = document.querySelector('main');
    if (container) container.insertBefore(alert, container.firstChild);

    setTimeout(() => alert.remove(), 5000);
}

// Utility: Conferma azione
function confirmAction(message) {
    return confirm(message);
}

// Gestione Modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// Chiudi modal cliccando fuori
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// API Calls Helper con auth
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API GET Error:', error);
        handleAuthError(error);
        throw error;
    }
}

async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API POST Error:', error);
        handleAuthError(error);
        throw error;
    }
}

async function apiPut(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API PUT Error:', error);
        handleAuthError(error);
        throw error;
    }
}

async function apiDelete(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API DELETE Error:', error);
        handleAuthError(error);
        throw error;
    }
}

// Validazione form
function validateRequired(value, fieldName) {
    if (!value || value.trim() === '') {
        showError(`Il campo ${fieldName} è obbligatorio`);
        return false;
    }
    return true;
}

function validateNumber(value, fieldName) {
    if (isNaN(value) || value < 0) {
        showError(`Il campo ${fieldName} deve essere un numero positivo`);
        return false;
    }
    return true;
}

// Popola select con opzioni
function populateSelect(selectId, items, valueKey, textKey, placeholder = 'Seleziona...') {
    const select = document.getElementById(selectId);
    if (!select) return;

    select.innerHTML = `<option value="">${placeholder}</option>`;

    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item[valueKey] ?? item._id ?? item.id ?? '';
        option.textContent = item[textKey] ?? '';
        select.appendChild(option);
    });
}

// Formattazione numero con decimali
function formatNumber(number, decimals = 2) {
    if (number === null || number === undefined) return '-';
    return Number(number).toFixed(decimals);
}

// Protezione pagine + navbar
document.addEventListener('DOMContentLoaded', () => {
    // Salta login.html
    if (!window.location.pathname.includes('login.html')) {
        if (!requireAuth()) return;
    }

    // Aggiungi bottone logout alla navbar (se navbar esiste)
    const nav = document.querySelector('nav ul');
    if (nav && !document.getElementById('logout-btn')) {
        const li = document.createElement('li');
        li.innerHTML = '<a id="logout-btn" href="#" onclick="logout()" class="px-3 py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors" style="cursor:pointer" title="Esci">🚪</a>';
        nav.appendChild(li);
    }
});
