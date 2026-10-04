# HackTrip Frontend Architecture

## 1. Architecture Overview

HackTrip uses Next.js as the frontend application framework.

The application combines:

* Next.js App Router
* React Server Components
* React Client Components
* TypeScript
* MUI
* Axios
* Zod
* centralized constants
* feature-oriented modules
* Next.js image optimization
* server-rendered public content
* client-side interactive application areas

The backend remains an independent service.

The frontend has two separate external boundaries:

```text
                    ┌──────────────────────┐
                    │      Browser         │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐        ┌─────────────────┐
        │   HackTrip API  │        │   Google Maps   │
        │                 │        │      SDK        │
        └────────┬────────┘        └────────┬────────┘
                 │                          │
              Axios                   browser/map APIs
                 │
                 ▼
        ┌─────────────────┐
        │ HackTrip Backend│
        └─────────────────┘
```

Google Maps is not part of the HackTrip Backend API layer.

The backend API contract is defined by:

`docs/API_CONTRACT.md`

---

## 2. Application Layers

The frontend is divided into clear responsibilities.

```text
app/
    ↓
components/
    ↓
hooks/
    ↓
services/
    ↓
feature API
    ↓
api/client.ts
    ↓
Axios
    ↓
HackTrip Backend
```

Supporting layers:

```text
validations/
types/
constants/
config/
lib/
```

The purpose of each layer is explicit.

---

## 3. Next.js App Router

Next.js App Router owns application routing.

Routes are organized by user-facing responsibility rather than backend controller names.

Typical application areas include:

```text
app/
├── (public)/
├── (auth)/
├── (account)/
└── (admin)/
```

Dynamic routes represent public content that can be directly opened and shared.

Route structure must follow the actual application and must not be changed merely to mirror backend endpoint names.

---

## 4. Server Components and Client Components

Server Components are the default.

Use Server Components for:

* public trip pages
* public point pages
* informational pages
* SEO metadata
* server-side data retrieval
* layouts
* static content
* ISR content

Use Client Components only for functionality requiring:

* browser APIs
* hooks
* event-driven interaction
* maps
* geolocation
* live tracking
* interactive galleries
* uploads
* drag/drop
* dialogs
* client-side form interaction
* browser-only libraries

Example:

```text
TripPage (Server)
├── TripHeader
├── TripMetadata
├── TripGallery
├── TripDescription
├── TripMap (Client)
├── TripPoints
└── TripSocialActions (Client)
```

Do not make the complete Trip page a Client Component because one child requires client-side JavaScript.

---

## 5. Public Content Architecture

Public HackTrip content is designed to be:

* directly accessible
* server-rendered
* indexable where appropriate
* shareable
* mobile-friendly
* optimized for social previews

A user opening a shared public URL directly must receive the public page without depending on previous browser navigation state.

---

## 6. SEO Architecture

SEO is implemented through Next.js metadata APIs.

Public content may expose:

```text
title
description
canonical
robots
openGraph
twitter
```

Dynamic content uses metadata derived from the public API response.

Metadata must never expose private user/account information.

---

## 7. Search Engine Indexing

The application provides the technical infrastructure required for indexing public content.

Typical infrastructure includes:

```text
app/
├── robots.ts
└── sitemap.ts
```

Only intentionally public/indexable URLs belong in the sitemap.

Private pages such as authentication, account and admin pages must not be indexed.

---

## 8. Social Sharing

Public content has stable canonical URLs.

Sharing is based on public routes rather than client navigation state.

Public metadata should provide:

```text
og:title
og:description
og:url
og:image
twitter:title
twitter:description
twitter:image
```

The representative image must use the established public image mechanism.

---

## 9. Image Architecture

Images are centralized.

Use the existing shared image components and utilities.

The image architecture must reflect the current project structure.

Image presets are maintained under the existing constants structure, including:

```text
src/constants/images/presets.ts
```

Do not reintroduce removed legacy files such as:

```text
lib/images/imageUrl.ts
lib/images/imageMetadata.ts
```

