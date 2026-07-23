const { verifyToken } = require('../utils/auth');

function extractToken(req) {
    const header = req.headers.authorization || '';
    const [scheme, value] = header.split(' ');
    if (scheme === 'Bearer' && value) return value;
    return null;
}

function requireAuth(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Autenticação necessária.' });
    }
    try {
        req.user = verifyToken(token);
        return next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}

function requireAdmin(req, res, next) {
    return requireAuth(req, res, () => {
        if (!req.user || req.user.tipo !== 'admin') {
            return res.status(403).json({ error: 'Acesso restrito a administradores.' });
        }
        return next();
    });
}

module.exports = { requireAuth, requireAdmin };
