# Multi-stage build para otimização
FROM node:18-alpine AS builder

WORKDIR /app

# Copia arquivos de dependências do backend
COPY backend/package*.json ./
RUN npm install

# Copia código do backend
COPY backend/ ./

# Compila o projeto
RUN npm run build

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Copia package.json e arquivos compilados do builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Instala apenas dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Expõe a porta 3006
EXPOSE 3006

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
