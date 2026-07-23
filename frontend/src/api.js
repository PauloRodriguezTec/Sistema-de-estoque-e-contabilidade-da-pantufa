// Helper de requisições HTTP que propaga erros em vez de silenciá-los.
// Faz o fetch, valida a resposta e lança um Error com a mensagem do servidor
// quando o status não é 2xx, evitando que respostas de erro sejam tratadas
// como dados válidos.
export async function fetchJson(url, options) {
    let response;
    try {
        response = await fetch(url, options);
    } catch (erroRede) {
        throw new Error('Não foi possível conectar ao servidor.');
    }

    const texto = await response.text();
    let dados = null;
    if (texto) {
        try {
            dados = JSON.parse(texto);
        } catch (erroParse) {
            if (!response.ok) {
                throw new Error(`Erro ${response.status} ao processar a requisição.`);
            }
            throw new Error('Resposta inválida do servidor.');
        }
    }

    if (!response.ok) {
        const mensagem = (dados && dados.error) || `Erro ${response.status} ao processar a requisição.`;
        throw new Error(mensagem);
    }

    return dados;
}
