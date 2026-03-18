#!/bin/bash

set -euo pipefail

SCHEMA_PATH="${SCHEMA_PATH:-/app/packages/database/prisma/schema.prisma}"

echo "Running Prisma migrate deploy"
npx prisma migrate deploy --schema "$SCHEMA_PATH"

echo "Starting application"
exec "$@"
