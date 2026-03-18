# MetalGest API

Backend Express da aplicacao MetalGest.

## Responsabilidades

- autenticacao e autorizacao
- CRUD de usuarios, clientes, produtos e servicos
- orcamentos e ordens de servico
- transacoes, dashboard e configuracoes
- upload local de arquivos
- auditoria em banco

## Banco

O Prisma nao fica mais neste app. Toda a camada de banco esta em:

```text
packages/database
```

Comandos uteis:

```bash
npm run prisma:generate --workspace @metalgest/api
npm run prisma:migrate --workspace @metalgest/api
npm run prisma:migrate:deploy --workspace @metalgest/api
npm run prisma:seed --workspace @metalgest/api
```

## Porta

Em runtime padrao:

```text
3001
```

## Testes

```bash
npm run test --workspace @metalgest/api
```
