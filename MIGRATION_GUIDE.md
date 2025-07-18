# Guia de Migração - Express → T3 Stack

Este documento descreve a migração completa do backend Express para o T3 Stack com arquitetura monorepo.

## 🔄 Mudanças Principais

### Estrutura do Projeto
```
ANTES:
metalgest/
├── src/               # Frontend React
├── backend/           # Backend Express
├── public/
└── ...

DEPOIS:
metalgest/
├── apps/
│   ├── web/          # Frontend React + Vite + tRPC
│   └── server/       # Backend Next.js + tRPC + NextAuth
├── packages/
│   ├── database/     # Prisma schema e cliente
│   └── shared/       # Tipos e utilitários compartilhados
└── ...
```

### Tecnologias Migradas

| Componente | Antes | Depois |
|------------|-------|--------|
| **API** | Express + REST | Next.js + tRPC |
| **Auth** | JWT manual | NextAuth.js |
| **Database** | Prisma direto | Prisma + package compartilhado |
| **Validation** | Joi | Zod |
| **Types** | TypeScript básico | Type-safe full-stack |
| **Queries** | fetch/axios | tRPC + TanStack Query |

## 🚀 Benefícios da Migração

### Type Safety
- **Antes**: Tipos separados entre front e back
- **Depois**: Tipos compartilhados e inferidos automaticamente

### Developer Experience
- **Antes**: Documentação manual da API
- **Depois**: Auto-complete e type-hints automáticos

### Performance
- **Antes**: Fetch requests individuais
- **Depois**: Batch requests + cache inteligente

### Manutenibilidade
- **Antes**: Código duplicado entre front e back
- **Depois**: Lógica compartilhada em packages

## 📋 Funcionalidades Migradas

### ✅ Completamente Migrado
- **Autenticação**: Login, registro, perfil
- **Dashboard**: Estatísticas e gráficos
- **Produtos**: CRUD completo com filtros
- **Estrutura Base**: Monorepo, types, validação

### 🔄 Parcialmente Migrado
- **Serviços**: Schema criado, API em desenvolvimento
- **Clientes**: Schema criado, API em desenvolvimento
- **Orçamentos**: Schema criado, API em desenvolvimento
- **Transações**: Schema criado, API em desenvolvimento

### 📋 Próximos Passos
1. Completar routers tRPC restantes
2. Migrar componentes frontend
3. Implementar testes
4. Configurar CI/CD

## 🔧 Como Usar a Nova API

### Antes (REST)
```javascript
// Buscar produtos
const response = await fetch('/api/products');
const products = await response.json();

// Criar produto
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(productData)
});
```

### Depois (tRPC)
```typescript
// Buscar produtos
const { data: products, isLoading } = trpc.products.list.useQuery();

// Criar produto
const createProduct = trpc.products.create.useMutation({
  onSuccess: () => {
    // Invalidar cache automaticamente
    utils.products.list.invalidate();
  }
});
```

## 🎯 Hooks Migrados

### Produtos
```typescript
// Listar produtos
const { data, isLoading } = useProducts(filters);

// Produto individual
const { data: product } = useProduct(id);

// Criar produto
const createProduct = useCreateProduct();

// Atualizar produto
const updateProduct = useUpdateProduct();

// Deletar produto
const deleteProduct = useDeleteProduct();
```

### Dashboard
```typescript
// Estatísticas
const { data: stats } = useDashboardStats();

// Gráficos
const { data: charts } = useDashboardCharts();

// Orçamentos recentes
const { data: quotes } = useRecentQuotes();
```

### Autenticação
```typescript
// Dados do usuário
const { data: user } = useMe();

// Atualizar perfil
const updateProfile = useUpdateProfile();

// Trocar senha
const changePassword = useChangePassword();
```

## 🔐 Autenticação

### Antes (JWT Manual)
```javascript
// Login
const token = await login(email, password);
localStorage.setItem('token', token);

// Requests autenticados
fetch('/api/protected', {
  headers: { Authorization: `Bearer ${token}` }
});
```

### Depois (NextAuth)
```typescript
// Login
import { signIn } from 'next-auth/react';
await signIn('credentials', { email, password });

// Requests autenticados (automático)
const { data } = trpc.auth.getMe.useQuery();
```

## 📊 Validação

### Antes (Joi)
```javascript
const schema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required()
});
```

### Depois (Zod)
```typescript
const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  price: z.number().min(0, "Preço deve ser maior que 0")
});
```

## 🚀 Próximos Routers a Implementar

### 1. Services Router
```typescript
// apps/server/src/server/api/routers/services.ts
export const servicesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(serviceFilterSchema)
    .query(async ({ ctx, input }) => {
      // Implementar listagem de serviços
    }),
  
  create: protectedProcedure
    .input(serviceSchema)
    .mutation(async ({ ctx, input }) => {
      // Implementar criação de serviço
    }),
  
  // ... outros procedures
});
```

### 2. Clients Router
```typescript
// apps/server/src/server/api/routers/clients.ts
export const clientsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(clientFilterSchema)
    .query(async ({ ctx, input }) => {
      // Implementar listagem de clientes
    }),
  
  // ... outros procedures
});
```

### 3. Quotes Router
```typescript
// apps/server/src/server/api/routers/quotes.ts
export const quotesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(quoteFilterSchema)
    .query(async ({ ctx, input }) => {
      // Implementar listagem de orçamentos
    }),
  
  // ... outros procedures
});
```

## 🏃‍♂️ Executando o Projeto

### Setup Inicial
```bash
# 1. Instalar dependências
node setup.js

# 2. Configurar database
# Editar apps/server/.env com sua URL do PostgreSQL

# 3. Rodar migrações
npm run db:migrate

# 4. Iniciar desenvolvimento
npm run dev
```

### URLs de Desenvolvimento
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- tRPC Panel: http://localhost:3001/api/trpc-playground

## 🔍 Debugging

### tRPC Devtools
```typescript
// Habilitar logs detalhados
const trpcConfig = {
  links: [
    loggerLink({
      enabled: () => process.env.NODE_ENV === 'development',
    }),
    // ...
  ],
};
```

### Prisma Studio
```bash
# Visualizar dados do banco
npm run db:studio
```

## 🎉 Resultado Final

A migração trouxe:
- **Type Safety**: 100% type-safe entre front e back
- **Developer Experience**: Auto-complete e detecção de erros
- **Performance**: Cache inteligente e batch requests
- **Maintainability**: Código compartilhado e organizado
- **Scalability**: Arquitetura monorepo moderna

O projeto agora está pronto para crescer com uma base sólida e moderna!