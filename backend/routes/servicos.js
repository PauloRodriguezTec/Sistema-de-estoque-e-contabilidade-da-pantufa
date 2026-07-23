const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// CREATE
router.post('/', (req, res) => {
    const { nome, descricao, valor } = req.body;
    const validation = validateRequiredFields(
        { nome, valor },
        ['nome', 'valor']
    );

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO servicos (nome, descricao, valor, ativo) VALUES (?, ?, ?, 1)`,
        [nome, descricao || '', Number(valor)],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Serviço já existe.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, nome, descricao, valor });
        }
    );
});

// READ ALL
router.get('/', (req, res) => {
    const query = req.query.ativos === 'true' 
        ? `SELECT * FROM servicos WHERE ativo = 1 ORDER BY nome`
        : `SELECT * FROM servicos ORDER BY nome`;
    
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(
            rows?.map((r) => ({
                ...r,
                valor: Number(r.valor)
            })) || []
        );
    });
});

// READ ONE
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM servicos WHERE id_servico = ?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Serviço não encontrado' });
        res.json({
            ...row,
            valor: Number(row.valor)
        });
    });
});

// UPDATE
router.put('/:id', (req, res) => {
    const { nome, descricao, valor, ativo } = req.body;

    db.run(
        `UPDATE servicos SET nome = ?, descricao = ?, valor = ?, ativo = ? WHERE id_servico = ?`,
        [nome, descricao || '', Number(valor), ativo ?? 1, req.params.id],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Nome de serviço já existe.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.json({ updated: this.changes, id: req.params.id });
        }
    );
});

// DELETE
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM servicos WHERE id_servico = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
