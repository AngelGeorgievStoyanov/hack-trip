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

Do not invent API behavior that is not defined by the backend contract.

---

# 2. Core Technology Rules

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

Use Client Components only when browser-side interactivity or browser APIs are required.

Prefer Server Components for:

* public page rendering
* SEO metadata
* static or ISR content
* server-side API reads
* layouts
* content that does not require browser state

Use Client Components for:

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

Do not add `"use client"` to a component unless it is actually required.

---

# 3. Backend API Contract

`docs/API_CONTRACT.md` is the single canonical API contract.

Before implementing or changing API integration:

1. Read the relevant section of `docs/API_CONTRACT.md`.
2. Match the documented request schema exactly.
3. Match the documented response DTO exactly.
4. Respect the documented authorization requirements.
5. Respect the documented public bearer token behavior.
6. Respect the documented error codes.
7. Do not send server-generated fields.

Important rules:

* `x-hacktrip-client: web` is required on every API request except CORS `OPTIONS`.
* Public frontend requests use the configured public bearer token.
* Missing `Authorization` is not treated as anonymous.
* Invalid user JWTs are never downgraded to public access.
* Refresh tokens are HttpOnly cookies.
* The frontend never reads or stores the refresh token.
* Requests that depend on the refresh cookie use credentialed requests.
* `credentials: 'include'` must be used with Fetch.
* `withCredentials: true` must be used with Axios.
* `pointNumber` / `numberPoint` are server-generated.
* Ownership fields such as `ownerId` / `userId` must not be supplied by the frontend when the backend derives them.
* Parent identifiers must follow the backend contract.
* Unknown request fields are rejected by the backend because request schemas are strict.

---

# 4. Authentication

Authentication is implemented according to the backend contract.

The frontend must distinguish between:

* public/anonymous viewer
* authenticated user
* manager
* admin

The frontend must never determine authorization from UI state alone.

Backend authorization is authoritative.

The frontend may hide or show controls according to the authenticated role, but every protected operation must still be authorized by the backend.

Do not store refresh tokens in:

* localStorage
* sessionStorage
* IndexedDB
* JavaScript-accessible cookies
* application state

The refresh token is handled exclusively by the browser as an HttpOnly cookie.

Access tokens must not be persisted unnecessarily.

Authentication-related API handling must correctly process:

* `401 UNAUTHORIZED`
* `403 EMAIL_NOT_VERIFIED`
* `403 ACCOUNT_SUSPENDED`
* `403 ACCOUNT_DEACTIVATED`
* `403 FORBIDDEN`

Do not silently convert authentication errors into anonymous access.

---

# 5. API Client

All API communication must go through the centralized API layer.

Do not scatter raw Axios calls throughout pages and components.

Recommended responsibility separation:

```text
src/
├── api/
│   ├── client.ts
│   ├── auth/
│   ├── trips/
│   ├── points/
│   ├── comments/
│   ├── social/
│   ├── admin/
│   └── config/
├── services/
│   ├── auth/
│   ├── trips/
│   ├── points/
│   ├── comments/
│   ├── social/
│   └── admin/
```

The API client is responsible for common request behavior.

Feature API modules are responsible for endpoint-specific calls.

Services contain application-level orchestration and should not duplicate HTTP configuration.

---

# 6. Zod Validation

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

Do not create one giant validation file.

Frontend schemas must reflect the backend contract.

Use Zod for:

* form validation
* request validation where appropriate
* query parameter parsing
* route parameter validation
* response validation where the application requires runtime guarantees

Do not duplicate business rules in multiple unrelated schemas.

Shared primitives belong in:

```text
src/validations/shared/
```

Feature-specific schemas stay inside their feature directory.

---

# 7. Constants

All reusable application constants belong under:

```text
src/constants/
```

Organize constants by responsibility:

```text
src/constants/
├── api.ts
├── auth.ts
├── routes.ts
├── images.ts
├── trips.ts
├── points.ts
├── comments.ts
├── social.ts
├── admin.ts
├── config.ts
├── ui.ts
└── index.ts
```

Do not scatter magic strings or numeric limits throughout components.

Examples:

* API paths
* route names
* role names
* image limits
* image dimensions
* pagination defaults
* query parameter names
* target types
* service configuration keys
* UI configuration values

Constants must not contain secrets.

Environment-specific values belong in environment configuration.

---

# 8. Types

TypeScript types are organized by feature:

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

Backend DTOs must be represented explicitly.

Do not expose database models directly in the frontend type system unless they are actually part of the API response.

Distinguish where necessary between:

* request types
* response DTOs
* UI models
* form models

---

