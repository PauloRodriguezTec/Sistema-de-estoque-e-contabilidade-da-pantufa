// Helpers HTTP compartilhados para padronizar respostas das rotas.

// Responde com 500 caso exista um erro de banco. Retorna true quando um erro
// foi tratado, permitindo o padrão `if (handleDbError(res, err)) return;`.
function handleDbError(res, err) {
    if (err) {
        res.status(500).json({ error: err.message });
        return true;
    }
    return false;
}

// Trata erros de banco diferenciando violações de unicidade (409) dos demais (500).
function handleWriteError(res, err, uniqueMessage) {
    if (!err) return false;
    if (uniqueMessage && err.message.includes('UNIQUE')) {
        res.status(409).json({ error: uniqueMessage });
        return true;
    }
    res.status(500).json({ error: err.message });
    return true;
}

module.exports = {
    handleDbError,
    handleWriteError,
};
