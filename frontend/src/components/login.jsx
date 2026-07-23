import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

function Login({ onLogin, onCadastrar }) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/clientes/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao fazer login.');
            }

            if (data.token) {
                onLogin(data);
            }
        } catch (err) {
            setErro(err.message || 'Não foi possível conectar ao servidor.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: '360px', margin: '0 auto' }}>
            <h2>Login</h2>
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} required />
            {erro && <p style={{ color: 'crimson' }}>{erro}</p>}
            <button type="submit" disabled={carregando}>{carregando ? 'Entrando...' : 'Entrar'}</button>
            <button type="button" onClick={onCadastrar}>Criar conta</button>
        </form>
    );
}

export default Login;