Do not duplicate image URL or thumbnail logic inside individual pages.

The backend API provides image DTOs and the backend contract defines the image behavior.

The frontend consumes the values provided by the API.

---

## 10. `next/image`

`next/image` is the default rendering mechanism for application images.

It provides:

* responsive images
* optimized loading
* width/height handling
* lazy loading
* priority loading
* appropriate `sizes`

The shared image layer owns common image presentation behavior.

Individual pages should not repeatedly implement image URL construction, thumbnail selection or responsive sizing logic.

---

## 11. Thumbnail Strategy

Use thumbnails for:

* trip lists
* point lists
* gallery previews
* cards
* compact UI
* secondary content

Use full images when the user explicitly needs larger display quality.

Avoid downloading full-size images unnecessarily in lists.

---

## 12. Responsive Image Strategy

Images use responsive sizing appropriate to their actual layout.

The exact `sizes` value belongs to the component/layout that renders the image rather than one universal hard-coded value.

---

## 13. Image Accessibility

Meaningful content images require meaningful `alt` text.

Decorative images use appropriate empty alt behavior.

Interactive galleries and previews must provide accessible controls and keyboard support where applicable.

---

## 14. Image Upload Architecture

Uploads are interactive Client Components.

```text
ImageUpload
    ↓
client validation
    ↓
Service
    ↓
Feature API
    ↓
api/client.ts
    ↓
Axios
    ↓
Backend
```

Client validation improves UX.

Backend validation remains authoritative.

The frontend respects the backend contract for:

* maximum file size
* supported file types
* maximum image count

---

## 15. API Architecture

All HackTrip Backend communication goes through the API layer.

```text
src/api/
├── client.ts
├── auth/
├── trips/
├── points/
├── comments/
├── social/
├── admin/
└── config/
```

`client.ts` owns shared HTTP behavior.

Feature API modules own endpoint-specific operations.

The intended flow is:

```text
Page / Component
       ↓
Service
       ↓
Feature API
       ↓
api/client.ts
       ↓
Axios
       ↓
HackTrip Backend
```

Pages and components must not construct arbitrary API URLs.

Pages and components must not make raw Axios calls directly.

---

## 16. Services Layer

Services contain application-level orchestration.

```text
src/services/
├── auth/
├── trips/
├── points/
├── comments/
├── social/
└── admin/
```

A service may coordinate multiple API operations.

Example:

```text
Trip Service
    ↓
Trip API
    ↓
Point API
```

Services prevent UI components from becoming business-logic containers.

Services do not own generic HTTP transport configuration.

---

## 17. Authentication Architecture

Authentication follows the backend contract.

```text
login
  ↓
access token → memory only
refresh token → HttpOnly cookie
```

The refresh token is never readable by JavaScript.

Requests requiring the refresh cookie use:

```text
Axios:
withCredentials: true

Fetch:
credentials: 'include'
```

After a browser reload:

```text
memory access token gone
        ↓
POST /auth/refresh
        ↓
browser sends HttpOnly cookie
        ↓
backend validates refresh token
        ↓
new access token
        ↓
memory
```

The frontend never stores the refresh token itself.

---

## 18. Authentication Boundaries

Three different concepts must remain separate:

```text
x-hacktrip-client: web
        ↓
frontend client identification


Public bearer token
        ↓
public frontend access where required


User access JWT
        ↓
authenticated user


HttpOnly refresh cookie
        ↓
session restoration
```

These concepts are not interchangeable.

The exact behavior is defined by `docs/API_CONTRACT.md`.

---

## 19. Zod Architecture

Validation is feature-oriented.

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

Frontend schemas reflect the backend contract but do not replace backend validation.

---

## 20. Constants Architecture

Constants are organized by responsibility.

The current structure uses areas such as:

```text
src/constants/
├── images/
├── maps/
├── points/
├── trips/
├── ui/
└── ...
```

Do not document or recreate the old flat structure as the target architecture.

Constants should remain close to the responsibility they configure.

