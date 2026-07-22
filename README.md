🗂 Modelo de Entidades
1. Fornecedores
id_fornecedor (PK),
nome,
tipo (empresa, pessoa física),
contato (telefone/email),
id_endereco (FK → Endereços)

3. Despesas
id_despesa (PK),
data,
valor,
forma_pgto (PIX, boleto, dinheiro),
tipo_custo (insumo, serviço, imposto, investimento, custo fixo/variável),
descrição,
id_fornecedor (FK → Fornecedores),

3. Produtos
id_produto (PK),
nome (Calabresa, Marguerita, Bacon c/ Alho Poró, etc.),
preço_unitário,
categoria (pizza, insumo, embalagem etc.)

5. Pedidos/Vendas,
id_pedido (PK),
id_cliente (FK → Clientes),
data_pedido,
data_entrega,
forma_pgto,
data_pgto,
status (pago, pendente, cancelado),
desconto,
valor_final,

5. Itens do Pedido
id_item (PK),
id_pedido (FK → Pedidos),
id_produto (FK → Produtos),
quantidade,
valor_unitário,
subtotal,

6. Clientes
id_cliente (PK),
nome,
cpf_cnpj,
telefone,
email,
id_endereco (FK → Endereços),
histórico_compras (total de pedidos realizados),
pedidos_ativos (quantidade),
pedidos_entregues (quantidade),
pagamentos_pendentes (valor acumulado),
pagamentos_realizados (valor acumulado)

7. Endereços
id_endereco (PK).
logradouro,
número,
complemento,
bairro,
cidade,
estado,
cep,

🔗 Principais Relacionamentos
Fornecedores → possuem um Endereço.

Clientes → possuem um Endereço.

Despesas → vinculadas a um Fornecedor.

Pedidos → vinculados a um Cliente.

Itens do Pedido → vinculados a um Pedido e a um Produto.
