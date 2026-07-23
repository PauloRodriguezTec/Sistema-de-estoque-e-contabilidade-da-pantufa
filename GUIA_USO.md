# 🍕 Sistema de Estoque e Contabilidade - Pizzaria

## 📋 Visão Geral

Sistema completo de gerenciamento para pizzaria com dois tipos de usuários:
- **Cliente**: Acesso ao catálogo de pizzas para realizar compras
- **Administrador**: Controle de estoque, financeiro, pedidos e pagamentos

## 🚀 Instalação e Execução

### Backend
```bash
cd backend
npm install
node server.js
```
Servidor rodará em: `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 👥 Usuários de Teste

### Admin
- **Email**: `nani@nani`
- **Senha**: `123456`

### Cliente (registrar novo)
- Clique em "Cadastro" na tela de login
- Preencha os dados solicitados

## 📊 Funcionalidades

### Para Cliente

#### 🛒 Catálogo de Pizzas
- Visualização de todas as pizzas disponíveis
- Filtro por categoria "Produto"
- Seleção de sabores para cada pizza
- Adição ao carrinho com quantidade customizável
- Visualização do total a pagar

### Para Administrador

#### 🍕 Gerenciador de Pizzas
- **Adicionar Pizza**: Nome, preço, categoria, descrição
- **Selecionar Sabores**: Associar sabores disponíveis
- **Editar Pizza**: Alterar preços e informações
- **Deletar Pizza**: Remover do cardápio
- **Visualizar Lista**: Tabela com todas as pizzas

#### 📦 Insumos/Ingredientes
- **Adicionar Insumo**: Nome, descrição, preço unitário, unidade (kg, L, un, pct)
- **Controlar Estoque**: Quantidade inicial
- **Editar/Deletar**: Gerenciar insumos

#### 📋 Controle de Estoque
- **Registrar Movimentação**:
  - Tipo: Entrada (compra), Saída (uso), Ajuste (inventário)
  - Quantidade
  - Descrição
- **Alerta de Baixo Estoque**: Insumos com menos de 5 unidades
- **Histórico Completo**: Últimas 50 movimentações
- **Estoque Atual**: Visualizar valor total em estoque

#### 📋 Gerenciador de Pedidos
- **Filtro por Status**:
  - Todos
  - Pendente
  - Confirmado
  - Entregue
  - Cancelado
- **Atualizar Status**: Dropdown para mudar status
- **Resumo Financeiro**: Totais por status
- **Informações Detalhadas**: Cliente, data, valor

#### 💳 Gerenciador de Pagamentos
- **Registrar Pagamento**: Associar a pedidos
- **Status de Pagamento**: Pendente → Confirmado → Cancelado
- **Filtros por Status**: Visualizar categorizados
- **Resumo**: Total recebido, à receber, cancelado
- **Confirmar/Cancelar**: Ações diretas por linha

#### 💰 Dashboard Financeiro
- **Resumo Financeiro**:
  - Total Recebido (receitas confirmadas)
  - Receitas Pendentes
  - Total Despesas (despesas confirmadas)
  - Saldo Líquido
- **Movimentações Financeiras**:
  - Tipo: Receita ou Despesa
  - Status: Pendente, Confirmado, Cancelado
  - Confirmar pendentes
  - Histórico completo
- **Relatório**: Totais agrupados por tipo e status

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

**clientes**
- Armazena clientes e administradores
- Campos: id, nome, cpf_cnpj, email, senha, tipo, etc.

**produtos**
- Pizzas disponíveis
- Campos: id_produto, nome, preco_unitario, categoria, estoque

**insumos**
- Ingredientes em estoque
- Campos: id_insumo, nome, preco_unitario, estoque, unidade

**categorias**
- Categorias de produtos
- Campos: id_categoria, nome, descricao

**sabores**
- Sabores disponíveis para pizzas
- Campos: id_sabor, nome, descricao

**pizza_sabores**
- Relação entre pizzas e sabores
- Campos: id_pizza, id_sabor, preco_adicional, disponivel

**pedidos**
- Pedidos do cliente
- Campos: id_pedido, id_cliente, data_pedido, valor_final, status

**itens_pedido**
- Items de cada pedido
- Campos: id_item, id_pedido, id_produto, quantidade, subtotal

**movimentacoes_estoque**
- Histórico de movimento de insumos
- Campos: id_movimentacao, id_insumo, tipo, quantidade, data

**movimentacoes_financeiras**
- Histórico de transações financeiras
- Campos: id_movimentacao, tipo, valor, status, data

**pagamentos**
- Histórico de pagamentos
- Campos: id_pagamento, id_pedido, valor, status, data_pagamento

## 🔗 Rotas da API

### Clientes
- `POST /api/clientes/cadastro` - Registrar cliente
- `POST /api/clientes/login` - Login
- `GET /api/clientes/admins` - Listar admins
- `POST /api/clientes/admins` - Criar admin
- `PUT /api/clientes/admins/:id` - Atualizar admin
- `DELETE /api/clientes/admins/:id` - Deletar admin

### Produtos
- `GET /api/produtos` - Listar todos
- `POST /api/produtos` - Criar
- `GET /api/produtos/:id` - Obter um
- `PUT /api/produtos/:id` - Atualizar
- `DELETE /api/produtos/:id` - Deletar

### Categorias
- `GET /api/categorias` - Listar
- `POST /api/categorias` - Criar
- `PUT /api/categorias/:id` - Atualizar
- `DELETE /api/categorias/:id` - Deletar

### Insumos
- `GET /api/insumos` - Listar
- `POST /api/insumos` - Criar
- `PUT /api/insumos/:id` - Atualizar
- `DELETE /api/insumos/:id` - Deletar

### Sabores
- `GET /api/sabores` - Listar
- `POST /api/sabores` - Criar
- `PUT /api/sabores/:id` - Atualizar
- `DELETE /api/sabores/:id` - Deletar

### Serviços
- `GET /api/servicos` - Listar
- `POST /api/servicos` - Criar
- `PUT /api/servicos/:id` - Atualizar
- `DELETE /api/servicos/:id` - Deletar

### Movimentações
- `POST /api/movimentacoes/estoque` - Registrar movimentação de estoque
- `GET /api/movimentacoes/estoque` - Listar movimentações
- `POST /api/movimentacoes/financeiras` - Registrar mov. financeira
- `GET /api/movimentacoes/financeiras` - Listar mov. financeiras
- `PUT /api/movimentacoes/financeiras/:id` - Atualizar status
- `GET /api/movimentacoes/relatorio/financeiro` - Relatório

### Pagamentos
- `GET /api/pagamentos` - Listar pagamentos
- `POST /api/pagamentos` - Criar pagamento
- `PUT /api/pagamentos/:id` - Atualizar status
- `DELETE /api/pagamentos/:id` - Deletar
- `GET /api/pagamentos/relatorio/resumo` - Resumo

## 🎨 Fluxo de Uso

### Cliente
1. Faz login ou cadastro
2. Visualiza catálogo de pizzas
3. Seleciona pizza e sabor
4. Adiciona quantidade ao carrinho
5. Finaliza compra

### Administrador
1. Faz login
2. Navega pelo menu lateral
3. Gerencia produtos (pizzas)
4. Gerencia insumos
5. Registra movimentações de estoque
6. Gerencia pedidos e pagamentos
7. Visualiza relatórios financeiros

## ⚙️ Configurações Iniciais Recomendadas

1. **Criar Categorias**:
   - Produto (para pizzas)
   - Bebida
   - Sobremesa
   - Serviço

2. **Criar Sabores**:
   - Margherita
   - Calabresa
   - Quatro Queijos
   - Portuguesa
   - etc.

3. **Criar Insumos**:
   - Massa de pizza
   - Molho de tomate
   - Queijo
   - Calabresa
   - etc.

4. **Criar Pizzas**:
   - Associar sabores
   - Definir preços
   - Definir categoria

## 📝 Notas Importantes

- O email de admin (`nani@nani`) é criado automaticamente
- Movimentações de estoque atualizam automaticamente o estoque do insumo
- Pagamentos podem ser filtrados por status
- Relatórios financeiros mostram totais confirmados e pendentes
- Todas as datas são registradas automaticamente

## 🐛 Troubleshooting

**Erro: "Backend não está respondendo"**
- Verifique se o servidor Node está rodando em http://localhost:5000

**Erro: "Banco de dados não encontrado"**
- O SQLite criará automaticamente o arquivo `database.sqlite` na pasta backend

**Estoque não atualiza**
- Verifique se a movimentação foi registrada com o tipo correto (entrada/saída/ajuste)

## 📞 Suporte

Para questões ou problemas, revise:
1. Logs do servidor (terminal backend)
2. Console do navegador (F12)
3. Database.sqlite logs
