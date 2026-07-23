const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// CREATE
router.post('/', (req, res) => {
    const { nome, descricao } = req.body;
    const validation = validateRequiredFields({ nome }, ['nome']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO categorias (nome, descricao) VALUES (?, ?)`,
        [nome, descricao || ''],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Categoria já existe.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, nome, descricao });
        }
    );
});

// READ ALL
router.get('/', (req, res) => {
    db.all(`SELECT * FROM categorias ORDER BY nome`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
});

// READ ONE
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM categorias WHERE id_categoria = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json(row);
    });
});

// UPDATE
router.put('/:id', (req, res) => {
    const { nome, descricao } = req.body;

    db.run(
        `UPDATE categorias SET nome = ?, descricao = ? WHERE id_categoria = ?`,
        [nome, descricao || '', req.params.id],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Nome de categoria já existe.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ updated: this.changes, id: req.params.id });
        }
    );
});

// DELETE
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM categorias WHERE id_categoria = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
