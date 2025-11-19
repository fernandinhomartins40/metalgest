# Arquitetura MetalGest - Monorepo

## Visão Geral

MetalGest é um Sistema de Gestão Empresarial moderno construído como um **monorepo**, permitindo escalabilidade, reutilização de código e manutenibilidade aprimorada.

## Estrutura do Projeto

```
metalgest/
├── apps/                       # Aplicações
│   ├── web/                    # Frontend React + Vite
│   └── api/                    # Backend Node.js + Prisma (futuro)
├── packages/                   # Pacotes compartilhados
│   ├── ui/                     # Componentes UI
│   ├── types/                  # Tipos TypeScript
│   ├── utils/                  # Utilitários
│   └── config/                 # Configurações
├── docker/                     # Configurações Docker
│   ├── frontend/
│   ├── backend/
│   └── nginx/
├── scripts/                    # Scripts de automação
├── docs/                       # Documentação
└── .github/                    # CI/CD
```

## Aplicações

### 1. Frontend (`apps/web`)

**Stack Tecnológica:**
- React 18.2
- Vite 4.4.5
- TypeScript
- Tailwind CSS
- Radix UI
- React Router
- Zod (validação)
- React Hook Form

**Estrutura:**
```
apps/web/src/
├── components/         # Componentes específicos da aplicação
│   ├── auth/
│   ├── layout/
│   ├── dre/
│   └── ...
├── pages/              # Páginas/Rotas
├── hooks/              # Custom hooks
├── contexts/           # Context API
├── providers/          # Providers
├── services/           # Serviços de API (mock)
├── lib/                # Bibliotecas de terceiros
└── constants/          # Constantes
```

**Funcionalidades:**
- Dashboard
- Gestão de Clientes
- Gestão de Produtos e Serviços
- Orçamentos
- Ordens de Serviço (Produção)
- Módulo Financeiro
- DRE (Demonstração de Resultado)
- Gestão de Usuários
- Configurações

**Estado Atual:**
- ✅ Totalmente funcional em modo MOCK
- ✅ Sem integração com backend real
- ✅ Autenticação simulada (local storage)
- ✅ Dados persistidos apenas no navegador

### 2. Backend (`apps/api`)

**Status:** 🚧 **EM PLANEJAMENTO** 🚧

**Stack Planejada:**
- Node.js 20+
- TypeScript
- Express.js ou Fastify
- Prisma ORM
- PostgreSQL
- JWT (autenticação)
- Zod (validação)
- Jest (testes)
- Docker

**Arquitetura Planejada:**
```
apps/api/src/
├── config/             # Configurações
├── controllers/        # Camada de apresentação
├── services/           # Lógica de negócio
├── repositories/       # Acesso a dados
├── middlewares/        # Middlewares
├── routes/             # Rotas
├── types/              # Tipos TypeScript
├── utils/              # Utilitários
└── server.ts           # Entry point
```

**Implementação:** Será realizada na **Fase 6**

## Pacotes Compartilhados

### 1. `@metalgest/ui`

Componentes UI primitivos baseados em Radix UI.

**Exports:**
- Button, Card, Toast, Tabs
- DropdownMenu, Breadcrumb
- Loading, ConfirmDialog

**Uso:**
```typescript
import { Button, Card } from '@metalgest/ui';
```

### 2. `@metalgest/types`

Tipos TypeScript compartilhados entre frontend e backend.

**Exports:**
- User, Product, Service, Client
- Quote, Transaction, Settings
- API response types

**Uso:**
```typescript
import type { User, Product } from '@metalgest/types';
```

### 3. `@metalgest/utils`

Utilitários compartilhados.

**Exports:**
- Máscaras (CPF, CNPJ, CEP, telefone)
- Validadores
- Storage helpers
- Formatadores

**Uso:**
```typescript
import { masks, validators } from '@metalgest/utils';
```

### 4. `@metalgest/config`

Configurações compartilhadas (ESLint, TypeScript, Tailwind).

## Infraestrutura

