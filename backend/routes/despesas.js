const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// CREATE
router.post('/', (req, res) => {
    const { data, valor, forma_pgto, tipo_custo, descricao, id_fornecedor } = req.body;
    const validation = validateRequiredFields({ data, valor, forma_pgto, tipo_custo, descricao }, ['data', 'valor', 'forma_pgto', 'tipo_custo', 'descricao']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO despesas (data, valor, forma_pgto, tipo_custo, descricao, id_fornecedor) VALUES (?, ?, ?, ?, ?, ?)`,
        [data, valor, forma_pgto, tipo_custo, descricao, id_fornecedor],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// READ ALL
router.get('/', (req, res) => {
    db.all(`SELECT * FROM despesas`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// READ ONE
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM despesas WHERE id_despesa=?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// UPDATE
router.put('/:id', (req, res) => {
    const { data, valor, forma_pgto, tipo_custo, descricao, id_fornecedor } = req.body;
    db.run(
        `UPDATE despesas SET data=?, valor=?, forma_pgto=?, tipo_custo=?, descricao=?, id_fornecedor=? WHERE id_despesa=?`,
        [data, valor, forma_pgto, tipo_custo, descricao, id_fornecedor, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        }
    );
});

// DELETE
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM despesas WHERE id_despesa=?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
