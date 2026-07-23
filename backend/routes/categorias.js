const db = require('../models/database');
const { createCrudRouter } = require('../utils/crudRouter');

const toText = (value) => value || '';

module.exports = createCrudRouter({
    db,
    table: 'categorias',
    idColumn: 'id_categoria',
    fields: ['nome', { name: 'descricao', transform: toText }],
    requiredFields: ['nome'],
    orderBy: 'nome',
    uniqueMessages: { create: 'Categoria já existe.', update: 'Nome de categoria já existe.' },
    notFoundMessage: 'Categoria não encontrada',
    echoFields: ['nome', 'descricao'],
    includeIdInUpdate: true,
});
