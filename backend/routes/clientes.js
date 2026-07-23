const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { validateRequiredFields } = require('../utils/validation');
const { hashPassword, comparePassword, isHashed, signToken, sanitizeCliente } = require('../utils/auth');
const { requireAdmin } = require('../middleware/auth');

// Cadastro de cliente
router.post('/cadastro', async (req, res) => {
    const { nome, cpf_cnpj, telefone, email, senha } = req.body;
    const validation = validateRequiredFields({ nome, cpf_cnpj, email, senha }, ['nome', 'cpf_cnpj', 'email', 'senha']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    let senhaHash;
    try {
        senhaHash = await hashPassword(senha);
    } catch (hashErr) {
        return res.status(500).json({ error: 'Erro ao processar a senha.' });
    }

    db.run(
        `INSERT INTO clientes (nome, cpf_cnpj, telefone, email, senha, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, cpf_cnpj, telefone, email, senhaHash, 'cliente'],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Email ou CPF/CNPJ já cadastrado.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'Cliente cadastrado com sucesso!' });
        }
    );
});

// Login com senha em hash (bcrypt) e migração transparente de senhas legadas em texto puro
router.post('/login', (req, res) => {
    const { email, senha } = req.body;
    const validation = validateRequiredFields({ email, senha }, ['email', 'senha']);

    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    db.get(
        `SELECT * FROM clientes WHERE email = ? LIMIT 1`,
        [email],
        async (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            if (!row) {
                return res.status(401).json({ error: 'Credenciais inválidas' });
            }

            try {
                let autenticado;
                if (isHashed(row.senha)) {
                    autenticado = await comparePassword(senha, row.senha);
                } else {
                    // Senha legada armazenada em texto puro: valida e migra para hash.
                    autenticado = row.senha === senha;
                    if (autenticado) {
                        const novoHash = await hashPassword(senha);
                        db.run(`UPDATE clientes SET senha = ? WHERE id_cliente = ?`, [novoHash, row.id_cliente]);
                    }
                }

                if (!autenticado) {
                    return res.status(401).json({ error: 'Credenciais inválidas' });
                }
            } catch (compareErr) {
                return res.status(500).json({ error: 'Erro ao validar credenciais.' });
            }

            const cliente = sanitizeCliente({ ...row, tipo: row.tipo || 'cliente' });
            res.json({ token: signToken(cliente), cliente });
        }
    );
});

// Listar contas administrativas
router.get('/admins', requireAdmin, (req, res) => {
    db.all(`SELECT id_cliente, nome, email, telefone, tipo FROM clientes WHERE tipo = 'admin' ORDER BY nome`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Criar conta administrativa
router.post('/admins', requireAdmin, async (req, res) => {
    const { nome, cpf_cnpj, telefone, email, senha } = req.body;
    if (!nome || !cpf_cnpj || !email || !senha) {
        return res.status(400).json({ error: 'Preencha nome, CPF/CNPJ, email e senha.' });
    }

    let senhaHash;
    try {
        senhaHash = await hashPassword(senha);
    } catch (hashErr) {
        return res.status(500).json({ error: 'Erro ao processar a senha.' });
    }

    db.run(
        `INSERT INTO clientes (nome, cpf_cnpj, telefone, email, senha, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
        [nome, cpf_cnpj, telefone, email, senhaHash, 'admin'],
        function (err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Email ou CPF/CNPJ já cadastrado.' });
                }
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: this.lastID, message: 'Administrador criado com sucesso!' });
        }
    );
});

// Atualizar senha de conta administrativa
router.put('/admins/:id', requireAdmin, async (req, res) => {
    const { senha } = req.body;
    if (!senha) return res.status(400).json({ error: 'Informe a nova senha.' });

    let senhaHash;
    try {
        senhaHash = await hashPassword(senha);
    } catch (hashErr) {
        return res.status(500).json({ error: 'Erro ao processar a senha.' });
    }

    db.run(`UPDATE clientes SET senha = ? WHERE id_cliente = ? AND tipo = 'admin'`, [senhaHash, req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

// Excluir conta administrativa
router.delete('/admins/:id', requireAdmin, (req, res) => {
    db.run(`DELETE FROM clientes WHERE id_cliente = ? AND tipo = 'admin'`, [req.params.id], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ deleted: this.changes });
    });
});

module.exports = router;
