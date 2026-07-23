const db = require('../models/database');
const { createCrudRouter } = require('../utils/crudRouter');

module.exports = createCrudRouter({
    db,
    table: 'fornecedores',
    idColumn: 'id_fornecedor',
    fields: ['nome', 'tipo', 'contato', 'id_endereco'],
    requiredFields: ['nome', 'tipo', 'contato'],
});
