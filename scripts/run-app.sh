#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if ! command -v php >/dev/null 2>&1; then
  echo "Error: php is not installed or not in PATH. Backend cannot start."
  exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
  echo "Error: composer is not installed or not in PATH. Backend cannot start."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH."
  exit 1
fi

if [[ ! -d "backend/vendor" ]]; then
  echo "Installing backend Composer dependencies ..."
  composer --working-dir=backend install --no-interaction --no-progress
fi

if [[ ! -x "backend/node_modules/.bin/vite" ]]; then
  echo "Installing backend npm dependencies ..."
  npm --prefix backend install
fi

if [[ ! -d "frontend/node_modules" ]]; then
  echo "Installing frontend npm dependencies ..."
  npm --prefix frontend install
fi

shutdown() {
  if [[ -n "${REVERB_PID:-}" ]] && kill -0 "$REVERB_PID" 2>/dev/null; then
    kill "$REVERB_PID" 2>/dev/null || true
  fi

  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [[ -n "${FRONTEND_PID:-}" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  wait 2>/dev/null || true
}

trap shutdown INT TERM EXIT

REVERB_PID=""
REVERB_PORT="${REVERB_PORT:-8080}"
if (
  cd backend
  php artisan list --raw 2>/dev/null | grep -q "^reverb:start"
); then
  if command -v lsof >/dev/null 2>&1 && lsof -iTCP:"$REVERB_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Reverb port ${REVERB_PORT} already in use. Assuming Reverb is already running; skipping startup."
  else
    echo "Starting Reverb on ws://localhost:${REVERB_PORT} ..."
    (
      cd backend
      php artisan reverb:start --host=0.0.0.0 --port="$REVERB_PORT"
    ) &
    REVERB_PID=$!
  fi
else
  echo "Reverb command not found. Skipping realtime server startup (install laravel/reverb to enable it)."
fi

echo "Starting backend on http://localhost:8000 ..."
npm run dev:backend &
BACKEND_PID=$!

echo "Starting frontend on http://localhost:3000 ..."
npm run dev:frontend &
FRONTEND_PID=$!

EXIT_CODE=0
while true; do
  if [[ -n "${REVERB_PID:-}" ]] && ! kill -0 "$REVERB_PID" 2>/dev/null; then
    wait "$REVERB_PID" || EXIT_CODE=$?
    break
  fi

  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    wait "$BACKEND_PID" || EXIT_CODE=$?
    break
  fi

  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    wait "$FRONTEND_PID" || EXIT_CODE=$?
    break
  fi

  sleep 1
done

shutdown
exit "$EXIT_CODE"
