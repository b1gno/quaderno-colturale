// Configurazione API
const API_URL = '/api';

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
    alert.className = 'alert alert-success';
    alert.textContent = message;
    
    const container = document.querySelector('.main-content');
    container.insertBefore(alert, container.firstChild);
    
    setTimeout(() => alert.remove(), 3000);
}

// Utility: Mostra messaggio di errore
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.textContent = message;
    
    const container = document.querySelector('.main-content');
    container.insertBefore(alert, container.firstChild);
    
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

// API Calls Helper
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API GET Error:', error);
        throw error;
    }
}

async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API POST Error:', error);
        throw error;
    }
}

async function apiPut(endpoint, data) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API PUT Error:', error);
        throw error;
    }
}

async function apiDelete(endpoint) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API DELETE Error:', error);
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

// Evidenzia menu attivo
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});