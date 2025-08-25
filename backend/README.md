# MetalGest Backend - Node.js + SQLite3

Backend Node.js independente para o sistema MetalGest, substituindo o Next.js + tRPC + PostgreSQL por uma solução mais simples e autônoma.

## 🚀 Características

- **Express.js** - Framework web minimalista
- **SQLite3** - Banco de dados local sem dependências externas  
- **JWT** - Autenticação stateless
- **Zod** - Validação de dados type-safe
- **Bcrypt** - Criptografia de senhas
- **Winston** - Sistema de logs
- **Helmet** - Segurança HTTP
- **CORS** - Controle de acesso cross-origin
- **Rate Limiting** - Proteção contra spam

## 📁 Estrutura

```
backend/
├── src/
│   ├── config/          # Configurações (database, app)
│   ├── controllers/     # Controllers REST
│   ├── middleware/      # Middlewares (auth, validation, cors)
│   ├── models/          # Modelos SQLite
│   ├── routes/          # Rotas REST API
│   ├── services/        # Lógica de negócio
│   ├── utils/           # Utilitários (validation schemas)
│   └── database/        # Schema SQL e migrações
├── uploads/             # Upload de arquivos
├── logs/                # Logs da aplicação
├── tests/               # Testes automatizados
└── server.js           # Entry point
```

## 🛠️ Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações.

### 3. Criar banco de dados

```bash
npm run migrate
```

### 4. Popular dados iniciais (opcional)

```bash
npm run seed
```

### 5. Iniciar servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🔌 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Perfil do usuário
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/change-password` - Alterar senha

### Clientes
- `GET /api/clients` - Listar clientes (com paginação)
- `GET /api/clients/search` - Buscar clientes
- `GET /api/clients/stats` - Estatísticas de clientes
- `GET /api/clients/:id` - Obter cliente por ID
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Remover cliente (soft delete)

### Sistema
- `GET /api/health` - Health check

## 🔒 Autenticação

O sistema utiliza JWT (JSON Web Tokens) para autenticação:

1. **Login** - Retorna `access_token` e `refresh_token`
2. **Access Token** - Válido por 24h, usado nas requisições
3. **Refresh Token** - Válido por 7 dias, usado para renovar tokens
4. **Header** - `Authorization: Bearer <access_token>`

## 📊 Banco de Dados

### Estrutura SQLite

- **users** - Usuários do sistema
- **refresh_tokens** - Tokens de renovação
- **clients** - Cadastro de clientes  
- **products** - Catálogo de produtos
- **services** - Catálogo de serviços
- **quotes** - Sistema de orçamentos
- **quote_items** - Itens de orçamento (produtos)
- **service_items** - Itens de orçamento (serviços)
- **service_orders** - Ordens de produção
- **transactions** - Controle financeiro
- **settings** - Configurações do usuário
- **audit_logs** - Logs de auditoria

### Migrações

```bash
# Executar migrações
npm run migrate

# Popular dados de exemplo
npm run seed
```

## 🧪 Testes

```bash
# Executar testes
npm test
```

## 📝 Logs

Os logs são salvos em:
- Console (desenvolvimento)
- Arquivo `logs/app.log` (produção)

Níveis de log: `error`, `warn`, `info`, `debug`

## 🔧 Scripts NPM

- `npm run dev` - Iniciar em modo desenvolvimento (nodemon)
- `npm start` - Iniciar em produção
- `npm run migrate` - Executar migrações do banco
- `npm run seed` - Popular dados iniciais
- `npm test` - Executar testes

## 🌍 Variáveis de Ambiente

```env
# Server
PORT=3000
NODE_ENV=development

# Database  
DATABASE_PATH=./src/database/sqlite.db

# JWT
JWT_SECRET=seu-jwt-secret-aqui
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=seu-refresh-secret-aqui
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3001

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5000000

# Logs
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

## 🚀 Deploy

### Docker (Recomendado)

```bash
# Build da imagem
docker build -t metalgest-backend .

# Executar container
docker run -p 3000:3000 -v $(pwd)/data:/app/src/database metalgest-backend
```

### PM2 (Produção)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start server.js --name metalgest-backend

# Configurar auto-restart
pm2 startup
pm2 save
```

## ⚡ Performance

- **Rate Limiting** - 100 req/15min geral, 20 req/15min para auth
- **Compression** - Gzip habilitado
- **Caching** - Headers de cache configurados
- **Database** - Índices otimizados no SQLite
- **Security** - Helmet.js para headers de segurança

## 🔄 Compatibilidade

Esta implementação mantém **100% de compatibilidade** com o frontend React existente:

- Mesma estrutura de resposta das APIs
- Mesmos códigos de status HTTP
- Mesmos formatos de erro
- Mesma autenticação JWT
- Mesmas validações de dados

## 📋 TODO - Próximas Fases

- [ ] **Fase 2** - Controllers restantes (Products, Services, Quotes, Dashboard)
- [ ] **Fase 3** - Integração completa, testes e deploy
- [ ] WebSockets para notificações real-time
- [ ] Upload de arquivos e imagens
- [ ] Relatórios em PDF
- [ ] Cache Redis (opcional)
- [ ] Monitoramento e métricas

---

**Status**: ✅ Fase 1 Completa - Core funcional implementado