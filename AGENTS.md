# HackTrip Frontend — Agent Instructions

## 1. Project Identity

This repository contains the HackTrip frontend application.

The frontend is a production-oriented Next.js application with TypeScript, React, MUI, Axios, Zod and the HackTrip Backend API.

The frontend consumes the backend API contract defined in:

`docs/API_CONTRACT.md`

The backend API contract is authoritative for:

* endpoints
* HTTP methods
* request schemas
* response DTOs
* authentication behavior
* authorization
* error codes
* pagination
* image behavior
* public versus authenticated access
* server-generated fields
* backend-generated ownership

Do not invent API behavior that is not defined by the backend contract.

---

## 2. Core Technology Rules

The application uses:

* Next.js
* React
* TypeScript
* MUI
* Axios
* Zod
* ESLint
* Prettier
* Next.js built-in image optimization

Next.js is the application framework and routing layer.

React components must follow Next.js Server Component / Client Component boundaries.

Server Components are the default.

Use Client Components only when browser-side interactivity or browser APIs are actually required.

Client Components are appropriate for:

* interactive forms
* maps
* live tracking
* browser geolocation
* authentication state requiring client interaction
* likes/favorites
* comments interaction
* image upload UI
* drag-and-drop/reordering
* dialogs
* interactive filters
* components requiring hooks or browser APIs

Do not add `"use client"` merely for convenience.

---

## 3. Backend API Contract

`docs/API_CONTRACT.md` is the single canonical API contract.

Before implementing or changing API integration:

1. Read the relevant section of `docs/API_CONTRACT.md`.
2. Match the documented request schema exactly.
3. Match the documented response DTO exactly.
4. Respect documented authorization requirements.
5. Respect documented public bearer token behavior.
6. Respect documented error codes.
7. Do not send server-generated fields.
8. Do not invent undocumented endpoints, fields or authentication behavior.

Important rules:

* `x-hacktrip-client: web` is required on every API request except CORS `OPTIONS`.
* Public frontend requests use the configured public bearer token where required by the backend contract.
* Missing `Authorization` is not automatically treated as anonymous access.
* Invalid user JWTs are never downgraded to public access.
* Refresh tokens are HttpOnly cookies.
* The frontend never reads or stores the refresh token.
* Requests that depend on the refresh cookie use credentialed requests.
* `credentials: 'include'` must be used with Fetch.
* `withCredentials: true` must be used with Axios.
* `pointNumber` / `numberPoint` are server-generated.
* Ownership fields such as `ownerId` / `userId` must not be supplied when the backend derives them.
* Parent identifiers must follow the backend contract.
* Unknown request fields are rejected by strict backend schemas.

Do not modify `docs/API_CONTRACT.md` as part of ordinary frontend modernization unless the actual backend contract has intentionally changed.

---

## 4. Authentication

Authentication follows the backend contract.

The frontend must distinguish between:

* public/anonymous viewer
* authenticated user
* manager
* admin

Backend authorization is authoritative.

Frontend role checks are UI guards only and must never be treated as security boundaries.

### Access token

The user access token is kept in application memory.

It must not be persisted unnecessarily.

Do not store user access tokens in persistent browser storage unless the backend contract and explicit architecture require it.

### Refresh token

The refresh token is handled exclusively by the browser as an HttpOnly cookie.

Never store refresh tokens in:

* localStorage
* sessionStorage
* IndexedDB
* JavaScript-accessible cookies
* application state

The frontend never reads the refresh token.

Authentication lifecycle:

```text
login
  ↓
access token → memory only
refresh token → HttpOnly cookie
```

After a browser reload:

For a public page opened by an anonymous user, the frontend must not call the refresh-token endpoint merely because the browser was reloaded. The refresh flow is only attempted when the frontend has an authenticated session that requires restoration.

```text
anonymous public page reload
  ↓
no refresh-token request
  ↓
continue as anonymous/public viewer
```

For an authenticated session:

```text
browser reload
  ↓
memory access token is gone
  ↓
POST /auth/refresh
  ↓
browser automatically sends HttpOnly refresh cookie
  ↓
backend validates refresh token
  ↓
new access token
  ↓
access token stored in memory
```

Authentication-related API handling must correctly process:

