const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Tutti i movimenti di magazzino
router.get('/movimenti', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                m.*,
                p.nome as nome_prodotto,
                p.unita_misura
            FROM movimenti_magazzino m
            JOIN prodotti p ON m.id_prodotto = p.id
            ORDER BY m.data DESC
            LIMIT 100
        `);
        res.json(rows);
    } catch (error) {
        console.error('Errore GET /magazzino/movimenti:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Carico manuale in magazzino
router.post('/carico', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { id_prodotto, quantita, note } = req.body;
        
        if (!id_prodotto || !quantita || quantita <= 0) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'ID prodotto e quantità valida sono obbligatori' 
            });
        }

        // Aggiorna quantità disponibile
        await connection.query(
            'UPDATE prodotti SET quantita_disponibile = quantita_disponibile + ? WHERE id = ?',
            [quantita, id_prodotto]
        );

        // Registra movimento
        const [result] = await connection.query(
            'INSERT INTO movimenti_magazzino (id_prodotto, tipo_movimento, quantita, note) VALUES (?, ?, ?, ?)',
            [id_prodotto, 'carico', quantita, note || null]
        );

        await connection.commit();

        res.status(201).json({ 
            id: result.insertId,
            message: 'Carico registrato con successo'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Errore POST /magazzino/carico:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// POST - Scarico manuale da magazzino
router.post('/scarico', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { id_prodotto, quantita, note } = req.body;
        
        if (!id_prodotto || !quantita || quantita <= 0) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'ID prodotto e quantità valida sono obbligatori' 
            });
        }

        // Verifica disponibilità
        const [prodotto] = await connection.query(
            'SELECT nome, quantita_disponibile FROM prodotti WHERE id = ?',
            [id_prodotto]
        );

        if (prodotto.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }

        if (prodotto[0].quantita_disponibile < quantita) {
            await connection.rollback();
            return res.status(400).json({ 
                error: `Quantità insufficiente. Disponibile: ${prodotto[0].quantita_disponibile}` 
            });
        }

        // Aggiorna quantità disponibile
        await connection.query(
            'UPDATE prodotti SET quantita_disponibile = quantita_disponibile - ? WHERE id = ?',
            [quantita, id_prodotto]
        );

        // Registra movimento
        const [result] = await connection.query(
            'INSERT INTO movimenti_magazzino (id_prodotto, tipo_movimento, quantita, note) VALUES (?, ?, ?, ?)',
            [id_prodotto, 'scarico', quantita, note || null]
        );

        await connection.commit();

        res.status(201).json({ 
            id: result.insertId,
            message: 'Scarico registrato con successo'
        });

    } catch (error) {
        await connection.rollback();
        console.error('Errore POST /magazzino/scarico:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// GET - Statistiche magazzino
router.get('/statistiche', async (req, res) => {
    try {
        const [totali] = await db.query(`
            SELECT 
                COUNT(*) as totale_prodotti,
                SUM(CASE WHEN quantita_disponibile <= scorta_minima THEN 1 ELSE 0 END) as prodotti_sotto_scorta,
                SUM(CASE WHEN quantita_disponibile = 0 THEN 1 ELSE 0 END) as prodotti_esauriti
            FROM prodotti
        `);

        const [ultimi_movimenti] = await db.query(`
            SELECT COUNT(*) as movimenti_ultimo_mese
            FROM movimenti_magazzino
            WHERE data >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);

        res.json({
            ...totali[0],
            ...ultimi_movimenti[0]
        });
    } catch (error) {
        console.error('Errore GET /magazzino/statistiche:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;