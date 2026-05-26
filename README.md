# Quaderno di Campo Digitale

Applicazione web per la gestione di un quaderno di campo agricolo con magazzino integrato, autenticazione multiutente, previsioni scorte e report PDF.

## Requisiti

- Node.js 14+
- npm
- MongoDB Atlas (o MongoDB locale)

## Installazione

```bash
# Clona il repository
git clone <url>
cd quaderno_campo

# Installa le dipendenze
npm install
```

## Configurazione

Crea un file `.env` nella root del progetto:

```
MONGODB_URI=mongodb+srv://<utente>:<password>@cluster0.xxxxx.mongodb.net/test
JWT_SECRET=una_stringa_casuale_sicura
PORT=3000
```

Il database di default su Atlas è `test` (aggiunto automaticamente se non specificato).

## Avvio

```bash
npm start
```

Oppure in sviluppo:

```bash
npm run dev
```

Il server sarà su **http://localhost:3000**.

## Deploy su Vercel

1. Collega il repository a Vercel
2. Imposta le env vars in Vercel Dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
3. Vercel usa automaticamente `api/index.js` come serverless function
4. I file statici in `public/` sono serviti direttamente

## Struttura del Progetto

```
quaderno-campo/
├── api/
│   └── index.js              # Entry point serverless Vercel
├── backend/
│   ├── config/
│   │   └── db.js              # Connessione MongoDB con cache
│   ├── controllers/
│   │   ├── authController.js  # Register, login, me
│   │   ├── campiController.js # CRUD campi
│   │   ├── coltivazioniController.js # CRUD coltivazioni
│   │   ├── prodottiController.js # CRUD prodotti + sotto-scorta
│   │   ├── attivitaController.js # CRUD attività + scarico automatico
│   │   ├── magazzinoController.js # Carico/scarico + previsioni
│   │   └── reportController.js # PDF report
│   ├── middleware/
│   │   ├── auth.js            # JWT + adminOnly
│   │   ├── validate.js        # Validazione campi
│   │   ├── errorHandler.js    # Gestione errori centralizzata
│   │   └── asyncWrapper.js    # Try/catch per route async
│   ├── models/
│   │   ├── User.js
│   │   ├── Campo.js
│   │   ├── Coltivazione.js
│   │   ├── Prodotto.js
│   │   ├── Attivita.js
│   │   └── MovimentoMagazzino.js
│   ├── routes/                # Router Express (7 file)
│   ├── utils/
│   │   └── AppError.js        # Classe errore personalizzata
│   ├── app.js                 # Express app (middleware + route)
│   └── server.js              # Avvio server locale
├── public/
│   ├── css/
│   │   └── style.css          # Tema chiaro/scuro con variabili CSS
│   ├── js/
│   │   └── app.js             # Utility condivise (auth, API, CSV, ecc.)
│   ├── login.html             # Auth (registrati / accedi)
│   ├── index.html             # Dashboard con chart e previsioni
│   ├── campi.html             # Gestione campi
│   ├── coltivazioni.html      # Gestione coltivazioni
│   ├── prodotti.html          # Magazzino + previsioni esaurimento
│   ├── attivita.html          # Registro attività + report PDF
│   └── calendario.html        # Calendario interattivo con drag & drop
├── .env                       # Variabili d'ambiente
├── vercel.json                # Config deploy Vercel
└── package.json
```

## Funzionalità

### Dashboard
- Statistiche riepilogative (campi, coltivazioni, prodotti, sotto-scorta)
- Grafico a barre (coltivazioni per campo) e grafico a ciambella (categorie prodotti)
- Tabella prodotti sotto scorta minima
- Previsioni esaurimento scorte con indicatori (Urgente / Attento)
- Ultime attività registrate

### Autenticazione
- Register/login con email + password + nome
- JWT per API calls
- Isolamento dati per utente (ogni utente vede solo i propri dati)
- Admin può vedere tutti i dati

### Campi
- CRUD completo
- Superficie, tipo terreno, note

### Coltivazioni
- CRUD completo
- Collegamento a un campo
- Stato colturale e data semina

### Magazzino
- CRUD prodotti con categoria, unità di misura, scorta minima
- Movimenti di carico/scarico manuali
- **Previsione esaurimento**: analizza consumo ultimi 90 giorni, calcola data stimata di esaurimento
- Stato "Sotto scorta" calcolato automaticamente

### Attività
- CRUD completo
- Collegamento a campo + coltivazione
- **Scarico automatico dal magazzino** alla creazione (decrementa quantità e crea movimento)
- Aggiunta dinamica di righe prodotto con validazione disponibilità
- Export report PDF (annuale / mensile / stagionale)

