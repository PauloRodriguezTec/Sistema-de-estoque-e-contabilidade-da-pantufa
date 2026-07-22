Entidades Principais
1. Fornecedores
id_fornecedor (PK)
nome
tipo (empresa, pessoa física)
contato (telefone/email)

2. Despesas
id_despesa (PK)
data
valor
forma_pgto (PIX, boleto, dinheiro)
tipo_custo (insumo, serviço, imposto, investimento, custo fixo/variável)
descrição
id_fornecedor (FK → Fornecedores)

3. Produtos
id_produto (PK)
nome (Calabresa, Marguerita, Bacon c/ Alho Poró, Frango c/ Catupiry, Ratatouille etc.)
preço_unitário
categoria (pizza, insumo, embalagem etc.)

4. Pedidos/Vendas
id_pedido (PK)
data_pedido
data_entrega
forma_pgto
data_pgto
status (pago, pendente, cancelado)
desconto
valor_final

5. Itens do Pedido
id_item (PK)
id_pedido (FK → Pedidos)
id_produto (FK → Produtos)
quantidade
valor_unitário
subtotal

🔗 Relacionamentos
Fornecedores 1:N Despesas → cada fornecedor pode ter várias despesas.
Pedidos 1:N ItensPedido → cada pedido pode ter vários produtos.
Produtos 1:N ItensPedido → cada produto pode aparecer em vários pedidos.
