const db = require('../models/database');
const { createCrudRouter } = require('../utils/crudRouter');

const toText = (value) => value || '';

module.exports = createCrudRouter({
    db,
    table: 'sabores',
    idColumn: 'id_sabor',
    fields: ['nome', { name: 'descricao', transform: toText }],
    requiredFields: ['nome'],
    orderBy: 'nome',
    uniqueMessages: { create: 'Sabor já existe.', update: 'Nome de sabor já existe.' },
    notFoundMessage: 'Sabor não encontrado',
    echoFields: ['nome', 'descricao'],
    includeIdInUpdate: true,
});
