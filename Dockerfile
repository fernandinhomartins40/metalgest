# Usa código já compilado do GitHub Actions
FROM node:18-alpine

WORKDIR /app

# Copia package.json e arquivos compilados
COPY backend/package.json ./
COPY backend/dist ./dist

# Instala apenas dependências de produção
RUN npm install --only=production && npm cache clean --force

# Expõe a porta 3006
EXPOSE 3006

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
