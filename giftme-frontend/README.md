# GiftMe Frontend

React + Vite + Tailwind CSS. Two areas share this one app:

- **Storefront** (`src/app`, `src/pages`, `src/components`) — the public marketing/shopping
  site. See `src/app/routes.jsx` and `src/app/paths.js` for the route table.
- **Admin dashboard** (`src/admin`) — everything under `/admin/*`. Self-contained: its own
  layout, auth, API client and stylesheet, mounted as a sibling of the storefront's
  `RootLayout` so it never inherits the storefront header/footer or design tokens.

## Running locally

```bash
cp .env.example .env   # VITE_API_BASE_URL, used by the admin section - defaults to http://localhost:8080
npm install
npm run dev
```

Opens on **http://localhost:5173**. The backend (`../backend`) must be running for the admin
section to do anything real; the storefront doesn't call the API yet (only the home page is
implemented so far).

```bash
npm run build   # vite build -> dist/
npm run lint    # oxlint
```

## Admin dashboard (`src/admin`)

Routes: `/admin/login`, `/admin` (overview), `/admin/products`, `/admin/orders`,
`/admin/orders/:id`, `/admin/customers`, `/admin/memories`.

Login with the backend's seeded admin account:

| Field | Value |
|---|---|
| Username | `aelalami` |
| Password | `abdo@3214` |

Covers dashboard stats/charts, product CRUD (with image upload + activate/deactivate), order
management (status changes + tracking timeline), customers (with order history), and QR
memory management — plus CSV export ("download report") on the products/orders/customers
lists. Every page handles loading/error/empty states and every form is validated
(`react-hook-form` + `zod`).

### Why it's plain JavaScript, not TypeScript

This dashboard was originally built in TypeScript as a standalone app, then merged in here.
The rest of this project is plain `.jsx` with no TypeScript tooling actually wired up (no
`tsconfig.json`, `typescript` isn't a dependency — only the `@types/*` packages are present),
so every admin file was converted to match rather than introducing a second toolchain for one
subtree.

### Why it has its own Tailwind stylesheet (`src/admin/styles/admin.css`)

The storefront's `src/styles/tailwind.css` deliberately strips Tailwind's entire stock color
palette (`--color-*: initial`) in favor of brand-only tokens (rose, sage, caramel, ivory…),
and deliberately skips Preflight so it doesn't restyle the plain-CSS marketing sections. The
admin dashboard is a different kind of UI - dense tables, forms, status badges - built against
Tailwind's stock palette (indigo/slate/red/amber/green), and it needs those colors to actually
resolve to something.

`src/admin/styles/admin.css` imports Tailwind's `theme.css` + `utilities.css` directly (not
Preflight), independent of the storefront's `@theme` override. This is Tailwind v4's supported
way to have two independently-themed sections share one build: verified by inspecting the
compiled output — the storefront's utilities correctly resolve to its brand `--color-primary`
etc., the admin utilities correctly resolve to `--color-indigo-600` etc., and neither file's
theme configuration leaks into the other's. Also verified live in a real browser: the
storefront's homepage renders identically with and without the admin section present (no
Preflight leakage, no dropped brand colors), and the admin section's stock-palette utilities
render as real colors, not unstyled fallbacks.

### Icons

The storefront intentionally avoids an icon library (`src/components/common/Icon.jsx` - one
hand-drawn SVG set, "avoiding an icon dependency and a folder of one-line components"). The
admin section pragmatically uses `lucide-react` instead of extending that hand-rolled set,
given the number of distinct icons a data-dense admin UI needs (tables, forms, status
indicators, charts) — a deliberate, scoped exception, not an oversight.
