const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

function ensureColumn(tableName, columnName, definition, callback) {
    db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) return callback(err);
        if (rows.some((row) => row.name === columnName)) return callback();
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${definition}`, callback);
    });
}

// Criação das tabelas principais
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    cpf_cnpj TEXT UNIQUE,
    telefone TEXT,
    email TEXT UNIQUE,
    senha TEXT,
    id_endereco INTEGER
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS enderecos (
    id_endereco INTEGER PRIMARY KEY AUTOINCREMENT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS fornecedores (
    id_fornecedor INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    tipo TEXT,
    contato TEXT,
    id_endereco INTEGER
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS despesas (
    id_despesa INTEGER PRIMARY KEY AUTOINCREMENT,
    data TEXT,
    valor REAL,
    forma_pgto TEXT,
    tipo_custo TEXT,
    descricao TEXT,
    id_fornecedor INTEGER
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id_produto INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    preco_unitario REAL,
    categoria TEXT,
    estoque INTEGER DEFAULT 0
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id_pedido INTEGER PRIMARY KEY AUTOINCREMENT,
    id_cliente INTEGER,
    data_pedido TEXT,
    data_entrega TEXT,
    forma_pgto TEXT,
    data_pgto TEXT,
    status TEXT,
    desconto REAL,
    valor_final REAL
  )`);

    db.run(`CREATE TABLE IF NOT EXISTS itens_pedido (
    id_item INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido INTEGER,
    id_produto INTEGER,
    quantidade INTEGER,
    valor_unitario REAL,
    subtotal REAL
  )`);

    // Nova estrutura: Categorias
    db.run(`CREATE TABLE IF NOT EXISTS categorias (
    id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE,
    descricao TEXT,
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

    // Insumos/Ingredientes em estoque
    db.run(`CREATE TABLE IF NOT EXISTS insumos (
    id_insumo INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE,
    descricao TEXT,
    preco_unitario REAL,
    estoque REAL DEFAULT 0,
    unidade TEXT,
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

    // Sabores de pizzas
    db.run(`CREATE TABLE IF NOT EXISTS sabores (
    id_sabor INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE,
    descricao TEXT,
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

    // Relação pizza com sabores e preços
    db.run(`CREATE TABLE IF NOT EXISTS pizza_sabores (
    id_pizza_sabor INTEGER PRIMARY KEY AUTOINCREMENT,
    id_produto INTEGER,
    id_sabor INTEGER,
    preco_adicional REAL DEFAULT 0,
    disponivel INTEGER DEFAULT 1,
    UNIQUE(id_produto, id_sabor)
  )`);

    // Serviços (entrega, embalagem, etc)
    db.run(`CREATE TABLE IF NOT EXISTS servicos (
    id_servico INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT UNIQUE,
    descricao TEXT,
    valor REAL,
    ativo INTEGER DEFAULT 1,
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

    // Movimentações de estoque
    db.run(`CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id_movimentacao INTEGER PRIMARY KEY AUTOINCREMENT,
    id_insumo INTEGER,
    tipo TEXT,
    quantidade REAL,
    descricao TEXT,
    data_movimentacao TEXT DEFAULT CURRENT_TIMESTAMP,
    criado_por INTEGER
  )`);

    // Movimentações financeiras
    db.run(`CREATE TABLE IF NOT EXISTS movimentacoes_financeiras (
    id_movimentacao INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    valor REAL,
    categoria TEXT,
    descricao TEXT,
    status TEXT DEFAULT 'pendente',
    data_movimentacao TEXT DEFAULT CURRENT_TIMESTAMP,
    data_confirmacao TEXT,
    criado_por INTEGER
  )`);

    // Pagamentos de pedidos
    db.run(`CREATE TABLE IF NOT EXISTS pagamentos (
    id_pagamento INTEGER PRIMARY KEY AUTOINCREMENT,
    id_pedido INTEGER,
    valor REAL,
    data_pagamento TEXT,
    status TEXT DEFAULT 'pendente',
    forma_pagamento TEXT,
    descricao TEXT,
    data_criacao TEXT DEFAULT CURRENT_TIMESTAMP
  )`);

    ensureColumn('clientes', 'tipo', "tipo TEXT DEFAULT 'cliente'", (err) => {
        if (err) {
            console.error('Erro ao adicionar coluna tipo em clientes:', err.message);
            return;
        }

        db.get(
            `SELECT id_cliente FROM clientes WHERE email = ? OR cpf_cnpj = ? LIMIT 1`,
            ['nani@nani', '00000000000'],
            (selectErr, existing) => {
                if (selectErr) {
                    console.error('Erro ao verificar usuário administrador:', selectErr.message);
                    return;
                }

                if (existing) {
                    db.run(
                        `UPDATE clientes SET nome=?, cpf_cnpj=?, telefone=?, email=?, senha=?, tipo=? WHERE id_cliente=?`,
                        ['Nani', '00000000000', '00000000000', 'nani@nani', '123456', 'admin', existing.id_cliente],
                        (updateErr) => {
                            if (updateErr) {
                                console.error('Erro ao atualizar usuário administrador:', updateErr.message);
                            }
                        }
                    );
                    return;
                }

                db.run(
                    `INSERT INTO clientes (nome, cpf_cnpj, telefone, email, senha, tipo) VALUES (?, ?, ?, ?, ?, ?)`,
                    ['Nani', '00000000000', '00000000000', 'nani@nani', '123456', 'admin'],
                    (insertErr) => {
                        if (insertErr) {
                            console.error('Erro ao criar usuário administrador:', insertErr.message);
                        }
                    }
                );
            }
        );
    });

    ensureColumn('produtos', 'estoque', 'estoque INTEGER DEFAULT 0', (err) => {
        if (err) {
            console.error('Erro ao adicionar coluna estoque em produtos:', err.message);
            return;
        }
        db.run(`UPDATE produtos SET estoque = COALESCE(estoque, 0) WHERE estoque IS NULL`);
    });
});

module.exports = db;
