# MetalGest - Sistema de Gestão Empresarial

> Sistema de gestão empresarial moderno construído em arquitetura **monorepo** com React, TypeScript e Turborepo.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/seu-usuario/metalgest)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.2.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)]()

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Instalação](#-instalação)
- [Desenvolvimento](#-desenvolvimento)
- [Deploy](#-deploy)
- [Documentação](#-documentação)
- [Roadmap](#-roadmap)

## 🎯 Visão Geral

MetalGest é um ERP completo para gestão empresarial, oferecendo módulos integrados para:

- **Dashboard** - Visão geral de métricas e performance
- **Clientes** - Cadastro e gestão de clientes (PF/PJ)
- **Produtos & Serviços** - Catálogo com controle de estoque
- **Orçamentos** - Criação, aprovação e compartilhamento
- **Produção** - Ordens de serviço e acompanhamento
- **Financeiro** - Transações, contas a pagar/receber
- **DRE** - Demonstração de Resultado do Exercício
- **Usuários** - Gestão com controle de permissões (RBAC)
- **Configurações** - Personalização do sistema

## 🏗️ Arquitetura

### Monorepo Turborepo

```
metalgest/
├── apps/
│   ├── web/              # 🌐 Frontend React + Vite + TypeScript
│   └── api/              # 🚧 Backend Node.js + Prisma + PostgreSQL (em desenvolvimento)
│
├── packages/
│   ├── @metalgest/ui/    # 🎨 Componentes UI (Radix UI)
│   ├── @metalgest/types/ # 📘 Tipos TypeScript compartilhados
│   ├── @metalgest/utils/ # 🛠️ Utilitários (máscaras, validadores)
│   └── @metalgest/config/# ⚙️ Configurações compartilhadas
│
├── docker/               # 🐳 Configurações Docker
│   ├── frontend/
│   ├── backend/
│   └── nginx/
│
├── scripts/              # 📜 Scripts de automação
├── docs/                 # 📚 Documentação
└── .github/              # 🔄 CI/CD (GitHub Actions)
```

**Benefícios:**
- ✅ **Escalabilidade** - Fácil adicionar novos apps (mobile, admin, etc.)
- ✅ **Reutilização** - Pacotes compartilhados entre aplicações
- ✅ **Performance** - Build cache do Turborepo
- ✅ **Manutenibilidade** - Código organizado e separação clara
- ✅ **Tipagem** - TypeScript em 100% do código

## 🚀 Tecnologias

### Frontend (`apps/web`)

| Tecnologia | Versão | Propósito |
|-----------|---------|-----------|
| **React** | 18.2 | Framework UI |
| **Vite** | 4.4.5 | Build tool ultra-rápido |
| **TypeScript** | 5.2.2 | Tipagem estática |
| **Tailwind CSS** | 3.3.3 | Utility-first CSS |
| **Radix UI** | Latest | Componentes acessíveis |
| **React Router** | 6.16.0 | Roteamento SPA |
| **React Hook Form** | 7.46.1 | Gerenciamento de formulários |
| **Zod** | 3.22.2 | Validação de schemas |
| **Recharts** | 2.8.0 | Gráficos e visualizações |
| **jsPDF** | 2.5.1 | Geração de PDF |
| **XLSX** | 0.18.5 | Exportação Excel |

### Backend (`apps/api`) - 🚧 Em Desenvolvimento

| Tecnologia | Versão | Propósito |
|-----------|---------|-----------|
| **Node.js** | 20+ | Runtime JavaScript |
| **TypeScript** | 5.2.2 | Tipagem estática |
| **Prisma** | Latest | ORM type-safe |
| **PostgreSQL** | 15+ | Banco de dados relacional |
| **Express/Fastify** | Latest | Framework web |
| **JWT** | Latest | Autenticação |
| **Zod** | Latest | Validação |
| **Jest** | Latest | Framework de testes |

### DevOps

| Tecnologia | Propósito |
|-----------|-----------|
| **Turborepo** | Build system monorepo |
| **Docker** | Containerização |
| **Docker Compose** | Orquestração local |
| **Nginx** | Reverse proxy |
| **GitHub Actions** | CI/CD |

## 📦 Instalação

### Pré-requisitos

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** (opcional, para deploy)
- **Git**

### 1. Clonar Repositório

```bash
git clone https://github.com/seu-usuario/metalgest.git
cd metalgest
```

### 2. Instalar Dependências

```bash
# Instala todas as dependências do monorepo
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env.local

# Editar conforme necessário
nano .env.local
```

## 💻 Desenvolvimento

### Comandos Principais

```bash
# Iniciar modo desenvolvimento (todas as apps)
npm run dev

# Build de produção
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Limpeza de builds
npm run clean
```

### Comandos por App

```bash
# Apenas frontend
cd apps/web && npm run dev

# Apenas backend (quando implementado)
cd apps/api && npm run dev
```

### Docker (Desenvolvimento)

```bash
# Build containers
npm run docker:build

# Iniciar containers
npm run docker:up

# Ver logs
npm run docker:logs

# Parar containers
npm run docker:down

# Restart containers
npm run docker:restart
```

## 🚢 Deploy

### Produção (Docker)

```bash
# 1. Build imagens
docker-compose build

# 2. Iniciar serviços
docker-compose up -d

# 3. Verificar status
docker-compose ps
```

### CI/CD (GitHub Actions)

O deploy automático é executado ao fazer push para `main`:

1. Type check
2. Build
3. Deploy para VPS
4. Health check

**URL Produção:** `http://72.60.10.112:3010`

## 📚 Documentação

Documentação completa disponível em `/docs`:

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitetura detalhada
- [DEVELOPMENT.md](./docs/DEVELOPMENT.md) - Guia de desenvolvimento (em breve)
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Guia de deploy (em breve)
- [API.md](./docs/API.md) - Documentação da API (em breve)

## 🗺️ Roadmap

### ✅ Fase 1 - Remoção Backend Antigo *(Concluída)*
- [x] Remover backend SQLite
- [x] Criar serviços mock
- [x] Limpar configurações antigas

### ✅ Fase 2 - Arquitetura Monorepo *(Concluída)*
- [x] Estrutura de diretórios profissional
- [x] Pacotes compartilhados (`@metalgest/*`)
- [x] Turborepo configurado
- [x] Docker reorganizado
- [x] Documentação atualizada

### 🚧 Fase 3 - Correção de Imports *(Em Andamento)*
- [ ] Atualizar imports para usar pacotes monorepo
- [ ] Corrigir referências quebradas
- [ ] Testar builds

### ⏳ Fase 4 - TypeScript Strict
- [ ] Análise completa de tipos
- [ ] Eliminar uso de `any`
- [ ] Strict mode habilitado

### ⏳ Fase 5 - Plano Backend Detalhado
- [ ] Design arquitetural completo
- [ ] Schemas Prisma
- [ ] Endpoints documentados
- [ ] Estratégia de migração

### ⏳ Fase 6 - Implementação Backend
- [ ] Node.js + TypeScript + Prisma
- [ ] PostgreSQL configurado
- [ ] JWT Auth + RBAC
- [ ] Endpoints REST
- [ ] Testes unitários e integração
- [ ] Deploy Docker

## 📄 Licença

**Proprietário** - MetalGest © 2025

---

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adicionar nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📧 Contato

Para dúvidas ou suporte, entre em contato:

- **Email:** suporte@metalgest.com.br
- **Website:** https://metalgest.com.br

---

<p align="center">Feito com ❤️ pela equipe MetalGest</p>
