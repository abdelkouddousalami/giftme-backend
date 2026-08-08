#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/giftme-frontend"


JAVA21="$HOME/.local/jdks/jdk-21.0.12+8"
if [ ! -x "$JAVA21/bin/java" ]; then
  echo "error: JDK 21 not found at $JAVA21 (or it's not executable)." >&2
  echo "Install one, e.g.: sudo apt install openjdk-21-jdk" >&2
  exit 1
fi
export JAVA_HOME="$JAVA21"
export PATH="$JAVA_HOME/bin:$PATH"


export PUBLIC_APP_URL="http://localhost:5173"

PG_CONTAINER="giftme-postgres"
if ! docker ps --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
  if docker ps -a --format '{{.Names}}' | grep -qx "$PG_CONTAINER"; then
    echo "==> Starting existing $PG_CONTAINER container"
    docker start "$PG_CONTAINER" >/dev/null
  else
    echo "==> Creating $PG_CONTAINER (db=giftme user=giftme password=giftme, matches application.yml defaults)"
    docker run -d --name "$PG_CONTAINER" \
      -e POSTGRES_DB=giftme -e POSTGRES_USER=giftme -e POSTGRES_PASSWORD=giftme \
      -p 5432:5432 \
      -v giftme_postgres_data:/var/lib/postgresql/data \
      postgres:16-alpine >/dev/null
  fi
fi

echo -n "==> Waiting for Postgres to accept connections"
for i in $(seq 1 30); do
  if docker exec "$PG_CONTAINER" pg_isready -U giftme >/dev/null 2>&1; then
    echo " ready"
    break
  fi
  echo -n "."
  sleep 1
done

# --- Frontend deps (ghi first run albogossa dyalii <3) ----------------------------------------
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "==> Installing frontend dependencies (first run)"
  (cd "$FRONTEND_DIR" && npm install)
fi

run_backend() {
  trap - EXIT INT TERM
  cd "$BACKEND_DIR"
  mvn -q spring-boot:run 2>&1 | sed -u 's/^/[backend]  /'
}

run_frontend() {
  trap - EXIT INT TERM
  cd "$FRONTEND_DIR"
  npm run dev 2>&1 | sed -u 's/^/[frontend] /'
}

# Kill the whole process 
CLEANED_UP=0
cleanup() {
  if [ "$CLEANED_UP" -eq 1 ]; then return; fi
  CLEANED_UP=1
  echo
  echo "==> Stopping backend and frontend (Postgres keeps running - stop it with: docker stop $PG_CONTAINER)"
  kill -- -$$ 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "==> Starting backend on http://localhost:8080 and frontend on http://localhost:5173"
echo "    Admin login: aelalami / abdo@3214 - Ctrl+C stops both."
echo

run_backend &
run_frontend &
wait
