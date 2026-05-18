const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Tutti i prodotti
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM prodotti ORDER BY nome');
        res.json(rows);
    } catch (error) {
        console.error('Errore GET /prodotti:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Prodotti sotto scorta minima
router.get('/sotto-scorta', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM prodotti WHERE quantita_disponibile <= scorta_minima ORDER BY nome'
        );
        res.json(rows);
    } catch (error) {
        console.error('Errore GET /prodotti/sotto-scorta:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Singolo prodotto per ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM prodotti WHERE id = ?', [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Errore GET /prodotti/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Crea nuovo prodotto
router.post('/', async (req, res) => {
    try {
        const { nome, categoria, unita_misura, scorta_minima, quantita_disponibile } = req.body;
        
        if (!nome) {
            return res.status(400).json({ error: 'Il nome del prodotto è obbligatorio' });
        }

        const [result] = await db.query(
            'INSERT INTO prodotti (nome, categoria, unita_misura, scorta_minima, quantita_disponibile) VALUES (?, ?, ?, ?, ?)',
            [
                nome, 
                categoria || 'altro', 
                unita_misura || 'unità', 
                scorta_minima || 0, 
                quantita_disponibile || 0
            ]
        );

        res.status(201).json({ 
            id: result.insertId, 
            message: 'Prodotto creato con successo'
        });
    } catch (error) {
        console.error('Errore POST /prodotti:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT - Aggiorna prodotto
router.put('/:id', async (req, res) => {
    try {
        const { nome, categoria, unita_misura, scorta_minima, quantita_disponibile } = req.body;
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE prodotti SET nome = ?, categoria = ?, unita_misura = ?, scorta_minima = ?, quantita_disponibile = ? WHERE id = ?',
            [nome, categoria, unita_misura, scorta_minima, quantita_disponibile, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }

        res.json({ message: 'Prodotto aggiornato con successo' });
    } catch (error) {
        console.error('Errore PUT /prodotti/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Elimina prodotto
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM prodotti WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }

        res.json({ message: 'Prodotto eliminato con successo' });
    } catch (error) {
        console.error('Errore DELETE /prodotti/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Storico movimenti di un prodotto
router.get('/:id/movimenti', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM movimenti_magazzino WHERE id_prodotto = ? ORDER BY data DESC',
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Errore GET /prodotti/:id/movimenti:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;