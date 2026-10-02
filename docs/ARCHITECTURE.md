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

The architecture separates public SEO-oriented content from authenticated interactive functionality while keeping both inside the same application.

The backend remains an independent service.

```text
                    ┌──────────────────────┐
                    │      Browser         │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │      Next.js         │
                    │   App Router / RSC   │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        Public Server Content       Interactive Client UI
        SEO / SSR / ISR              Maps / Forms / Social
                 │                           │
                 └─────────────┬─────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    API Client        │
                    │       Axios          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    HackTrip API      │
                    │      /api/v1         │
                    └──────────────────────┘
```

The API contract is defined by:

`docs/API_CONTRACT.md`

---

# 2. Application Layers

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
api/
    ↓
backend
```

Supporting layers:

```text
validations/
types/
constants/
config/
lib/
```

Each layer has a defined responsibility.

---

# 3. Next.js App Router

Next.js App Router owns application routing.

Routes are organized by user-facing responsibility rather than by backend controller names.

Typical structure:

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
│
├── (auth)/
│   ├── login/
│   ├── register/
│   ├── verify-email/
│   ├── forgot-password/
│   └── reset-password/
│
├── (account)/
│   ├── profile/
│   └── ...
│
└── (admin)/
    └── admin/
```

Route groups are used to organize application areas without unnecessarily changing public URLs.

Dynamic routes represent public content that can be directly opened and shared.

---

# 4. Server Components and Client Components

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

Client Components are used for functionality requiring:

* `useState`
* `useEffect`
* browser APIs
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
├── TripHeader (Server)
├── TripMetadata (Server)
├── TripGallery (Server/Client depending on interaction)
├── TripDescription (Server)
├── TripMap (Client)
├── TripPoints (Server)
│   └── PointCard (Server)
└── TripSocialActions (Client)
```

Do not make the complete Trip page a Client Component because the map or social controls require client-side JavaScript.

---

# 5. Public Content Architecture

Public HackTrip content is designed to be:

* directly accessible
* server-rendered
* indexable where appropriate
* shareable
* optimized for mobile
* optimized for social previews

Public Trip pages can use:

* Server Components
* SSR
* ISR
* revalidation
* metadata generation
* canonical URLs
* Open Graph metadata

Public content must not depend on browser state to render its primary content.

A user opening:

```text
/trips/123
```

must receive a complete public page even when arriving directly from an external website.

---

# 6. SEO Architecture

SEO is implemented through Next.js metadata APIs.

Public content exposes appropriate:

```text
title
description
canonical
robots
openGraph
twitter
```

Dynamic content uses dynamic metadata derived from the public API response.

For example:

```text
Trip
 ├── title
 ├── description
 ├── canonical URL
 └── representative image
```

The metadata generation must not expose private information.

Authenticated application pages are not SEO content.

---

# 7. Search Engine Indexing

The application provides the technical infrastructure required for indexing public content.

The architecture includes:

```text
app/
├── robots.ts
└── sitemap.ts
```

The sitemap contains only URLs intended for search engines.

Public Trip and Point URLs may be included when their content is publicly accessible and indexable.

Private pages are excluded.

The architecture avoids duplicate canonical URLs.

Search engine crawlers must receive valid public HTML rather than a client-only loading shell for indexable content.

---

# 8. Social Sharing

Public content has stable canonical URLs.

Sharing is implemented around the public route, not around client navigation state.

For Trips:

```text
/trips/[tripId]
```

For Points:

```text
/points/[pointId]
```

The page metadata provides:

```text
og:title
og:description
og:url
og:image
twitter:title
twitter:description
twitter:image
```

The representative image is selected from the public content.

If a Trip has images, the appropriate public image is used for social previews.

If no content image is available, the application uses the configured HackTrip fallback image.

---

# 9. Image Architecture

Images are centralized.

```text
components/images/
├── AppImage.tsx
├── ImageGallery.tsx
├── ImageThumbnail.tsx
├── ImagePreview.tsx
└── ImageUpload.tsx
```

Image utilities:

```text
lib/images/
├── imageUrl.ts
├── thumbnail.ts
└── imageMetadata.ts
```

The application does not contain ad-hoc image URL concatenation inside pages.

The backend API provides image DTOs.

The backend contract defines:

* image URL
* thumbnail URL
* supported upload formats
* image limits
* image storage behavior

The frontend consumes those values.

---

# 10. `next/image`

`next/image` is the default rendering mechanism for application images.

It provides:

* responsive images
* optimized loading
* width/height handling
* lazy loading
* priority loading
* appropriate `sizes`

Example responsibility:

```text
AppImage
    ↓
