# MetalGest - Monorepo T3 Stack

Sistema de gestão empresarial moderno construído com T3 Stack em arquitetura monorepo.

## 🏗️ Arquitetura

```
metalgest/
├── apps/
│   ├── web/          # Frontend React + Vite + tRPC
│   └── server/       # Backend Next.js + tRPC + NextAuth
├── packages/
│   ├── database/     # Prisma schema e cliente
│   └── shared/       # Tipos e utilitários compartilhados
└── [arquivos de configuração do monorepo]
```

## 🚀 Tecnologias

### Frontend (apps/web)
- **React 18** + **Vite** - Framework e bundler
- **TypeScript** - Tipagem estática
- **tRPC** - Type-safe API calls
- **TanStack Query** - Cache e sincronização
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **React Hook Form** - Formulários
- **Zod** - Validação

### Backend (apps/server)
- **Next.js 14** - Framework fullstack
- **tRPC** - Type-safe API
- **NextAuth.js** - Autenticação
- **Prisma** - ORM
- **PostgreSQL** - Database
- **bcrypt** - Hash de senhas
- **JWT** - Tokens de autenticação

### Packages
- **@metalgest/database** - Prisma client e schemas
- **@metalgest/shared** - Tipos, schemas e utilitários compartilhados

## 📦 Instalação

1. **Setup inicial:**
   ```bash
   node setup.js
   ```

2. **Configurar database:**
   ```bash
   # Editar apps/server/.env com sua URL do PostgreSQL
   DATABASE_URL="postgresql://username:password@localhost:5432/metalgest"
   
   # Rodar migrações
   npm run db:migrate
   ```

3. **Iniciar desenvolvimento:**
   ```bash
   npm run dev
