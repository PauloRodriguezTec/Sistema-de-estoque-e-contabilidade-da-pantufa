const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { hashPassword } = require('../utils/auth');
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'nani@nani';
const ADMIN_CPF = process.env.ADMIN_CPF || '00000000000';
const ADMIN_NAME = process.env.ADMIN_NAME || 'Nani';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '123456';
if (!process.env.ADMIN_PASSWORD) {
  console.warn('[SEGURANÇA] ADMIN_PASSWORD não definido. Usando senha padrão de desenvolvimento. Defina ADMIN_PASSWORD e troque a senha.');
}

function addColumnIfMissing() {
  return new Promise((resolve, reject) => {
    db.all('PRAGMA table_info(clientes)', (err, rows) => {
      if (err) return reject(err);
      const hasTipo = rows.some((row) => row.name === 'tipo');
      if (hasTipo) return resolve();
      db.run('ALTER TABLE clientes ADD COLUMN tipo TEXT DEFAULT "cliente"', (alterErr) => {
        if (alterErr) return reject(alterErr);
        resolve();
      });
    });
  });
}

async function createAdminUser() {
  const senhaHash = await hashPassword(ADMIN_PASSWORD);
  return new Promise((resolve, reject) => {
    // Não sobrescreve a senha de um admin já existente ao atualizar os demais campos.
    db.run(
      `INSERT INTO clientes (nome, cpf_cnpj, telefone, email, senha, tipo)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET nome=excluded.nome, tipo=excluded.tipo`,
      [ADMIN_NAME, ADMIN_CPF, ADMIN_CPF, ADMIN_EMAIL, senhaHash, 'admin'],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

(async () => {
  try {
    await addColumnIfMissing();
    await createAdminUser();
      db.get('SELECT id_cliente, nome, email, tipo FROM clientes WHERE email = ?', [ADMIN_EMAIL], (err, row) => {
      if (err) throw err;
      console.log(JSON.stringify(row));
      db.close();
    });
  } catch (error) {
    console.error(error.message);
    db.close();
    process.exit(1);
  }
})();
