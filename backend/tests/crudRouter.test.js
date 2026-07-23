const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const { createCrudRouter } = require('../utils/crudRouter');

// Sobe um servidor Express efêmero com um banco em memória e o router CRUD.
async function buildServer() {
    const db = new sqlite3.Database(':memory:');

    await new Promise((resolve, reject) => {
        db.run(
            `CREATE TABLE things (
                id_thing INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT UNIQUE,
                valor REAL,
                ativo INTEGER
            )`,
            (err) => (err ? reject(err) : resolve())
        );
    });

    const app = express();
    app.use(express.json());
    app.use(
        '/things',
        createCrudRouter({
            db,
            table: 'things',
            idColumn: 'id_thing',
            fields: ['nome', { name: 'valor', transform: (v) => Number(v) }],
            updateFields: [
                'nome',
                { name: 'valor', transform: (v) => Number(v) },
                { name: 'ativo', transform: (v) => v ?? 1 },
            ],
            insertExtras: { ativo: 1 },
            requiredFields: ['nome', 'valor'],
            orderBy: 'nome',
            uniqueMessages: { create: 'Nome já existe.', update: 'Nome já existe.' },
            notFoundMessage: 'Não encontrado',
            transformListRow: (row) => ({ ...row, valor: Number(row.valor) }),
            transformItemRow: (row) => ({ ...row, valor: Number(row.valor) }),
            echoFields: ['nome'],
            includeIdInUpdate: true,
            listFilter: (req) =>
                req.query.ativos === 'true'
                    ? { where: 'WHERE ativo = 1', params: [] }
                    : { where: '', params: [] },
        })
    );

    const server = await new Promise((resolve) => {
        const s = app.listen(0, () => resolve(s));
    });
    const { port } = server.address();
    return { server, db, base: `http://127.0.0.1:${port}/things` };
}

test('createCrudRouter cobre o ciclo CRUD completo', async (t) => {
    const { server, db, base } = await buildServer();
    t.after(() => {
        server.close();
        db.close();
    });

    // CREATE válido
    const createRes = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Banana', valor: '2.5' }),
    });
    assert.equal(createRes.status, 201);
    const created = await createRes.json();
    assert.equal(created.nome, 'Banana');
    assert.ok(created.id > 0);

    // CREATE sem campo obrigatório
    const missingRes = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Sem valor' }),
    });
    assert.equal(missingRes.status, 400);

    // CREATE duplicado dispara 409
    const dupRes = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Banana', valor: 1 }),
    });
    assert.equal(dupRes.status, 409);
    assert.equal((await dupRes.json()).error, 'Nome já existe.');

    // READ ALL aplica transformação de linha (valor numérico) e ordenação
    await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Abacaxi', valor: 4 }),
    });
    const listRes = await fetch(base);
    const list = await listRes.json();
    assert.equal(list.length, 2);
    assert.equal(list[0].nome, 'Abacaxi'); // ORDER BY nome
    assert.equal(typeof list[0].valor, 'number');

    // READ ONE existente
    const oneRes = await fetch(`${base}/${created.id}`);
    assert.equal(oneRes.status, 200);
    assert.equal((await oneRes.json()).valor, 2.5);

    // READ ONE inexistente => 404
    const notFoundRes = await fetch(`${base}/9999`);
    assert.equal(notFoundRes.status, 404);
    assert.equal((await notFoundRes.json()).error, 'Não encontrado');

    // UPDATE
    const updateRes = await fetch(`${base}/${created.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: 'Banana Nanica', valor: 3, ativo: 0 }),
    });
    assert.equal(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.equal(updated.updated, 1);
    assert.equal(updated.id, String(created.id));

    // DELETE
    const deleteRes = await fetch(`${base}/${created.id}`, { method: 'DELETE' });
    assert.equal(deleteRes.status, 200);
    assert.equal((await deleteRes.json()).deleted, 1);
});