Examples include:

```text
images/
    image presets and image-related constants

maps/
    map-related constants

points/
    point-related constants

trips/
    trip-related constants

ui/
    shared UI constants
```

Do not introduce a new constants architecture as part of ordinary migration.

Do not move frontend constants into backend configuration during the current modernization stage.

Backend-driven configuration is a separate future concern.

---

## 21. Type Architecture

Types are organized by feature.

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

Where useful:

```text
API DTO
    ↓
service transformation
    ↓
UI model
```

This prevents backend implementation details from leaking throughout the UI.

---

## 22. Components Architecture

Components are organized by responsibility.

Typical areas include:

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

Generic components must not contain feature-specific business logic.

Presentational components should not make direct API calls.

---

## 23. Hooks

Reusable React behavior belongs in:

```text
src/hooks/
```

Hooks may compose:

* services
* local state
* browser APIs
* reusable interaction logic

Hooks must not duplicate API transport configuration.

---

## 24. Maps

Maps are isolated Client Components.

```text
components/maps/
├── TripMap.tsx
├── PointMap.tsx
├── TrackingMap.tsx
└── MapMarker.tsx
```

Map code may use:

* Google Maps SDK
* browser APIs
* geolocation
* interactive state
* markers
* polylines
* live tracking

Maps are a separate frontend integration boundary from the HackTrip Backend API.

```text
HackTrip Backend
    ↑
Axios / API layer


Google Maps
    ↑
Google Maps SDK
```

A map does not require the entire surrounding page to become a Client Component.

---

## 25. Live Tracking

Live tracking is client-side.

```text
GPS / browser
      ↓
tracking hook
      ↓
tracking state
      ↓
map component
```

Tracking state must remain localized to the interactive portion of the application.

---

## 26. Comments and Social Features

Comments, likes, favorites and reports remain feature modules.

Typical separation:

```text
components/comments/
components/social/

api/comments/
api/social/

services/comments/
services/social/

validations/comments/
validations/social/

types/comments/
types/social/
```

Public reads may be server-rendered where appropriate.

Interactive mutations are Client Components.

---

## 27. Admin Architecture

Admin functionality is isolated from public application features.

```text
app/(admin)/admin/
components/admin/
api/admin/
services/admin/
validations/admin/
types/admin/
```

Frontend role checks are UI guards only.

Backend authorization remains authoritative.

---

## 28. Configuration

Frontend configuration is centralized under the existing configuration layer.

Browser-visible configuration is public.

Backend-only environment variables must never be imported into Client Components.

Do not introduce backend-driven configuration migration as part of the current frontend modernization stage.

---

## 29. Static Informational Pages

Pages such as:

```text
/about
/privacy-policy
```

are ordinary public Next.js pages.

Static pages do not need backend API requests merely because the rest of the application uses an API.

They still participate in:

* metadata
* canonical URLs
* accessibility
* responsive UI
* SEO

---

## 30. Performance Architecture

Preferred pattern:

```text
Server-rendered page
       │
       ├── static content
       ├── SEO metadata
       ├── optimized images
       │
       └── Client Components only where interaction exists
```

Heavy browser-only components such as maps may be dynamically loaded where appropriate.

Images use thumbnails and responsive loading.

Public data uses caching/revalidation where appropriate.

Avoid unnecessary client JavaScript.

---

## 31. Error Boundary Architecture

Use Next.js error boundaries where appropriate:

```text
error.tsx
not-found.tsx
loading.tsx
```

API errors are translated into safe UI messages.

Backend error codes remain available to application logic.

Do not expose backend internals.

---

## 32. Security Architecture

The browser is an untrusted environment.

Never trust:

* hidden form fields
* local role state
* local ownership state
* client-generated IDs
* client-generated point numbers
* client-generated owner IDs

The backend is authoritative for:

* authentication
* authorization
* ownership
* generated identifiers
* image validation
* business rules

The frontend must follow the API contract exactly.

---

## 33. Request Data Flow

