const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// CREATE
router.post('/', (req, res) => {
    const { nome, descricao, preco_unitario, estoque, unidade } = req.body;
    const validation = validateRequiredFields(
        { nome, preco_unitario, unidade },
        ['nome', 'preco_unitario', 'unidade']
    );

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO insumos (nome, descricao, preco_unitario, estoque, unidade) VALUES (?, ?, ?, ?, ?)`,
        [nome, descricao || '', Number(preco_unitario), Number(estoque || 0), unidade],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Insumo já existe.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, nome, preco_unitario, estoque, unidade });
        }
    );
});

// READ ALL
router.get('/', (req, res) => {
    db.all(`SELECT * FROM insumos ORDER BY nome`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(
            rows?.map((r) => ({
                ...r,
                preco_unitario: Number(r.preco_unitario),
                estoque: Number(r.estoque)
            })) || []
        );
    });
});

// READ ONE
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM insumos WHERE id_insumo = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Insumo não encontrado' });
        res.json({
            ...row,
            preco_unitario: Number(row.preco_unitario),
            estoque: Number(row.estoque)
        });
    });
});

// UPDATE
router.put('/:id', (req, res) => {
    const { nome, descricao, preco_unitario, estoque, unidade } = req.body;

    db.run(
        `UPDATE insumos SET nome = ?, descricao = ?, preco_unitario = ?, estoque = ?, unidade = ? WHERE id_insumo = ?`,
        [nome, descricao || '', Number(preco_unitario), Number(estoque || 0), unidade, req.params.id],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Nome de insumo já existe.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ updated: this.changes, id: req.params.id });
        }
    );
});

// DELETE
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM insumos WHERE id_insumo = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
