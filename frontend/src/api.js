export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// POST em JSON com tratamento padrão de erro. Lança Error com a mensagem do
// backend (ou `fallbackError`) quando a resposta não é bem-sucedida.
export async function postJson(path, body, fallbackError = 'Erro na requisição.') {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || fallbackError);
    }

    return data;
}
