#!/bin/sh

echo "=== MetalGest Backend Startup ==="

# Aguardar que o banco esteja disponível
echo "Aguardando conexão com o banco de dados..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if nc -z db 5432; then
        echo "✅ Banco de dados conectado na tentativa $attempt"
        break
    else
        echo "⏳ Tentativa $attempt/$max_attempts - Banco ainda não disponível..."
        sleep 2
        attempt=$((attempt + 1))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    echo "❌ ERRO: Não foi possível conectar ao banco após $max_attempts tentativas"
    exit 1
fi

# Verificar variáveis de ambiente essenciais
echo "=== Verificando configurações ==="
echo "DATABASE_URL: ${DATABASE_URL}"
echo "NODE_ENV: ${NODE_ENV}"
echo "PORT: ${PORT}"

# Verificar se o Prisma schema existe
if [ ! -f "./prisma/schema.prisma" ]; then
    echo "❌ ERRO: Arquivo prisma/schema.prisma não encontrado"
    exit 1
fi

echo "✅ Schema Prisma encontrado"

# Gerar Prisma Client
echo "=== Gerando Prisma Client ==="
if npx prisma generate; then
    echo "✅ Prisma Client gerado com sucesso"
else
    echo "❌ ERRO: Falha ao gerar Prisma Client"
    exit 1
fi

# Executar migrations com fallback para db push
echo "=== Configurando banco de dados ==="

echo "Tentando executar migrations..."
if npx prisma migrate deploy; then
    echo "✅ Migrations executadas com sucesso"
elif npx prisma db push --force-reset --accept-data-loss; then
    echo "✅ Schema aplicado via db push"
else
    echo "⚠️ Falha na configuração do banco - continuando sem migrations"
fi

# Verificar se o banco está acessível via Prisma
echo "=== Testando conexão Prisma ==="
if npx prisma db execute --command="SELECT 1" > /dev/null 2>&1; then
    echo "✅ Conexão Prisma validada"
else
    echo "⚠️ Conexão Prisma com problemas - continuando mesmo assim"
fi

echo "=== Iniciando aplicação ==="
echo "🚀 Iniciando servidor na porta ${PORT:-3006}..."

# Iniciar a aplicação
exec node dist/index.js