const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// CREATE
router.post('/', (req, res) => {
    const { id_cliente, data_pedido, data_entrega, forma_pgto, data_pgto, status, desconto, valor_final } = req.body;
    const validation = validateRequiredFields({ id_cliente, data_pedido, forma_pgto, status, valor_final }, ['id_cliente', 'data_pedido', 'forma_pgto', 'status', 'valor_final']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO pedidos (id_cliente, data_pedido, data_entrega, forma_pgto, data_pgto, status, desconto, valor_final) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id_cliente, data_pedido, data_entrega, forma_pgto, data_pgto, status, desconto, valor_final],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

router.post('/checkout', (req, res) => {
    const { id_cliente, items, forma_pgto } = req.body;

    if (!id_cliente || !Array.isArray(items) || items.length === 0 || !forma_pgto) {
        return res.status(400).json({ error: 'Informe cliente, forma de pagamento e itens do carrinho.' });
    }

    const productIds = items.map((item) => item.id_produto);
    const placeholders = productIds.map(() => '?').join(',');

    db.all(`SELECT id_produto, nome, preco_unitario, estoque FROM produtos WHERE id_produto IN (${placeholders})`, productIds, (err, produtos) => {
        if (err) return res.status(500).json({ error: err.message });

        const produtosMap = new Map(produtos.map((produto) => [produto.id_produto, produto]));
        const semEstoque = items.find((item) => {
            const produto = produtosMap.get(item.id_produto);
            return !produto || Number(produto.estoque || 0) < Number(item.quantidade || 1);
        });

        if (semEstoque) {
            return res.status(400).json({ error: 'Um ou mais produtos não têm estoque suficiente.' });
        }

        const valorTotal = items.reduce((total, item) => {
            const produto = produtosMap.get(item.id_produto);
            return total + Number(produto.preco_unitario) * Number(item.quantidade || 1);
        }, 0);

        db.run('BEGIN', (beginErr) => {
            if (beginErr) return res.status(500).json({ error: beginErr.message });

            db.run(
                `INSERT INTO pedidos (id_cliente, data_pedido, data_entrega, forma_pgto, data_pgto, status, desconto, valor_final) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id_cliente, new Date().toISOString(), null, forma_pgto, null, 'pendente', 0, valorTotal],
                function (insertErr) {
                    if (insertErr) {
                        db.run('ROLLBACK');
                        return res.status(500).json({ error: insertErr.message });
                    }

                    const pedidoId = this.lastID;
                    const inserirItens = (index) => {
                        if (index >= items.length) {
                            db.run('COMMIT', (commitErr) => {
                                if (commitErr) {
                                    db.run('ROLLBACK');
                                    return res.status(500).json({ error: commitErr.message });
                                }
                                return res.status(201).json({ id: pedidoId, message: 'Pedido realizado com sucesso!' });
                            });
                            return;
                        }

                        const item = items[index];
                        const produto = produtosMap.get(item.id_produto);
                        const quantidade = Number(item.quantidade || 1);
                        const subtotal = Number(produto.preco_unitario) * quantidade;

                        db.run(
                            `INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, valor_unitario, subtotal) VALUES (?, ?, ?, ?, ?)`,
                            [pedidoId, item.id_produto, quantidade, produto.preco_unitario, subtotal],
                            function (itemErr) {
                                if (itemErr) {
                                    db.run('ROLLBACK');
                                    return res.status(500).json({ error: itemErr.message });
                                }

                                db.run(`UPDATE produtos SET estoque = estoque - ? WHERE id_produto = ?`, [quantidade, item.id_produto], function (stockErr) {
                                    if (stockErr) {
                                        db.run('ROLLBACK');
                                        return res.status(500).json({ error: stockErr.message });
                                    }
                                    inserirItens(index + 1);
                                });
                            }
                        );
                    };

                    inserirItens(0);
                }
            );
        });
    });
});

// READ ALL
router.get('/', (req, res) => {
    const clienteId = req.query.clienteId;
    const query = clienteId
        ? `SELECT p.*, c.nome AS cliente_nome FROM pedidos p LEFT JOIN clientes c ON c.id_cliente = p.id_cliente WHERE p.id_cliente = ? ORDER BY p.id_pedido DESC`
        : `SELECT p.*, c.nome AS cliente_nome FROM pedidos p LEFT JOIN clientes c ON c.id_cliente = p.id_cliente ORDER BY p.id_pedido DESC`;

    db.all(query, clienteId ? [clienteId] : [], (err, pedidos) => {
        if (err) return res.status(500).json({ error: err.message });

        const pedidoIds = pedidos.map((pedido) => pedido.id_pedido);
        if (pedidoIds.length === 0) return res.json([]);

        const placeholders = pedidoIds.map(() => '?').join(',');
        db.all(`SELECT ip.id_pedido, ip.id_item, ip.id_produto, ip.quantidade, ip.valor_unitario, ip.subtotal, pr.nome AS produto_nome
                FROM itens_pedido ip
                LEFT JOIN produtos pr ON pr.id_produto = ip.id_produto
                WHERE ip.id_pedido IN (${placeholders})`, pedidoIds, (itemErr, itens) => {
            if (itemErr) return res.status(500).json({ error: itemErr.message });

            const pedidosComItens = pedidos.map((pedido) => ({
                ...pedido,
                itens: itens.filter((item) => item.id_pedido === pedido.id_pedido)
            }));

            res.json(pedidosComItens);
        });
    });
});

router.get('/minhas/:idCliente', (req, res) => {
    db.all(`SELECT p.*, c.nome AS cliente_nome FROM pedidos p LEFT JOIN clientes c ON c.id_cliente = p.id_cliente WHERE p.id_cliente = ? ORDER BY p.id_pedido DESC`, [req.params.idCliente], (err, pedidos) => {
        if (err) return res.status(500).json({ error: err.message });

        const pedidoIds = pedidos.map((pedido) => pedido.id_pedido);
        if (pedidoIds.length === 0) return res.json([]);

        const placeholders = pedidoIds.map(() => '?').join(',');
        db.all(`SELECT ip.id_pedido, ip.id_item, ip.id_produto, ip.quantidade, ip.valor_unitario, ip.subtotal, pr.nome AS produto_nome
                FROM itens_pedido ip
                LEFT JOIN produtos pr ON pr.id_produto = ip.id_produto
                WHERE ip.id_pedido IN (${placeholders})`, pedidoIds, (itemErr, itens) => {
            if (itemErr) return res.status(500).json({ error: itemErr.message });

            const pedidosComItens = pedidos.map((pedido) => ({
                ...pedido,
                itens: itens.filter((item) => item.id_pedido === pedido.id_pedido)
            }));

            res.json(pedidosComItens);
        });
    });
});

// READ ONE
router.get('/:id', (req, res) => {
    db.get(`SELECT * FROM pedidos WHERE id_pedido=?`, [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Pedido não encontrado.' });
        res.json(row);
    });
});

// UPDATE
router.put('/:id', (req, res) => {
    const campos = [];
    const values = [];
    const { id_cliente, data_pedido, data_entrega, forma_pgto, data_pgto, status, desconto, valor_final } = req.body;

    if (id_cliente !== undefined) { campos.push('id_cliente=?'); values.push(id_cliente); }
    if (data_pedido !== undefined) { campos.push('data_pedido=?'); values.push(data_pedido); }
    if (data_entrega !== undefined) { campos.push('data_entrega=?'); values.push(data_entrega); }
    if (forma_pgto !== undefined) { campos.push('forma_pgto=?'); values.push(forma_pgto); }
    if (data_pgto !== undefined) { campos.push('data_pgto=?'); values.push(data_pgto); }
    if (status !== undefined) { campos.push('status=?'); values.push(status); }
    if (desconto !== undefined) { campos.push('desconto=?'); values.push(desconto); }
    if (valor_final !== undefined) { campos.push('valor_final=?'); values.push(valor_final); }

    if (campos.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar.' });
    }

    values.push(req.params.id);
    db.run(`UPDATE pedidos SET ${campos.join(', ')} WHERE id_pedido=?`, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

// DELETE
router.delete('/:id/cancelar', (req, res) => {
    db.get(`SELECT * FROM pedidos WHERE id_pedido=?`, [req.params.id], (err, pedido) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado.' });

        const statusCancelavel = ['pendente', 'novo', 'em_aberto', 'aguardando_confirmacao'];
        if (!statusCancelavel.includes((pedido.status || '').toLowerCase())) {
            return res.status(400).json({ error: 'Só é possível cancelar pedidos ainda não confirmados.' });
        }

        db.run(`UPDATE pedidos SET status='cancelado' WHERE id_pedido=?`, [req.params.id], function (cancelErr) {
            if (cancelErr) return res.status(500).json({ error: cancelErr.message });
            res.json({ canceled: this.changes });
        });
    });
});

router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM pedidos WHERE id_pedido=?`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