* `401 UNAUTHORIZED`
* `403 EMAIL_NOT_VERIFIED`
* `403 ACCOUNT_SUSPENDED`
* `403 ACCOUNT_DEACTIVATED`
* `403 FORBIDDEN`

Do not silently convert authentication failures into anonymous access.

---

## 5. Client Identification, Public Access and User Authentication

These concepts must remain separate.

```text
x-hacktrip-client: web
        ↓
identifies the frontend client

Public bearer token
        ↓
identifies/authorizes configured public frontend access

User access JWT
        ↓
identifies the authenticated user

HttpOnly refresh cookie
        ↓
allows session restoration
```

Do not confuse:

* frontend client identification
* public bearer access
* authenticated user access
* refresh-token session restoration

The exact behavior is defined by `docs/API_CONTRACT.md`.

---

## 6. API Layer

All HackTrip Backend API communication must go through the centralized API layer. Components and pages must not call Axios directly or construct arbitrary backend URLs.

The transport path is:

```text
Feature API
    ↓
api/client.ts
    ↓
Axios
    ↓
HackTrip Backend
```

A Server Component may call a feature API directly for server-side data loading. An interactive Client Component normally uses a feature hook when it needs React Query, mutations, cache invalidation, or reusable client-side lifecycle state:

```text
Client Component
       ↓
Feature Hook
       ↓
Feature API
       ↓
api/client.ts
       ↓
Axios
       ↓
HackTrip Backend
```

A service is an optional application-orchestration layer, not a mandatory pass-through layer:

```text
Component / Page
       ↓
Feature Hook or Service (only when useful)
       ↓
Feature API
       ↓
api/client.ts
       ↓
Axios
       ↓
HackTrip Backend
```

### Responsibilities

**`src/api/client.ts`** owns common HTTP transport behavior: backend base URL, common headers and `x-hacktrip-client`, authentication and credential handling, refresh behavior, shared request/response behavior, and transport-level payload normalization.

**Feature API modules** own endpoint-specific HTTP operations and request/response typing. They use the centralized client and follow `docs/API_CONTRACT.md`. They must not contain React hooks, component state, presentation logic, or UI notifications.

**Feature hooks** under `src/hooks/` or a feature-local hooks directory coordinate React Query queries/mutations, cache keys and invalidation, loading/error state, client lifecycle, and calls to one or more feature API operations. Do not create hooks that only rename one API call without adding a useful React-facing contract.

**Services** are introduced only when there is meaningful application-level orchestration, such as coordinating multiple API operations, applying application-specific transformations, or implementing a workflow shared by multiple UI entry points.

Services must not wrap every API method, duplicate Axios configuration, contain presentation logic, or replace React Query for server-state caching.

A direct Feature Hook → Feature API or Server Component → Feature API path is valid when no orchestration is needed.

Google Maps and other external browser SDK integrations remain outside the HackTrip Backend API layer.
## 7. Google Maps Boundary

Google Maps is a separate frontend/browser integration.

It is not part of the HackTrip Backend API layer.

The architecture is:

```text
                 FRONTEND
                    │
        ┌───────────┴───────────┐
        ↓                       ↓
   HackTrip API            Google Maps
        │                       │
   api/client.ts          Google Maps SDK
        │                       │
     Axios                 Map components
        │
     Backend
```

Do not route Google Maps SDK operations through the HackTrip Axios API layer unless the backend explicitly provides a corresponding endpoint.

Maps may use:

* browser APIs
* geolocation
* map state
* markers
* polylines
* live tracking
* map interaction

Keep Maps isolated behind Client Component boundaries.

---

## 8. Zod Validation

Zod is the frontend validation standard.

Validation schemas live under:

```text
src/validations/
├── auth/
├── trips/
├── points/
├── comments/
├── social/
├── admin/
└── shared/
```

Schemas are organized by feature.

Use Zod for:

* form validation
* request validation where appropriate
* query parameter parsing
* route parameter validation
* response validation where runtime guarantees are required

Frontend validation improves UX.

Backend validation remains authoritative.

Do not duplicate unrelated business rules across multiple schemas.

---

## 9. Constants

All reusable application constants belong under:

```text
src/constants/
```

Constants are organized by responsibility.

The current architecture uses responsibility-based directories such as:

