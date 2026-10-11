#!/bin/bash
# Wosool API release script for Hostinger (run from hPanel cron or SSH).
# Never rotates APP_KEY, never runs migrate:fresh or demo seeders.
set -euo pipefail
cd "$(dirname "$0")"
export COMPOSER_HOME="${COMPOSER_HOME:-$HOME/.composer}"
if [ ! -f .env ]; then echo "ERROR: .env missing in $(pwd)"; exit 1; fi
COMPOSER_BIN="$(command -v composer2 || command -v composer)"
"$COMPOSER_BIN" install --no-dev --prefer-dist --no-interaction --no-progress --optimize-autoloader
mkdir -p storage/app/private/eoa storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chmod -R ug+rwX storage bootstrap/cache
chmod 700 storage/app/private
php artisan migrate --force
php artisan db:seed --class=RoleAndPermissionSeeder --force
php artisan eoa:install
[ -L public/storage ] || php artisan storage:link
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan queue:restart || true
echo "DEPLOY_OK $(date -u +%FT%TZ)"
