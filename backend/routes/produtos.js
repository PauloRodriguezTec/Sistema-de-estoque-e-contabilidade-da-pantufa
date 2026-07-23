const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// CREATE
router.post('/', (req, res) => {
    const { nome, preco_unitario, categoria, estoque } = req.body;
    const validation = validateRequiredFields({ nome, preco_unitario, categoria }, ['nome', 'preco_unitario', 'categoria']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO produtos (nome, preco_unitario, categoria, estoque) VALUES (?, ?, ?, ?)` ,
        [nome, Number(preco_unitario), categoria, Number(estoque || 0)],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// READ ALL
router.get('/', (req, res) => {
    db.all(`SELECT * FROM produtos ORDER BY nome`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map((row) => ({ ...row, estoque: Number(row.estoque || 0) })));
    });
});

// READ ONE
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM produtos WHERE id_produto=?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// UPDATE
router.put('/:id', (req, res) => {
    const { nome, preco_unitario, categoria, estoque } = req.body;
    db.run(
        `UPDATE produtos SET nome=?, preco_unitario=?, categoria=?, estoque=? WHERE id_produto=?`,
        [nome, Number(preco_unitario), categoria, Number(estoque || 0), req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        }
    );
});

// DELETE
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM produtos WHERE id_produto=?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