```text
src/constants/
├── images/
├── maps/
├── points/
├── trips/
├── ui/
└── ...
```

Do not recreate the old flat structure of unrelated files such as a single `images.ts`, `trips.ts`, `points.ts`, etc. merely because older documentation used that structure.

Before creating or moving a constant, inspect the existing `src/constants/` structure and place it in the responsibility area that already owns that kind of value.

Do not scatter magic strings or numeric limits throughout components.

Constants must not contain secrets.

Environment-specific values belong in environment configuration.

Do not move frontend constants into the backend as part of the current modernization work.

A future backend-driven configuration architecture is a separate concern.

---

## 10. Types

TypeScript types are organized by feature.

Typical areas include:

```text
src/types/
├── auth/
├── trips/
├── points/
├── comments/
├── social/
├── admin/
├── config/
├── images/
└── api/
```

Do not use `any` to bypass API typing.

Distinguish where necessary between:

* request types
* response DTOs
* UI models
* form models

Do not expose database models directly in the frontend unless they are actually part of the API response contract.

---

## 11. Images

Images are a first-class part of HackTrip.

Use the existing centralized image architecture.

Do not recreate the old image utility structure documented in previous versions of the project.

In particular, do not introduce or reference removed files such as:

```text
lib/images/imageUrl.ts
lib/images/imageMetadata.ts
```

Image presets belong to the existing constants architecture, including:

```text
src/constants/images/presets.ts
```

Use the existing shared image components and utilities rather than implementing independent image URL, thumbnail or sizing logic inside individual pages.

`next/image` is preferred for displayed images.

The backend contract determines the actual image URL and thumbnail URL.

Do not reconstruct backend storage paths manually in random components.

The frontend must respect the backend limits for:

* maximum image count
* maximum file size
* supported formats

Client-side validation is for UX only. Backend validation remains authoritative.

---

## 12. SEO

Public HackTrip content is SEO-sensitive.

Public pages should use Next.js capabilities rather than relying on client-only rendering.

SEO applies particularly to:

* public trip pages
* public point pages
* informational pages
* About
* Privacy Policy
* other public content

Use Next.js metadata APIs.

Where applicable provide:

* title
* description
* canonical URL
* Open Graph metadata
* Open Graph image
* Twitter/X metadata
* robots directives
* appropriate structured metadata

Do not expose private user/account information through metadata.

---

## 13. Routing

Application routes live in the Next.js App Router.

Use route groups and nested layouts where they improve organization.

Keep public content routes separate from authenticated application areas.

Actual routes must remain consistent with the established application structure.

Do not invent routes solely to match backend controller names.

---

## 14. Data Fetching

Public content should use Server Components and server-side fetching where practical.

Use SSR/ISR/revalidation where appropriate.

Do not turn the entire application into a Client Component merely to fetch data.

Interactive mutations may use Client Components.

Keep server data and browser interaction separate.

Avoid duplicate requests caused by unnecessary client-side refetching.

---

## 15. Maps and Tracking

Maps are client-side functionality.

Keep map implementation isolated behind Client Component boundaries.

Live tracking follows:

```text
GPS / browser
      ↓
tracking hook
      ↓
tracking state
      ↓
map component
```

Tracking must not force the complete Trip page into Client Component mode.

---

## 16. Forms

Forms use:

* React Hook Form for form state where appropriate
* Zod and centralized feature validation schemas
* feature hooks for React Query mutations and client-side lifecycle
* feature API modules for endpoint-specific HTTP operations
* services only when a form workflow requires meaningful multi-operation orchestration

A service is not required merely because a form submits data.

Forms must display backend validation and authorization errors using documented error semantics, distinguish field validation from general submission errors, prevent duplicate submissions while pending, avoid duplicating request payload construction across unrelated components, submit only fields accepted by the backend contract, and preserve existing behavior during modernization.

Never assume a successful HTTP request means every submitted field was accepted.

Do not send:

* unknown fields
* server-generated fields
* ownership fields derived by the backend
## 17. Error Handling

Preserve backend error semantics.

Do not replace all backend errors with one generic message.

Known backend error codes should be handled appropriately.

Unexpected errors may be logged where appropriate, but never expose:

