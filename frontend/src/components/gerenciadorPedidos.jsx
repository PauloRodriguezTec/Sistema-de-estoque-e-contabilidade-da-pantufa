import React, { useState, useEffect } from 'react';

export default function GerenciadorPedidos({ onVoltar }) {
    const [pedidos, setPedidos] = useState([]);
    const [filtroStatus, setFiltroStatus] = useState('todos');

    useEffect(() => {
        carregarPedidos();
    }, []);

    const carregarPedidos = async () => {
        try {
            const res = await fetch('/api/pedidos');
            setPedidos(await res.json());
        } catch (erro) {
            console.error('Erro ao carregar pedidos:', erro);
        }
    };

    const atualizarStatusPedido = async (id, novoStatus) => {
        try {
            const res = await fetch(`/api/pedidos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });

            if (res.ok) {
                carregarPedidos();
            }
        } catch (erro) {
            console.error('Erro ao atualizar pedido:', erro);
        }
    };

    const pedidosFiltrados = filtroStatus === 'todos'
        ? pedidos
        : pedidos.filter((p) => p.status === filtroStatus);

    const totalPendentes = pedidos.filter((p) => p.status === 'pendente').reduce((sum, p) => sum + (p.valor_final || 0), 0);
    const totalConfirmados = pedidos.filter((p) => p.status === 'confirmado').reduce((sum, p) => sum + (p.valor_final || 0), 0);

    return (
        <div style={{ padding: '2rem' }}>
            <button onClick={onVoltar} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
                ← Voltar
            </button>

            <h2>📋 Gerenciador de Pedidos</h2>

            {/* Resumo */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: '#3498db', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Total de Pedidos</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        {pedidos.length}
                    </div>
                </div>

                <div style={{ backgroundColor: '#f39c12', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Pedidos Pendentes</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        R$ {totalPendentes.toFixed(2)}
                    </div>
                </div>

                <div style={{ backgroundColor: '#27ae60', color: 'white', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Pedidos Confirmados</div>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        R$ {totalConfirmados.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Filtro */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: '1rem' }}>Filtrar por status:</label>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} style={{ padding: '0.5rem' }}>
                    <option value="todos">Todos</option>
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="entregue">Entregue</option>
                    <option value="cancelado">Cancelado</option>
                </select>
            </div>

            {/* Tabela de Pedidos */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#ecf0f1' }}>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>ID</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Cliente</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Data</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Valor</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Status</th>
                            <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #bdc3c7' }}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidosFiltrados.map((pedido) => (
                            <tr key={pedido.id_pedido} style={{ borderBottom: '1px solid #ecf0f1' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>#{pedido.id_pedido}</td>
                                <td style={{ padding: '0.75rem' }}>{pedido.cliente_nome || 'Cliente'}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    {new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}
                                </td>
                                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                                    R$ {pedido.valor_final.toFixed(2)}
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        backgroundColor: pedido.status === 'confirmado' || pedido.status === 'entregue' ? '#d4edda' : pedido.status === 'pendente' ? '#fff3cd' : '#f8d7da',
                                        color: pedido.status === 'confirmado' || pedido.status === 'entregue' ? '#155724' : pedido.status === 'pendente' ? '#856404' : '#721c24'
                                    }}>
                                        {pedido.status}
                                    </span>
                                </td>
                                <td style={{ padding: '0.75rem' }}>
                                    <select
                                        value={pedido.status}
                                        onChange={(e) => atualizarStatusPedido(pedido.id_pedido, e.target.value)}
                                        style={{
                                            padding: '0.4rem',
                                            borderRadius: '4px',
                                            border: '1px solid #bdc3c7',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        <option value="pendente">Pendente</option>
                                        <option value="confirmado">Confirmado</option>
                                        <option value="entregue">Entregue</option>
                                        <option value="cancelado">Cancelado</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
