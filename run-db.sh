#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DB_DIR="$ROOT_DIR/database"

echo "==> Pulling/creating the giftme MySQL image and starting the container"
(cd "$DB_DIR" && docker compose up -d)

echo -n "==> Waiting for MySQL to report healthy"
for i in $(seq 1 30); do
  status="$(docker inspect --format='{{.State.Health.Status}}' giftme 2>/dev/null || echo "starting")"
  if [ "$status" = "healthy" ]; then
    echo " done"
    break
  fi
  echo -n "."
  sleep 2
done

if [ "$status" != "healthy" ]; then
  echo
  echo "warning: container did not report healthy within the wait window - check with: docker logs giftme" >&2
fi

echo
docker ps --filter "name=giftme"
echo
echo "Connect with DBeaver: host=localhost port=3307 database=giftme user=aelalami password=abdo@3214"
echo "Stop it with: (cd database && docker compose down)"
