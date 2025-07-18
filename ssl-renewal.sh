#!/bin/bash

# Script para renovação automática de certificados SSL
# Deve ser executado via cron job

set -e

echo "=== MetalGest SSL Renewal Script ==="
echo "Iniciando renovação de certificados SSL..."

# Diretório do projeto
PROJECT_DIR="/var/www/metalgest"
BACKUP_DIR="/var/www/metalgest-backup"
SSL_DIR="$PROJECT_DIR/ssl"

# Função para log com timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Função para criar backup dos certificados atuais
backup_certificates() {
    log "Criando backup dos certificados atuais..."
    
    if [ -d "$SSL_DIR" ]; then
        mkdir -p "$BACKUP_DIR/ssl-backup-$(date +%Y%m%d_%H%M%S)"
        cp -r "$SSL_DIR" "$BACKUP_DIR/ssl-backup-$(date +%Y%m%d_%H%M%S)/"
        log "✅ Backup criado com sucesso"
    fi
}

# Função para parar nginx temporariamente
stop_nginx() {
    log "Parando nginx para renovação..."
    cd "$PROJECT_DIR"
    docker-compose stop nginx
    log "✅ Nginx parado"
}

# Função para renovar certificados
renew_certificates() {
    log "Renovando certificados SSL..."
    
    # Tentar renovar certificados
    if certbot renew --quiet; then
        log "✅ Certificados renovados com sucesso"
        
        # Copiar novos certificados para o projeto
        if [ -f "/etc/letsencrypt/live/metalgest.com.br/fullchain.pem" ]; then
            cp /etc/letsencrypt/live/metalgest.com.br/fullchain.pem "$SSL_DIR/"
            cp /etc/letsencrypt/live/metalgest.com.br/privkey.pem "$SSL_DIR/"
            
            # Ajustar permissões
            chmod 644 "$SSL_DIR/fullchain.pem"
            chmod 600 "$SSL_DIR/privkey.pem"
            
            log "✅ Certificados copiados para o projeto"
        else
            log "❌ Erro: Certificados não encontrados após renovação"
            return 1
        fi
    else
        log "⚠️ Nenhum certificado precisava ser renovado"
    fi
}

# Função para iniciar nginx
start_nginx() {
    log "Iniciando nginx..."
    cd "$PROJECT_DIR"
    
    if docker-compose up -d nginx; then
        log "✅ Nginx iniciado com sucesso"
        
        # Aguardar nginx ficar pronto
        sleep 10
        
        # Verificar se HTTPS está funcionando
        if curl -s -f https://metalgest.com.br/health >/dev/null 2>&1; then
            log "✅ HTTPS funcionando corretamente"
            return 0
        else
            log "❌ HTTPS não está funcionando"
            return 1
        fi
    else
        log "❌ Erro ao iniciar nginx"
        return 1
    fi
}

# Função para restaurar backup em caso de erro
restore_backup() {
    log "Restaurando backup dos certificados..."
    
    # Encontrar o backup mais recente
    LATEST_BACKUP=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "ssl-backup-*" | sort -r | head -1)
    
    if [ -n "$LATEST_BACKUP" ] && [ -d "$LATEST_BACKUP" ]; then
        cp -r "$LATEST_BACKUP/ssl/"* "$SSL_DIR/"
        log "✅ Backup restaurado"
    else
        log "❌ Nenhum backup encontrado"
    fi
}

# Função principal
main() {
    log "=== INICIANDO RENOVAÇÃO SSL ==="
    
    # 1. Criar backup
    backup_certificates
    
    # 2. Parar nginx
    stop_nginx
    
    # 3. Renovar certificados
    if renew_certificates; then
        log "Certificados renovados com sucesso"
    else
        log "⚠️ Falha na renovação, mas continuando..."
    fi
    
    # 4. Iniciar nginx
    if start_nginx; then
        log "🎉 RENOVAÇÃO SSL CONCLUÍDA COM SUCESSO!"
        
        # Limpar backups antigos (manter apenas os 5 mais recentes)
        find "$BACKUP_DIR" -maxdepth 1 -type d -name "ssl-backup-*" | sort -r | tail -n +6 | xargs -r rm -rf
        
        exit 0
    else
        log "❌ Falha ao iniciar nginx após renovação"
        
        # Restaurar backup
        restore_backup
        
        # Tentar iniciar nginx novamente
        if start_nginx; then
            log "⚠️ Nginx restaurado com certificados anteriores"
            exit 1
        else
            log "❌ FALHA CRÍTICA: Nginx não iniciou nem com backup"
            exit 2
        fi
    fi
}

# Executar script principal
main "$@"