next/image
    ↓
backend-provided image URL
```

The shared image component handles common HackTrip behavior.

Individual pages should not repeatedly implement:

```text
if thumbnail...
if full...
build URL...
choose width...
choose sizes...
```

That logic belongs in the image layer.

---

# 11. Thumbnail Strategy

Thumbnail images are used for:

* trip lists
* point lists
* gallery previews
* cards
* compact UI
* secondary content

Full-size images are used when the user explicitly views the image at larger resolution.

The architecture therefore separates:

```text
List/Card
    ↓
thumbnail

Gallery/Detail
    ↓
full image where appropriate
```

This reduces bandwidth and improves page performance.

---

# 12. Responsive Image Strategy

Images use responsive sizing.

The image component determines the appropriate `sizes` value based on the layout.

Typical cases:

```text
Full-width hero:
100vw

Two-column gallery:
50vw

Three-column cards:
33vw

Mobile-first card:
~100vw with responsive breakpoints
```

Exact values are defined by the actual component layout rather than hard-coded globally when they differ.

---

# 13. Image Accessibility

Every meaningful content image has meaningful `alt` text.

Decorative images use appropriate empty alt behavior.

Image galleries provide accessible controls.

Lightboxes provide:

* keyboard interaction
* close controls
* accessible labels
* focus handling

---

# 14. Image Upload Architecture

Uploads are interactive Client Components.

```text
ImageUpload
    ↓
client validation
    ↓
API service
    ↓
Axios
    ↓
Backend multipart endpoint
```

Client validation is for UX.

Backend validation remains authoritative.

The frontend respects:

* maximum file size
* supported file types
* maximum image count

The frontend never assumes an upload succeeded until the backend response confirms it.

---

# 15. API Layer

All backend communication goes through the API layer.

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

`client.ts` contains shared HTTP behavior.

Feature modules contain endpoint-specific operations.

Example:

```text
api/trips/tripsApi.ts
api/points/pointsApi.ts
api/comments/commentsApi.ts
```

Pages and components should not construct arbitrary API URLs.

---

# 16. Services Layer

Services contain application-level operations.

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
TripService
    ↓
Trip API
    ↓
Point API
    ↓
Image API
```

The service layer prevents UI components from becoming business-logic containers.

---

# 17. Authentication Architecture

Authentication uses the backend contract.

```text
Browser
   │
   ├── access token
   │
   └── HttpOnly refresh cookie
            │
            ▼
        Backend
```

The refresh cookie is never read by JavaScript.

Axios requests requiring the cookie use:

```text
withCredentials: true
```

Equivalent Fetch requests use:

```text
credentials: 'include'
```

The application never stores the refresh token itself.

---

# 18. Public Authentication Boundary

Public frontend API requests still identify themselves as the web client.

Every API request uses:

```http
x-hacktrip-client: web
```

Public reads additionally use the backend-defined public bearer token.

Authentication endpoints such as:

```text
register
login
verify-email
resend-verification
forgot-password
reset-password
refresh
```

do not require a user Authorization credential where the backend defines them as unauthenticated.

They still require the frontend client marker.

This distinction is important:

```text
Client identification
        ≠
User authentication
        ≠
Authorization
```

---

# 19. Zod Architecture

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

The architecture mirrors backend feature boundaries.

Example:

```text
validations/auth/
├── register.schema.ts
├── login.schema.ts
├── verifyEmail.schema.ts
├── resendVerification.schema.ts
├── updateProfile.schema.ts
├── confirmPassword.schema.ts
├── changePassword.schema.ts
├── forgotPassword.schema.ts
└── resetPassword.schema.ts
```

Equivalent feature-specific structures are used for Trips, Points, Social, Comments and Admin.

---

# 20. Constants Architecture

Constants are centralized.

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

Examples:

```text
api.ts
    API prefix
    API paths
    HTTP-related constants

auth.ts
    roles
    auth states
    authentication-related constants

routes.ts
    frontend route paths

images.ts
    upload limits
    image-related UI constants

trips.ts
    trip filters
    pagination
    sorting

points.ts
    point-related constants

social.ts
    target types
    social-related constants
```

This prevents inconsistent strings throughout the application.

---

# 21. Type Architecture

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

Types represent API contracts and frontend domain models.

Where useful, keep:

```text
API DTO
    ↓
service transformation
    ↓
UI model
```

This prevents backend implementation details from leaking throughout the UI.

---

# 22. Components Architecture

Components are organized by responsibility.

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

Examples:

