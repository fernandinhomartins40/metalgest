#!/bin/bash

# MetalGest Rollback Script
# Este script reverte o deploy para um estado anterior funcional

set -e

echo "=== MetalGest Rollback Script ==="
echo "Iniciando processo de rollback..."

# Variáveis
BACKUP_DIR="/var/www/metalgest-backup"
APP_DIR="/var/www/metalgest"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Função para log com timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Função para criar backup antes do rollback
create_backup() {
    log "Criando backup antes do rollback..."
    
    if [ -d "$APP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        cp -r "$APP_DIR" "$BACKUP_DIR/failed-deploy-$TIMESTAMP"
        log "✅ Backup do deploy falho criado em: $BACKUP_DIR/failed-deploy-$TIMESTAMP"
    fi
}

# Função para parar serviços
stop_services() {
    log "Parando serviços atuais..."
    
    cd "$APP_DIR" || {
        log "❌ Diretório da aplicação não encontrado: $APP_DIR"
        exit 1
    }
    
    # Parar containers
    docker-compose down --remove-orphans 2>/dev/null || log "⚠️ Nenhum container para parar"
    
    # Limpar recursos órfãos
    docker container prune -f 2>/dev/null || true
    docker network prune -f 2>/dev/null || true
    
    log "✅ Serviços parados"
}

# Função para restaurar backup anterior
restore_backup() {
    log "Procurando backup anterior para restaurar..."
    
    # Encontrar o backup mais recente (excluindo o atual)
    LATEST_BACKUP=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "deploy-*" | sort -r | head -1)
    
    if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP" ]; then
        log "Backup encontrado: $LATEST_BACKUP"
        
        # Remover deploy atual
        rm -rf "$APP_DIR"
        
        # Restaurar backup
        cp -r "$LATEST_BACKUP" "$APP_DIR"
        
        log "✅ Backup restaurado com sucesso"
        return 0
    else
        log "⚠️ Nenhum backup anterior encontrado"
        return 1
    fi
}

# Função para deploy mínimo de emergência
emergency_deploy() {
    log "Executando deploy mínimo de emergência..."
    
    cd "$APP_DIR" || exit 1
    
    # Criar configuração mínima se não existir
    if [ ! -f "docker-compose.yml" ]; then
        log "Criando docker-compose.yml mínimo..."
        cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  nginx:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
    volumes:
      - ./maintenance.html:/usr/share/nginx/html/index.html:ro
    restart: unless-stopped
EOF
    fi
    
    # Criar página de manutenção
    cat > maintenance.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>MetalGest - Manutenção</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Sistema em Manutenção</h1>
        <p>O MetalGest está temporariamente indisponível para manutenção.</p>
        <p>Por favor, tente novamente em alguns minutos.</p>
        <p><small>Se o problema persistir, entre em contato com o suporte.</small></p>
    </div>
</body>
</html>
EOF
    
    log "✅ Página de manutenção criada"
}

# Função para iniciar serviços
start_services() {
    log "Iniciando serviços..."
    
    cd "$APP_DIR" || exit 1
    
    # Tentar iniciar com docker-compose
    if docker-compose up -d; then
        log "✅ Serviços iniciados com sucesso"
        
        # Aguardar e verificar status
        sleep 10
        if docker-compose ps | grep -q "Up"; then
            log "✅ Containers estão rodando"
            return 0
        else
            log "❌ Containers não iniciaram corretamente"
            return 1
        fi
    else
        log "❌ Falha ao iniciar serviços"
        return 1
    fi
}

# Função para verificar saúde do sistema
health_check() {
    log "Verificando saúde do sistema..."
    
    # Verificar se nginx responde
    if curl -s -f http://localhost/ >/dev/null 2>&1; then
        log "✅ Sistema respondendo na porta 80"
        return 0
    else
        log "❌ Sistema não está respondendo"
        return 1
    fi
}

# Função principal de rollback
main() {
    log "=== INICIANDO ROLLBACK ==="
    
    # 1. Criar backup do estado atual
    create_backup
    
    # 2. Parar serviços
    stop_services
    
    # 3. Tentar restaurar backup anterior
    if restore_backup; then
        log "Backup anterior restaurado, tentando iniciar..."
        
        if start_services && health_check; then
            log "🎉 ROLLBACK CONCLUÍDO COM SUCESSO!"
            log "Sistema restaurado para versão anterior"
            exit 0
        else
            log "⚠️ Backup restaurado mas serviços falharam, tentando deploy de emergência..."
        fi
    fi
    
    # 4. Se backup falhou, fazer deploy de emergência
    emergency_deploy
    
    if start_services && health_check; then
        log "🚨 ROLLBACK DE EMERGÊNCIA CONCLUÍDO"
        log "Página de manutenção ativa - Sistema precisa de atenção manual"
        exit 0
    else
        log "❌ ROLLBACK FALHOU COMPLETAMENTE"
        log "Sistema requer intervenção manual imediata"
        exit 1
    fi
}

# Executar script principal
main "$@"