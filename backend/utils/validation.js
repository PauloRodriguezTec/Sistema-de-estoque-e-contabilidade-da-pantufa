function validateRequiredFields(data, fields) {
    for (const field of fields) {
        const value = data[field];

        if (value === undefined || value === null) {
            return { valid: false, error: `Campo obrigatório ausente: ${field}` };
        }

        if (typeof value === 'string' && value.trim() === '') {
            return { valid: false, error: `Campo obrigatório ausente: ${field}` };
        }
    }

    return { valid: true };
}

module.exports = {
    validateRequiredFields,
};
