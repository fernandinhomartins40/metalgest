# Deployment Guide - MetalGest T3 Stack

## Estrutura da Aplicação

A aplicação utiliza uma arquitetura T3 Stack com monorepo:

```
metalgest/
├── apps/
│   ├── server/        # Backend Next.js (tRPC + NextAuth + Prisma)
│   └── web/           # Frontend React (Vite)
├── packages/
│   ├── database/      # Prisma schema e cliente
│   ├── shared/        # Tipos e utilitários compartilhados
│   └── ui/            # Componentes UI compartilhados
└── docker-compose.yml # Configuração de produção
```

## Deployment Automático

### GitHub Actions

O workflow de deploy é acionado automaticamente quando há push para a branch `main`:

1. **Build**: Compila frontend e backend
2. **Transfer**: Envia arquivos para VPS
3. **Deploy**: Executa containers Docker

### Configuração de Secrets

Configure os seguintes secrets no GitHub:

```
VPS_PASSWORD=<senha-do-vps>
DB_NAME=metalgest
DB_USER=postgres
DB_PASSWORD=<senha-do-banco>
NEXTAUTH_SECRET=<chave-secreta-nextauth>
JWT_SECRET=<chave-secreta-jwt>
```

## Estrutura Docker

### Serviços

1. **db** - PostgreSQL 15
2. **backend** - Next.js server (porta 3000)
3. **frontend** - React app servido pelo nginx (porta 3001)
4. **nginx** - Proxy reverso (porta 80)

### Arquivos Docker

- `Dockerfile.backend` - Build do servidor Next.js
- `Dockerfile.frontend` - Build do frontend React
- `docker-compose.yml` - Orquestração dos serviços
- `nginx/` - Configurações do proxy reverso

## Comandos Úteis

### Desenvolvimento
```bash
npm run dev              # Inicia todos os serviços
npm run build           # Build completo
npm run build:web       # Build apenas frontend
npm run build:server    # Build apenas backend
```

### Produção (VPS)
```bash
docker-compose up -d             # Inicia todos os serviços
docker-compose logs backend     # Logs do backend
docker-compose logs frontend    # Logs do frontend
docker-compose ps               # Status dos containers
```

### Banco de Dados
```bash
npm run db:generate     # Gera cliente Prisma
npm run db:push         # Sincroniza schema
npm run db:studio       # Interface web do banco
```

## Monitoramento

### Health Checks

- **Backend**: `http://servidor/api/health`
- **Frontend**: `http://servidor/`
- **Nginx**: Status dos proxies

### Logs

```bash
# Logs em tempo real
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx

# Logs específicos
docker-compose logs --tail=100 backend
```

## Rollback

Em caso de problemas no deploy:

```bash
# Executar rollback automático
bash /var/www/metalgest/rollback.sh
```

O script:
1. Para containers atuais
2. Restaura backup mais recente
3. Reinicia serviços

## Troubleshooting

### Problemas Comuns

1. **Build falha**: Verificar dependências e tipos TypeScript
2. **Banco não conecta**: Verificar credenciais e health checks
3. **Frontend 404**: Verificar configuração nginx
4. **API não responde**: Verificar logs do backend

### Verificação de Saúde

```bash
# Testar conectividade
curl http://localhost/api/health

# Verificar containers
docker-compose ps

# Verificar logs
docker-compose logs --tail=50
```

## Variáveis de Ambiente

### Produção (.env)
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@db:5432/metalgest
NEXTAUTH_URL=https://metalgest.com.br
NEXTAUTH_SECRET=chave-secreta-nextauth
JWT_SECRET=chave-secreta-jwt
NEXT_PUBLIC_API_URL=https://metalgest.com.br
```

### Desenvolvimento (.env.development)
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/metalgest
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret
JWT_SECRET=dev-jwt-secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```