const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// CREATE - Registrar pagamento
router.post('/', (req, res) => {
    const { id_pedido, valor, forma_pagamento, descricao } = req.body;
    const validation = validateRequiredFields(
        { id_pedido, valor, forma_pagamento },
        ['id_pedido', 'valor', 'forma_pagamento']
    );

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO pagamentos (id_pedido, valor, forma_pagamento, descricao, status)
         VALUES (?, ?, ?, ?, 'pendente')`,
        [id_pedido, Number(valor), forma_pagamento, descricao || ''],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: this.lastID,
                id_pedido,
                valor,
                forma_pagamento,
                status: 'pendente'
            });
        }
    );
});

// READ ALL com filtros
router.get('/', (req, res) => {
    let query = `SELECT p.*, pd.id_cliente, c.nome as cliente_nome
                 FROM pagamentos p
                 LEFT JOIN pedidos pd ON p.id_pedido = pd.id_pedido
                 LEFT JOIN clientes c ON pd.id_cliente = c.id_cliente`;
    let params = [];

    if (req.query.status) {
        query += ` WHERE p.status = ?`;
        params.push(req.query.status);
    }

    if (req.query.id_pedido) {
        query += params.length ? ` AND p.id_pedido = ?` : ` WHERE p.id_pedido = ?`;
        params.push(req.query.id_pedido);
    }

    query += ` ORDER BY p.data_criacao DESC`;

    db.all(query, params, (err, rows) => {
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
    db.get(
        `SELECT p.*, pd.id_cliente, c.nome as cliente_nome
         FROM pagamentos p
         LEFT JOIN pedidos pd ON p.id_pedido = pd.id_pedido
         LEFT JOIN clientes c ON pd.id_cliente = c.id_cliente
         WHERE p.id_pagamento = ?`,
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) return res.status(404).json({ error: 'Pagamento não encontrado' });
            res.json({
                ...row,
                valor: Number(row.valor)
            });
        }
    );
});

// UPDATE - Atualizar status
router.put('/:id', (req, res) => {
    const { status, data_pagamento } = req.body;

    if (status && !['pendente', 'confirmado', 'cancelado'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
    }

    let updateQuery = `UPDATE pagamentos SET `;
    let params = [];

    if (status) {
        updateQuery += `status = ?`;
        params.push(status);
    }

    if (data_pagamento) {
        updateQuery += params.length ? `, data_pagamento = ?` : `data_pagamento = ?`;
        params.push(data_pagamento);
    }

    updateQuery += ` WHERE id_pagamento = ?`;
    params.push(req.params.id);

    db.run(updateQuery, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes, id: req.params.id });
    });
});

// DELETE
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM pagamentos WHERE id_pagamento = ?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

// RELATÓRIO - Resumo de pagamentos
router.get('/relatorio/resumo', (req, res) => {
    db.all(
        `SELECT 
            status,
            COUNT(*) as quantidade,
            SUM(valor) as total
         FROM pagamentos
         GROUP BY status`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            let totalPago = 0;
            let totalPendente = 0;
            let totalCancelado = 0;

            rows.forEach((row) => {
                const valor = Number(row.total);
                if (row.status === 'confirmado') totalPago += valor;
                else if (row.status === 'pendente') totalPendente += valor;
                else if (row.status === 'cancelado') totalCancelado += valor;
            });

            res.json({
                total_pago: totalPago,
                total_pendente: totalPendente,
                total_cancelado: totalCancelado,
                saldo_a_receber: totalPendente
            });
        }
    );
});

module.exports = router;
