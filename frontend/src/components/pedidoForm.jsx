import React, { useState } from 'react';

function PedidoForm() {
    const [form, setForm] = useState({ id_cliente: '', data_pedido: '', forma_pgto: '', valor_final: '' });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    return (
        <form style={{ display: 'grid', gap: '0.75rem', maxWidth: '420px' }}>
            <h3>Novo pedido</h3>
            <input name="id_cliente" placeholder="ID do cliente" value={form.id_cliente} onChange={handleChange} />
            <input name="data_pedido" placeholder="Data do pedido" value={form.data_pedido} onChange={handleChange} />
            <input name="forma_pgto" placeholder="Forma de pagamento" value={form.forma_pgto} onChange={handleChange} />
            <input name="valor_final" placeholder="Valor final" value={form.valor_final} onChange={handleChange} />
            <button type="submit">Salvar pedido</button>
        </form>
    );
}

export default PedidoForm;