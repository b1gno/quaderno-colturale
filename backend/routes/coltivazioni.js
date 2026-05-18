const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Tutte le coltivazioni con informazioni del campo
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, ca.nome as nome_campo, ca.superficie 
            FROM coltivazioni c
            JOIN campi ca ON c.id_campo = ca.id
            ORDER BY c.data_semina DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Errore GET /coltivazioni:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Singola coltivazione per ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.*, ca.nome as nome_campo 
            FROM coltivazioni c
            JOIN campi ca ON c.id_campo = ca.id
            WHERE c.id = ?
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Coltivazione non trovata' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Errore GET /coltivazioni/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Crea nuova coltivazione
router.post('/', async (req, res) => {
    try {
        const { id_campo, tipo_coltura, data_semina, periodo, stato } = req.body;
        
        if (!id_campo || !tipo_coltura) {
            return res.status(400).json({ 
                error: 'Campo e tipo di coltura sono obbligatori' 
            });
        }

        const [result] = await db.query(
            'INSERT INTO coltivazioni (id_campo, tipo_coltura, data_semina, periodo, stato) VALUES (?, ?, ?, ?, ?)',
            [id_campo, tipo_coltura, data_semina || null, periodo || null, stato || 'In preparazione']
        );

        res.status(201).json({ 
            id: result.insertId, 
            message: 'Coltivazione creata con successo'
        });
    } catch (error) {
        console.error('Errore POST /coltivazioni:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT - Aggiorna coltivazione
router.put('/:id', async (req, res) => {
    try {
        const { id_campo, tipo_coltura, data_semina, periodo, stato } = req.body;
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE coltivazioni SET id_campo = ?, tipo_coltura = ?, data_semina = ?, periodo = ?, stato = ? WHERE id = ?',
            [id_campo, tipo_coltura, data_semina, periodo, stato, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Coltivazione non trovata' });
        }

        res.json({ message: 'Coltivazione aggiornata con successo' });
    } catch (error) {
        console.error('Errore PUT /coltivazioni/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Elimina coltivazione
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM coltivazioni WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Coltivazione non trovata' });
        }

        res.json({ message: 'Coltivazione eliminata con successo' });
    } catch (error) {
        console.error('Errore DELETE /coltivazioni/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;