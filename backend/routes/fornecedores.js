const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// CREATE
router.post('/', (req, res) => {
    const { nome, tipo, contato, id_endereco } = req.body;
    const validation = validateRequiredFields({ nome, tipo, contato }, ['nome', 'tipo', 'contato']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO fornecedores (nome, tipo, contato, id_endereco) VALUES (?, ?, ?, ?)`,
        [nome, tipo, contato, id_endereco],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// READ ALL
router.get('/', (req, res) => {
    db.all(`SELECT * FROM fornecedores`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// READ ONE
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM fornecedores WHERE id_fornecedor = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// UPDATE
router.put('/:id', (req, res) => {
    const { nome, tipo, contato, id_endereco } = req.body;
    db.run(
        `UPDATE fornecedores SET nome=?, tipo=?, contato=?, id_endereco=? WHERE id_fornecedor=?`,
        [nome, tipo, contato, id_endereco, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        }
    );
});

// DELETE
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM fornecedores WHERE id_fornecedor=?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
