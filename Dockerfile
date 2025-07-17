# Estágio 1: Builder - Compila o TypeScript para JavaScript
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências e instala
COPY backend/package*.json ./
RUN npm install

# Copia o resto do código do backend
COPY backend/ ./

# Compila o projeto
RUN npm run build # Garanta que você tem um script "build" em backend/package.json que compila TS para JS (ex: tsc)

# ---

# Estágio 2: Production - Cria a imagem final e otimizada
FROM node:18-alpine

WORKDIR /app

# Copia as dependências de produção do estágio de build
COPY --from=builder /app/node_modules ./node_modules
# Copia o código compilado do estágio de build
COPY --from=builder /app/dist ./dist
# Copia o package.json para que o entrypoint funcione
COPY backend/package.json ./

# Expõe a porta que a aplicação vai usar (será definida no docker-compose)
# EXPOSE 3001 (Opcional, a porta real será mapeada no docker-compose)

# Comando para iniciar a aplicação
CMD [ "node", "dist/index.js" ]
