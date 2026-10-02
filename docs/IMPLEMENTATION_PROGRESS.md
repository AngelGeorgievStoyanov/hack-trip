# Implementation Progress

Temporary working document for the frontend modernization. This is the only tracking
document; `AGENTS.md`, `ARCHITECTURE.md`, and `docs/API_CONTRACT.md` are locked and must
not be modified.

## 1. Current state (inventory)

### Environment

| Item | Value |
| --- | --- |
| Node.js | v24.21.0 |
| npm | 11.19.0 |
| Git branch | feature/frontend-modernization |
| Git HEAD | 80cefbf "finalize frontend architecture and API contract documentation" |

### Key package versions

| Package | Version (installed) | package.json range |
| --- | --- | --- |
| typescript | 5.9.3 | ^5.9.3 |
| react | 19.3.0 | ^19.3.0 |
| react-dom | 19.3.0 | ^19.3.0 |
| vite | 6.4.3 | ^6.0.11 |
| @mui/material | 7.3.11 | ^7.3.11 |
| @mui/icons-material | 7.3.11 | ^7.3.11 |
| @mui/x-data-grid | 7.29.13 | ^7.29.13 |
| @hookform/resolvers | 2.9.11 | ^2.9.10 |
| react-hook-form | 7.88.0 | ^7.88.0 |
| @tanstack/react-query | 5.102.8 | ^5.102.8 |
| react-router-dom | 7.18.3 | ^7.18.3 |
| @react-google-maps/api | 2.20.8 | ^2.20.8 |
| react-google-recaptcha | 3.0.0-alpha.1 | ^3.0.0-alpha.1 |
| browser-image-compression | 2.0.0 | ^2.0.0 |
| jwt-decode | 3.1.2 | ^3.1.2 |
| yup | 0.32.11 | ^0.32.11 |
| axios | **1.20.0 (added)** | ^1.20.0 |
| zod | **4.6.5 (added as direct dep)** | ^4.6.5 |

### Findings before implementation

- The source tree still uses the **old** architecture (`src/components/*`, `src/model/*`,
  `src/services/*`, `src/shared/*`, `src/utils/baseUrl.ts`), not the layered architecture in
  `ARCHITECTURE.md`.
- All HTTP traffic currently uses raw `fetch` against old, non-`/api/v1` endpoints
  (`/data/trips`, `/data/points`, `/data/comments`, `/data/users`, ...). These do **not**
  match `docs/API_CONTRACT.md`.
- `axios` and `zod` were absent as direct dependencies. `zod` was only present transitively
  (4.6.4). `yup` is used by the current form components and must be phased out.
- `@hookform/resolvers@2.9.11` supports both yup and zod resolvers.

### npm audit

One high-severity advisory exists in `brace-expansion` (5.0.9), reachable only via the dev
toolchain `eslint@10.10.0 -> minimatch@10.2.6 -> brace-expansion`. Not a runtime dependency.
`npm audit fix` is available; a compatible fix (upgrade minimatch / brace-expansion, or
upgrade eslint) will be applied without `--force`.

## 2. Package changes

- Added `axios@^1.20.0` (central HTTP client per architecture).
- Added `zod@^4.6.5` (request validation per architecture; replaces `yup`).
- `yup` remains temporarily until the form components are migrated to Zod, then it will be
  removed.

## 3. Plan / logical stages

Layer foundation (done):

1. **Foundation** — `src/constants/*`, `src/config/*`, `src/types/*`,
   `src/clients/*`. ✅ DONE
2. **Validation layer** — `src/validations/*`. ✅ DONE
3. **API layer** — `src/api/*`. ✅ DONE
4. **Auth hook** — `src/hooks/useAuth.tsx`. ✅ DONE

Stage 5 — Next.js migration (in progress). Order per the task brief:

1. **Next.js application structure** — ✅ DONE
2. routing + structural alignment — ✅ DONE
3. public pages + API integration + SEO — ✅ DONE
4. API integration
5. React Query hooks
6. authentication pages
7. trip pages
8. point/day pages
9. comments/social
10. images
11. SEO/metadata
12. sharing/Open Graph
13. private/account pages
14. admin
15. cleanup of legacy code

