const db = require('../models/database');
const { createCrudRouter } = require('../utils/crudRouter');

const toText = (value) => value || '';
const toNumber = (value) => Number(value);
const toAtivo = (value) => value ?? 1;

const parseRow = (row) => ({ ...row, valor: Number(row.valor) });

module.exports = createCrudRouter({
    db,
    table: 'servicos',
    idColumn: 'id_servico',
    fields: [
        'nome',
        { name: 'descricao', transform: toText },
        { name: 'valor', transform: toNumber },
    ],
    updateFields: [
        'nome',
        { name: 'descricao', transform: toText },
        { name: 'valor', transform: toNumber },
        { name: 'ativo', transform: toAtivo },
    ],
    insertExtras: { ativo: 1 },
    requiredFields: ['nome', 'valor'],
    orderBy: 'nome',
    uniqueMessages: { create: 'Serviço já existe.', update: 'Nome de serviço já existe.' },
    notFoundMessage: 'Serviço não encontrado',
    transformListRow: parseRow,
    transformItemRow: parseRow,
    echoFields: ['nome', 'descricao', 'valor'],
    includeIdInUpdate: true,
    listFilter: (req) =>
        req.query.ativos === 'true'
            ? { where: 'WHERE ativo = 1', params: [] }
            : { where: '', params: [] },
});
