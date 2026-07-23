import React, { useState, useEffect } from 'react';
import { fetchJson } from '../api.js';

export default function DashboardFinanceiro({ onVoltar }) {
    const [resumo, setResumo] = useState(null);
    const [movimentacoes, setMovimentacoes] = useState([]);
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [erro, setErro] = useState('');

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [resumoData, movimentacoesList] = await Promise.all([
                fetchJson('/api/movimentacoes/relatorio/financeiro'),
                fetchJson('/api/movimentacoes/financeiras')
            ]);

            setResumo(resumoData);
            setMovimentacoes(movimentacoesList);
            setErro('');
        } catch (erro) {
            setErro(erro.message || 'Erro ao carregar dados financeiros.');
        }
    };

    const movimentacoesFiltradas = filtroStatus === 'todos'
        ? movimentacoes
        : movimentacoes.filter((m) => m.status === filtroStatus);

    const confirmarMovimentacao = async (id, status) => {
        try {
            await fetchJson(`/api/movimentacoes/financeiras/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            setErro('');
            carregarDados();
        } catch (erro) {
            setErro(erro.message || 'Erro ao atualizar status.');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={onVoltar} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                ← Voltar
            </button>

            <h2>💰 Dashboard Financeiro</h2>

            {erro && (
                <div style={{ backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', padding: '0.75rem', marginBottom: '1rem' }}>
                    {erro}
                </div>
            )}

            {resumo && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Recebido</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            R$ {resumo.receita_paga.toFixed(2)}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#f39c12', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Receitas Pendentes</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            R$ {resumo.receita_pendente.toFixed(2)}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#e74c3c', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Despesas</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            R$ {resumo.despesa_paga.toFixed(2)}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#3498db', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Saldo Líquido</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            R$ {resumo.saldo_total.toFixed(2)}
                        </div>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '2rem' }}>
                <h3>📊 Movimentações Financeiras</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ marginRight: '1rem' }}>Filtrar por status:</label>
                    <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ padding: '0.5rem' }}>
                        <option value="todos">Todos</option>
                        <option value="pendente">Pendente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="cancelado">Cancelado</option>
                    </select>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#ecf0f1' }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Data</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Tipo</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Categoria</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Valor</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Status</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimentacoesFiltradas.map((mov) => (
                                <tr key={mov.id_movimentacao} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                    <td style={{ padding: '0.75rem' }}>{new Date(mov.data_movimentacao).toLocaleDateString('pt-BR')}</td>
                                    <td style={{ padding: '0.75rem' }}>{mov.tipo}</td>
                                    <td style={{ padding: '0.75rem' }}>{mov.categoria}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                                        R$ {mov.valor.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.85rem',
                                            backgroundColor: mov.status === 'confirmado' ? '#d4edda' : mov.status === 'pendente' ? '#fff3cd' : '#f8d7da',
                                            color: mov.status === 'confirmado' ? '#155724' : mov.status === 'pendente' ? '#856404' : '#721c24'
                                        }}>
                                            {mov.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        {mov.status === 'pendente' && (
                                            <button
                                                onClick={() => confirmarMovimentacao(mov.id_movimentacao, 'confirmado')}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    backgroundColor: '#27ae60',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Confirmar
                                            </button>
                                        )}
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
