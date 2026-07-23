const db = require('../models/database');
const { createCrudRouter } = require('../utils/crudRouter');

const toText = (value) => value || '';
const toNumber = (value) => Number(value);
const toEstoque = (value) => Number(value || 0);

const parseRow = (row) => ({
    ...row,
    preco_unitario: Number(row.preco_unitario),
    estoque: Number(row.estoque),
});

module.exports = createCrudRouter({
    db,
    table: 'insumos',
    idColumn: 'id_insumo',
    fields: [
        'nome',
        { name: 'descricao', transform: toText },
        { name: 'preco_unitario', transform: toNumber },
        { name: 'estoque', transform: toEstoque },
        'unidade',
    ],
    requiredFields: ['nome', 'preco_unitario', 'unidade'],
    orderBy: 'nome',
    uniqueMessages: { create: 'Insumo já existe.', update: 'Nome de insumo já existe.' },
    notFoundMessage: 'Insumo não encontrado',
    transformListRow: parseRow,
    transformItemRow: parseRow,
    echoFields: ['nome', 'preco_unitario', 'estoque', 'unidade'],
    includeIdInUpdate: true,
});