Stage 6 — dependency cleanup + delete `docs/IMPLEMENTATION_PROGRESS.md` when finished.

## 4. Log

### Stage 1 — Foundation (done)

- Added `axios@^1.20.0` and `zod@^4.6.5` as direct dependencies (lock file updated).
- `src/constants/` — `api`, `auth`, `routes`, `roles`, `trips`, `points`, `images`, `ui`,
  plus a barrel. Includes API paths, the `x-hacktrip-client` marker, the public frontend
  token, refresh-cookie name, documented error codes, roles, pagination defaults, and image
  limits.
- `src/config/` — runtime config resolved from `import.meta.env` (`VITE_API_BASE_URL`,
  `VITE_GOOGLE_KEY`, `VITE_SITE_KEY2`, `VITE_SITE_KEY3`), with the existing production API
  base URL as fallback.
- `src/types/` — response DTOs (`auth`, `trips`, `points`, `images`, `social`, `comments`,
  `config`, `admin`, `common`) mirroring `API_CONTRACT.md` §19.
- `src/clients/axios/` — centralized Axios client with `withCredentials`, the marker header
  interceptor, bearer selection (user token → public token), single-flight refresh-on-401
  retry, and `ApiError`/`normalizeApiError` for error-code normalization.
- `src/clients/google/` — Google Maps key/libraries boundary.

### Stage 2 — Validation layer (done)

- `src/validations/shared.ts` — helpers mirroring §18.1 (`trimmedString`, `passwordString`,
  `optionalText`, `patchText`, `requiredNumber`, `patchNumber`, `optionalInt`,
  `positiveIdParam`, `userIdParam`, `positiveId`, `targetTypeInput`, `idList`, `emailString`).
- `src/validations/params.ts` — route-parameter schemas (§18.7), all `.strict()`.
- Domain schemas in `auth`, `trips`, `points`, `comments`, `social`, `admin` (§18.2–18.6),
  all `.strict()`. Server-generated fields (`pointNumber`, `numberPoint`, `ownerId`, ...)
  are intentionally absent.

### Stage 3 — API layer (done)

- `src/api/{auth,trips,points,comments,social,config,admin}/*` exposing typed operations that
  validate requests via the Zod schemas and call the centralized Axios client.
- Auth endpoints use `skipAuthHeader: true` (no bearer). Multipart uploads use field `file`.
- `DELETE /images/:imageId` is placed in the trips module (day-image counterpart); point
  reorder (`PUT /days/:dayId/points/reorder`) is placed in the points module.

### Stage 4 — Auth hook (done)

- `src/hooks/useAuth.tsx` — `AuthProvider` + `useAuth()` exposing `status`
  (`loading | anonymous | authenticated | accountError`), `user`, `token`, `login`, and
  `logout`. User role/status are resolved from `GET /auth/me` (not decoded from the JWT,
  whose only identity claim is `sub`). Account-status failures (`EMAIL_NOT_VERIFIED`,
  `ACCOUNT_SUSPENDED`, `ACCOUNT_DEACTIVATED`) are kept distinct from anonymous access.
- `src/clients/axios/` token store now persists the access token to localStorage
  (`hacktrip.accessToken`) so a session survives reloads; the refresh token remains an
  HttpOnly cookie and is never touched.

### Stage 5 — Step 1: Next.js application structure (done)

HEAD advanced to `1d045e2` ("define Next.js architecture, SEO and project guidelines"); the
locked docs now mandate Next.js (App Router, RSC, `api/client.ts`, `services/`,
`components/images/`, `lib/images/`, `next/image`). The framework migration therefore starts
from the documented order.

Framework:

- Added `next@^16.3.8` and `@mui/material-nextjs@^9.4.0` (MUI App Router emotion cache).
- Removed `vite` and `@vitejs/plugin-react` (production dependencies of the retired SPA).

New files:

