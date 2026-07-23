const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');
const { handleDbError, handleWriteError } = require('../utils/http');

// Cadastro de cliente
router.post('/cadastro', (req, res) => {
    const { nome, cpf_cnpj, telefone, email, senha } = req.body;
    const validation = validateRequiredFields({ nome, cpf_cnpj, email, senha }, ['nome', 'cpf_cnpj', 'email', 'senha']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.run(
        `INSERT INTO clientes (nome, cpf_cnpj, telefone, email, senha, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, cpf_cnpj, telefone, email, senha, 'cliente'],
        function (err) {
            if (handleWriteError(res, err, 'Email ou CPF/CNPJ já cadastrado.')) return;
            res.status(201).json({ id: this.lastID, message: 'Cliente cadastrado com sucesso!' });
        }
    );
});

// Login simples
router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const validation = validateRequiredFields({ email, senha }, ['email', 'senha']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.get(
        `SELECT * FROM clientes WHERE email = ? AND senha = ? LIMIT 1`,
        [email, senha],
        (err, row) => {
            if (handleDbError(res, err)) return;
            if (!row) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            const cliente = {
                ...row,
                tipo: row.tipo || 'cliente'
            };

            res.json({ token: `fake-jwt-${row.id_cliente}`, cliente });
        }
    );
});

// Listar contas administrativas
router.get('/admins', (req, res) => {
    db.all(`SELECT id_cliente, nome, email, telefone, tipo FROM clientes WHERE tipo = 'admin' ORDER BY nome`, [], (err, rows) => {
        if (handleDbError(res, err)) return;
        res.json(rows);
    });
});

// Criar conta administrativa
router.post('/admins', (req, res) => {
    const { nome, cpf_cnpj, telefone, email, senha } = req.body;
    if (!nome || !cpf_cnpj || !email || !senha) {
        return res.status(400).json({ error: 'Preencha nome, CPF/CNPJ, email e senha.' });
    }

    db.run(
        `INSERT INTO clientes (nome, cpf_cnpj, telefone, email, senha, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, cpf_cnpj, telefone, email, senha, 'admin'],
        function (err) {
            if (handleWriteError(res, err, 'Email ou CPF/CNPJ já cadastrado.')) return;
            res.status(201).json({ id: this.lastID, message: 'Administrador criado com sucesso!' });
        }
    );
});

// Atualizar senha de conta administrativa
router.put('/admins/:id', (req, res) => {
    const { senha } = req.body;
    if (!senha) return res.status(400).json({ error: 'Informe a nova senha.' });

    db.run(`UPDATE clientes SET senha = ? WHERE id_cliente = ? AND tipo = 'admin'`, [senha, req.params.id], function (err) {
        if (handleDbError(res, err)) return;
        res.json({ updated: this.changes });
    });
});

// Excluir conta administrativa
router.delete('/admins/:id', (req, res) => {
    db.run(`DELETE FROM clientes WHERE id_cliente = ? AND tipo = 'admin'`, [req.params.id], function (err) {
        if (handleDbError(res, err)) return;
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
