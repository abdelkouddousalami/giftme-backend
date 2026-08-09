#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/giftme-frontend"


# JDK 21: macOS (Homebrew keg or java_home) first, then the Linux install path.
if [ -x /opt/homebrew/opt/openjdk@21/bin/java ]; then
  JAVA21="/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home"
elif [ -x /usr/libexec/java_home ] && JAVA21="$(/usr/libexec/java_home -v 21 2>/dev/null)"; then
  :
elif [ -x "$HOME/.local/jdks/jdk-21.0.12+8/bin/java" ]; then
  JAVA21="$HOME/.local/jdks/jdk-21.0.12+8"
else
  echo "error: no JDK 21 found." >&2
  echo "Install one: brew install openjdk@21 (macOS) or sudo apt install openjdk-21-jdk (Linux)" >&2
  exit 1
fi
export JAVA_HOME="$JAVA21"
export PATH="$JAVA_HOME/bin:$PATH"

if ! command -v mvn >/dev/null 2>&1; then
  echo "error: mvn not found. Install it: brew install maven (macOS) or sudo apt install maven (Linux)" >&2
  exit 1
fi

# The illizeo dev stack holds 8080 (phpmyadmin) and 5173 (frontend), so GiftMe
# runs on 8081/5174 locally and both stacks can coexist.
export SERVER_PORT=8081
export CORS_ALLOWED_ORIGINS="http://localhost:5173,http://localhost:5174"
export PUBLIC_APP_URL="http://localhost:5174"
export VITE_API_BASE_URL="http://localhost:8081"

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
  npm run dev -- --port 5174 --strictPort 2>&1 | sed -u 's/^/[frontend] /'
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

echo "==> Starting backend on http://localhost:8081 and frontend on http://localhost:5174"
echo "    Admin login: aelalami / abdo@3214 - Ctrl+C stops both."
echo

run_backend &
run_frontend &
wait