* backend stack traces
* internal infrastructure details
* secrets
* sensitive request data

`500 INTERNAL_SERVER_ERROR` must never expose backend internals.

When auditing logs or error handling, ensure tokens, cookies, passwords, request bodies and sensitive query data are not leaked.

---

## 18. Security

Never place secrets in client-side code.

Never expose:

* JWT signing secrets
* SMTP credentials
* database credentials
* cloud credentials
* private API keys

Treat every value available to browser JavaScript as public.

Do not trust client-side role or ownership state for authorization.

Do not use unsafe HTML rendering unless explicitly trusted and sanitized.

---

## 19. Accessibility

UI components must provide:

* semantic HTML
* keyboard accessibility
* visible focus
* meaningful labels
* accessible form errors
* appropriate alt text
* accessible dialogs
* accessible buttons and controls

Interactive functionality must remain usable with supported input methods.

---

## 20. Legacy Migration Rule

### Frontend modernization is a migration, not a redesign.

The purpose of the current modernization work is to move the existing HackTrip frontend onto the target architecture **without losing existing functionality**.

Do not remove existing behavior merely because it is not present in the new UI.

Before removing or replacing an existing component, hook, utility or interaction:

```text
Legacy behavior
      ↓
Inspect current implementation
      ↓
Identify existing functionality
      ↓
Compare with new implementation
      ↓
Migrate missing behavior
      ↓
Verify equivalent behavior
      ↓
Only then remove obsolete code
```

Existing functionality includes more than visible UI.

The migration must preserve, where applicable:

* click behavior
* mouse interactions
* hover behavior
* touch interactions
* swipe gestures
* keyboard interactions
* mobile-specific behavior
* tablet-specific behavior
* desktop-specific behavior
* responsive behavior
* device/input-specific behavior
* image interactions
* map interactions
* drag/drop behavior
* animations when they are part of functional behavior
* existing navigation behavior
* existing loading/error behavior

Do not assume that behavior is obsolete simply because it is not represented in the replacement component.

When uncertain, inspect the legacy implementation before removing anything.

---

## 21. Comments

Do not add comments that merely restate what the code already says.

Avoid comments such as:

```ts
// Get user
const user = ...
```

or:

```ts
// Image preset configuration
export const IMAGE_PRESETS = ...
```

when the code is already self-explanatory.

Comments should explain non-obvious reasons, such as:

* architectural constraints
* security requirements
* backend contract requirements
* compatibility requirements
* browser behavior
* migration decisions
* workarounds
* non-obvious assumptions

Good comment:

```ts
// Backend requires this request to use the web client marker.
```

Only add comments when they provide information that cannot be understood directly from the code.

---

## Icon Centralization Rule

All application icons must be exported through the central icon registry:

`src/constants/icons.ts`

Components import icons through the existing alias:

`@/constants/icons`

Rules:

* Components must not import icons directly from icon libraries such as `@mui/icons-material/*`.
* Give each exported icon a stable, semantic name based on its purpose.
* The registry maps semantic names to actual library icons; consumers should not need to change when an icon implementation changes.
* Add new icon exports to the registry before using them in components.
* Reuse an existing semantic export when the same purpose is already represented.
* Keep icon-library implementation details inside the registry.
* Do not move the registry without updating all consumers and this document in the same change.

The current registry is a single file, `src/constants/icons.ts`. The directory-style path `src/constants/icons/index.ts` is not the current repository structure and must not be referenced as if it already exists.

---
## 22. UI Architecture

MUI is the primary UI component system.

Components should have a clear responsibility:

* generic UI components own presentation and reusable interaction patterns
* feature components compose feature UI and feature behavior
* feature hooks own reusable React-facing state and server-state coordination
* API modules own backend HTTP operations
* services own only meaningful application-level orchestration

Avoid feature-specific business logic inside generic UI components and API calls directly from presentational components.

Do not redesign existing UI behavior as part of architectural migration unless the task explicitly requires a UX change.

### Design system and styling rules

The target design-system ownership is:

```text
src/constants/ui/
    design tokens and shared UI constants

src/theme/
    MUI theme creation, palette, typography, shape and component overrides

app/providers.tsx
    provider composition and application-level provider wiring
```

