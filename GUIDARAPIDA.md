# 🚀 GUIDA RAPIDA - Quaderno di Campo Digitale

## ⚡ Avvio Veloce (5 minuti)

### 1️⃣ Avvia XAMPP
- Apri XAMPP Control Panel
- Clicca **Start** su **Apache** e **MySQL**
- Aspetta che diventino verdi ✅

### 2️⃣ Importa il Database
- Apri il browser → `http://localhost/phpmyadmin`
- Clicca **Importa** in alto
- Scegli il file `quaderno_campo.sql`
- Clicca **Esegui**
- ✅ Database creato!

### 3️⃣ Installa le dipendenze Backend
Apri il terminale nella cartella `backend`:
```bash
cd backend
npm install
```

### 4️⃣ Avvia il Server
Sempre nella cartella `backend`:
```bash
npm start
```

Vedrai: `🚀 Server avviato su http://localhost:3000`

### 5️⃣ Apri l'Applicazione
- Apri il browser
- Vai su `http://localhost:3000`
- 🎉 **È tutto pronto!**

---

## 📚 Come Usare l'Applicazione

### 🏞️ **1. Crea i tuoi Campi**
- Vai su **Campi** nel menu
- Clicca **+ Nuovo Campo**
- Inserisci: nome, superficie, tipo terreno
- Clicca **Salva**

### 🌱 **2. Aggiungi Coltivazioni**
- Vai su **Coltivazioni**
- Clicca **+ Nuova Coltivazione**
- Seleziona il campo
- Inserisci tipo coltura (es: Grano, Pomodori)
- Scegli data semina e stato
- Clicca **Salva**

### 📦 **3. Carica il Magazzino**
- Vai su **Magazzino**
- Clicca **+ Nuovo Prodotto**
- Inserisci: nome, categoria, quantità iniziale
- Clicca **Salva**

**Per caricare altri prodotti:**
- Clicca **📦 Carico**
- Seleziona prodotto e quantità
- Clicca **Registra Carico**

### ✍️ **4. Registra Attività (CON SCARICO AUTOMATICO!)**
- Vai su **Attività**
- Clicca **+ Nuova Attività**
- Compila: data, campo, tipo attività
- **Clicca "+ Aggiungi Prodotto"** per ogni prodotto usato
- Seleziona prodotto e quantità
- Clicca **💾 Salva e Scarica da Magazzino**

**✨ MAGIA:** I prodotti vengono scaricati automaticamente dal magazzino!

---

## 🎯 Esempio Pratico

Immagina di dover **concimare il campo "Nord"**:

1. **Vai su Attività** → **+ Nuova Attività**
2. Compila:
   - Data: Oggi
   - Campo: Nord
   - Tipo: Concimazione
   - Descrizione: "Prima concimazione di copertura"
3. **Aggiungi Prodotto:**
   - Prodotto: Concime NPK 15-15-15
   - Quantità: 150 kg
4. Clicca **Salva**

**Risultato:**
- ✅ Attività registrata
- ✅ 150 kg di NPK scaricati automaticamente
- ✅ Movimento registrato in magazzino
- ✅ Scorte aggiornate

---

## 💡 Funzionalità Chiave

### ⚠️ Alert Scorte Basse
La dashboard mostra automaticamente i prodotti sotto scorta minima in rosso.

### 📊 Storico Completo
Puoi vedere:
- Tutte le attività per campo
- Tutti i movimenti di un prodotto
- Le coltivazioni associate a ogni campo

### 🔒 Sicurezza Dati
Il sistema usa **transazioni database**: se qualcosa va storto durante il salvataggio, tutto viene annullato automaticamente.

### ✅ Controlli Automatici
- Non puoi usare più prodotto di quello disponibile
- Le relazioni tra campi, coltivazioni e attività sono sempre coerenti

---

## 🐛 Problemi Comuni

### ❌ "Cannot connect to database"
**Soluzione:** Verifica che MySQL sia avviato in XAMPP

### ❌ "Port 3000 already in use"
**Soluzione:** Chiudi altri programmi che usano la porta 3000, oppure cambia porta nel file `.env`

### ❌ La pagina non si carica
**Soluzione:** 
1. Verifica che il server Node.js sia avviato
2. Controlla che XAMPP sia attivo
3. Ricarica la pagina (F5)

### ❌ "Quantità insufficiente"
**Soluzione:** Vai su **Magazzino** → **📦 Carico** e aggiungi scorte

---

## 📁 File Importanti

```
quaderno-campo/
├── quaderno_campo.sql    ← Database da importare
├── backend/
│   ├── .env              ← Configurazione (password MySQL qui)
│   ├── server.js         ← Server principale
│   └── package.json      ← Dipendenze
└── frontend/
    ├── index.html        ← Dashboard
    ├── attivita.html     ← Registro attività
    └── prodotti.html     ← Magazzino
```

---

## 🎓 Per l'Approfondimento Scolastico

### Punti Chiave da Evidenziare:
1. **Architettura Client-Server**
   - Frontend (HTML/CSS/JS) separato dal Backend (Node.js)
   - Comunicazione via API REST

2. **Database Relazionale**
   - MySQL invece di MongoDB
   - Uso di FOREIGN KEY per integrità referenziale
   - Transazioni per operazioni critiche

3. **Logica di Business Complessa**
   - Scarico automatico magazzino
   - Controlli di disponibilità
   - Storicizzazione movimenti

4. **Tecnologie Moderne**
   - Express.js per il backend
   - Fetch API per chiamate asincrone
   - Promises e async/await

### Da Inserire nella Relazione:
- Schema ER del database
- Diagramma dell'architettura
- Screenshot dell'interfaccia
- Esempio di transazione SQL
- Codice della funzione di scarico automatico

---

## 🔗 Link Utili

- phpMyAdmin: `http://localhost/phpmyadmin`
- Applicazione: `http://localhost:3000`
- Test API: `http://localhost:3000/api/test`

---

## 📞 Supporto

Se hai problemi:
1. Controlla i **log del terminale** dove hai avviato `npm start`
2. Controlla la **console del browser** (F12)
3. Verifica che tutti i servizi siano attivi

---

**Buon lavoro! 🌾✨**