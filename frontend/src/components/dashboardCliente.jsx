import React, { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '../api.js';

function DashboardCliente({ cliente, onLogout }) {
    const [produtos, setProdutos] = useState([]);
    const [pedidos, setPedidos] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [formaPgto, setFormaPgto] = useState('pix');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(true);

    const carregarDados = async () => {
        try {
            setCarregando(true);
            const [produtosData, pedidosData] = await Promise.all([
                fetchJson('http://localhost:5000/api/produtos'),
                fetchJson(`http://localhost:5000/api/pedidos/minhas/${cliente.id_cliente}`)
            ]);
            setProdutos(produtosData);
            setPedidos(pedidosData);
        } catch (error) {
            setMensagem(error.message || 'Erro ao carregar catálogo.');
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, [cliente.id_cliente]);

    const totalCarrinho = useMemo(() => carrinho.reduce((total, item) => total + Number(item.preco_unitario) * Number(item.quantidade), 0), [carrinho]);

    const adicionarAoCarrinho = (produto) => {
        setCarrinho((prev) => {
            const existente = prev.find((item) => item.id_produto === produto.id_produto);
            if (existente) {
                return prev.map((item) => item.id_produto === produto.id_produto ? { ...item, quantidade: item.quantidade + 1 } : item);
            }
            return [...prev, { id_produto: produto.id_produto, nome: produto.nome, preco_unitario: produto.preco_unitario, quantidade: 1 }];
        });
        setMensagem(`${produto.nome} adicionado ao carrinho.`);
    };

    const alterarQuantidade = (id_produto, delta) => {
        setCarrinho((prev) => prev.flatMap((item) => {
            if (item.id_produto !== id_produto) return [item];
            const novaQuantidade = item.quantidade + delta;
            return novaQuantidade > 0 ? [{ ...item, quantidade: novaQuantidade }] : [];
        }));
    };

    const finalizarCompra = async () => {
        if (carrinho.length === 0) {
            setMensagem('Adicione itens ao carrinho antes de comprar.');
            return;
        }

        try {
            await fetchJson('http://localhost:5000/api/pedidos/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_cliente: cliente.id_cliente, forma_pgto: formaPgto, items: carrinho.map((item) => ({ id_produto: item.id_produto, quantidade: item.quantidade })) })
            });
            setMensagem('Pedido realizado com sucesso!');
            setCarrinho([]);
            carregarDados();
        } catch (error) {
            setMensagem(error.message || 'Erro ao concluir pedido.');
        }
    };

    const cancelarPedido = async (pedidoId) => {
        try {
            await fetchJson(`http://localhost:5000/api/pedidos/${pedidoId}/cancelar`, { method: 'DELETE' });
            setMensagem('Pedido cancelado com sucesso.');
            carregarDados();
        } catch (error) {
            setMensagem(error.message || 'Erro ao cancelar pedido.');
        }
    };

    return (
        <div style={{ display: 'grid', gap: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2>Bem-vindo, {cliente.nome}</h2>
                    <p>Veja os produtos disponíveis, monte seu carrinho e acompanhe seus pedidos.</p>
                </div>
                <button onClick={onLogout}>Sair</button>
            </div>

            {mensagem && <div style={{ padding: '0.75rem', background: '#ecfdf3', borderRadius: '8px' }}>{mensagem}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', display: 'grid', gap: '0.75rem' }}>
                    <h3>Catálogo de produtos</h3>
                    {carregando ? <p>Carregando...</p> : (
                        produtos.map((produto) => (
                            <div key={produto.id_produto} style={{ border: '1px solid #eee', padding: '0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{produto.nome}</strong><br />
                                    R$ {Number(produto.preco_unitario).toFixed(2)} • Estoque: {produto.estoque}
                                </div>
                                <button onClick={() => adicionarAoCarrinho(produto)}>Adicionar</button>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px', display: 'grid', gap: '0.75rem' }}>
                    <h3>Carrinho</h3>
                    {carrinho.length === 0 ? <p>Seu carrinho está vazio.</p> : (
                        carrinho.map((item) => (
                            <div key={item.id_produto} style={{ border: '1px solid #eee', padding: '0.5rem', borderRadius: '6px' }}>
                                <strong>{item.nome}</strong><br />
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                                    <div>
                                        <button onClick={() => alterarQuantidade(item.id_produto, -1)}>-</button>
                                        <span style={{ margin: '0 0.45rem' }}>{item.quantidade}</span>
                                        <button onClick={() => alterarQuantidade(item.id_produto, 1)}>+</button>
                                    </div>
                                    <span>R$ {(Number(item.preco_unitario) * Number(item.quantidade)).toFixed(2)}</span>
                                </div>
                            </div>
                        ))
                    )}
                    <label>
                        Forma de pagamento
                        <select value={formaPgto} onChange={(e) => setFormaPgto(e.target.value)} style={{ display: 'block', width: '100%', marginTop: '0.3rem' }}>
                            <option value="pix">Pix</option>
                            <option value="boleto">Boleto</option>
                            <option value="cartao">Cartão</option>
                        </select>
                    </label>
                    <p><strong>Total:</strong> R$ {totalCarrinho.toFixed(2)}</p>
                    <button onClick={finalizarCompra}>Finalizar compra</button>
                </div>
            </div>

            <div style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '8px' }}>
                <h3>Meus pedidos</h3>
                {pedidos.length === 0 ? <p>Você ainda não fez compras.</p> : (
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                        {pedidos.map((pedido) => (
                            <div key={pedido.id_pedido} style={{ border: '1px solid #eee', padding: '0.75rem', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <strong>Pedido #{pedido.id_pedido}</strong>
                                    <span>{pedido.status}</span>
                                </div>
                                <p>Valor: R$ {Number(pedido.valor_final || 0).toFixed(2)}</p>
                                <ul>
                                    {pedido.itens?.map((item) => (
                                        <li key={item.id_item}>{item.produto_nome} x {item.quantidade}</li>
                                    ))}
                                </ul>
                                {['pendente', 'novo', 'em_aberto', 'aguardando_confirmacao'].includes((pedido.status || '').toLowerCase()) ? (
                                    <button onClick={() => cancelarPedido(pedido.id_pedido)}>Cancelar pedido</button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default DashboardCliente;
