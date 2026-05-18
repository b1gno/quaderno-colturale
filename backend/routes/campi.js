const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Tutti i campi
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM campi ORDER BY nome');
        res.json(rows);
    } catch (error) {
        console.error('Errore GET /campi:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Singolo campo per ID
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM campi WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Campo non trovato' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Errore GET /campi/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Crea nuovo campo
router.post('/', async (req, res) => {
    try {
        const { nome, superficie, tipo_terreno, note } = req.body;
        
        if (!nome) {
            return res.status(400).json({ error: 'Il nome del campo è obbligatorio' });
        }

        const [result] = await db.query(
            'INSERT INTO campi (nome, superficie, tipo_terreno, note) VALUES (?, ?, ?, ?)',
            [nome, superficie || null, tipo_terreno || null, note || null]
        );

        res.status(201).json({ 
            id: result.insertId, 
            message: 'Campo creato con successo',
            campo: { id: result.insertId, nome, superficie, tipo_terreno, note }
        });
    } catch (error) {
        console.error('Errore POST /campi:', error);
        res.status(500).json({ error: error.message });
    }
});

// PUT - Aggiorna campo esistente
router.put('/:id', async (req, res) => {
    try {
        const { nome, superficie, tipo_terreno, note } = req.body;
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE campi SET nome = ?, superficie = ?, tipo_terreno = ?, note = ? WHERE id = ?',
            [nome, superficie, tipo_terreno, note, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Campo non trovato' });
        }

        res.json({ message: 'Campo aggiornato con successo' });
    } catch (error) {
        console.error('Errore PUT /campi/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Elimina campo
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query('DELETE FROM campi WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Campo non trovato' });
        }

        res.json({ message: 'Campo eliminato con successo' });
    } catch (error) {
        console.error('Errore DELETE /campi/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Coltivazioni di un campo specifico
router.get('/:id/coltivazioni', async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM coltivazioni WHERE id_campo = ? ORDER BY data_semina DESC',
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        console.error('Errore GET /campi/:id/coltivazioni:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;