import React, { useState } from 'react';
import GerenciadorProdutos from './gerenciadorProdutos.jsx';
import GerenciadorInsumos from './gerenciadorInsumos.jsx';
import DashboardEstoque from './dashboardEstoque.jsx';
import DashboardFinanceiro from './dashboardFinanceiro.jsx';
import GerenciadorPagamentos from './gerenciadorPagamentos.jsx';
import GerenciadorPedidos from './gerenciadorPedidos.jsx';

function DashboardAdmin({ user, onLogout }) {
    const [secaoAtiva, setSecaoAtiva] = useState('principal');

    const menuItems = [
        { id: 'principal', label: '🏠 Início', icon: '📊' },
        { id: 'produtos', label: '🍕 Gerenciar Pizzas', icon: '📝' },
        { id: 'insumos', label: '📦 Insumos/Ingredientes', icon: '📦' },
        { id: 'estoque', label: '📋 Controle de Estoque', icon: '📊' },
        { id: 'pedidos', label: '📋 Pedidos', icon: '📝' },
        { id: 'pagamentos', label: '💳 Pagamentos', icon: '💰' },
        { id: 'financeiro', label: '💰 Financeiro', icon: '📊' }
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '250px 1fr',
            height: '100vh',
            backgroundColor: '#f3f4f6',
            gap: '1rem',
            padding: '1rem'
        }}>
            {/* Sidebar */}
            <div style={{
                backgroundColor: '#1f2937',
                borderRadius: '8px',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                <div style={{ color: 'white', marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>🍕 Pizzaria Admin</h3>
                    <p style={{ margin: '0', fontSize: '0.85rem', color: '#d1d5db' }}>{user?.nome || 'Administrador'}</p>
                </div>

                <nav style={{ flex: 1 }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSecaoAtiva(item.id)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                marginBottom: '0.5rem',
                                backgroundColor: secaoAtiva === item.id ? '#3b82f6' : 'transparent',
                                color: secaoAtiva === item.id ? 'white' : '#d1d5db',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '0.95rem',
                                transition: 'all 0.3s',
                                fontWeight: secaoAtiva === item.id ? 'bold' : 'normal'
                            }}
                            onMouseEnter={(e) => {
                                if (secaoAtiva !== item.id) {
                                    e.target.style.backgroundColor = '#374151';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (secaoAtiva !== item.id) {
                                    e.target.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={onLogout}
                    style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#dc2626'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ef4444'}
                >
                    🚪 Sair
                </button>
            </div>

            {/* Conteúdo Principal */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                overflow: 'auto',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
                {secaoAtiva === 'principal' && (
                    <div style={{ padding: '2rem' }}>
                        <h1>👋 Bem-vindo ao Painel Administrativo</h1>
                        <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '2rem' }}>
                            Selecione uma opção no menu lateral para começar.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                            <div style={{
                                backgroundColor: '#eff6ff',
                                border: '2px solid #3b82f6',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px rgba(59, 130, 246, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => setSecaoAtiva('produtos')}
                            >
                                <h3>🍕 Gerenciar Pizzas</h3>
                                <p>Adicione, edite ou remova pizzas do cardápio.</p>
                            </div>

                            <div style={{
                                backgroundColor: '#f0fdf4',
                                border: '2px solid #22c55e',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px rgba(34, 197, 94, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => setSecaoAtiva('insumos')}
                            >
                                <h3>📦 Insumos/Ingredientes</h3>
                                <p>Gerencie os ingredientes em estoque.</p>
                            </div>

                            <div style={{
                                backgroundColor: '#fef3c7',
                                border: '2px solid #f59e0b',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px rgba(245, 158, 11, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => setSecaoAtiva('estoque')}
                            >
                                <h3>📋 Controle de Estoque</h3>
                                <p>Registre movimentações de insumos.</p>
                            </div>

                            <div style={{
                                backgroundColor: '#fce7f3',
                                border: '2px solid #ec4899',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px rgba(236, 72, 153, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => setSecaoAtiva('pedidos')}
                            >
                                <h3>📋 Pedidos</h3>
                                <p>Gerencie pedidos pendentes e confirmados.</p>
                            </div>

                            <div style={{
                                backgroundColor: '#e0e7ff',
                                border: '2px solid #6366f1',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px rgba(99, 102, 241, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => setSecaoAtiva('pagamentos')}
                            >
                                <h3>💳 Pagamentos</h3>
                                <p>Controle pagamentos pendentes e confirmados.</p>
                            </div>

                            <div style={{
                                backgroundColor: '#f3e8ff',
                                border: '2px solid #a855f7',
                                borderRadius: '8px',
                                padding: '1.5rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-4px)';
                                    e.currentTarget.style.boxShadow = '0 10px 15px rgba(168, 85, 247, 0.3)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => setSecaoAtiva('financeiro')}
                            >
                                <h3>💰 Dashboard Financeiro</h3>
                                <p>Visualize relatórios financeiros e movimentações.</p>
                            </div>
                        </div>
                    </div>
                )}

                {secaoAtiva === 'produtos' && <GerenciadorProdutos onVoltar={() => setSecaoAtiva('principal')} />}
                {secaoAtiva === 'insumos' && <GerenciadorInsumos onVoltar={() => setSecaoAtiva('principal')} />}
                {secaoAtiva === 'estoque' && <DashboardEstoque onVoltar={() => setSecaoAtiva('principal')} />}
                {secaoAtiva === 'pedidos' && <GerenciadorPedidos onVoltar={() => setSecaoAtiva('principal')} />}
                {secaoAtiva === 'pagamentos' && <GerenciadorPagamentos onVoltar={() => setSecaoAtiva('principal')} />}
                {secaoAtiva === 'financeiro' && <DashboardFinanceiro onVoltar={() => setSecaoAtiva('principal')} />}
            </div>
        </div>
    );
}

export default DashboardAdmin;