```text
components/trips/
├── TripCard
├── TripHeader
├── TripGallery
├── TripDetails
├── TripFilters
└── TripActions

components/points/
├── PointCard
├── PointDetails
├── PointGallery
└── PointActions

components/images/
├── AppImage
├── ImageGallery
├── ImageThumbnail
├── ImagePreview
└── ImageUpload
```

Generic components do not contain feature-specific business logic.

---

# 23. Hooks

Reusable React behavior belongs in:

```text
src/hooks/
```

Examples:

```text
useAuth
useCurrentUser
useTrip
usePoints
useComments
useLikes
useFavorites
useImageUpload
useMap
useGeolocation
```

Hooks should compose services and state rather than duplicate API calls.

---

# 24. Maps

Maps are isolated Client Components.

```text
components/maps/
├── TripMap.tsx
├── PointMap.tsx
├── TrackingMap.tsx
└── MapMarker.tsx
```

Map code may use browser APIs and interactive state.

Public Trip pages remain Server Components around the map.

```text
TripPage
├── server-rendered content
├── server-rendered SEO metadata
└── client-side TripMap
```

This preserves SEO while allowing full map interactivity.

---

# 25. Live Tracking

Live tracking is client-side.

The architecture separates:

```text
GPS / browser
      ↓
tracking hook
      ↓
tracking state
      ↓
map component
```

Tracking does not force the entire Trip page into Client Component mode.

---

# 26. Comments and Social Features

Comments, likes, favorites and reports are feature modules.

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

Public reads can be server-rendered when appropriate.

Interactive mutations are Client Components.

---

# 27. Admin Architecture

Admin functionality is isolated from public application features.

```text
app/(admin)/admin/
components/admin/
api/admin/
services/admin/
validations/admin/
types/admin/
constants/admin.ts
```

Role checks in the frontend are UI guards only.

Backend authorization remains authoritative.

Manager and admin capabilities follow the backend API contract.

---

# 28. Configuration

Frontend configuration is centralized under:

```text
src/config/
```

Runtime/public configuration must be clearly separated from secrets.

Browser-visible configuration is treated as public.

Backend-only environment variables must never be imported into Client Components.

---

# 29. Static Informational Pages

Pages such as:

```text
/about
/privacy-policy
```

are ordinary public Next.js pages.

They do not need backend API requests when their content is static.

Their content should be maintained as normal application content and rendered server-side.

They still participate in:

* metadata
* canonical URLs
* SEO
* accessibility
* responsive UI

---

# 30. Performance Architecture

Performance is based on minimizing unnecessary browser JavaScript.

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

Heavy components such as maps may be dynamically imported where appropriate.

Images use thumbnails and responsive loading.

Public data uses caching/revalidation where appropriate.

---

# 31. Error Boundary Architecture

Next.js error boundaries are used for page-level failures.

Use appropriate:

```text
error.tsx
not-found.tsx
loading.tsx
```

where the route benefits from them.

API errors are translated into safe UI messages.

Backend error codes remain available to application logic.

---

# 32. Security Architecture

The browser is treated as an untrusted environment.

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

---

# 33. Request Data Flow

Typical public Trip page:

```text
Next.js Server Component
        ↓
Trip Service
        ↓
Trip API
        ↓
Axios
        ↓
Backend /api/v1/trips/:id
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
API module
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

# 34. Data Ownership

The backend owns domain truth.

The frontend owns:

* presentation
* navigation
* interaction
* local UI state
* form state
* optimistic UI only where safe
* rendering
* SEO presentation

The backend owns:

* persistent state
* authorization
* ownership
* IDs
* numbering
* validation authority
* business rules

---

# 35. Architectural Boundaries

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

Backend
    owns domain truth and authorization
```

---

# 36. Canonical Documentation

The frontend architecture is described here.

Engineering agent rules are described in:

`AGENTS.md`

The backend API is described in:

`docs/API_CONTRACT.md`

`docs/API_CONTRACT.md` is the canonical API reference.

Frontend architecture documentation must not contradict it.

---

# 37. Final Architecture Principle

HackTrip is structured as a modern production Next.js application where:

```text
SEO/public content
        ↓
Next.js Server Components + SSR/ISR
        ↓
optimized HTML + metadata + images

Interactive application
        ↓
React Client Components
        ↓
hooks + services + API modules
        ↓
HackTrip Backend
```

The architecture deliberately keeps:

* public content indexable
* Trips and Points directly shareable
* social previews image-rich
* images centralized and optimized
* thumbnails efficient
* maps interactive without sacrificing SEO
* authentication secure
* validation feature-oriented
* constants centralized
* API integration typed
* backend authorization authoritative
* application boundaries explicit
* UI scalable as the product grows
