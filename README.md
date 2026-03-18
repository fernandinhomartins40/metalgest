# MetalGest

MetalGest e um monorepo com Turborepo, frontend React/Vite, backend Node/Express, Prisma e PostgreSQL.

## Arquitetura

```text
apps/web               -> frontend React/Vite
apps/api               -> backend Express
packages/database      -> Prisma schema, migrations, seed e client
packages/types         -> tipos compartilhados
packages/ui            -> componentes compartilhados
packages/utils         -> utilitarios compartilhados
docker/nginx           -> proxy reverso na unica porta externa
docker/frontend        -> runtime do frontend na porta interna 3000
docker/backend         -> runtime do backend na porta interna 3001
```

## Topologia de rede

- Frontend: porta interna `3000`
- Backend: porta interna `3001`
- PostgreSQL: porta interna `5432`
- Nginx: unica porta externa, configurada por `APP_PORT` e roteando:
  - `/` -> frontend
  - `/api` -> backend

## Requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose

## Desenvolvimento local

```bash
npm install
npx prisma generate --schema packages/database/prisma/schema.prisma
npm run type-check
npm run build
```

Para rodar os apps separadamente:

```bash
cd apps/api && npm run dev
cd apps/web && npm run dev
```

## Banco de dados

O Prisma foi centralizado em `packages/database`.

Comandos principais:

```bash
npm run prisma:generate --workspace @metalgest/api
npm run prisma:migrate --workspace @metalgest/api
npm run prisma:migrate:deploy --workspace @metalgest/api
npm run prisma:seed --workspace @metalgest/api
```

## Docker

```bash
docker compose up -d --build
npm run smoke:docker
docker compose down -v
```

## Validacao

```bash
npm run type-check
npm run build
npm run test:api
npm run smoke:docker
```

## Credenciais do seed

- `admin@metalgest.com / admin123`
- `user@metalgest.com / user123`

## Produção

- O backend usa `refresh token` em cookie `HttpOnly`.
- O frontend consome a API pelo mesmo host via Nginx.
- O PostgreSQL nao e exposto externamente no `docker-compose.yml`.
- O upload de arquivos passa pelo backend proprio.
- As alteracoes mutantes da API geram logs em `audit_logs`.

Documentacao complementar:

- [Arquitetura](./docs/ARCHITECTURE.md)
- [API](./docs/API_SPECIFICATION.md)
