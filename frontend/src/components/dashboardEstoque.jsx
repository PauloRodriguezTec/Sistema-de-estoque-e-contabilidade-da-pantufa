import React, { useState, useEffect } from 'react';
import { fetchJson } from '../api.js';

export default function DashboardEstoque({ onVoltar }) {
    const [insumos, setInsumos] = useState([]);
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [erro, setErro] = useState('');
    const [mostraFormMovimentacao, setMostraFormMovimentacao] = useState(false);
    const [formData, setFormData] = useState({
        id_insumo: '',
        tipo: 'entrada',
        quantidade: '',
        descricao: ''
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [insumosData, movData] = await Promise.all([
                fetchJson('/api/insumos'),
                fetchJson('/api/movimentacoes/estoque')
            ]);

            setInsumos(insumosData);
            setMovimentacoes(movData);
            setErro('');
        } catch (erro) {
            setErro(erro.message || 'Erro ao carregar dados.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await fetchJson('/api/movimentacoes/estoque', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    quantidade: Number(formData.quantidade)
                })
            });

            setErro('');
            alert('Movimentação registrada com sucesso!');
            setFormData({ id_insumo: '', tipo: 'entrada', quantidade: '', descricao: '' });
            setMostraFormMovimentacao(false);
            carregarDados();
        } catch (erro) {
            const mensagem = erro.message || 'Erro ao registrar movimentação.';
            setErro(mensagem);
            alert(mensagem);
        }
    };

    const insumosComBaixoEstoque = insumos.filter((i) => i.estoque < 5);

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={onVoltar} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                ← Voltar
            </button>

            <h2>📦 Dashboard de Estoque</h2>

            {erro && (
                <div style={{ backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', padding: '0.75rem', marginBottom: '1rem' }}>
                    {erro}
                </div>
            )}

            {/* Alerta de Baixo Estoque */}
            {insumosComBaixoEstoque.length > 0 && (
                <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '4px', padding: '1rem', marginBottom: '1rem' }}>
                    <strong>⚠️ Alerta:</strong> {insumosComBaixoEstoque.length} insumo(s) com estoque baixo:
                    <ul style={{ margin: '0.5rem 0 0 1.5rem' }}>
                        {insumosComBaixoEstoque.map((i) => (
                            <li key={i.id_insumo}>{i.nome} - {i.estoque} {i.unidade}</li>
                        ))}
                    </ul>
                </div>
            )}

            <button
                onClick={() => setMostraFormMovimentacao(!mostraFormMovimentacao)}
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
                + Registrar Movimentação
            </button>

            {mostraFormMovimentacao && (
                <div style={{ backgroundColor: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem', maxWidth: '500px' }}>
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1rem' }}>
                            <label>Insumo:</label>
                            <select
                                value={formData.id_insumo}
                                onChange={(e) => setFormData({ ...formData, id_insumo: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            >
                                <option value="">Selecione...</option>
                                {insumos.map((i) => (
                                    <option key={i.id_insumo} value={i.id_insumo}>
                                        {i.nome} (Estoque: {i.estoque} {i.unidade})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Tipo de Movimentação:</label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            >
                                <option value="entrada">Entrada (compra/devolução)</option>
                                <option value="saída">Saída (uso/venda)</option>
                                <option value="ajuste">Ajuste (inventário)</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Quantidade:</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantidade}
                                onChange={(e) => setFormData({ ...formData, quantidade: e.target.value })}
                                required
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label>Descrição:</label>
                            <textarea
                                value={formData.descricao}
                                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                                placeholder="Ex: Compra do fornecedor X, Data..."
                                style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', minHeight: '60px' }}
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
                            Registrar Movimentação
                        </button>
                    </form>
                </div>
            )}

            {/* Estoque Atual */}
            <div style={{ marginTop: '2rem' }}>
                <h3>📋 Estoque Atual</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ecf0f1' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Insumo</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Estoque</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Preço Unit.</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Valor Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {insumos.map((insumo) => (
                                <tr key={insumo.id_insumo} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                    <td style={{ padding: '0.75rem' }}>{insumo.nome}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: insumo.estoque < 5 ? 'bold' : 'normal', color: insumo.estoque < 5 ? '#e74c3c' : 'inherit' }}>
                                        {insumo.estoque} {insumo.unidade}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>R$ {insumo.preco_unitario.toFixed(2)}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                                        R$ {(insumo.estoque * insumo.preco_unitario).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Histórico de Movimentações */}
            <div style={{ marginTop: '2rem' }}>
                <h3>📊 Histórico de Movimentações</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ecf0f1' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Data</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Insumo</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Tipo</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Quantidade</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Descrição</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimentacoes.slice(0, 50).map((mov) => (
                                <tr key={mov.id_movimentacao} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                    <td style={{ padding: '0.75rem' }}>{new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ padding: '0.75rem' }}>{mov.insumo_nome}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            backgroundColor: mov.tipo === 'entrada' ? '#d4edda' : mov.tipo === 'saída' ? '#f8d7da' : '#e2e3e5',
                                            color: mov.tipo === 'entrada' ? '#155724' : mov.tipo === 'saída' ? '#721c24' : '#383d41'
                                        }}>
                                            {mov.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{mov.quantidade} {mov.unidade}</td>
                                    <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#666' }}>{mov.descricao}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
