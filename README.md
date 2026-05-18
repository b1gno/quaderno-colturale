# Quaderno di Campo Digitale

Applicazione web per la gestione di un quaderno di campo digitale con sistema integrato di gestione magazzino.

## 📋 Requisiti

- **XAMPP** (per MySQL e Apache)
- **Node.js** (versione 14 o superiore)
- **npm** (incluso con Node.js)

## 🚀 Installazione

### 1. Setup Database

1. Avvia **XAMPP Control Panel**
2. Avvia i servizi **Apache** e **MySQL**
3. Apri **phpMyAdmin** (http://localhost/phpmyadmin)
4. Vai su **Importa** → Seleziona il file `quaderno_campo.sql`
5. Clicca su **Esegui**

Il database verrà creato automaticamente con dati di esempio.

### 2. Setup Backend

Apri il terminale nella cartella `backend`:

```bash
cd backend
npm install
```

### 3. Configurazione

Verifica che il file `backend/.env` contenga:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=quaderno_campo
PORT=3000
```

**IMPORTANTE**: Se la tua installazione di MySQL ha una password, modificala nel file `.env`.

## ▶️ Avvio dell'applicazione

### Avvia il server backend

Nella cartella `backend`:

```bash
npm start
```

Oppure, per lo sviluppo con auto-restart:

```bash
npm run dev
```

Il server sarà disponibile su: **http://localhost:3000**

### Apri l'applicazione

Apri il browser e vai su:
- **http://localhost:3000** (Dashboard principale)

## 📁 Struttura del Progetto

```
quaderno-campo/
├── backend/
│   ├── config/
│   │   └── db.js              # Configurazione database
│   ├── routes/
│   │   ├── campi.js           # API per i campi
│   │   ├── coltivazioni.js    # API per le coltivazioni
│   │   ├── prodotti.js        # API per i prodotti
│   │   ├── attivita.js        # API per le attività
│   │   └── magazzino.js       # API per il magazzino
│   ├── .env                   # Configurazione ambiente
│   ├── server.js              # Server principale
│   └── package.json
│
├── frontend/
│   ├── css/
│   │   └── style.css          # Stili dell'applicazione
│   ├── js/
│   │   └── app.js             # Funzioni JavaScript comuni
│   ├── index.html             # Dashboard
│   ├── campi.html             # Gestione campi
│   ├── coltivazioni.html      # Gestione coltivazioni
│   ├── prodotti.html          # Gestione magazzino
│   └── attivita.html          # Registro attività
│
├── quaderno_campo.sql         # File SQL per il database
└── README.md
```

## 🎯 Funzionalità Principali

### 1. Dashboard
- Statistiche riepilogative (campi, coltivazioni, prodotti)
- Alert per prodotti sotto scorta minima
- Visualizzazione ultime attività

### 2. Gestione Campi
- Creazione e modifica campi agricoli
- Tracciamento superficie e tipo terreno
- Note descrittive

### 3. Gestione Coltivazioni
- Associazione coltivazioni ai campi
- Tracciamento date di semina
- Gestione stati colturali

### 4. Magazzino Prodotti
- Gestione prodotti fitosanitari, concimi, diserbanti
- Monitoraggio scorte minime
- Storico movimenti di carico/scarico

### 5. Registro Attività
- **Scarico automatico dal magazzino** quando si registra un'attività
- Collegamento attività → campo → coltivazione → prodotti
- Storico completo delle operazioni

## 🔧 API Endpoints

### Campi
- `GET /api/campi` - Lista tutti i campi
- `GET /api/campi/:id` - Dettagli campo specifico
- `POST /api/campi` - Crea nuovo campo
- `PUT /api/campi/:id` - Aggiorna campo
- `DELETE /api/campi/:id` - Elimina campo

### Coltivazioni
- `GET /api/coltivazioni` - Lista tutte le coltivazioni
- `POST /api/coltivazioni` - Crea nuova coltivazione
- `PUT /api/coltivazioni/:id` - Aggiorna coltivazione
- `DELETE /api/coltivazioni/:id` - Elimina coltivazione

### Prodotti
- `GET /api/prodotti` - Lista tutti i prodotti
- `GET /api/prodotti/sotto-scorta` - Prodotti sotto scorta minima
- `POST /api/prodotti` - Crea nuovo prodotto
- `PUT /api/prodotti/:id` - Aggiorna prodotto
- `DELETE /api/prodotti/:id` - Elimina prodotto

### Attività
- `GET /api/attivita` - Lista tutte le attività
- `POST /api/attivita` - Crea nuova attività (con scarico automatico)
- `PUT /api/attivita/:id` - Aggiorna attività
- `DELETE /api/attivita/:id` - Elimina attività

### Magazzino
- `GET /api/magazzino/movimenti` - Storico movimenti
- `GET /api/magazzino/statistiche` - Statistiche magazzino
- `POST /api/magazzino/carico` - Registra carico manuale
- `POST /api/magazzino/scarico` - Registra scarico manuale

## 💡 Come Funziona lo Scarico Automatico

Quando crei una nuova attività e selezioni i prodotti utilizzati:

1. Il sistema verifica la disponibilità in magazzino
2. Se la quantità è sufficiente, procede con:
   - Creazione dell'attività
   - Registrazione dei prodotti utilizzati
   - **Scarico automatico dal magazzino**
   - Creazione del movimento di magazzino

3. Se la quantità è insufficiente, l'operazione viene annullata

Tutto avviene in una **transazione database** per garantire la coerenza dei dati.

## 🐛 Troubleshooting

### Errore: "Cannot connect to database"
- Verifica che MySQL sia avviato in XAMPP
- Controlla le credenziali nel file `.env`
- Verifica che il database `quaderno_campo` esista

### Errore: "Port 3000 already in use"
- Cambia la porta nel file `.env`
- Oppure termina il processo che usa la porta 3000

### Le pagine non si caricano
- Verifica che il server Node.js sia avviato
- Controlla la console per eventuali errori
- Verifica che XAMPP sia attivo

## 📊 Dati di Esempio

Il database viene popolato con dati di esempio:
- 3 campi agricoli
- 3 coltivazioni attive
- 5 prodotti in magazzino
- 3 attività registrate

Puoi eliminarli o modificarli dalla dashboard.

## 🔐 Sviluppi Futuri

- Sistema di autenticazione multiutente
- Export dati in PDF/Excel
- Grafici e statistiche avanzate
- Applicazione mobile
- Notifiche automatiche per scorte minime

## 👨‍💻 Autore

Progetto di approfondimento - Classe Quinta
Tecnologie utilizzate: Node.js, Express, MySQL, HTML/CSS/JavaScript

## 📝 Licenza

Progetto didattico per scopi educativi.