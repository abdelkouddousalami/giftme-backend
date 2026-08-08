# GiftMe API

Production-ready REST API for **GiftMe**, a personalized-gifts e-commerce platform (personalized puzzles, mugs, and QR "memory" experiences). Built with Spring Boot 3 / Java 21.

Guest checkout is a first-class citizen: a customer can browse, personalize a product, and pay Cash-on-Delivery without ever creating an account. Every price the API returns is computed server-side — the frontend cannot influence what a customer is charged.

---

## Table of contents

1. [Tech stack](#tech-stack)
2. [Running locally](#running-locally)
3. [Environment variables](#environment-variables)
4. [Database setup](#database-setup)
5. [Swagger / API docs](#swagger--api-docs)
6. [Authentication flow](#authentication-flow)
7. [API endpoints](#api-endpoints)
8. [Order lifecycle](#order-lifecycle)
9. [Tracking system](#tracking-system)
10. [QR memory system](#qr-memory-system)
11. [File uploads & migrating to S3](#file-uploads--migrating-to-s3)
12. [Business rules reference](#business-rules-reference)
13. [Testing](#testing)
14. [Project structure](#project-structure)
15. [Known limitations / TODOs](#known-limitations--todos)

---

## Tech stack

Java 21 · Spring Boot 3.3 · Spring Web · Spring Data JPA (Hibernate) · Spring Security · PostgreSQL · Flyway · Bean Validation · Lombok · springdoc-openapi (Swagger UI) · JJWT · Bucket4j (rate limiting) · Apache Tika (upload content sniffing) · JUnit 5 / Mockito · Maven · Docker.

Layering is strict **Controller → Service → Repository**; controllers contain no business logic, entities are never serialized directly (every endpoint returns a DTO).

## Running locally

### Prerequisites

- **JDK 21** (not just JRE — must include `javac`). The Spring Boot 3.3 parent's managed Lombok version has flaky annotation-processor support on JDKs newer than 21 (verified against 25); building with a JDK newer than the project's target can silently produce classes with no Lombok-generated methods. Building *with* JDK 21 (or compiling with a newer JDK using `--release 21`, using a Lombok version confirmed compatible with that JDK) avoids this entirely — stick to JDK 21 unless you've verified otherwise.
- Maven 3.8+
- PostgreSQL 16 (or Docker, see below)

### Option A — Docker Compose (recommended)

```bash
cp .env.example .env
# edit .env: set DATABASE_PASSWORD and JWT_SECRET at minimum

docker compose --env-file .env up --build
```

This starts PostgreSQL and the API together. Flyway runs automatically on startup, creating the schema and seeding:
- an admin account (`admin@giftme.ma`, see [Database setup](#database-setup) for the password)
- the three initial products (Personalized Puzzle, Personalized Mug, QR Memory Experience)

API available at `http://localhost:8080`.

### Option B — Run against a local Postgres

```bash
# 1. Start Postgres however you like, then create the DB/role:
psql -c "CREATE USER giftme WITH PASSWORD 'giftme';"
psql -c "CREATE DATABASE giftme OWNER giftme;"

# 2. Run the app (uses application.yml defaults, matching the above)
export JWT_SECRET="$(openssl rand -base64 64)"
mvn spring-boot:run
```

## Environment variables

All have safe local-dev defaults in `application.yml` except `JWT_SECRET`, which you should always set explicitly outside of local dev.

| Variable | Purpose | Default |
|---|---|---|
| `DATABASE_URL` | JDBC URL | `jdbc:postgresql://localhost:5432/giftme` |
| `DATABASE_USERNAME` | DB user | `giftme` |
| `DATABASE_PASSWORD` | DB password | `giftme` |
| `JWT_SECRET` | HMAC signing key for access tokens (≥32 bytes) | dev-only placeholder — **override in any real deployment** |
| `JWT_ACCESS_EXPIRATION_MS` | Access token TTL | `900000` (15 min) |
| `JWT_REFRESH_EXPIRATION_MS` | Refresh token TTL | `1209600000` (14 days) |
| `FILE_STORAGE_PATH` | Local disk root for uploads | `./storage/uploads` |
| `FILE_STORAGE_PUBLIC_URL` | URL prefix uploads are served under | `/uploads` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,http://localhost:5173` |
| `PUBLIC_APP_URL` | Used to build memory page links (`{url}/m/{code}`) | `https://giftme.ma` |
| `SERVER_PORT` | HTTP port | `8080` |

Never commit real secrets — `.env` is gitignored; `.env.example` documents the shape only.

## Database setup

Schema and seed data are managed entirely by **Flyway** (`src/main/resources/db/migration`):

- `V1__init_schema.sql` — all tables, foreign keys, check constraints, and the indexes called out in the spec (`product.slug`, `order.orderNumber`, `order.trackingCode`, `order.phone`, `memory.publicCode`, `order.status`, `order.createdAt`).
- `V2__seed_data.sql` — a default admin account and the three initial products.

**Default admin login:** `admin@giftme.ma` / `ChangeMe!2026`
**Change this password immediately in any non-throwaway environment** — the seeded bcrypt hash is public (it's sitting in this repo's migration file).

Public self-registration (`POST /api/auth/register`) can only ever create a `CUSTOMER` account — there's no way to mint an admin account through the API by design. Additional admins must be seeded via a migration or created directly in the database.

`ddl-auto` is set to `validate` (never `update`/`create`) — the Flyway migrations are the single source of truth for schema, and Hibernate just double-checks the entity mappings match them at startup.

## Swagger / API docs

- Swagger UI: **http://localhost:8080/swagger-ui.html**
- Raw OpenAPI JSON: `http://localhost:8080/v3/api-docs`

Every controller carries `@Tag`/`@Operation` descriptions. Admin endpoints declare a `bearerAuth` security requirement — click **Authorize** in Swagger UI and paste an `accessToken` from `/api/auth/login` to call them interactively.

## Authentication flow

- `POST /api/auth/register` — public self-registration, **always** creates a `CUSTOMER` (no role field in the request — can't be abused to self-elevate).
- `POST /api/auth/login` — works for both `ADMIN` and `CUSTOMER` accounts.
- `POST /api/auth/refresh` — exchanges a refresh token for a new access token. Refresh tokens are **rotated**: the presented token is revoked and a new one issued, so a stolen-then-replayed refresh token stops working the moment the legitimate client refreshes.
- `GET /api/auth/me` — current user, requires a valid access token.

Access tokens are short-lived JWTs (HS256/384/512 depending on secret length) carrying `sub` (email), `userId`, and `role` claims. Refresh tokens are opaque, cryptographically random strings; the server stores only their SHA-256 hash (`refresh_tokens` table), so a database leak alone can't be used to mint sessions.

Authorization is role-based: `/api/admin/**` requires `ROLE_ADMIN` (enforced both at the Spring Security filter-chain level and available for method-level `@PreAuthorize` via `@EnableMethodSecurity`). Anonymous/wrong-role requests get a consistent JSON error body (see [API response format](#api-response-format) below) with `401`/`403` respectively — not Spring's default HTML error page.

### API response format

Every endpoint returns the same envelope:

```json
// success
{ "success": true, "data": { ... }, "message": "Success" }

// error
{ "success": false, "message": "Product not found: 123", "code": "PRODUCT_NOT_FOUND",
  "timestamp": "2026-08-08T10:15:30Z", "path": "/api/products/123" }
```

`GlobalExceptionHandler` (`@RestControllerAdvice`) is the single place this shape is produced from — bean validation failures, `@PreAuthorize` rejections, JWT filter rejections, and every domain exception all funnel through it (or, for the two exceptions that fire inside the security filter chain before Spring MVC ever sees the request — anonymous access and wrong-role access — through `AuthEntryPointJwt` / `RestAccessDeniedHandler`, which build the identical JSON shape).

## API endpoints

**Public** (no auth required):
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/products                       (active products only; paginated/filterable)
GET    /api/products/{id}
GET    /api/products/slug/{slug}
POST   /api/orders                          (guest or authenticated checkout)
GET    /api/tracking/{trackingCode}
GET    /api/memories/{publicCode}
POST   /api/uploads/image | /video | /audio (rate-limited; see below)
```

**Authenticated** (any logged-in user):
```
GET    /api/auth/me
```

**Admin only** (`ROLE_ADMIN`):
```
POST   /api/admin/products
PUT    /api/admin/products/{id}
DELETE /api/admin/products/{id}
PATCH  /api/admin/products/{id}/status

GET    /api/admin/memories/{id}             (added beyond the original spec - see note below)
POST   /api/admin/memories
PUT    /api/admin/memories/{id}
DELETE /api/admin/memories/{id}

GET    /api/admin/orders                    (search/filter/paginate/sort)
GET    /api/admin/orders/{id}
PATCH  /api/admin/orders/{id}/status
GET    /api/admin/orders/{id}/tracking
POST   /api/admin/orders/{id}/tracking-events

GET    /api/admin/customers
GET    /api/admin/customers/{id}
GET    /api/admin/customers/{id}/orders

GET    /api/admin/dashboard/stats
GET    /api/admin/dashboard/orders-chart
GET    /api/admin/dashboard/top-products
```

> **Note:** `GET /api/admin/memories/{id}` isn't in the original endpoint list but was added — a CRUD resource is unusable from an admin UI without a way to fetch a memory's current data before editing it. Everything else matches the spec exactly.

Full request/response schemas: Swagger UI.

## Order lifecycle

`POST /api/orders` is intentionally the most defensive endpoint in the API. For every item in the request it:

1. Loads the **real** `Product` row by id — rejects unknown or inactive products.
2. Checks stock, then reserves it with an **atomic conditional UPDATE**
   (`UPDATE products SET stock = stock - :qty WHERE id = :id AND stock >= :qty`) rather than a
   read-then-write — this is what actually prevents stock from going negative under concurrent
   orders for the last few units of a product, not just the earlier read-check (which is only
   there for a fast, clear error message in the common case).
3. Prices the line using the **product's current price**, never anything in the request body — the request DTO doesn't even have a price field.
4. Snapshots `productNameSnapshot` and `unitPrice` onto the `OrderItem`, so a later price/name change on the `Product` never rewrites history.
5. Builds a `Customization` row if personalization data was supplied, and generates a `Memory` (see below) if `qrMemoryEnabled` was set.

Delivery fee and total are computed server-side: a flat fee (`giftme.order.delivery-fee-default`, 30.00 by default) is applied unless the subtotal meets a free-delivery threshold (`giftme.order.delivery-fee-free-threshold`, 500.00 by default) — this threshold isn't in the original spec; it's a common, easily-adjustable e-commerce default, kept behind a config property specifically so it can be tuned without a code change.

Customers are deduplicated by **phone number**, not email (see [Business rules](#business-rules-reference)): `POST /api/orders` finds-or-creates a `Customer` row keyed on phone.

**Status machine** (`OrderStatus`):

```
PENDING → CONFIRMED → PREPARING → READY → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
                                                            ↘
                                                          CANCELLED
```

`CANCELLED` and `DELIVERED` are **terminal** — once an order reaches either, no further status change is accepted (`ConflictException` / `409`), which is how rules #10 and #11 are enforced. Within the non-terminal states, an admin can move to any other status (including backwards, to correct a mistake) — the spec's diagram is the *expected* path, not a strict linear gate. Every status change, whichever endpoint triggers it, appends a `TrackingEvent` (rule #8) and — since GiftMe is COD-only today — flips `paymentStatus` to `PAID` the moment an order reaches `DELIVERED` (cash collected on delivery).

`POST /api/admin/orders/{id}/tracking-events` and `PATCH /api/admin/orders/{id}/status` share the same underlying transition logic; the former lets an admin supply a custom description/status pair for a more expressive tracking entry, the latter just applies a sensible default description per status.

## Tracking system

Every order gets a `trackingCode` (format `GM-XXXXXX`, e.g. `GM-8X4K2Q`) generated with `SecureRandom` over a 31-character alphabet with visually-ambiguous characters (`0/O`, `1/I/L`) removed — safe to read aloud or type. `GET /api/tracking/{trackingCode}` is fully public and returns the order's current status plus its full `TrackingEvent` history; no order id, customer PII beyond what's needed, or authentication is involved.

## QR memory system

When an order item's customization has `qrMemoryEnabled: true`, order creation also creates a standalone `Memory` row with a **24-character, high-entropy, URL-safe `publicCode`** (also `SecureRandom`-backed — unguessable per rule #14) and links it from the `Customization`. `GET /api/memories/{publicCode}` is public and returns the memory's content (title, message, images, video/audio/music URLs) — but only if `active` is true; an inactive memory is indistinguishable from a nonexistent one (`404 MEMORY_NOT_FOUND`), so deactivating a memory is a safe way to pull it without deleting data.

Admins can also create/manage memories directly (`/api/admin/memories`), independent of any order — useful for one-off or manually-curated memory pages.

The frontend is expected to expose these at `https://giftme.ma/m/{publicCode}`; the API returns that full URL as `publicUrl` on the admin-facing `MemoryResponse` (via the `PUBLIC_APP_URL` env var) so nothing needs to be hardcoded into a frontend build.

## File uploads & migrating to S3

`POST /api/uploads/{image|video|audio}` accepts a `multipart/form-data` file. Every upload is validated **by content**, not by what the client claims:

1. Size limit per category (`giftme.storage.limits.*`).
2. Extension whitelist (jpg/jpeg/png/webp/gif · mp4/mov/webm · mp3/wav/ogg/m4a).
3. **Magic-byte content sniffing via Apache Tika** (`FileValidator`) — a `.exe` renamed to `photo.jpg` with a spoofed `Content-Type: image/jpeg` header still fails here, because Tika inspects the actual bytes.

Storage is behind the `FileStorageService` interface (`com.giftme.storage`):

```java
public interface FileStorageService {
    StoredFile store(MultipartFile file, FileCategory category);
}
```

`LocalFileStorageService` is the only implementation today — it writes validated bytes under `giftme.storage.local.base-path` (subdirectories `images/`, `videos/`, `audio/`) and returns a URL rooted at `giftme.storage.public-base-url` (served statically by `WebMvcConfig`, mapped to `/uploads/**`).

**To add S3-compatible storage later:**

1. Add an `S3FileStorageService implements FileStorageService` (AWS SDK v2's `S3Client`, or any S3-compatible client for providers like DigitalOcean Spaces/MinIO). Reuse the existing `FileValidator` unchanged — validation is storage-agnostic by design.
2. Have it upload the already-validated bytes and return a `StoredFile` whose `url()` is the bucket's public (or CloudFront-fronted) URL instead of a local path.
3. Add `giftme.storage.provider=s3` plus S3-specific config (bucket, region, credentials — via env vars, never hardcoded) to `GiftMeProperties.Storage`.
4. Swap which implementation is the `@Primary`/active bean based on `giftme.storage.provider` (e.g. `@ConditionalOnProperty`) — no controller, service, or DTO needs to change, since everything upstream only ever depends on the `FileStorageService` interface and the `StoredFile` record.

This isn't implemented in this repo (no AWS SDK dependency is pulled in) — genuinely marking it as a **TODO** rather than shipping a half-working stub, per the brief.

## Business rules reference

A quick index of where each numbered rule from the spec is enforced, for review purposes:

| # | Rule | Where |
|---|---|---|
| 1–3 | Prices/totals are never trusted from the client; computed server-side | `OrderServiceImpl.addOrderItem` / `calculateDeliveryFee` — note `CreateOrderRequest` has no price field at all |
| 4 | Guest COD checkout, no account required | `/api/orders` is `permitAll`; `OrderService.createOrder` accepts a nullable `authenticatedUserId` |
| 5 | Tracking is public only via tracking code | `TrackingController` / `TrackingService` — no id-based lookup exists |
| 6 | Memory pages public only via publicCode | `MemoryController` — same; inactive memories 404 |
| 7 | Only admin changes order status | `/api/admin/orders/**` is `hasRole("ADMIN")` |
| 8 | Every status change creates a TrackingEvent | `AdminOrderServiceImpl.applyStatusChange` |
| 9 | Product changes don't rewrite historical orders | `OrderItem.productNameSnapshot` / `unitPrice` snapshot fields |
| 10 | Cancelled can't move to Delivered | `OrderStatus.isTerminal()` check in `applyStatusChange` (generalized to: nothing leaves a terminal state) |
| 11 | Delivered orders aren't modified except by admin | Same terminal-state check — this admin-only method *is* the authorized operation |
| 12 | Stock never goes negative | `ProductRepository.decreaseStock` atomic conditional UPDATE |
| 13 | Uploaded files are validated | `FileValidator` (extension + size + Tika content sniffing) |
| 14 | QR/tracking codes are cryptographically random | `RandomCodeGenerator` (`java.security.SecureRandom`) |

## Testing

```bash
mvn test
```

36 tests, all passing, covering every category called out in the spec:

- **Product CRUD** — `ProductServiceImplTest`
- **Order creation / price calculation / stock validation / QR memory generation / tracking code generation** — `OrderServiceImplTest`
- **Status transitions** — `AdminOrderServiceImplTest`
- **Admin authorization / invalid requests** — `SecurityAndValidationIntegrationTest` (full Spring context + real security filter chain + H2, asserting actual `401`/`403`/`400` responses and the `ApiResponse` error shape end-to-end)
- **Auth (register/login/refresh, role safety)** — `AuthServiceImplTest`
- **Memory public-code generation/uniqueness** — `MemoryServiceImplTest`

Service-layer tests use Mockito against mocked repositories (fast, no DB). The one integration test class boots the full app against an in-memory H2 database (`src/test/resources/application-test.yml`, Flyway disabled, Hibernate `create-drop` — chosen so tests don't depend on Postgres-only SQL like `date_trunc`, which the dashboard chart query uses in production).

## Project structure

```
src/main/java/com/giftme/
├── GiftMeApplication.java
├── config/          SecurityConfig, OpenApiConfig, WebMvcConfig, GiftMeProperties
├── security/         JWT filter/service, rate limiter, entry points
├── domain/           JPA entities + enums
├── repository/       Spring Data repositories + Specifications
├── dto/               Request/response records, grouped by feature
├── mapper/            Manual entity↔DTO mappers (no MapStruct - kept dependency-light)
├── service/           Interfaces
│   └── impl/          Implementations
├── controller/        REST controllers
├── storage/           FileStorageService abstraction + Local impl + validator
└── common/            ApiResponse/PagedResponse, exception hierarchy, util (slugs, codes)

src/main/resources/db/migration/   Flyway migrations
src/test/java/com/giftme/          Mirrors main, plus integration/
```

## Known limitations / TODOs

- **S3 storage** — interface-ready, not implemented (see above) — `TODO`.
- **Rate limiting is in-memory/single-instance** (`RateLimitFilter`) — fine for one API instance; a multi-instance deployment needs a shared store (e.g. Redis-backed Bucket4j) — `TODO` if you scale horizontally.
- **Delivery fee / free-delivery threshold** and **5-day estimated delivery** are configurable defaults invented to fill gaps the spec left open, not values extracted from a real business requirement — tune `giftme.order.*` and `OrderServiceImpl.ESTIMATED_DELIVERY_DAYS` for the real numbers.
- **`totalRevenue`/`todayRevenue`** on the dashboard are defined as gross order value for non-cancelled orders (a standard GMV-style metric), *not* actual cash collected — the domain model doesn't track a separate "paid at" timestamp distinct from "delivered at", so this is the most defensible definition available without inventing new fields. Documented in `OrderRepository`/`DashboardServiceImpl`.
