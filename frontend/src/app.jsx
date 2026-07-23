import React, { useState } from 'react';
import Login from './components/login.jsx';
import DashboardCliente from './components/dashboardCliente.jsx';
import DashboardAdmin from './components/dashboardAdmin.jsx';
import CadastroCliente from './components/cadastroCliente.jsx';
import CatalogoCliente from './components/catalogoCliente.jsx';

function App() {
    const [user, setUser] = useState(null);
    const [showCadastro, setShowCadastro] = useState(false);

    const handleLogin = (data) => {
        const cliente = data.cliente;
        const normalizedUser = {
            ...cliente,
            tipo: cliente.tipo || (cliente.email === 'nani@nani' ? 'admin' : 'cliente')
        };
        setUser(normalizedUser);
    };

    const handleCadastroSucesso = (cliente) => {
        setUser({ ...cliente, tipo: 'cliente' });
        setShowCadastro(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setShowCadastro(false);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', fontFamily: 'Arial, sans-serif', padding: '0 1rem' }}>
            {!user ? (
                showCadastro ? (
                    <CadastroCliente onCadastroSucesso={handleCadastroSucesso} onVoltar={() => setShowCadastro(false)} />
                ) : (
                    <Login onLogin={handleLogin} onCadastrar={() => setShowCadastro(true)} />
                )
            ) : user.tipo === 'admin' ? (
                <DashboardAdmin user={user} onLogout={handleLogout} />
            ) : (
                <CatalogoCliente cliente={user} onLogout={handleLogout} />
            )}
        </div>
    );
}

export default App;
