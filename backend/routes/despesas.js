const db = require('../models/database');
const { createCrudRouter } = require('../utils/crudRouter');

module.exports = createCrudRouter({
    db,
    table: 'despesas',
    idColumn: 'id_despesa',
    fields: ['data', 'valor', 'forma_pgto', 'tipo_custo', 'descricao', 'id_fornecedor'],
    requiredFields: ['data', 'valor', 'forma_pgto', 'tipo_custo', 'descricao'],
});