# 9. Images

Images are a first-class part of HackTrip.

The application uses a centralized image architecture.

Do not implement independent image URL/thumbnail logic inside individual pages.

Use a shared image component and shared image utilities.

Recommended structure:

```text
src/
├── components/
│   └── images/
│       ├── AppImage.tsx
│       ├── ImageGallery.tsx
│       ├── ImageThumbnail.tsx
│       ├── ImagePreview.tsx
│       └── ImageUpload.tsx
├── lib/
│   └── images/
│       ├── imageUrl.ts
│       ├── thumbnail.ts
│       └── imageMetadata.ts
```

`next/image` must be preferred for displayed images.

The backend contract determines the actual image URL and thumbnail URL.

Do not reconstruct backend storage paths manually in random components.

Images must support:

* responsive rendering
* thumbnails
* lazy loading where appropriate
* correct aspect ratio
* `sizes`
* meaningful `alt`
* priority loading for important above-the-fold images
* gallery display
* preview
* social sharing images
* SEO images

For trip pages, point pages and galleries:

* use thumbnails for lists and previews when appropriate
* use full images when the user needs the original display quality
* do not load full-size images unnecessarily in lists
* do not download all gallery images eagerly
* use responsive image sizing

The frontend must respect the backend limit of:

* maximum 9 images per day/point
* maximum 25 MB per uploaded file
* supported backend image formats

Do not duplicate backend validation as a security boundary. Client validation improves UX; backend validation remains authoritative.

---

# 10. SEO

Public HackTrip content is SEO-sensitive.

Public pages must be implemented using Next.js capabilities rather than relying on client-only rendering.

SEO applies particularly to:

* public trip pages
* public day pages where routable
* public point pages where routable
* informational pages
* About
* Privacy Policy
* other public content pages

Use Next.js metadata APIs.

Public pages should provide, where applicable:

* title
* description
* canonical URL
* Open Graph metadata
* Open Graph image
* Twitter/X metadata
* robots directives
* appropriate structured metadata

Trip and point sharing must generate meaningful previews.

A shared HackTrip trip should expose:

* page title
* description
* URL
* representative image

A shared point should expose:

* point title
* description
* representative image
* canonical URL

Use the actual backend image URL or configured public image URL mechanism.

Do not expose private user/account information through metadata.

---

# 11. Search Engine Indexing

Public content that is intended to be discoverable by search engines must be server-rendered or statically/ISR rendered by Next.js.

Use:

* `sitemap`
* `robots`
* canonical URLs
* metadata
* Open Graph
* appropriate HTTP status codes
* stable public URLs

Do not index:

* login
* registration
* password reset
* account pages
* admin pages
* private dashboards
* private management interfaces
* pages whose content is not intended to be public

SEO behavior must not expose authenticated/private data.

Avoid duplicate URLs for the same canonical content.

---

# 12. Sharing

HackTrip content is designed to be shareable.

Public Trip and Point URLs must work when opened directly.

A shared URL must not depend on previous frontend navigation state.

A user opening a shared Trip URL from:

* Facebook
* Messenger
* WhatsApp
* Telegram
* X
* Google
* another browser
* a mobile device

must receive a valid public page.

Social previews should use:

* title
* description
* representative image
* canonical URL

Sharing must work without requiring an authenticated user when the content itself is public.

---

# 13. Routing

Application routes live in the Next.js App Router.

Use route groups and nested layouts where they improve organization.

Keep public content routes separate from authenticated application areas.

A typical structure may contain:

```text
app/
├── (public)/
│   ├── page.tsx
│   ├── about/
│   ├── privacy-policy/
│   ├── trips/
│   │   └── [tripId]/
│   └── points/
│       └── [pointId]/
├── (auth)/
│   ├── login/
│   ├── register/
│   ├── verify-email/
│   ├── forgot-password/
│   └── reset-password/
├── (account)/
│   ├── profile/
│   └── ...
└── (admin)/
    └── admin/
```

Actual routes must remain consistent with the application's established routing constants and backend contract.

---

# 14. Data Fetching

Public content should use server-side fetching where practical.

Use ISR/revalidation for public content where appropriate.

Do not turn the entire application into a Client Component merely to fetch data.

Interactive mutations may use Client Components.

Keep server data and browser interaction separate.

Avoid duplicate requests caused by unnecessary client-side refetching after server rendering.

---

# 15. Maps and Tracking

Maps are client-side functionality.

Map components may use:

* browser APIs
* GPS/geolocation
* live position
* map interaction
* route polylines
* POI markers

Maps must not force unrelated page content into Client Components.

Keep the map implementation isolated behind a Client Component boundary.

