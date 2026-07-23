const express = require('express');
const { validateRequiredFields } = require('./validation');
const { handleDbError, handleWriteError } = require('./http');

const identity = (value) => value;

// Normaliza um campo declarado como string ou como { name, transform }.
function normalizeField(field) {
    if (typeof field === 'string') {
        return { name: field, transform: identity };
    }
    return { name: field.name, transform: field.transform || identity };
}

/**
 * Cria um router Express com as operações CRUD padrão (create, read all,
 * read one, update, delete) para uma tabela simples.
 *
 * Opções:
 * - table, idColumn: nome da tabela e coluna de chave primária.
 * - fields: colunas gravadas no INSERT/UPDATE (string ou { name, transform }).
 * - requiredFields: campos obrigatórios validados no create.
 * - orderBy: coluna usada no ORDER BY do read all.
 * - uniqueMessages: { create, update } mensagens para violações de UNIQUE (409).
 * - notFoundMessage: quando definido, read one responde 404 se não achar linha.
 * - transformListRow / transformItemRow: transforma linhas retornadas.
 * - echoFields: campos do corpo devolvidos na resposta do create.
 * - includeIdInUpdate: inclui `id` na resposta do update.
 * - insertExtras: colunas com valores fixos adicionadas ao INSERT.
 * - updateFields: sobrescreve os campos do UPDATE (default = fields).
 * - listFilter: fn(req) => { where, params } para filtrar o read all.
 */
function createCrudRouter(options) {
    const {
        db,
        table,
        idColumn,
        fields: rawFields,
        requiredFields = [],
        orderBy = null,
        uniqueMessages = null,
        notFoundMessage = null,
        transformListRow = identity,
        transformItemRow = identity,
        echoFields = [],
        includeIdInUpdate = false,
        insertExtras = {},
        updateFields: rawUpdateFields = null,
        listFilter = null,
    } = options;

    const fields = rawFields.map(normalizeField);
    const updateFields = (rawUpdateFields || rawFields).map(normalizeField);
    const extraColumns = Object.keys(insertExtras);

    const router = express.Router();

    // CREATE
    router.post('/', (req, res) => {
        const body = req.body || {};

        if (requiredFields.length) {
            const validation = validateRequiredFields(body, requiredFields);
            if (!validation.valid) {
                return res.status(400).json({ error: validation.error });
            }
        }

        const columns = [...fields.map((f) => f.name), ...extraColumns];
        const values = [
            ...fields.map((f) => f.transform(body[f.name])),
            ...extraColumns.map((column) => insertExtras[column]),
        ];
        const placeholders = columns.map(() => '?').join(', ');

        db.run(
            `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
            values,
            function (err) {
                if (handleWriteError(res, err, uniqueMessages && uniqueMessages.create)) return;
                const response = { id: this.lastID };
                for (const name of echoFields) {
                    response[name] = body[name];
                }
                res.status(201).json(response);
            }
        );
    });

    // READ ALL
    router.get('/', (req, res) => {
        let query = `SELECT * FROM ${table}`;
        let params = [];

        if (listFilter) {
            const filter = listFilter(req) || {};
            if (filter.where) query += ` ${filter.where}`;
            params = filter.params || [];
        }

        if (orderBy) query += ` ORDER BY ${orderBy}`;

        db.all(query, params, (err, rows) => {
            if (handleDbError(res, err)) return;
            res.json((rows || []).map(transformListRow));
        });
    });

    // READ ONE
    router.get('/:id', (req, res) => {
        db.get(`SELECT * FROM ${table} WHERE ${idColumn} = ?`, [req.params.id], (err, row) => {
            if (handleDbError(res, err)) return;
            if (notFoundMessage && !row) {
                return res.status(404).json({ error: notFoundMessage });
            }
            res.json(transformItemRow(row));
        });
    });

    // UPDATE
    router.put('/:id', (req, res) => {
        const body = req.body || {};
        const setClause = updateFields.map((f) => `${f.name} = ?`).join(', ');
        const values = [
            ...updateFields.map((f) => f.transform(body[f.name])),
            req.params.id,
        ];

        db.run(
            `UPDATE ${table} SET ${setClause} WHERE ${idColumn} = ?`,
            values,
            function (err) {
                if (handleWriteError(res, err, uniqueMessages && uniqueMessages.update)) return;
                const response = { updated: this.changes };
                if (includeIdInUpdate) response.id = req.params.id;
                res.json(response);
            }
        );
    });

    // DELETE
    router.delete('/:id', (req, res) => {
        db.run(`DELETE FROM ${table} WHERE ${idColumn} = ?`, [req.params.id], function (err) {
            if (handleDbError(res, err)) return;
            res.json({ deleted: this.changes });
        });
    });

    return router;
}

module.exports = { createCrudRouter };
