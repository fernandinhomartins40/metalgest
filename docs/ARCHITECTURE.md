# MetalGest Architecture

## Resumo

O projeto foi estruturado como monorepo com Turborepo e quatro camadas principais:

1. `apps/web`: interface React/Vite.
2. `apps/api`: API Express com autenticacao JWT, upload proprio e auditoria.
3. `packages/database`: Prisma client, schema, migracoes e seed.
4. `docker/*`: empacotamento de frontend, backend e Nginx.

## Fluxo de requisicoes

```text
Internet
  -> nginx :80
     -> /           -> frontend:3000
     -> /api/*      -> backend:3001
                     -> postgres:5432
```

## Backend

Modulos ativos:

- `auth`
- `users`
- `clients`
- `products`
- `services`
- `quotes`
- `service-orders`
- `transactions`
- `dashboard`
- `settings`
- `audit-logs`
- `upload`

Pontos operacionais:

- `refresh token` em cookie `HttpOnly`
- rate limit na API
- logs estruturados
- auditoria para operacoes mutantes
- upload local servido em `/api/uploads`

## Banco

O schema Prisma mora em `packages/database/prisma/schema.prisma`.

Arquivos relevantes:

- `packages/database/prisma/schema.prisma`
- `packages/database/prisma/migrations/*`
- `packages/database/prisma/seed.ts`
- `packages/database/src/index.ts`

## Containers

- `frontend`: Nginx servindo build estatico na porta interna `3000`
- `backend`: Node.js na porta interna `3001`
- `postgres`: somente rede interna Docker
- `nginx`: unica porta exposta externamente

## Pipeline

O workflow em `.github/workflows/deploy.yml` executa:

1. `npm ci`
2. `prisma generate`
3. `npm run type-check`
4. `npm run build`
5. `npm run test:api`
6. `docker compose up -d --build`
7. `npm run smoke:docker`

O deploy remoto e condicionado a secrets de SSH.
