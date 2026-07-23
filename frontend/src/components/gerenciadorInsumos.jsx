import React, { useState, useEffect } from 'react';

export default function GerenciadorInsumos({ onVoltar }) {
    const [insumos, setInsumos] = useState([]);
    const [mostraForm, setMostraForm] = useState(false);
    const [formData, setFormData] = useState({
        nome: '',
        descricao: '',
        preco_unitario: '',
        estoque: '',
        unidade: 'kg'
    });

    useEffect(() => {
        carregarInsumos();
    }, []);

    const carregarInsumos = async () => {
        try {
            const res = await fetch('/api/insumos');
            setInsumos(await res.json());
        } catch (erro) {
            console.error('Erro ao carregar insumos:', erro);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/insumos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Insumo adicionado com sucesso!');
                setFormData({ nome: '', descricao: '', preco_unitario: '', estoque: '', unidade: 'kg' });
                setMostraForm(false);
                carregarInsumos();
            } else {
                alert('Erro ao adicionar insumo');
            }
        } catch (erro) {
            console.error('Erro:', erro);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={onVoltar} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                ← Voltar
            </button>

            <h2>📦 Gerenciador de Insumos</h2>

            <button
                onClick={() => setMostraForm(!mostraForm)}
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginBottom: '1rem'
                }}
            >
                + Adicionar Insumo
            </button>

            {mostraForm && (
                <div style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', maxWidth: '500px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Nome do Insumo:</label>
                            <input
                                type="text"
                                value={formData.nome}
                                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Descrição:</label>
                            <textarea
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', minHeight: '80px' }}
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label>Preço Unitário (R$):</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.preco_unitario}
                                    onChange={(e) => setFormData({ ...formData, preco_unitario: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                                />
                            </div>

                            <div>
                                <label>Unidade:</label>
                                <select
                                    value={formData.unidade}
                                    onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                                    style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                                >
                                    <option value="kg">kg</option>
                                    <option value="l">L</option>
                                    <option value="un">Unidade</option>
                                    <option value="pct">Pacote</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Estoque Inicial:</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.estoque}
                                onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                backgroundColor: '#3498db',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            Salvar Insumo
                        </button>
                    </form>
                </div>
            )}

            {/* Lista de Insumos */}
            <div style={{ marginTop: '2rem' }}>
                <h3>Insumos em Estoque</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ecf0f1' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Nome</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Estoque</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Preço Unitário</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insumos.map((insumo) => (
                                <tr key={insumo.id_insumo} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                    <td style={{ padding: '0.75rem' }}>{insumo.nome}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        {insumo.estoque} {insumo.unidade}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>R$ {insumo.preco_unitario.toFixed(2)}</td>
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