Typical public Trip page:

```text
Next.js Server Component
        ↓
Trip Service
        ↓
Trip API
        ↓
api/client.ts
        ↓
Axios
        ↓
Backend
        ↓
Trip DTO
        ↓
Server Component
        ↓
HTML + metadata
```

Typical interactive mutation:

```text
Client Component
        ↓
Zod validation
        ↓
Service
        ↓
Feature API
        ↓
api/client.ts
        ↓
Axios
        ↓
Backend
        ↓
DTO / error
        ↓
UI update
```

---

## 34. Data Ownership

The frontend owns:

* presentation
* navigation
* interaction
* local UI state
* form state
* rendering
* SEO presentation

The backend owns:

* persistent state
* authorization
* ownership
* generated identifiers
* numbering
* validation authority
* business rules

Do not reproduce backend domain truth in frontend state.

---

## 35. Legacy Migration Architecture

### Modernization is a migration, not a redesign.

The target architecture must preserve the behavior of the existing HackTrip application.

Before removing or replacing legacy functionality:

```text
Legacy implementation
        ↓
Inspect behavior
        ↓
Identify functionality
        ↓
Implement equivalent behavior in new architecture
        ↓
Compare old vs new
        ↓
Verify
        ↓
Remove obsolete implementation
```

Functional equivalence includes behavior that may not be obvious from the visual UI.

The migration must explicitly account for:

* mouse click behavior
* mouse hover behavior
* touch events
* swipe gestures
* keyboard interactions
* mobile behavior
* tablet behavior
* desktop behavior
* responsive breakpoints
* device/input-specific behavior
* image interactions
* map interactions
* drag/drop
* navigation behavior
* loading states
* error states
* animations when they affect behavior

A component must not be considered successfully migrated merely because the new UI looks similar.

If the old implementation supported a behavior, inspect and preserve it unless its removal is explicitly required.

---

## 36. Documentation and Comments

Architecture documentation describes stable architectural rules.

Code comments should not merely repeat the code.

Prefer comments explaining:

* why a non-obvious architectural decision exists
* why a backend requirement is necessary
* why a compatibility workaround exists
* why browser/device-specific behavior is required
* why a migration temporarily keeps an unusual implementation

Avoid comments that only describe obvious operations.

---

## 37. Architectural Boundaries

The following boundaries are intentional:

```text
Next.js
    owns routing and rendering

React
    owns component interaction

MUI
    owns UI primitives

Zod
    owns frontend validation

Axios
    owns HTTP transport

API modules
    own endpoint communication

Services
    own application orchestration

Components
    own presentation

Hooks
    own reusable client behavior

Constants
    own centralized static configuration

Types
    own TypeScript contracts

Image layer
    owns image presentation and optimization

Google Maps SDK
    owns map rendering and map interaction

Backend
    owns domain truth and authorization
```

---

## 38. Canonical Documentation

Frontend engineering rules are defined in:

`AGENTS.md`

Frontend architecture is defined in:

`docs/ARCHITECTURE.md`

The backend API contract is defined in:

`docs/API_CONTRACT.md`

`docs/API_CONTRACT.md` remains the canonical API reference.

Frontend architecture documentation must not contradict the backend API contract.

Do not create a second frontend API contract.

Do not move backend API rules into a new frontend-specific contract.

---

## 39. Final Architecture Principle

HackTrip is an established production application being modernized incrementally.

The target architecture is:

```text
                 HackTrip Frontend
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
    HackTrip Backend            Google Maps SDK
          │                           │
   api/client.ts                Map Components
          │
       Axios
          │
      Services
          │
   Client/Server UI
```

Public content remains:

* server-renderable
* SEO-friendly
* directly shareable

Interactive functionality remains:

* client-side where required
* isolated
* reusable
* responsive

API integration remains:

* centralized
* typed
* contract-driven

Authentication remains:

* access token in memory
* refresh token in HttpOnly cookie

And most importantly:

**The modernization must not silently remove existing HackTrip functionality.**
