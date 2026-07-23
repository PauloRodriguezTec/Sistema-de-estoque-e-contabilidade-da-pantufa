import React, { useState, useEffect } from 'react';

export default function CatalogoCliente({ cliente, onLogout }) {
    const [pizzas, setPizzas] = useState([]);
    const [sabores, setSabores] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostraSabores, setMostraSabores] = useState(null);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [pizzasRes, saboresRes] = await Promise.all([
                fetch('/api/produtos?categoria=Produto'),
                fetch('/api/sabores')
            ]);

            const pizzasData = await pizzasRes.json();
            const saboresData = await saboresRes.json();

            setPizzas(pizzasData);
            setSabores(saboresData);
        } catch (erro) {
            console.error('Erro ao carregar pizzas:', erro);
        } finally {
            setLoading(false);
        }
    };

    const adicionarAoCarrinho = (pizza, sabor = null) => {
        const item = {
            id_produto: pizza.id_produto,
            nome: pizza.nome,
            sabor: sabor?.nome || 'Padrão',
            preco: pizza.preco_unitario,
            quantidade: 1
        };

        setCarrinho([...carrinho, item]);
        setMostraSabores(null);
    };

    const removerDoCarrinho = (index) => {
        const novo = [...carrinho];
        novo.splice(index, 1);
        setCarrinho(novo);
    };

    const atualizarQuantidade = (index, novaQtd) => {
        if (novaQtd < 1) {
            removerDoCarrinho(index);
        } else {
            const novo = [...carrinho];
            novo[index].quantidade = novaQtd;
            setCarrinho(novo);
        }
    };

    const totalCarrinho = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);

    if (loading) return <div>Carregando cardápio...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>🍕 Bem-vindo, {cliente.nome}!</h1>
                <button onClick={onLogout} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
                    Sair
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                {/* Cardápio */}
                <div>
                    <h2>📋 Nosso Cardápio</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                        {pizzas.map((pizza) => (
                            <div
                                key={pizza.id_produto}
                                style={{
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s'
                                }}
                            >
                                <h3>{pizza.nome}</h3>
                                <p style={{ color: '#666', fontSize: '0.9rem' }}>{pizza.categoria}</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e74c3c' }}>
                                    R$ {pizza.preco_unitario.toFixed(2)}
                                </p>
                                <button
                                    onClick={() => setMostraSabores(mostraSabores === pizza.id_produto ? null : pizza.id_produto)}
                                    style={{
                                        width: '100%',
                                        padding: '0.5rem',
                                        backgroundColor: '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {mostraSabores === pizza.id_produto ? 'Ocultar Sabores' : 'Ver Sabores'}
                                </button>

                                {mostraSabores === pizza.id_produto && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                                        {sabores.length > 0 ? (
                                            sabores.map((sabor) => (
                                                <button
                                                    key={sabor.id_sabor}
                                                    onClick={() => adicionarAoCarrinho(pizza, sabor)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '0.5rem',
                                                        marginBottom: '0.5rem',
                                                        backgroundColor: '#27ae60',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem'
                                                    }}
                                                >
                                                    {sabor.nome}
                                                </button>
                                            ))
                                        ) : (
                                            <button
                                                onClick={() => adicionarAoCarrinho(pizza)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.5rem',
                                                    backgroundColor: '#27ae60',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                Adicionar ao Carrinho
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Carrinho */}
                <div style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', height: 'fit-content', position: 'sticky', top: '2rem' }}>
                    <h3>🛒 Carrinho ({carrinho.length})</h3>
                    {carrinho.length === 0 ? (
                        <p style={{ color: '#999' }}>Seu carrinho está vazio</p>
                    ) : (
                        <>
                            <div style={{ marginBottom: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                                {carrinho.map((item, idx) => (
                                    <div key={idx} style={{ paddingBottom: '0.5rem', borderBottom: '1px solid #eee', marginBottom: '0.5rem' }}>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                            {item.nome} ({item.sabor})
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                                            R$ {item.preco.toFixed(2)} x
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantidade}
                                                onChange={(e) => atualizarQuantidade(idx, parseInt(e.target.value))}
                                                style={{ width: '40px', marginLeft: '0.5rem' }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => removerDoCarrinho(idx)}
                                            style={{
                                                fontSize: '0.8rem',
                                                color: '#e74c3c',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                                marginTop: '0.25rem'
                                            }}
                                        >
                                            ✕ Remover
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ paddingTop: '1rem', borderTop: '2px solid #333' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    Total: R$ {totalCarrinho.toFixed(2)}
                                </div>
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        backgroundColor: '#e74c3c',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Finalizar Pedido
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
