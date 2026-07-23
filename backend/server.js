const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const clientesRoutes = require('./routes/clientes');
const fornecedoresRoutes = require('./routes/fornecedores');
const produtosRoutes = require('./routes/produtos');
const pedidosRoutes = require('./routes/pedidos');
const despesasRoutes = require('./routes/despesas');
const itensPedidoRoutes = require('./routes/itensPedido');
const categoriasRoutes = require('./routes/categorias');
const insumosRoutes = require('./routes/insumos');
const saboresRoutes = require('./routes/sabores');
const servicosRoutes = require('./routes/servicos');
const movimentacoesRoutes = require('./routes/movimentacoes');
const pagamentosRoutes = require('./routes/pagamentos');

const app = express();

// CORS restrito a uma allowlist configurável (CORS_ORIGINS separado por vírgula).
// Em desenvolvimento, o padrão libera as portas locais comuns do Vite.
const defaultOrigins = 'http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000';
const allowedOrigins = (process.env.CORS_ORIGINS || defaultOrigins)
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Permite requisições sem Origin (curl, apps mobile, health checks).
        // Para origens não permitidas, não envia cabeçalhos CORS — o navegador
        // bloqueia a resposta sem derrubar a requisição com erro 500.
        return callback(null, !origin || allowedOrigins.includes(origin));
    }
}));
app.use(bodyParser.json());

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend funcionando corretamente.' });
});

// Rotas
app.use('/api/clientes', clientesRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/despesas', despesasRoutes);
app.use('/api/itens-pedido', itensPedidoRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/sabores', saboresRoutes);
app.use('/api/servicos', servicosRoutes);
app.use('/api/movimentacoes', movimentacoesRoutes);
app.use('/api/pagamentos', pagamentosRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Erro interno no servidor.' });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = { app, server };