---

# 16. Forms

Forms use:

* React
* Zod
* controlled/uncontrolled form strategy appropriate to the component
* centralized validation schemas
* API services

Forms must display backend validation and authorization errors correctly.

Never assume a successful HTTP request means that the backend accepted every field.

Do not send unknown fields.

Do not send server-generated fields.

---

# 17. Error Handling

The frontend must preserve backend error semantics.

Do not replace all backend errors with a generic message.

Display appropriate user-facing messages for known codes.

For unexpected errors:

* log useful diagnostic information where appropriate
* do not expose internal backend details
* provide a safe user-facing message

`500 INTERNAL_SERVER_ERROR` must never expose backend stack traces or infrastructure details.

---

# 18. Security

Never place secrets in client-side code.

Never expose:

* JWT signing secrets
* SMTP credentials
* database credentials
* cloud credentials
* private API keys

Public frontend configuration is not secret merely because it comes from an environment variable.

Treat every value available to browser JavaScript as public.

Do not trust client-side role checks for authorization.

Do not store refresh tokens in JavaScript-accessible storage.

Do not use unsafe HTML rendering unless the content is explicitly trusted and sanitized.

---

# 19. Accessibility

UI components must provide:

* semantic HTML
* keyboard accessibility
* visible focus
* meaningful labels
* accessible form errors
* appropriate alt text
* accessible dialogs
* accessible buttons and controls

Do not use images as the only source of important information.

---

# 20. Performance

Prioritize:

* Server Components for static/read-heavy content
* Next.js image optimization
* thumbnails
* responsive images
* lazy loading
* code splitting
* dynamic imports for heavy interactive components
* avoiding unnecessary client JavaScript
* avoiding duplicate API calls
* caching/revalidation for public content

Maps and other heavy browser-only dependencies should be loaded only where needed.

---

# 21. UI Architecture

MUI is the primary UI component system.

Shared UI components belong under:

```text
src/components/
├── common/
├── layout/
├── navigation/
├── forms/
├── images/
├── maps/
├── trips/
├── points/
├── comments/
├── social/
└── admin/
```

Components should have a single clear responsibility.

Avoid feature logic inside generic UI components.

Avoid API calls directly from presentational components.

---

# 22. Code Organization

The frontend follows feature-oriented organization.

Preferred separation:

```text
app/              Next.js routes and page composition
components/       reusable UI
api/              HTTP/API endpoint clients
services/         application orchestration
hooks/            reusable React hooks
validations/      Zod schemas
types/            TypeScript models
constants/        centralized constants
lib/              framework-independent utilities
config/            application configuration
```

Do not create random top-level folders without an architectural reason.

---

# 23. Dependency Management

Do not add a package merely because it is convenient.

Before adding a dependency:

1. Check whether Next.js, React, MUI or an existing utility already provides the capability.
2. Check whether the functionality can be implemented cleanly without a dependency.
3. Check package maintenance and compatibility.
4. Avoid duplicate libraries solving the same problem.

Do not introduce:

* Yup when Zod is the validation standard.
* Helmet as a replacement for backend security middleware.
* duplicate HTTP clients.
* duplicate state-management libraries.
* unnecessary image libraries when `next/image` is sufficient.

Backend dependencies and frontend dependencies are separate concerns.

---

# 24. Existing Backend Architecture

The frontend does not modify backend architecture.

Backend remains:

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

The frontend must consume this architecture through the documented API contract.

---

# 25. Documentation Rules

`AGENTS.md` describes engineering rules.

`ARCHITECTURE.md` describes the frontend architecture.

`docs/API_CONTRACT.md` describes the backend API contract.

Do not duplicate the complete API contract into frontend documentation.

Do not modify these architectural documents casually.

Changes to architecture must be deliberate and reflected in the appropriate documentation.

---

# 26. Development Rules

Before modifying code:

* inspect existing implementation
* follow established architecture
* reuse existing utilities
* avoid unnecessary rewrites
* preserve working behavior
* keep changes focused

After modifying code:

* run TypeScript checks
* run linting
* run relevant tests
* inspect changed files
* verify imports and routes
* verify API contract compatibility

Do not claim a task is complete without verifying the relevant code.

---

# 27. Git Rules

Do not:

* reset unrelated user changes
* overwrite uncommitted work
* force-push
* modify unrelated files
* create unnecessary commits

Commit messages should clearly describe the actual change.

Never commit secrets or environment files containing secrets.

---

# 28. Final Principle

HackTrip is treated as an established production application.

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

Do not introduce architectural shortcuts that make future API, SEO, image, authentication or UI work harder.
