const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

// Segredo usado para assinar os tokens JWT. Em produção defina JWT_SECRET.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET é obrigatório em produção. Defina a variável de ambiente JWT_SECRET.');
}
if (!JWT_SECRET) {
    console.warn('[SEGURANÇA] JWT_SECRET não definido. Usando segredo de desenvolvimento inseguro. NÃO use em produção.');
}
const EFFECTIVE_SECRET = JWT_SECRET || 'dev-insecure-secret-change-me';

// Hash bcrypt tem o formato $2a$/$2b$/$2y$...; usado para detectar senhas legadas em texto puro.
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$/;

function hashPassword(plain) {
    return bcrypt.hash(String(plain), SALT_ROUNDS);
}

function comparePassword(plain, hashed) {
    return bcrypt.compare(String(plain), String(hashed));
}

function isHashed(value) {
    return typeof value === 'string' && BCRYPT_HASH_REGEX.test(value);
}

function signToken(cliente) {
    return jwt.sign(
        { sub: cliente.id_cliente, tipo: cliente.tipo || 'cliente', email: cliente.email },
        EFFECTIVE_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

function verifyToken(token) {
    return jwt.verify(token, EFFECTIVE_SECRET);
}

// Remove campos sensíveis (senha) antes de enviar dados do cliente ao frontend.
function sanitizeCliente(row) {
    if (!row) return row;
    const { senha, ...safe } = row;
    return safe;
}

module.exports = {
    hashPassword,
    comparePassword,
    isHashed,
    signToken,
    verifyToken,
    sanitizeCliente,
};
