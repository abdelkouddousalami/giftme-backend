# Standalone MySQL container ("giftme")

This is a **standalone MySQL 8 instance for DBeaver access** — it is not connected to the
GiftMe Spring Boot backend, which uses PostgreSQL (see `../backend/docker-compose.yml`).
It exists purely because it was requested for local DB tooling access; nothing in the
application reads or writes to it. If you actually want the backend itself to run on
MySQL instead of Postgres, that's a separate, larger change (rewriting the Flyway
migrations and JPA dialect) — ask for that explicitly if it's what you need.

## Run it

```bash
cd database
docker compose up -d
```

**Verified working** (2026-08-08, on this machine): pulled, started, and connected as
`aelalami` both from inside the container and from the host via the mapped port.

## Credentials

| Setting | Value |
|---|---|
| Host | `localhost` |
| Port | `3307` (not 3306 — see below) |
| Database | `giftme` |
| Username | `aelalami` |
| Password | `abdo@3214` |
| Root username | `root` |
| Root password | `abdo@3214` |

### Why port 3307, not 3306

This machine already runs a native (non-Docker) MySQL service bound to
`127.0.0.1:3306` — unrelated to this project, so it was left alone. This container's
host-side port was remapped to `3307` instead (its own internal port is still the
MySQL default, 3306 — only the host-side mapping changed). If that native service is
ever removed, the port in `docker-compose.yml` can be changed back to `3306:3306`.

## Connect with DBeaver

1. New Connection → MySQL
2. Host: `localhost`, Port: `3307`, Database: `giftme`
3. Username: `aelalami`, Password: `abdo@3214`
4. Test Connection → Finish

## Stop / reset

```bash
docker compose down          # stop, keep data
docker compose down -v       # stop and wipe the volume (all data lost)
```

## If `docker pull` fails with "authentication required - incorrect username or password"

This means a stale/invalid Docker Hub credential is stored in `~/.docker/config.json`.
Fix (removes only the Docker Hub entry, leaves any other registry logins untouched):

```bash
docker logout
```