The current implementation may still define the MUI theme in `app/providers.tsx`. Moving theme construction into `src/theme/` is a planned implementation step, not a claim about the current code.

Rules:

* Reusable colors, typography values, spacing decisions, radii, shadows and breakpoints must have a clear central owner.
* MUI palette, typography, shape and reusable component defaults belong in the MUI theme.
* Shared non-theme UI constants and layout presets belong under `src/constants/ui/`.
* Global CSS is reserved for document-level styles, resets, font declarations, CSS variables and behavior that cannot reasonably be expressed through MUI.
* Component-local `sx` is appropriate for one-off layout or state-dependent styling; do not use it to introduce repeated palette values or duplicate design tokens.
* Do not create a global style abstraction for a one-off style. Extract a shared pattern when it is used repeatedly and has the same visual or behavioral meaning.
* Use MUI theme breakpoints for MUI responsive styles. Use CSS media/container queries when they are the correct tool, while keeping breakpoint values consistent with the responsive system.
* Preserve existing visual behavior while centralizing styles; theme work must not become an unrequested redesign.

### Reusable component rules

Extract shared components or patterns when multiple call sites have the same semantics and behavior.

Prefer small, composable building blocks for repeated form fields/actions, cards and content surfaces, dialogs and confirmation flows, icon buttons/action groups, and loading/empty/error states.

Do not merge components solely because their markup looks similar when their domain behavior or accessibility semantics differ. Avoid universal components with many feature-specific flags.
## 23. Code Organization

The frontend follows feature-oriented organization.

The major responsibilities are:

```text
app/              Next.js routes and page composition
components/       reusable UI
api/              HTTP/API endpoint clients
services/         optional application orchestration when a workflow needs it
hooks/            reusable React hooks
validations/      Zod schemas
types/            TypeScript models
constants/        centralized constants
lib/              framework-independent utilities
config/            application configuration
```

Do not create random top-level folders without an architectural reason.

---

## 24. Dependency Management

Do not add a package merely because it is convenient.

Before adding a dependency:

1. Check whether existing project dependencies already provide the capability.
2. Check whether the functionality can be implemented cleanly without a dependency.
3. Check compatibility and maintenance.
4. Avoid duplicate libraries solving the same problem.

Do not introduce duplicate HTTP clients, validation libraries or state-management libraries without an explicit architectural reason.

---

## 25. Existing Backend Architecture

The frontend does not modify backend architecture.

Backend remains independent:

```text
Frontend
    ↓
Nginx
    ↓
Express
    ↓
Middleware
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma
    ↓
MySQL
```

The frontend consumes this architecture only through the documented API contract.

---

## 26. Documentation Rules

`AGENTS.md` describes frontend engineering rules.

`docs/ARCHITECTURE.md` describes frontend architecture.

`docs/API_CONTRACT.md` describes the backend API contract.

Do not duplicate the complete API contract into frontend documentation.

Do not create another API contract document.

Do not change `docs/API_CONTRACT.md` merely to document frontend architecture.

---

## 27. Development Rules

Before modifying code:

1. Inspect the existing implementation.
2. Inspect related legacy implementation when migrating functionality.
3. Read the relevant architecture documentation.
4. Read the relevant section of `docs/API_CONTRACT.md` for API work.
5. Reuse existing utilities and patterns.
6. Avoid unnecessary rewrites.
7. Preserve existing behavior.

After modifying code:

1. Run TypeScript checks.
2. Run linting.
3. Run relevant tests.
4. Inspect changed files.
5. Verify imports and routes.
6. Verify API contract compatibility.
7. Verify that existing functionality has not disappeared.

Do not claim a migration task is complete without checking the relevant legacy behavior.

---

## 28. Git Rules

Do not:

* reset unrelated user changes
* overwrite uncommitted work
* force-push
* modify unrelated files
* create unnecessary commits

Commit messages should clearly describe the actual change.

Never commit secrets or environment files containing secrets.

---

## 29. Final Principle

HackTrip is an established production application being modernized incrementally.

Prefer:

* consistency
* explicit boundaries
* typed contracts
* reusable components
* centralized configuration
* secure authentication
* SEO-friendly public content
* optimized images
* maintainability
* minimal duplication
* preservation of existing behavior

Modernize the architecture without silently deleting functionality.