### Docker

**Serviços:**
1. **Frontend** (apps/web)
   - Build: Vite
   - Runtime: Nginx Alpine
   - Porta exposta: 3000 (interna)

2. **Backend** (apps/api - futuro)
   - Build: TypeScript
   - Runtime: Node.js 20
   - Porta exposta: 3010 (interna)

3. **Nginx** (Reverse Proxy)
   - Roteamento frontend
   - Roteamento API (futuro)
   - Porta pública: 3010

4. **PostgreSQL** (futuro)
   - Banco de dados principal
   - Persistência em volume Docker

### CI/CD

**GitHub Actions** (`.github/workflows/deploy.yml`)
- Trigger: Push para `main`
- Steps:
  1. Checkout código
  2. Setup Node.js 20
  3. Install dependencies
  4. Type check
  5. Build
  6. Deploy para VPS

## Fluxo de Desenvolvimento

### 1. Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Modo desenvolvimento (todas as apps)
npm run dev

# Apenas frontend
cd apps/web && npm run dev

# Apenas backend (futuro)
cd apps/api && npm run dev

# Type check em todos os pacotes
npm run type-check

# Lint em todos os pacotes
npm run lint
```

### 2. Build de Produção

```bash
# Build completo (Turborepo)
npm run build

# Build apenas frontend
cd apps/web && npm run build

# Build com Docker
npm run docker:build
npm run docker:up
```

### 3. Deploy

**Automático:**
- Push para `main` → GitHub Actions → Deploy VPS

**Manual:**
```bash
./scripts/deploy.sh
```

## Segurança

### Frontend
- HTTPS (Nginx)
- Headers de segurança (CSP, X-Frame-Options)
- Sanitização de inputs
- Validação com Zod

### Backend (Futuro)
- JWT com refresh tokens
- RBAC (Role-Based Access Control)
- Rate limiting
- Validação Zod
- Helmet.js
- CORS configurado
- SQL Injection protection (Prisma)

## Performance

### Otimizações Implementadas
- Lazy loading de rotas
- Code splitting (Vite)
- Tree shaking
- Compressão (gzip/brotli)
- Cache de assets (1 ano)
- Turborepo build cache

### Monitoramento (Futuro)
- Logs estruturados (Winston)
- APM (Application Performance Monitoring)
- Error tracking (Sentry)

## Escalabilidade

### Horizontal
- Frontend: Multiple containers via Docker Swarm/Kubernetes
- Backend: Multiple instances com load balancer
- Database: Read replicas PostgreSQL

### Vertical
- Otimização de queries (Prisma)
- Cache (Redis) - futuro
- CDN para assets estáticos

## Versionamento

**Semantic Versioning** (semver):
- **Major**: Mudanças breaking
- **Minor**: Novas features (backward compatible)
- **Patch**: Bug fixes

**Versão Atual:** `2.0.0`

## Roadmap

### ✅ Fase 1 - Remoção Backend Antigo
- Remover backend SQLite
- Criar serviços mock
- Limpar configurações

### ✅ Fase 2 - Monorepo
- Estrutura de diretórios
- Pacotes compartilhados
- Turborepo configurado

### 🚧 Fase 3 - Correção de Imports
- Atualizar imports para usar pacotes
- Corrigir referências
- Testar builds

### ⏳ Fase 4 - TypeScript
- Análise de erros
- Correção de tipos
- Eliminar `any`

### ⏳ Fase 5 - Plano Backend
- Design arquitetural
- Schemas Prisma
- Documentação completa

### ⏳ Fase 6 - Implementação Backend
- Node.js + TypeScript
- Prisma + PostgreSQL
- JWT Auth
- Endpoints completos

## Contribuição

1. Fork o repositório
2. Criar branch (`git checkout -b feature/nova-feature`)
3. Commit changes (`git commit -m 'feat: adicionar nova feature'`)
4. Push branch (`git push origin feature/nova-feature`)
5. Abrir Pull Request

## Licença

Proprietário - MetalGest © 2025
