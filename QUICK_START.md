# 🚀 QUICK START - Sistema de Pizzaria

## ⚡ Começar em 3 Passos

### 1️⃣ Backend
```bash
cd backend
npm install
node server.js
```
✅ Servidor ativo em `http://localhost:5000`

### 2️⃣ Frontend
```bash
cd frontend
npm install
npm run dev
```
✅ App ativo em `http://localhost:5173` (ou similar)

### 3️⃣ Login com Admin
- **Email**: `nani@nani`
- **Senha**: `123456`

---

## 🎯 Testar as Funcionalidades

### Como Admin 👨‍💼

#### 1. Criar Sabores
1. Menu → 🏠 Início
2. Clique no card "Gerenciar Pizzas"
3. Na seção de sabores (dropdown), crie alguns:
   - Margherita
   - Calabresa
   - Quatro Queijos

#### 2. Criar Pizzas
1. Menu → 🍕 Gerenciar Pizzas
2. Clique "+ Adicionar Nova Pizza"
3. Preencha:
   - Nome: "Pizza Margherita"
   - Preço: 35.00
   - Categoria: "Produto"
   - Selecione sabores

#### 3. Criar Insumos
1. Menu → 📦 Insumos/Ingredientes
2. Clique "+ Adicionar Insumo"
3. Preencha:
   - Nome: "Queijo Mozzarela"
   - Preço: 45.00
   - Unidade: kg
   - Estoque: 10

#### 4. Registrar Movimentação de Estoque
1. Menu → 📋 Controle de Estoque
2. Clique "+ Registrar Movimentação"
3. Selecione:
   - Insumo: "Queijo Mozzarela"
   - Tipo: "Entrada"
   - Quantidade: 5
   - Descrição: "Compra fornecedor X"

#### 5. Visualizar Estoque
1. Menu → 📋 Controle de Estoque
2. Veja a tabela "Estoque Atual"
3. Note que estoque foi atualizado (10 + 5 = 15 kg)

#### 6. Criar Pagamento/Pedido
1. Menu → 💳 Pagamentos
2. Veja resumos de: Total Pago, À Receber, Cancelado

#### 7. Dashboard Financeiro
1. Menu → 💰 Financeiro
2. Veja cards com:
   - Total Recebido
   - Receitas Pendentes
   - Total Despesas
   - Saldo Líquido

---

## 🛒 Testar como Cliente

### 1. Criar Conta Cliente
1. Volte ao login (Sair)
2. Clique "Cadastro"
3. Preencha:
   - Nome: "João Silva"
   - CPF: "12345678900"
   - Email: "joao@email.com"
   - Senha: "123456"
4. Clique Cadastrar

### 2. Visualizar Catálogo
1. Será redirecionado para catálogo
2. Veja as pizzas criadas
3. Clique em "Ver Sabores" de uma pizza
4. Selecione um sabor

### 3. Adicionar ao Carrinho
1. Clique no sabor desejado
2. Pizza será adicionada ao carrinho
3. Ajuste quantidade à direita
4. Veja total atualizar automaticamente

---

## 📊 Verificar Dados no BD

### SQLite (opcional)
```bash
# Na pasta backend
sqlite3 database.sqlite

# Ver tabelas
.tables

# Ver dados de pizzas
SELECT * FROM produtos;

# Ver sabores
SELECT * FROM sabores;

# Ver insumos
SELECT * FROM insumos;

# Ver movimentações
SELECT * FROM movimentacoes_estoque;

# Sair
.exit
```

---

## 🎨 Interface Visual

### Admin Dashboard
```
┌─────────────────────────────────────────┐
│  🍕 Pizzaria Admin                      │
├─────────────────────────────────────────┤
│ Menu Lateral (250px)  │  Conteúdo      │
├─────────────────────────────────────────┤
│ 🏠 Início             │  Cards de      │
│ 🍕 Pizzas             │  navegação     │
│ 📦 Insumos            │                │
│ 📋 Estoque            │  Formulários   │
│ 📋 Pedidos            │  e Tabelas     │
│ 💳 Pagamentos         │                │
│ 💰 Financeiro         │                │
│ 🚪 Sair               │                │
└─────────────────────────────────────────┘
```

### Cliente Catálogo
```
┌────────────────────────────────────────────┐
│  Bem-vindo, João!              [Sair]      │
├───────────────────────────┬─────────────────┤
│                           │ 🛒 Carrinho     │
│   CARDÁPIO                │ (3 itens)       │
│                           │                 │
│  [Pizza 1] [Pizza 2]      │ Pizza A (2x)   │
│  [Pizza 3] [Pizza 4]      │ Pizza B (1x)   │
│                           │                 │
│  ...                      │ Total: R$ 75   │
│                           │ [Finalizar]    │
└───────────────────────────┴─────────────────┘
```

---

## ✅ Checklist Funcional

- [ ] Admin consegue criar pizzas
- [ ] Admin consegue criar sabores
- [ ] Admin consegue criar insumos
- [ ] Admin consegue registrar movimentações
- [ ] Estoque atualiza automaticamente
- [ ] Cliente vê catálogo
- [ ] Cliente consegue adicionar ao carrinho
- [ ] Total do carrinho calcula correto
- [ ] Dashboard financeiro mostra resumos
- [ ] Pagamentos filtram por status

---

## 🐛 Debugging

### Se der erro de conexão:
```bash
# Terminal 1 - Backend
cd backend
node server.js
# Deve aparecer: "Servidor rodando na porta 5000"

# Terminal 2 - Frontend
cd frontend
npm run dev
# Deve aparecer: "http://localhost:5173"
```

### Se o BD não criar:
- Verifique pasta `backend/` 
- Deve ter arquivo `database.sqlite` depois de rodar server.js

### Se componentes não aparecerem:
- Limpe cache: `Ctrl+Shift+Delete` no navegador
- Ou abra em abas privadas

---

## 📞 Problemas Comuns

| Erro | Solução |
|------|---------|
| "Backend não respondendo" | Verifique se server.js está rodando |
| "Nenhuma pizza aparece" | Crie pizzas no gerenciador |
| "Estoque não atualiza" | Registre movimento com tipo correto |
| "Componente não carrega" | F5 para recarregar ou verificar console |
| "Banco não existe" | Execute uma vez o server.js que criará |

---

## 🎯 Próximos Testes

1. **Teste de Carga**: Crie 100 insumos
2. **Teste de Estoque**: Registre 50 movimentações
3. **Teste Financeiro**: Confirme/cancele múltiplos pagamentos
4. **Teste UI**: Redimensione janela (responsividade)
5. **Teste Filtros**: Filtre por diferentes status

---

## 💡 Dicas

- Use Ctrl+Shift+J (DevTools) para ver console
- Network tab mostra requisições ao backend
- Local Storage: F12 → Application → Storage
- Dados persistem no SQLite (fechando app não apaga)

---

## 🚀 Está Pronto para:

✅ Testes funcionais
✅ Testes de interface
✅ Testes de performance
✅ Desenvolvimento de novas features
✅ Implantação em staging

---

**Enjoy! 🍕**
