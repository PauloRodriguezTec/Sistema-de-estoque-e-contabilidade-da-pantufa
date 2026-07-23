const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// CREATE
router.post('/', (req, res) => {
    const { id_pedido, id_produto, quantidade, valor_unitario, subtotal } = req.body;
    const validation = validateRequiredFields({ id_pedido, id_produto, quantidade, valor_unitario, subtotal }, ['id_pedido', 'id_produto', 'quantidade', 'valor_unitario', 'subtotal']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, valor_unitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
        [id_pedido, id_produto, quantidade, valor_unitario, subtotal],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// READ ALL
router.get('/', (req, res) => {
    db.all(`SELECT * FROM itens_pedido`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// READ ONE
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM itens_pedido WHERE id_item=?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
    });
});

// UPDATE
router.put('/:id', (req, res) => {
    const { id_pedido, id_produto, quantidade, valor_unitario, subtotal } = req.body;
    db.run(
        `UPDATE itens_pedido SET id_pedido=?, id_produto=?, quantidade=?, valor_unitario=?, subtotal=? WHERE id_item=?`,
        [id_pedido, id_produto, quantidade, valor_unitario, subtotal, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes });
        }
    );
});

// DELETE
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM itens_pedido WHERE id_item=?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
