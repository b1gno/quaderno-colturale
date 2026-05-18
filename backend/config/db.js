const mysql = require('mysql2');
require('dotenv').config();

// Creazione del pool di connessioni
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test della connessione
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Errore connessione al database:', err.message);
        return;
    }
    console.log('✅ Database MySQL connesso correttamente');
    connection.release();
});

// Esporta il pool con supporto per promises
module.exports = pool.promise();