- `next.config.mjs` — `reactStrictMode`, `images.remotePatterns` for the API/GCS hosts.
- `next-env.d.ts`.
- `app/layout.tsx` — root Server Component layout with site-wide `metadata` and `viewport`.
- `app/providers.tsx` — single Client Component boundary (`AppRouterCacheProvider`,
  MUI theme, `CssBaseline`, React Query, `AuthProvider`).
- `app/globals.css` — migrated from the old `src/index.css`.
- `app/(public)/page.tsx` — public home page (Server Component) with its own `metadata`.
- `tsconfig.json` — Next.js configuration (`app`+`src`+`.next/types` include, `@/*` path
  alias, `exclude` for `legacy`). Next.js later enforced `jsx: react-jsx` and added
  `.next/dev/types` automatically.

Changed:

- `package.json` scripts → `next dev` / `next build` / `next start` / `eslint src app`.
- `src/config/index.ts` → reads `NEXT_PUBLIC_*` (referenced literally so Next inlines them).
- `src/clients/axios/index.ts` → access-token store now guards `window` for SSR safety.
- `eslint.config.js` → lints `app` as well, ignores `.next` and `legacy`.
- `.gitignore` → `.next/`, `/out/`, `next-env.d.ts`, `*.tsbuildinfo`, `/legacy`.

Removed / quarantined:

- Deleted the retired Vite/CRA shell: `index.html`, `vite.config.ts`, `src/index.tsx`,
  `src/index.css`, `src/App.tsx`, `src/App.css`, `src/react-app-env.d.ts`, `src/App.test.tsx`,
  `src/setupTests.ts`.
- The legacy SPA tree (`src/components`, `src/model`, `src/services`, `src/shared`,
  `src/utils`, `src/assets`, `src/hooks/LoginContext.tsx`, `src/hooks/UseLoaders.tsx`) was
  **moved to `legacy/`** (temporary, git-ignored). It was provably dead: its only consumers
  were `src/App.tsx` / `src/index.tsx`, now replaced by the App Router. It stays on disk for
  reference and remains recoverable from commit `80cefbf`.

### Stage 5 — Step 2: Routing + structural alignment (done)

Structural alignment:

- Moved the canonical HTTP client to `src/api/client.ts` (was `src/clients/axios/`); all
  `src/api/*` modules and `useAuth` now import from `../client`. Removed `src/clients/`.
- Moved Google Maps init config to `src/lib/maps.ts` (key + libraries).
- `src/hooks/useAuth.tsx` now hydrates the token in a `useEffect` (SSR-safe hydration).
- `src/lib/images/` — `imageUrl.ts`, `thumbnail.ts`, `imageMetadata.ts`, barrel.
- `src/components/layout/` — `Header` (client, auth-aware), `Footer`.
- `src/components/images/` — `AppImage` (next/image, thumbnail vs full, fallback, responsive).
- `src/components/auth/` — `RequireAuth`, `RequireRole` (replace legacy guarded routes).
- `src/components/{common,navigation,forms,maps,trips,points,comments,social,admin}/` and
  `src/services/{auth,trips,points,comments,social,admin}/` scaffolds (empty barrels).

Routing (App Router):

- `app/(public)/layout.tsx` — Header + Footer shell (Server Component).
- Public: `/` (home), `/trips`, `/trips/[id]` (dynamic + `generateMetadata`), `/points/[pointId]`,
  `/not-found` (global 404).
- `app/(auth)/` — `/login`, `/register`, `/verify-email`, `/resend-verification`,
  `/forgot-password`, `/reset-password` (all `robots: noindex`).
- `app/(account)/` — `/profile`, `/my-trips`, `/favorites`, `/trips/create`,
  `/trips/[id]/edit` (guarded by `RequireAuth`).
- `app/(admin)/` — `/admin`, `/admin/users`, `/admin/users/[userId]`,
  `/admin/failed-login-logs`, `/admin/route-not-found-logs`, `/admin/images`
  (guarded by `RequireRole` moderator roles).

