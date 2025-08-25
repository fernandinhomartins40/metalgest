# MetalGest - Sistema de Gestão Empresarial

Sistema de gestão empresarial moderno construído com Node.js + React em arquitetura separada.

## 🏗️ Arquitetura

```
metalgest/
├── apps/
│   └── web/          # Frontend React + Vite
├── backend/          # Backend Node.js + Express + SQLite  
└── [arquivos de configuração]
```

## 🚀 Tecnologias

### Frontend (apps/web)
- **React 18** + **Vite** - Framework e bundler
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **React Hook Form** - Formulários
- **Zod** - Validação
- **React Router** - Roteamento

### Backend (backend/)
- **Node.js** + **Express** - Runtime e framework
- **SQLite3** - Database embarcado
- **JWT** - Autenticação segura
- **bcryptjs** - Hash de senhas
- **Zod** - Validação de dados
- **Winston** - Logging estruturado
- **Helmet** - Segurança HTTP

## 📦 Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar backend:**
   ```bash
   cd backend
   cp .env.example .env
   npm run migrate  # Criar tabelas SQLite
   npm run seed     # Popular com dados demo
   ```

3. **Iniciar desenvolvimento:**
   ```bash
   npm run dev      # Frontend + Backend
   ```

## 🔐 Usuários Demo

Após executar `npm run seed`, você terá:
- **Admin**: admin@metalgest.com / admin123
- **Demo**: demo@metalgest.com / demo123
