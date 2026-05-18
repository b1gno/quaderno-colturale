const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET - Tutte le attività con dettagli
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                a.*,
                ca.nome as nome_campo,
                co.tipo_coltura
            FROM attivita a
            JOIN campi ca ON a.id_campo = ca.id
            LEFT JOIN coltivazioni co ON a.id_coltivazione = co.id
            ORDER BY a.data DESC, a.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Errore GET /attivita:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Singola attività con prodotti utilizzati
router.get('/:id', async (req, res) => {
    try {
        // Recupera l'attività
        const [attivita] = await db.query(`
            SELECT 
                a.*,
                ca.nome as nome_campo,
                co.tipo_coltura
            FROM attivita a
            JOIN campi ca ON a.id_campo = ca.id
            LEFT JOIN coltivazioni co ON a.id_coltivazione = co.id
            WHERE a.id = ?
        `, [req.params.id]);

        if (attivita.length === 0) {
            return res.status(404).json({ error: 'Attività non trovata' });
        }

        // Recupera i prodotti utilizzati
        const [prodotti] = await db.query(`
            SELECT 
                up.*,
                p.nome as nome_prodotto,
                p.unita_misura
            FROM utilizzo_prodotti up
            JOIN prodotti p ON up.id_prodotto = p.id
            WHERE up.id_attivita = ?
        `, [req.params.id]);

        res.json({
            ...attivita[0],
            prodotti_utilizzati: prodotti
        });
    } catch (error) {
        console.error('Errore GET /attivita/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST - Crea nuova attività con scarico automatico magazzino
router.post('/', async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const { data, id_campo, id_coltivazione, descrizione, tipo_attivita, prodotti } = req.body;
        
        if (!data || !id_campo) {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'Data e campo sono obbligatori' 
            });
        }

        // 1. Inserisci l'attività
        const [resultAttivita] = await connection.query(
            'INSERT INTO attivita (data, id_campo, id_coltivazione, descrizione, tipo_attivita) VALUES (?, ?, ?, ?, ?)',
            [data, id_campo, id_coltivazione || null, descrizione || null, tipo_attivita || null]
        );

        const idAttivita = resultAttivita.insertId;

        // 2. Gestisci i prodotti utilizzati (se presenti)
        if (prodotti && Array.isArray(prodotti) && prodotti.length > 0) {
            for (const prodotto of prodotti) {
                const { id_prodotto, quantita_utilizzata } = prodotto;

                if (!id_prodotto || !quantita_utilizzata || quantita_utilizzata <= 0) {
                    continue;
                }

                // Verifica disponibilità
                const [prodottoInfo] = await connection.query(
                    'SELECT nome, quantita_disponibile FROM prodotti WHERE id = ?',
                    [id_prodotto]
                );

                if (prodottoInfo.length === 0) {
                    await connection.rollback();
                    return res.status(400).json({ 
                        error: `Prodotto con ID ${id_prodotto} non trovato` 
                    });
                }

                if (prodottoInfo[0].quantita_disponibile < quantita_utilizzata) {
                    await connection.rollback();
                    return res.status(400).json({ 
                        error: `Quantità insufficiente per il prodotto "${prodottoInfo[0].nome}". Disponibile: ${prodottoInfo[0].quantita_disponibile}` 
                    });
                }

                // Inserisci utilizzo prodotto
                await connection.query(
                    'INSERT INTO utilizzo_prodotti (id_attivita, id_prodotto, quantita_utilizzata) VALUES (?, ?, ?)',
                    [idAttivita, id_prodotto, quantita_utilizzata]
                );

                // SCARICO AUTOMATICO DAL MAGAZZINO
                await connection.query(
                    'UPDATE prodotti SET quantita_disponibile = quantita_disponibile - ? WHERE id = ?',
                    [quantita_utilizzata, id_prodotto]
                );

                // Registra movimento di magazzino
                await connection.query(
                    'INSERT INTO movimenti_magazzino (id_prodotto, tipo_movimento, quantita, note) VALUES (?, ?, ?, ?)',
                    [id_prodotto, 'scarico', quantita_utilizzata, `Utilizzato per attività: ${descrizione || tipo_attivita || 'Non specificata'}`]
                );
            }
        }

        await connection.commit();

        res.status(201).json({ 
            id: idAttivita, 
            message: 'Attività creata con successo e magazzino aggiornato',
            prodotti_scaricati: prodotti ? prodotti.length : 0
        });

    } catch (error) {
        await connection.rollback();
        console.error('Errore POST /attivita:', error);
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// PUT - Aggiorna attività (senza modificare prodotti)
router.put('/:id', async (req, res) => {
    try {
        const { data, id_campo, id_coltivazione, descrizione, tipo_attivita } = req.body;
        const { id } = req.params;

        const [result] = await db.query(
            'UPDATE attivita SET data = ?, id_campo = ?, id_coltivazione = ?, descrizione = ?, tipo_attivita = ? WHERE id = ?',
            [data, id_campo, id_coltivazione, descrizione, tipo_attivita, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Attività non trovata' });
        }

        res.json({ message: 'Attività aggiornata con successo' });
    } catch (error) {
        console.error('Errore PUT /attivita/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// DELETE - Elimina attività (il trigger CASCADE rimuove anche utilizzo_prodotti)
router.delete('/:id', async (req, res) => {
    try {
        // NOTA: In un sistema reale, dovresti anche ripristinare le quantità in magazzino
        // Per ora eliminiamo solo l'attività
        const [result] = await db.query('DELETE FROM attivita WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Attività non trovata' });
        }

        res.json({ message: 'Attività eliminata con successo' });
    } catch (error) {
        console.error('Errore DELETE /attivita/:id:', error);
        res.status(500).json({ error: error.message });
    }
});

// GET - Filtra attività per campo
router.get('/campo/:id_campo', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                a.*,
                ca.nome as nome_campo,
                co.tipo_coltura
            FROM attivita a
            JOIN campi ca ON a.id_campo = ca.id
            LEFT JOIN coltivazioni co ON a.id_coltivazione = co.id
            WHERE a.id_campo = ?
            ORDER BY a.data DESC
        `, [req.params.id_campo]);
        
        res.json(rows);
    } catch (error) {
        console.error('Errore GET /attivita/campo/:id_campo:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;