No `react-router`, `react-helmet`, `jwt-decode`, `yup`, or inline `fetch` remain in
`src/` + `app/`. The only Axios usage is the single `src/api/client.ts`.

### Stage 5 — Step 3: Public pages + API integration + SEO (done)

Server data flow: `Server Component → src/api/* → src/api/client.ts (axios) → backend`.

- `src/lib/serverApi.ts` — `React.cache()`-deduped `getTrip`/`getPoint` + `isNotFoundError`.
- `src/lib/images/representative.ts` — trip/point representative-image helpers (cover/OG).
- `src/components/common/JsonLd.tsx` — safe JSON-LD script (`<` escaped to `\u003c`).
- `src/components/social/ShareButton.tsx` — Web Share API + clipboard fallback (no react-share).
- `src/components/trips/{TripCard,TripList,TripFilters,TripDetails}.tsx` — presentational
  (Server Components); `TripFilters` is a native GET form (no client JS).
- `src/components/points/PointDetails.tsx`.
- `AppImage` gained a `src` prop for bare URLs (e.g. `coverImage`); all public images go
  through `next/image` (no raw `<img>`).

Public pages (all Server Components unless interactive):

- `/` — hero + recent trips (`GET /trips` limit 6).
- `/trips` — `GET /trips` with search/sort filters (GET form) + server pagination.
- `/trips/[id]` — `GET /trips/:id` (TripDetails) + `generateMetadata` (title/description/
  canonical/OG/Twitter) + JSON-LD `Trip` + `notFound()` on 404/invalid id.
- `/points/[pointId]` — `GET /points/:pointId` + `generateMetadata` + JSON-LD `Place` +
  `notFound()`.

SEO:

- `app/robots.ts` — allows public, disallows auth/account/admin/edit/create.
- `app/sitemap.ts` — `/`, `/trips` + all `/trips/[id]` from real `GET /trips` (points
  omitted: no public point-list endpoint).
- Canonical URLs use `config.siteUrl` via `absoluteUrl()` (no relative canonical).

## 5. Checks

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | 0 errors (legacy excluded; the 2 old `loading` errors went away with the quarantined code). |
| `npm run lint` | 0 errors, 0 warnings across `src` and `app`. |
| `npm run build` (`next build`) | Success (EXIT 0) — 21 static pages + dynamic `/trips` (search), `/trips/[id]`, `/points/[pointId]`, `/trips/[id]/edit`, `/admin/users/[userId]`; plus `/robots.txt`, `/sitemap.xml`. |
| `npm audit` | 1 high (`brace-expansion` via `eslint -> minimatch`), dev-toolchain only. Fix pending (no `--force`). |

## 7. Environment note

`.env` still holds the old `VITE_*` variables. The Next.js app reads `NEXT_PUBLIC_*`
(`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_GOOGLE_KEY`, `NEXT_PUBLIC_SITE_KEY2`,
`NEXT_PUBLIC_SITE_KEY3`, `NEXT_PUBLIC_SITE_URL`); the API base URL falls back to
`https://www.api-hack-trip.com`. Add the `NEXT_PUBLIC_*` values to `.env`/`.env.local` for
local development.

## 8. Remaining

Stage 5 remaining: React Query hooks for client interactive state, authentication pages,
account pages (profile/my-trips/favorites/trip create+edit), admin pages, comments/social
UI, maps/tracking, image upload. (Public pages + public SEO are now done.)

Structural alignment done in Step 2: HTTP client → `src/api/client.ts`, `src/services/`
scaffold, `src/components/{common,layout,navigation,forms,images,maps,trips,points,comments,social,admin,auth}/`,
`src/lib/images/` + `src/lib/maps.ts`.

Still optional (non-blocking cosmetic conformance): flatten `src/constants/*` to the
documented file-per-domain layout and split `src/validations/*` into per-schema files.

Stage 6: remove `yup`, `jwt-decode`, `react-router-dom`, `react-helmet-async`, `react-share`
once no consumers remain; resolve the `brace-expansion` advisory without `--force`; final
checks; delete this progress document.

