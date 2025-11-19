# MetalGest API (Backend)

> 🚧 **EM DESENVOLVIMENTO** 🚧

Este diretório conterá o backend da aplicação MetalGest.

## Stack Tecnológica Planejada

- **Runtime**: Node.js 20+
- **Linguagem**: TypeScript
- **Framework**: Express.js ou Fastify
- **ORM**: Prisma
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **Validação**: Zod
- **Documentação**: Swagger/OpenAPI
- **Testes**: Jest + Supertest
- **Container**: Docker

## Arquitetura

O backend seguirá os princípios de Clean Architecture:

```
apps/api/
├── src/
│   ├── config/           # Configurações
│   ├── controllers/      # Controllers (camada de apresentação)
│   ├── services/         # Lógica de negócio
│   ├── repositories/     # Acesso a dados
│   ├── middlewares/      # Middlewares Express
│   ├── routes/           # Definição de rotas
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Utilitários
│   └── server.ts         # Ponto de entrada
├── prisma/
│   ├── schema.prisma     # Schema do Prisma
│   ├── migrations/       # Migrações
│   └── seed.ts           # Seed de dados
├── tests/                # Testes
├── Dockerfile            # Docker config
├── package.json
└── tsconfig.json
```

## Módulos Planejados

### Core
- Autenticação e Autorização (JWT + RBAC)
- Gestão de Usuários
- Configurações do Sistema

### Negócio
- Gestão de Clientes
- Gestão de Produtos
- Gestão de Serviços
- Gestão de Orçamentos
- Ordens de Serviço (Produção)
- Transações Financeiras
- DRE (Demonstração de Resultado)
- Relatórios e Exportações

### Integrações
- Upload de Arquivos (S3 ou local)
- Envio de Emails (Nodemailer)
- Geração de PDFs
- Exportação Excel

## Implementação

A implementação completa será realizada na **Fase 6** do projeto, seguindo o plano detalhado que será criado na **Fase 5**.

## Documentação

Documentação completa será criada em `/docs/BACKEND.md` após a implementação.
