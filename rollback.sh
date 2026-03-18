#!/bin/bash

set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/var/www/metalgest}"
BACKUP_PATH="${BACKUP_PATH:-/var/www/metalgest-backup}"

echo "MetalGest rollback"

if [ ! -d "$BACKUP_PATH" ]; then
  echo "Backup directory not found: $BACKUP_PATH"
  exit 1
fi

LATEST_BACKUP="$(find "$BACKUP_PATH" -mindepth 1 -maxdepth 1 -type d | sort | tail -n 1)"

if [ -z "$LATEST_BACKUP" ]; then
  echo "No backup available in $BACKUP_PATH"
  exit 1
fi

cd "$DEPLOY_PATH"
docker compose down --remove-orphans || true

rm -rf "${DEPLOY_PATH}.failed"
mv "$DEPLOY_PATH" "${DEPLOY_PATH}.failed"
cp -R "$LATEST_BACKUP" "$DEPLOY_PATH"

cd "$DEPLOY_PATH"
docker compose up -d --build

echo "Rollback completed from $LATEST_BACKUP"
