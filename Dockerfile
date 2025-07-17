# Build usando arquivos transferidos pelo GitHub Actions
FROM node:18-alpine

# Instala curl para health checks
RUN apk add --no-cache curl

WORKDIR /app

# Copia arquivos do backend transferidos pelo Actions
# Os artifacts são baixados para backend/dist pelo GitHub Actions
COPY backend/package.json ./package.json
COPY backend/dist ./dist
COPY backend/prisma ./prisma

# Debug: Verificar estrutura de arquivos
RUN echo "=== Estrutura de arquivos no container ===" && \
    ls -la . && \
    echo "=== Conteúdo do dist ===" && \
    ls -la dist/ 2>/dev/null || echo "ERRO: dist não encontrado"

# Instala apenas dependências de produção
RUN npm install --only=production && npm cache clean --force

# Gera o Prisma client
RUN npx prisma generate

# Cria usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Muda ownership dos arquivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expõe a porta 3006
EXPOSE 3006

# Health check interno
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3006/api/v1/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
