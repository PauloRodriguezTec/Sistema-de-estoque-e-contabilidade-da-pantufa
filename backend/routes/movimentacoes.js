const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');

// ============ MOVIMENTAÇÕES DE ESTOQUE ============

// Criar movimentação de estoque
router.post('/estoque', (req, res) => {
    const { id_insumo, tipo, quantidade, descricao, criado_por } = req.body;
    const validation = validateRequiredFields(
        { id_insumo, tipo, quantidade },
        ['id_insumo', 'tipo', 'quantidade']
    );

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    if (!['entrada', 'saída', 'ajuste'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido. Use: entrada, saída, ajuste' });
    }

    // Começar transação
    db.run('BEGIN TRANSACTION', (beginErr) => {
        if (beginErr) return res.status(500).json({ error: beginErr.message });

        // Inserir movimentação
        db.run(
            `INSERT INTO movimentacoes_estoque (id_insumo, tipo, quantidade, descricao, criado_por)
             VALUES (?, ?, ?, ?, ?)`,
            [id_insumo, tipo, Number(quantidade), descricao || '', criado_por || null],
            function (insertErr) {
                if (insertErr) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: insertErr.message });
                }

                const movimentacaoId = this.lastID;

                // Atualizar estoque do insumo
                const qtdAjuste = tipo === 'saída' ? -Number(quantidade) : Number(quantidade);
                
                db.run(
                    `UPDATE insumos SET estoque = estoque + ? WHERE id_insumo = ?`,
                    [qtdAjuste, id_insumo],
                    (updateErr) => {
                        if (updateErr) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: updateErr.message });
                        }

                        db.run('COMMIT', (commitErr) => {
                            if (commitErr) {
                                db.run('ROLLBACK');
                                return res.status(500).json({ error: commitErr.message });
                            }

                            res.status(201).json({
                                id: movimentacaoId,
                                id_insumo,
                                tipo,
                                quantidade,
                                descricao
                            });
                        });
                    }
                );
            }
        );
    });
});

// Listar movimentações de estoque
router.get('/estoque', (req, res) => {
    let query = `SELECT me.*, i.nome as insumo_nome, i.unidade
                 FROM movimentacoes_estoque me
                 LEFT JOIN insumos i ON me.id_insumo = i.id_insumo`;
    let params = [];

    if (req.query.id_insumo) {
        query += ` WHERE me.id_insumo = ?`;
        params.push(req.query.id_insumo);
    }

    query += ` ORDER BY me.data_movimentacao DESC LIMIT 100`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(
            rows?.map((r) => ({
                ...r,
                quantidade: Number(r.quantidade)
            })) || []
        );
    });
});

// ============ MOVIMENTAÇÕES FINANCEIRAS ============

// Criar movimentação financeira
router.post('/financeiras', (req, res) => {
    const { tipo, valor, categoria, descricao, criado_por } = req.body;
    const validation = validateRequiredFields(
        { tipo, valor, categoria },
        ['tipo', 'valor', 'categoria']
    );

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    if (!['receita', 'despesa'].includes(tipo)) {
        return res.status(400).json({ error: 'Tipo inválido. Use: receita, despesa' });
    }

    db.run(
        `INSERT INTO movimentacoes_financeiras (tipo, valor, categoria, descricao, criado_por)
         VALUES (?, ?, ?, ?, ?)`,
        [tipo, Number(valor), categoria, descricao || '', criado_por || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({
                id: this.lastID,
                tipo,
                valor,
                categoria,
                descricao,
                status: 'pendente'
            });
        }
    );
});

// Listar movimentações financeiras
router.get('/financeiras', (req, res) => {
    let query = `SELECT * FROM movimentacoes_financeiras`;
    let params = [];

    if (req.query.status) {
        query += ` WHERE status = ?`;
        params.push(req.query.status);
    }

    query += ` ORDER BY data_movimentacao DESC LIMIT 100`;

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

// Atualizar status de movimentação financeira
router.put('/financeiras/:id', (req, res) => {
    const { status } = req.body;

    if (!['pendente', 'confirmado', 'cancelado'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
    }

    db.run(
        `UPDATE movimentacoes_financeiras 
         SET status = ?, data_confirmacao = ? 
         WHERE id_movimentacao = ?`,
        [status, status === 'confirmado' ? new Date().toISOString() : null, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ updated: this.changes, id: req.params.id, status });
        }
    );
});

// Relatório financeiro
router.get('/relatorio/financeiro', (req, res) => {
    db.all(
        `SELECT 
            tipo,
            status,
            SUM(valor) as total
         FROM movimentacoes_financeiras
         GROUP BY tipo, status`,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            let totalReceitaPaga = 0;
            let totalReceitaPendente = 0;
            let totalDespesaPaga = 0;
            let totalDespesaPendente = 0;

            rows.forEach((row) => {
                const valor = Number(row.total);
                if (row.tipo === 'receita' && row.status === 'confirmado') totalReceitaPaga += valor;
                if (row.tipo === 'receita' && row.status === 'pendente') totalReceitaPendente += valor;
                if (row.tipo === 'despesa' && row.status === 'confirmado') totalDespesaPaga += valor;
                if (row.tipo === 'despesa' && row.status === 'pendente') totalDespesaPendente += valor;
            });

            res.json({
                receita_paga: totalReceitaPaga,
                receita_pendente: totalReceitaPendente,
                despesa_paga: totalDespesaPaga,
                despesa_pendente: totalDespesaPendente,
                saldo_total: totalReceitaPaga - totalDespesaPaga,
                saldo_pendente: totalReceitaPendente - totalDespesaPendente
            });
        }
    );
});

module.exports = router;
