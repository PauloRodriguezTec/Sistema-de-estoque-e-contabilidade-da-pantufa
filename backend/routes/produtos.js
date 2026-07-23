const db = require('../models/database');
const { createCrudRouter } = require('../utils/crudRouter');

const toNumber = (value) => Number(value);
const toEstoque = (value) => Number(value || 0);

module.exports = createCrudRouter({
    db,
    table: 'produtos',
    idColumn: 'id_produto',
    fields: [
        'nome',
        { name: 'preco_unitario', transform: toNumber },
        'categoria',
        { name: 'estoque', transform: toEstoque },
    ],
    requiredFields: ['nome', 'preco_unitario', 'categoria'],
    orderBy: 'nome',
    transformListRow: (row) => ({ ...row, estoque: Number(row.estoque || 0) }),
});
