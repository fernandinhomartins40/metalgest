# Usa código já compilado do GitHub Actions
FROM node:18-alpine

WORKDIR /app

# Copia package.json, arquivos compilados e schema do Prisma
COPY backend/package.json ./
COPY backend/dist ./dist
COPY backend/prisma ./prisma

# Instala apenas dependências de produção
RUN npm install --only=production && npm cache clean --force

# Gera o Prisma client
RUN npx prisma generate

# Expõe a porta 3006
EXPOSE 3006

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