### Calendario
- Griglia calendario mensile con navigazione
- Pallini nei giorni con attività
- Click giorno → elenco attività
- **Drag & drop** per spostare attività tra giorni
- Creazione rapida attività

### Dark Mode
- Toggle 🌓 in navbar
- Preferenza salvata in localStorage
- Variabili CSS per tema chiaro/scuro

### Export
- **CSV**: ogni tabella ha pulsante export
- **PDF**: report attività con riepilogo e magazzino

## API Endpoints

### Auth
- `POST /api/auth/register` — Registrazione
- `POST /api/auth/login` — Login (ritorna JWT)
- `GET /api/auth/me` — Utente corrente (auth richiesta)

### Campi
- `GET /api/campi` — Lista campi
- `GET /api/campi/:id` — Dettaglio campo
- `GET /api/campi/:id/coltivazioni` — Coltivazioni di un campo
- `POST /api/campi` — Crea campo
- `PUT /api/campi/:id` — Modifica campo
- `DELETE /api/campi/:id` — Elimina campo

### Coltivazioni
- `GET /api/coltivazioni` — Lista coltivazioni
- `POST /api/coltivazioni` — Crea coltivazione
- `PUT /api/coltivazioni/:id` — Modifica coltivazione
- `DELETE /api/coltivazioni/:id` — Elimina coltivazione

### Prodotti
- `GET /api/prodotti` — Lista prodotti
- `GET /api/prodotti/sotto-scorta` — Prodotti sotto scorta minima
- `GET /api/prodotti/:id/movimenti` — Movimenti di un prodotto
- `POST /api/prodotti` — Crea prodotto
- `PUT /api/prodotti/:id` — Modifica prodotto
- `DELETE /api/prodotti/:id` — Elimina prodotto

### Attività
- `GET /api/attivita` — Lista attività
- `GET /api/attivita/:id` — Dettaglio attività
- `GET /api/attivita/campo/:id` — Attività per campo
- `POST /api/attivita` — Crea attività (scarica prodotti dal magazzino)
- `PUT /api/attivita/:id` — Modifica attività
- `DELETE /api/attivita/:id` — Elimina attività

### Magazzino
- `GET /api/magazzino/movimenti` — Storico movimenti
- `GET /api/magazzino/statistiche` — Statistiche (conteggi)
- `GET /api/magazzino/previsioni` — Previsioni esaurimento per prodotto
- `POST /api/magazzino/carico` — Carico manuale
- `POST /api/magazzino/scarico` — Scarico manuale

### Report
- `GET /api/report/pdf?anno=&mese=&stagione=` — Scarica PDF (auth richiesta)

## Come Funziona lo Scarico Automatico

Alla creazione di un'attività con prodotti:

1. Il sistema verifica la disponibilità in magazzino per ogni prodotto
2. Se la quantità è sufficiente:
   - Crea l'attività
   - Decrementa `quantita_disponibile` per ogni prodotto
   - Crea un movimento di scarico con nota "Scarico automatico da attività: ..."
3. Se la quantità è insufficiente → errore e operazione annullata

## Come Funzionano le Previsioni

L'endpoint `GET /api/magazzino/previsioni` analizza:
- Ultimi 90 giorni di movimenti di scarico per ogni prodotto
- Quantità totale scaricata / 90 = consumo giornaliero medio
- Quantità disponibile / consumo giornaliero = giorni rimanenti stimati
- Data odierna + giorni rimanenti = data di esaurimento prevista
- `sotto_scorta = true` se la quantità è già sotto la scorta minima

## Troubleshooting

### Errore "Cannot connect to database"
- Verifica `MONGODB_URI` nel file `.env`
- Controlla che l'IP sia autorizzato in Atlas (Network Access)

### Errore "E11000 duplicate key"
- L'indice unique su `username` nella collection `users` può causare conflitti
- Soluzione: la generazione automatica da email dovrebbe evitarlo

### next is not a function (User model)
- Mongoose 9 non passa `next` agli hook async
- Gli hook nel progetto non chiamano `next()` per questo motivo

### Pagina bianca dopo login
- Verifica che `localStorage` abbia il token
- Controlla la console del browser per errori CORS o 401

## Sviluppi Futuri

- Dashboard con statistiche annuali comparative
- Notifiche per scorte in esaurimento
- App mobile (PWA)
- Multi-lingua
- Backup automatico dati

## Autore

Progetto di approfondimento - Classe Quinta
Tecnologie: Node.js, Express, MongoDB, Tailwind CSS, Chart.js, PDFKit

## Licenza

Progetto didattico per scopi educativi.
