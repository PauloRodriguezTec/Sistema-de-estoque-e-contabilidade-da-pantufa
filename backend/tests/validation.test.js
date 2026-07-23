const test = require('node:test');
const assert = require('node:assert/strict');
const { validateRequiredFields } = require('../utils/validation');

test('valida campos obrigatórios quando todos estão presentes', () => {
  const result = validateRequiredFields({ nome: 'Ana', email: 'ana@email.com' }, ['nome', 'email']);

  assert.equal(result.valid, true);
  assert.equal(result.error, undefined);
});

test('retorna erro quando algum campo obrigatório está vazio', () => {
  const result = validateRequiredFields({ nome: 'Ana', email: '' }, ['nome', 'email']);

  assert.equal(result.valid, false);
  assert.match(result.error, /email/i);
});
