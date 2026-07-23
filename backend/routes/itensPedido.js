const db = require('../models/database');
const { createCrudRouter } = require('../utils/crudRouter');

module.exports = createCrudRouter({
    db,
    table: 'itens_pedido',
    idColumn: 'id_item',
    fields: ['id_pedido', 'id_produto', 'quantidade', 'valor_unitario', 'subtotal'],
    requiredFields: ['id_pedido', 'id_produto', 'quantidade', 'valor_unitario', 'subtotal'],
});
