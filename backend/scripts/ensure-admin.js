const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

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

function createAdminUser() {
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO clientes (nome, cpf_cnpj, telefone, email, senha, tipo)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET nome=excluded.nome, senha=excluded.senha, tipo=excluded.tipo`,
      ['Nani', '00000000000', '00000000000', 'nani@nani', '123456', 'admin'],
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
      db.get('SELECT id_cliente, nome, email, tipo FROM clientes WHERE email = ?', ['nani@nani'], (err, row) => {
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
