# Migração do Backend - Next.js → Node.js + SQLite3

## ✅ Mudanças Realizadas

### 1. **Arquivos Movidos/Renomeados**
- ✅ `apps/server/` → `apps/server_old/` (backend antigo preservado)
- ✅ Criado novo `backend/` com estrutura independente

### 2. **Docker Compose Atualizado**
- ❌ **REMOVIDO**: Serviço PostgreSQL (`db`)
- ❌ **REMOVIDO**: Dependência do banco externo
- ❌ **REMOVIDO**: Variáveis `DATABASE_URL`, `NEXTAUTH_*`
- ✅ **ATUALIZADO**: Backend agora aponta para `./backend/`
- ✅ **ATUALIZADO**: Volumes para SQLite, uploads e logs
- ✅ **ATUALIZADO**: Environment variables para novo backend

### 3. **Package.json Raiz Atualizado**
- ❌ **REMOVIDO**: Scripts do Turborepo (`turbo run...`)
- ❌ **REMOVIDO**: Scripts de banco Prisma (`db:generate`, `db:push`, etc.)
- ✅ **ATUALIZADO**: Scripts para frontend + novo backend
- ✅ **ADICIONADO**: Scripts Docker simplificados
- ✅ **ADICIONADO**: `concurrently` para rodar frontend e backend juntos

### 4. **Novos Scripts Disponíveis**
```bash
# Desenvolvimento
npm run dev                    # Frontend + Backend juntos
npm run dev:frontend          # Apenas frontend
npm run dev:backend           # Apenas backend

# Build
npm run build                 # Build completo
npm run build:frontend        # Build do frontend
npm run build:backend         # Migração do banco

# Produção
npm start                     # Frontend + Backend em produção
npm run start:frontend        # Frontend em produção
npm run start:backend         # Backend em produção

# Backend específico
npm run backend:migrate       # Migrar banco SQLite
npm run backend:seed          # Popular dados iniciais
npm run backend:test          # Rodar testes

# Docker
npm run docker:build          # Build dos containers
npm run docker:up             # Subir aplicação
npm run docker:down           # Parar aplicação
npm run docker:logs           # Ver logs
```

## 🗑️ Arquivos/Diretórios Obsoletos

### **Podem ser removidos após confirmação:**
1. `apps/server_old/` - Backend Next.js antigo
2. `packages/` - Packages do monorepo Turborepo
3. `turbo.json` - Configuração do Turborepo
4. `Dockerfile.backend` - Dockerfile do Next.js antigo

### **Arquivos que referenciam backend antigo:**
1. `nginx/default.conf` - Precisa ser atualizado para novo backend
2. `Dockerfile.frontend` - Pode precisar de ajustes

## ⚠️ Verificações Necessárias

### 1. **Frontend precisa ser atualizado:**
- `apps/web/src/lib/trpc.ts` - Remover configuração tRPC
- `apps/web/src/providers/TRPCProvider.tsx` - Remover provider
- `apps/web/src/services/httpClient.js` - Atualizar URL da API
- `apps/web/src/hooks/api/` - Atualizar hooks para REST API

### 2. **Nginx precisa ser reconfigurado:**
- Proxy para novo backend Node.js
- Remoção de configurações Next.js específicas

## 🚀 Como Testar a Migração

### **1. Desenvolvimento:**
```bash
# Instalar dependências
npm install
cd backend && npm install
cd ../apps/web && npm install

# Preparar banco
npm run backend:migrate
npm run backend:seed

# Rodar aplicação
npm run dev
```

### **2. Docker:**
```bash
npm run docker:build
npm run docker:up
```

### **3. URLs de teste:**
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Health Check: http://localhost:3000/api/health
- Nginx Proxy: http://localhost:3002

## 📊 Comparação das Arquiteturas

| Aspecto | Backend Antigo | Novo Backend |
|---------|----------------|--------------|
| Framework | Next.js 14 | Express.js |
| API | tRPC | REST |
| Banco | PostgreSQL | SQLite3 |
| ORM | Prisma | SQL nativo |
| Auth | NextAuth | JWT manual |
| Deploy | Multi-container | Single container |
| Dependências | PostgreSQL externa | Autocontido |
| Complexidade | Alta | Baixa |

## ✅ Próximos Passos

1. **Atualizar configurações do frontend** (remover tRPC, usar REST)
2. **Reconfigurar Nginx** para novo backend
3. **Testar integração completa**
4. **Remover arquivos obsoletos** após confirmação
5. **Implementar Fase 2** (Products, Services, Quotes, Dashboard)

---

**Status**: 🟡 Migração estrutural completa, pendente integração frontend