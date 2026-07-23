import React, { useState } from 'react';
import { postJson } from '../api.js';

function CadastroCliente({ onCadastroSucesso, onVoltar }) {
    const [form, setForm] = useState({ nome: '', cpf_cnpj: '', telefone: '', email: '', senha: '' });
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setCarregando(true);

        try {
            const data = await postJson('/api/clientes/cadastro', form, 'Erro ao cadastrar cliente.');

            onCadastroSucesso({ ...data, ...form, tipo: 'cliente' });
        } catch (err) {
            setErro(err.message || 'Não foi possível concluir o cadastro.');
        } finally {
            setCarregando(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '0.75rem', maxWidth: '420px', margin: '0 auto' }}>
            <h2>Cadastrar cliente</h2>
            <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
            <input name="cpf_cnpj" placeholder="CPF/CNPJ" value={form.cpf_cnpj} onChange={handleChange} required />
            <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
            <input name="senha" type="password" placeholder="Senha" value={form.senha} onChange={handleChange} required />
            {erro && <p style={{ color: 'crimson' }}>{erro}</p>}
            <button type="submit" disabled={carregando}>{carregando ? 'Cadastrando...' : 'Cadastrar'}</button>
            <button type="button" onClick={onVoltar}>Voltar para o login</button>
        </form>
    );
}

export default CadastroCliente;