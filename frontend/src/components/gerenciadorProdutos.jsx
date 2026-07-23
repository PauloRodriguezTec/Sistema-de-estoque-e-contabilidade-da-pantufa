import React, { useState, useEffect } from 'react';
import { fetchJson } from '../api.js';

export default function GerenciadorProdutos({ onVoltar }) {
    const [produtos, setProdutos] = useState([]);
    const [sabores, setSabores] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [erro, setErro] = useState('');
    const [mostraForm, setMostraForm] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        preco_unitario: '',
        categoria: '',
        descricao: ''
    });
    const [saborSelecionados, setSaborSelecionados] = useState([]);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [produtosData, saboresData, categoriasData] = await Promise.all([
                fetchJson('/api/produtos'),
                fetchJson('/api/sabores'),
                fetchJson('/api/categorias')
            ]);

            setProdutos(produtosData);
            setSabores(saboresData);
            setCategorias(categoriasData);
            setErro('');
        } catch (erro) {
            setErro(erro.message || 'Erro ao carregar dados.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await fetchJson('/api/produtos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            setErro('');
            alert('Produto criado com sucesso!');
            setFormData({ nome: '', preco_unitario: '', categoria: '', descricao: '' });
            setSaborSelecionados([]);
            setMostraForm(false);
            carregarDados();
        } catch (erro) {
            const mensagem = erro.message || 'Erro ao criar produto.';
            setErro(mensagem);
            alert(mensagem);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={onVoltar} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                ← Voltar
            </button>

            <h2>🍕 Gerenciador de Pizzas</h2>

            {erro && (
                <div style={{ backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', padding: '0.75rem', marginBottom: '1rem' }}>
                    {erro}
                </div>
            )}

            <button
                onClick={() => setMostraForm(!mostraForm)}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                }}
            >
                + Adicionar Nova Pizza
            </button>

            {mostraForm && (
                <div style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', maxWidth: '500px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Nome da Pizza:</label>
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Preço (R$):</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.preco_unitario}
                                onChange={(e) => setFormData({ ...formData, preco_unitario: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Categoria:</label>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            >
                                <option value="">Selecione...</option>
                                {categorias.map((cat) => (
                                    <option key={cat.id_categoria} value={cat.nome}>
                                        {cat.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Descrição:</label>
                            <textarea
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', minHeight: '80px' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Sabores Padrão (selecione múltiplos):</label>
                            <div style={{ marginTop: '0.5rem', maxHeight: '150px', overflowY: 'auto', border: '1px solid #ddd', padding: '0.5rem' }}>
                                {sabores.map((sabor) => (
                                    <label key={sabor.id_sabor} style={{ display: 'block', marginBottom: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={saborSelecionados.includes(sabor.id_sabor)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSaborSelecionados([...saborSelecionados, sabor.id_sabor]);
                                                } else {
                                                    setSaborSelecionados(saborSelecionados.filter((s) => s !== sabor.id_sabor));
                                                }
                                            }}
                                        />
                                        {sabor.nome}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#27ae60',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Salvar Pizza
                        </button>
                    </form>
                </div>
            )}

            {/* Lista de Pizzas */}
            <div style={{ marginTop: '2rem' }}>
                <h3>Pizzas Cadastradas</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ecf0f1' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Nome</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Categoria</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Preço</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtos.map((produto) => (
                                <tr key={produto.id_produto} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                    <td style={{ padding: '0.75rem' }}>{produto.nome}</td>
                                    <td style={{ padding: '0.75rem' }}>{produto.categoria}</td>
                                    <td style={{ padding: '0.75rem' }}>R$ {produto.preco_unitario.toFixed(2)}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <button style={{ marginRight: '0.5rem', cursor: 'pointer' }}>Editar</button>
                                        <button style={{ color: '#e74c3c', cursor: 'pointer' }}>Deletar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
