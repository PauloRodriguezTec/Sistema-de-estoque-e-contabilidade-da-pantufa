import React, { useState, useEffect } from 'react';
import { fetchJson } from '../api.js';

export default function GerenciadorPagamentos({ onVoltar }) {
    const [pagamentos, setPagamentos] = useState([]);
    const [resumo, setResumo] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [erro, setErro] = useState('');

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [pagamentosData, resumoData] = await Promise.all([
                fetchJson('/api/pagamentos'),
                fetchJson('/api/pagamentos/relatorio/resumo')
            ]);

            setPagamentos(pagamentosData);
            setResumo(resumoData);
            setErro('');
        } catch (erro) {
            setErro(erro.message || 'Erro ao carregar pagamentos.');
        }
    };

    const atualizarStatus = async (id, novoStatus) => {
        try {
            await fetchJson(`/api/pagamentos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
            setErro('');
            carregarDados();
        } catch (erro) {
            setErro(erro.message || 'Erro ao atualizar pagamento.');
        }
    };

    const pagamentosFiltrados = filtroStatus === 'todos'
        ? pagamentos
        : pagamentos.filter((p) => p.status === filtroStatus);

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={onVoltar} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                ← Voltar
            </button>

            <h2>💳 Gerenciador de Pagamentos</h2>

            {erro && (
                <div style={{ backgroundColor: '#f8d7da', color: '#721c24', border: '1px solid #f5c6cb', borderRadius: '4px', padding: '0.75rem', marginBottom: '1rem' }}>
                    {erro}
                </div>
            )}

            {/* Resumo */}
            {resumo && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total Recebido</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            R$ {resumo.total_pago.toFixed(2)}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#f39c12', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>À Receber</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            R$ {resumo.total_pendente.toFixed(2)}
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#3498db', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Cancelado</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                            R$ {resumo.total_cancelado.toFixed(2)}
                        </div>
                    </div>
                </div>
            )}

            {/* Filtro */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: '1rem' }}>Filtrar por status:</label>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ padding: '0.5rem' }}>
                    <option value="todos">Todos</option>
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>

            {/* Tabela de Pagamentos */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#ecf0f1' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Pedido</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Cliente</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Valor</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Forma</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Status</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagamentosFiltrados.map((pagamento) => (
                            <tr key={pagamento.id_pagamento} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                <td style={{ padding: '0.75rem' }}>#{pagamento.id_pedido}</td>
                                <td style={{ padding: '0.75rem' }}>{pagamento.cliente_nome || 'N/A'}</td>
                                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>R$ {pagamento.valor.toFixed(2)}</td>
                                <td style={{ padding: '0.75rem' }}>{pagamento.forma_pagamento}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        backgroundColor: pagamento.status === 'confirmado' ? '#d4edda' : pagamento.status === 'pendente' ? '#fff3cd' : '#f8d7da',
                                        color: pagamento.status === 'confirmado' ? '#155724' : pagamento.status === 'pendente' ? '#856404' : '#721c24'
                                    }}>
                                        {pagamento.status}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    {pagamento.status === 'pendente' && (
                                        <>
                                            <button
                                                onClick={() => atualizarStatus(pagamento.id_pagamento, 'confirmado')}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    backgroundColor: '#27ae60',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem',
                                                    marginRight: '0.5rem'
                                                }}
                                            >
                                                ✓ Confirmar
                                            </button>
                                            <button
                                                onClick={() => atualizarStatus(pagamento.id_pagamento, 'cancelado')}
                                                style={{
                                                    padding: '0.4rem 0.8rem',
                                                    backgroundColor: '#e74c3c',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                ✕ Cancelar
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
