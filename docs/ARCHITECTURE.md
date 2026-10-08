# HackTrip Frontend Architecture

## 1. Purpose

This document describes the architecture of the HackTrip frontend.

The frontend is a Next.js application that communicates with the HackTrip Backend through the documented API contract and integrates with Google Maps independently as a browser-side service.

The current modernization is an incremental migration of an existing application.

The goal is to improve structure, maintainability, security and consistency without silently removing existing functionality.

The backend API contract is defined separately in:

`docs/API_CONTRACT.md`

That document is authoritative for backend communication.

This document must not redefine the backend API contract.

---

# 2. Architectural Principles

The frontend follows these principles:

1. Backend contract is authoritative.
2. Frontend modernization is incremental.
3. Existing functionality must be preserved during migration.
4. Backend authorization is authoritative.
5. Authentication state and authorization UI are separate concerns.
6. API communication is centralized.
7. Google Maps is a separate integration boundary.
8. Server Components are preferred where browser interactivity is not required.
9. Client Components are isolated to interactive/browser-dependent functionality.
10. Constants are centralized and organized by responsibility.
11. Feature code should remain cohesive.
12. Shared infrastructure should not be duplicated.
13. API models must remain aligned with backend DTOs.
14. Public SEO-sensitive content should be server-rendered where practical.
15. Security-sensitive behavior must not depend on client-side assumptions.

---

# 3. High-Level Architecture

The frontend consists of several major layers:

```text
┌─────────────────────────────────────────────────────────┐
│                      Next.js App                         │
│                                                         │
│  App Router                                             │
│  Pages / Layouts / Route Groups                         │
│                                                         │
│  ┌───────────────────────┐  ┌────────────────────────┐  │
│  │ Server Components     │  │ Client Components      │  │
│  │                       │  │                        │  │
│  │ Public pages          │  │ Forms                  │  │
│  │ SEO content           │  │ Maps                   │  │
│  │ Server composition    │  │ Tracking               │  │
│  │ Data loading          │  │ Interactive UI         │  │
│  └───────────┬───────────┘  └────────────┬───────────┘  │
│              │                           │              │
│              └──────────────┬────────────┘              │
│                             ↓                           │
│                         Services                        │
│                             ↓                           │
│                       Feature APIs                      │
│                             ↓                           │
│                       api/client.ts                     │
└─────────────────────────────┬───────────────────────────┘
                              │
                              ↓
                       HackTrip Backend
```

Google Maps is deliberately outside the backend API flow:

```text
                         FRONTEND
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ↓                           ↓
       HackTrip Backend             Google Maps
              │                           │
       api/client.ts                Google Maps SDK
              │                           │
            Axios                   Map components
              │
          Express API
```

Google Maps operations must not be routed through `api/client.ts` unless the backend contract explicitly introduces a corresponding endpoint.

---

# 4. Repository Structure

The primary frontend structure is:

```text
app/
components/
api/
services/
hooks/
validations/
types/
constants/
lib/
config/
docs/
```

Responsibilities:

```text
app/
    Next.js App Router
    pages
    layouts
    route groups
    route-level composition

components/
    reusable UI components
    feature UI
    interactive UI

api/
    backend API communication
    feature endpoint modules
    centralized Axios client

services/
    application-level orchestration
    coordination between API operations
    application-specific transformations

hooks/
    reusable React hooks
    browser interactions
    authentication state
    tracking and interactive behavior

validations/
    Zod schemas
    form validation
    request/query validation where appropriate

types/
    TypeScript models
    API DTO types
    feature models
    UI models

constants/
    reusable application constants
    organized by responsibility

lib/
    framework-independent utilities
    shared low-level helpers

config/
    application/environment configuration
```

Do not create additional top-level architectural layers without a clear reason.

---

# 5. Next.js App Router

The application uses the Next.js App Router.

The `app/` directory owns:

* routing
* layouts
* pages
* route groups
* metadata
* route-level composition

Route organization should represent application navigation and page boundaries rather than backend controller structure.

Do not create frontend routes simply because a backend endpoint exists.

---

# 6. Server Components

Server Components are the default.

Use Server Components when a component does not require:

* browser APIs
* React client hooks
* browser event handlers
* interactive state
* client-only authentication interaction
* map SDK access
* geolocation
* live tracking

Server Components are preferred for:

* public trip pages
* public point pages
* informational pages
* SEO-sensitive content
* static page composition
* server-side data loading where appropriate

Avoid unnecessary `"use client"` boundaries.

---

# 7. Client Components

Client Components are required for browser-side functionality.

Typical examples:

* interactive forms
* authentication forms
* interactive navigation
* dialogs
* image upload UI
* drag/drop
* likes
* favorites
* comments interaction
* Google Maps
* geolocation
* live tracking
* touch interactions
* swipe interactions
* browser-specific behavior

Client Components should remain as small and isolated as practical.

Do not convert an entire page or feature to a Client Component merely because one child component needs browser functionality.

Prefer:

```text
Server Page
    ↓
Server composition
    ↓
Client interactive island
```

---

# 8. API Architecture

All communication with the HackTrip Backend must use the centralized API architecture.

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

The layers have distinct responsibilities.

---

## 8.1 `api/client.ts`

`src/api/client.ts` is the centralized Axios client.

It owns common HTTP behavior such as:

* backend base URL
* common headers
* `x-hacktrip-client`
* authentication header handling
* credentials
* refresh behavior
* common response handling

There must not be multiple independent Axios clients implementing competing authentication behavior.

Raw Axios calls must not be scattered across the application.

---

## 8.2 Feature API modules

Feature API modules expose endpoint-specific operations.

Examples include:

```text
src/api/
├── auth/
├── trips/
├── points/
├── comments/
├── social/
├── admin/
└── ...
```

The exact directory structure follows the actual repository.

Feature APIs should contain HTTP endpoint operations rather than UI logic.

Example responsibility:

```text
trips API
    ↓
GET /trips
GET /trips/top
GET /trips/:id
POST /trips
DELETE /trips/:id
POST /trips/:tripId/days
PUT /trips/:tripId/days/reorder
PUT /trips/:tripId/days/:dayId
DELETE /trips/:tripId/days/:dayId
POST /trips/:tripId/days/:dayId/images
```

Trip Group is only the container that associates days and carries group-level social state. Day content is created and edited through the day endpoints defined above.

The exact endpoints and payloads are defined by `docs/API_CONTRACT.md`.

---

# 9. Services

Services provide application-level orchestration.

A service may:

* coordinate multiple API operations
* transform API data into application models
* combine related API operations
* provide a feature-oriented interface for components
* encapsulate non-trivial application workflows

Services should not duplicate Axios configuration.

Services should not contain presentation/UI logic.

Example:

```text
Trip page
   ↓
tripService
   ↓
tripApi
   ↓
apiClient
   ↓
Backend
```

A service should exist when it provides meaningful application-level behavior.

Do not create empty service wrappers simply to add another layer.

---

# 10. API Contract Boundary

`docs/API_CONTRACT.md` defines the backend boundary.

The frontend must follow:

* endpoint paths
* HTTP methods
* request DTOs
* response DTOs
* authentication requirements
* authorization requirements
* error codes
* pagination
* ownership rules
* image rules
* public access rules

Do not invent frontend assumptions about the backend.

When a frontend requirement conflicts with the API contract, stop and resolve the contract discrepancy instead of silently implementing a different protocol.

---

# 10.1 Trip GET response model

The frontend must use exactly the same Trip Group response model defined in `docs/API_CONTRACT.md` and returned by the Backend for all Trip GET endpoints.

The canonical response model is:

```text
TripGroupResponse
├── tripGroupId
├── social
└── days[]
    ├── id
    ├── dayNumber
    ├── title
    ├── description
    ├── countPeoples
    ├── destination
    ├── lat
    ├── lng
    ├── price
    ├── currency { id, code, name }
    ├── transport
    ├── group
    ├── images[] + social
    ├── social
    ├── points[]
    │   ├── id
    │   ├── name
    │   ├── description
    │   ├── lat
    │   ├── lng
    │   ├── pointNumber
    │   ├── images[] + social
    │   └── social
    ├── createdAt
    └── updatedAt
```

The response is intentionally aligned with the database field naming for public Trip/Point fields. Do not rename or reshape these fields in the frontend API model.

### TripGroupDay

Each item in `TripGroupResponse.days[]` represents one `trips` database row and contains the public day-level fields:

```json
{
  "id": 1001,
  "dayNumber": 1,
  "title": "Day 1",
  "description": "Day description",
  "countPeoples": 2,
  "destination": "Sofia",
  "lat": 42.6975,
  "lng": 23.3241,
  "price": 250,
  "currency": {
    "id": 22,
    "code": "BGN",
    "name": "Bulgarian Lev"
  },
  "transport": {
    "key": "car",
    "name": "Car"
  },
  "group": {
    "key": "friends",
    "name": "Friends"
  },
  "images": [ SocialImageDto ],
  "social": SocialState,
  "points": [ TripPoint ],
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

All four day-specific database fields `countPeoples`, `destination`, `lat` and `lng` belong inside each `days[]` item. They must not be moved to `TripGroupResponse` level.

### TripPoint

Each point uses the database/API field names directly:

```json
{
  "id": 2001,
  "tripId": 1001,
  "name": "Point title",
  "description": "Point description",
  "lat": 42.6975,
  "lng": 23.3241,
  "pointNumber": 1,
  "images": [ SocialImageDto ],
  "social": SocialState
}
```

Point coordinates are `lat` and `lng`. Do not rename them to `latitude` / `longitude` in the API DTO.

`pointNumber` is the persisted point order and must be preserved. Points are returned in numeric `pointNumber` order, with `id` as the tie-break where required by the backend.

`ownerId`, `countEdited`, `createdAt`, and `updatedAt` are never part of the public Point response. `tripId` is public and identifies the parent trip/day row for the point.

### Ownership/security

`ownerId` and `userId` are never part of the public Trip Group, Day or Point response. They remain server-side ownership/authentication data and must not be added to frontend API DTOs, UI models, query parameters, or client-generated request identity.

### Shared response rules

A Trip Group is the grouping container. Day-specific metadata belongs to `days[]`, not to the Trip Group root.

Missing day numbers are preserved. For example, a group containing days 1, 3 and 5 returns exactly those existing days; the frontend must not generate missing days.

The `currency` object is supplied by the backend configuration:

```json
{
  "id": 22,
  "code": "BGN",
  "name": "Bulgarian Lev"
}
```

Currency options must not be hard-coded in the frontend.

Day images, point images and all social structures must be consumed exactly as defined by `docs/API_CONTRACT.md`. Do not create a second frontend-specific image or social DTO.

Endpoint cardinality:

* `GET /trips` → `TripGroupResponse[]`
* `GET /trips/top` → up to 5 `TripGroupResponse[]`
* `GET /trips/:id` → one complete `TripGroupResponse`
* `GET /me/trips` → `TripGroupResponse[]`
* `GET /me/favorites` → `TripGroupResponse[]`

For `GET /trips/:id`, `id` is the `tripGroupId`. The backend returns the complete group and all its days. If the user opened a specific day, the frontend selects that day from the returned `days[]`; it must not expect the endpoint to return only that day.

The same TypeScript/API model must be reused for all five endpoints. The frontend must not maintain a legacy Trip response shape alongside the canonical response.

# 10.2 Trip creation and day workflow

The frontend must treat `tripGroupId` only as the identifier that groups days together. It is not a day identifier and it does not contain day metadata such as title, description, price, currency, transport or group.

All trip creation actions must use the backend response as the source of truth. The backend returns a complete `TripGroupResponse` containing the current group and its `days[]`.

## Add Trip

`Add Trip` creates the day currently being entered in the form. It does not mean that the day must be Day 1.

The frontend chooses the endpoint from whether a Trip Group already exists:

```text
tripGroupId exists?
    │
    ├── NO
    │    ↓
    │  POST /trips
    │    ↓
    │  BE creates Trip Group + current Day
    │
    └── YES
         ↓
       POST /trips/:tripId/days
         ↓
       BE creates current Day in existing Trip Group
```

Both operations return the same `TripGroupResponse` structure.

For example, if the existing group contains days 1, 2 and 3 and the user is currently creating Day 6, `Add Trip` creates Day 6 and then navigates to Trip Details with Day 6 selected.

After either POST:

1. Use the returned `tripGroupId`.
2. Find the newly created day in the returned `days[]`.
3. Use that day's `id` as the day identifier.
4. Navigate to Trip Details.
5. Open exactly the newly created day, not the first day by default.

The frontend must not construct a fake day from the form after the request succeeds. The returned backend data is authoritative.

## Add Next Day Trip

`Add Next Day Trip` creates a day. It may be used when the Trip Group already exists, and the current form may also represent a day being created as part of the same creation flow.

When a Trip Group already exists:

```text
POST /trips/:tripId/days
→ BE creates the current day
→ returns TripGroupResponse
→ FE stays on the current trip form
```

When no Trip Group exists yet:

```text
POST /trips
→ BE creates Trip Group + current Day
→ returns TripGroupResponse
→ FE stays on the form
```

After receiving the response, the frontend uses the returned `days[]` to determine the highest existing `dayNumber`. The next form is prepared with:

```text
next dayNumber = highest existing dayNumber + 1
currency       = values from the latest day
transport      = values from the latest day
group          = values from the latest day
```

The values must come from the backend response, not from a separate hard-coded default.

## Add Points for this Day

The button is named `Add Points for this Day`.

The current day may belong to an existing Trip Group or may be the first day being persisted. The frontend therefore uses the same creation decision:

```text
tripGroupId exists?
    │
    ├── NO → POST /trips
    │
    └── YES → POST /trips/:tripId/days
```

The returned `TripGroupResponse` is then used to identify both required IDs:

```text
TripGroupResponse
├── tripGroupId
└── days[]
    └── newly created Day
        └── id
```

The frontend navigates to the Add Points flow using:

```text
tripGroupId → identifies the Trip Group
day.id      → identifies the specific Day to which points belong
```

Point creation must use the specific `day.id`; points are not attached directly to the Trip Group.

## Editing a Day

To edit a specific day, the frontend uses:

```text
PUT /trips/:tripId/days/:dayId
```

The backend returns the updated `TripGroupResponse`.

After a successful edit:

1. Keep the `dayId` that was being edited.
2. Use the returned `days[]` from the response.
3. Find the same day by its `id`.
4. Navigate to Trip Details.
5. Open exactly that day and display the newly returned values.

The frontend must not perform a second request merely to reconstruct the result of the successful PUT when the returned `TripGroupResponse` already contains the complete updated group.

## Trip Details navigation rule

`GET /trips/:id` uses `id = tripGroupId` and returns the complete Trip Group with all existing days.

When navigation originates from a specific day, the frontend must preserve that target day's `day.id` or `dayNumber` and select that day after the complete response is loaded.

The frontend must never assume that the first day is the selected day.


# 11. Authentication Architecture

Authentication has two separate token mechanisms:

```text
Access token
    ↓
memory only

Refresh token
    ↓
HttpOnly cookie
```

The frontend never reads the refresh token.


## 11.1 Login

The login flow is:

```text
Login form
    ↓
auth API
    ↓
POST /auth/login
    ↓
backend
    ├── access token
    └── refresh cookie
    ↓
access token stored in memory
```

The refresh token must never enter React state or JavaScript-accessible storage.


## 11.2 Session Restoration

After a browser reload, the frontend must not use `localStorage`, `sessionStorage`, IndexedDB, or another client-side persistence mechanism to store authentication/session state or a session-presence hint.

An anonymous visitor on a public page must not proactively call `POST /auth/refresh` merely because the page was reloaded.

Because the refresh token is HttpOnly and the access token is memory-only, the frontend cannot inspect the refresh cookie directly before making a request. The contract therefore provides a read-only session-presence probe:

```text
GET /auth/session
```

The probe:

* uses the public frontend bearer token;
* is sent with credentials enabled so the browser may include the HttpOnly refresh cookie;
* returns only `{ "hasSession": true|false }`;
* does not return or rotate access/refresh tokens;
* does not return user identity, role, account status or other account data;
* does not establish an authenticated access-token context;
* must return the same response shape for absent or invalid sessions.

The expected public-page reload behavior is:

```text
Public page reload
      ↓
GET /auth/session
      ↓
hasSession?
   ┌───┴────┐
   ↓        ↓
 false     true
   ↓        ↓
remain     POST /auth/refresh
anonymous       ↓
   ↓       new access token
no refresh       ↓
             memory
                ↓
            GET /auth/me
                ↓
          authenticated state
```

If `hasSession` is `false`, the frontend must not call `POST /auth/refresh` and must continue as anonymous using the public frontend token for public API requests.

If `hasSession` is `true`, the frontend may intentionally call the normal refresh flow. A definitive refresh failure must result in anonymous state without an infinite retry loop.

The session probe is read-only and is not a substitute for authentication. A successful probe only indicates that a valid refresh session is present; the backend remains authoritative when the actual refresh and authenticated requests occur.

## 11.3 Anonymous Public Pages

Public pages must remain usable for anonymous visitors. Anonymous page loads and reloads must not require a user access token or an authenticated refresh session unless the page itself is protected.

Public API requests follow the public-access rules in `docs/API_CONTRACT.md`. The public frontend token identifies the frontend client for public access; it is not a substitute for a user's authentication token.


# 12. Access Token Handling

Access tokens are application-memory state.

Do not persist access tokens in:

* localStorage
* sessionStorage
* IndexedDB

Do not create alternative token storage mechanisms.

The centralized API client is responsible for attaching the current access token when appropriate.

---

# 13. Refresh Token Handling

Refresh tokens are HttpOnly cookies.

The browser owns the cookie lifecycle.

The frontend JavaScript must not:

* read the refresh token
* write the refresh token
* copy the refresh token into state
* log the refresh token
* expose the refresh token to components

Axios requests that depend on the refresh cookie use:

```text
withCredentials: true
```

Fetch requests that depend on the refresh cookie use:

```text
credentials: 'include'
```

---

# 14. Refresh and 401 Handling

Authenticated requests may receive `401`.

The frontend API layer handles access-token restoration.

The expected flow is:

```text
Authenticated request
      ↓
401
      ↓
restoreSession()
      ↓
refresh access token
      ↓
retry original request once
```

Refresh requests themselves must not recursively enter the same refresh cycle.

Only one refresh operation should be active when multiple requests fail concurrently.

Conceptually:

```text
Request A ──┐
Request B ──┼──→ single refresh operation
Request C ──┘
                 ↓
             new token
                 ↓
          retry eligible requests
```

The frontend must prevent refresh storms and infinite retry loops.

---

# 15. Public Access and Client Identification

The following concepts are independent:

```text
x-hacktrip-client: web
        ↓
identifies the frontend client

Public bearer token
        ↓
public frontend access

User access JWT
        ↓
authenticated identity

Refresh HttpOnly cookie
        ↓
session restoration
```

The frontend must not merge these mechanisms into one generic token concept.

The exact behavior is defined by `docs/API_CONTRACT.md`.

---

# 16. Authorization Architecture

Authorization is ultimately enforced by the backend.

The frontend may provide UX guards.

Examples:

```text
RequireAuth
RequireRole
RequireTripOwner
```

These guards improve navigation and user experience.

They are not security boundaries.

The backend must independently enforce:

* authentication
* role permissions
* ownership
* account status
* resource access

Never assume that hiding a button or route is sufficient authorization.

---

# 17. Account State

Authentication state and account state are separate concerns.

Relevant backend states include:

* pending verification
* active
* suspended
* deactivated

Frontend behavior should distinguish meaningful backend authentication/account errors rather than treating every failure as anonymous.

For example:

```text
EMAIL_NOT_VERIFIED
ACCOUNT_SUSPENDED
ACCOUNT_DEACTIVATED
```

must remain distinguishable where the UI needs to communicate the correct state.

---

# 18. Routing Guards

Frontend guards should preserve navigation context where applicable.

For protected routes:

```text
unauthenticated
      ↓
login
      ↓
returnTo
      ↓
original destination
```

For role-protected routes:

```text
authenticated
      ↓
role check
      ↓
allowed → render
not allowed → appropriate fallback
```

For ownership-protected UI:

```text
authenticated
      ↓
resource owner check
      ↓
owner → edit UI
non-owner → public/read-only UI
```

Backend ownership remains authoritative.

---

# 19. Data Fetching

Data fetching should happen at the most appropriate layer.

Prefer server-side fetching for public, SEO-sensitive content when possible.

Use client-side fetching when functionality requires:

* browser interaction
* live updates
* user-specific state
* interactive mutations
* browser-only APIs

Do not automatically introduce a client-side data fetching layer for every request.

Use the dependencies already present in the repository according to the established architecture.

Do not add another data-fetching library without a concrete architectural requirement.

---

# 20. React Query

If React Query is used by the application, it must have a clear responsibility.

React Query is appropriate for client-side server state requiring features such as:

* caching
* synchronization
* invalidation
* background refetching
* mutation state
* query lifecycle management

React Query must not replace the API architecture.

The flow remains:

```text
Component / hook
      ↓
React Query
      ↓
Service / feature API
      ↓
api/client.ts
      ↓
Backend
```

Do not call Axios directly from arbitrary React Query callbacks when an existing API/service layer is responsible for the endpoint.

Do not introduce React Query into server-only page data simply because it is available in `package.json`.

---

# 21. Google Maps Architecture

Google Maps is a separate browser integration.

It does not belong under the HackTrip backend API layer.

The conceptual architecture is:

```text
Map page/component
       ↓
Google Maps integration
       ↓
Google Maps JavaScript SDK
       ↓
Google Maps
```

Backend data can be combined with map rendering:

```text
HackTrip API
     ↓
trip/point data
     ↓
map component
     ↓
Google Maps SDK
```

But the Google Maps SDK itself is not accessed through Axios.

---

# 22. Google Maps Loading

Google Maps must be loaded through the existing Google Maps integration rather than through the HackTrip API client.

Google Maps functionality should remain within Client Components because the Maps JavaScript SDK requires browser execution.

The integration should centralize:

* API key configuration
* script loading
* map availability
* map-related context/provider behavior

Do not load the Google Maps JavaScript SDK independently in multiple components.

Do not duplicate script loaders.

---

# 23. Google Maps Deprecations

Google Maps APIs evolve independently from the HackTrip backend.

Existing deprecated Google Maps APIs must not be replaced blindly during unrelated migration work.

If the application currently uses deprecated APIs such as:

```text
google.maps.Marker
google.maps.places.Autocomplete
```

the migration must:

1. identify all usages;
2. determine whether the current Google Maps library supports the recommended replacement;
3. inspect existing behavior;
4. verify the replacement's interaction and visual behavior;
5. migrate deliberately;
6. verify desktop, mobile and touch behavior.

The current Google Maps deprecation warnings do not justify changing unrelated HackTrip architecture.

Google Maps API migrations are separate compatibility tasks.

---

# 24. Maps and Trip Data

Trip/point data comes from the HackTrip backend.

Map-specific rendering remains a frontend responsibility.

Conceptually:

```text
Backend trip
    ↓
Trip API
    ↓
Trip service/model
    ↓
Map component
    ↓
markers / polylines / routes
```

Do not put map rendering logic into API modules.

Do not put Axios calls directly inside low-level map primitives.

---

# 25. Live Tracking

Live tracking is browser-side functionality.

The conceptual flow is:

```text
Browser GPS
     ↓
tracking hook
     ↓
tracking state
     ↓
map component
```

The tracking system may combine:

* browser geolocation
* current coordinates
* trip route data
* map position
* polylines
* markers
* user interaction

Tracking should not require converting the complete trip page into a Client Component.

Keep browser-dependent logic isolated.

---

# 26. Constants Architecture

Constants live under:

```text
src/constants/
```

They are organized by responsibility.

Current architecture includes areas such as:

```text
src/constants/
├── images/
├── maps/
├── points/
├── trips/
├── ui/
└── ...
```

The purpose of this structure is to prevent unrelated constants from being placed into large generic files.

Examples:

```text
images/
    image presets
    image sizes

maps/
    map defaults
    map configuration

points/
    point-related limits
    point configuration

trips/
    trip-related limits
    trip configuration

ui/
    UI-specific constants
```

Follow the actual repository structure when adding new constants.

Do not recreate removed flat files merely because older documentation referenced them.

---

# 27. Image Architecture

Images are handled through centralized image-related functionality.

The current image preset architecture includes:

```text
src/constants/images/presets.ts
```

Image constants should remain centralized.

Do not recreate removed legacy files such as:

```text
src/lib/images/imageUrl.ts
src/lib/images/imageMetadata.ts
```

unless a future architectural decision explicitly introduces those responsibilities again.

---

# 28. Image Components

Image rendering should use the existing shared image components and utilities.

Use `next/image` where appropriate.

Image URLs should come from the backend contract/data model.

Do not reconstruct backend storage URLs manually inside components.

Image presentation may include:

* thumbnails
* full-size images
* galleries
* previews
* upload previews

Image interaction must preserve existing legacy behavior.

---

# 29. Image Upload Architecture

Image upload follows the backend contract.

The frontend must respect backend limits.

Typical constraints include:

* one image per request
* maximum image count per entity
* maximum file size
* supported image formats

Client-side validation is only an early UX check.

The backend remains authoritative.

The frontend must not assume that client validation makes an upload safe or valid.

---

# 30. Forms and Validation

Forms use React form patterns and Zod validation.

The conceptual flow is:

```text
Form
 ↓
Zod validation
 ↓
Service
 ↓
Feature API
 ↓
Backend validation
```

Client validation exists for usability.

Backend validation remains authoritative.

Forms must handle documented backend validation errors.

Do not send fields that are generated or owned by the backend.

---

# 31. API Types

API types should reflect backend DTOs.

Where useful, distinguish:

```text
Request DTO
Response DTO
UI model
Form model
```

Do not expose database implementation details to UI code.

Do not assume that a backend database model and API DTO are identical.

---

# 32. Error Handling

Backend errors should retain their meaning.

The frontend should map documented error codes to appropriate UI behavior.

Examples may include:

```text
401 UNAUTHORIZED
403 FORBIDDEN
403 EMAIL_NOT_VERIFIED
403 ACCOUNT_SUSPENDED
403 ACCOUNT_DEACTIVATED
404 NOT_FOUND
409 CONFLICT
422 VALIDATION_ERROR
500 INTERNAL_SERVER_ERROR
```

The exact contract is defined in `docs/API_CONTRACT.md`.

Do not create frontend-only error codes that pretend to be backend contract values.

Unexpected errors should not expose internal implementation details.

---

# 33. Public Pages and SEO

Public pages should be designed for server rendering and SEO.

Relevant content includes:

* trips
* points
* About
* Privacy Policy
* other public informational pages

Use Next.js metadata APIs for:

* title
* description
* canonical
* Open Graph
* Twitter/X metadata

SEO metadata should not expose private user information.

Public pages should not require client-side JavaScript merely to render their primary content unless functionality genuinely requires it.

---

# 34. UI Architecture

MUI is the primary UI component system.

Reusable UI belongs in shared component locations.

Feature-specific UI should remain close to the feature when appropriate.

A generic component should not contain feature-specific backend logic.

Avoid:

```text
Button
  ↓
API call
  ↓
backend
```

Prefer:

```text
Button
  ↓
feature action
  ↓
service
  ↓
API
```

---

# 35. Responsive Architecture

Responsive behavior is part of the existing application's functionality.

The modernization must support:

* desktop
* tablet
* mobile

Responsive behavior includes more than CSS.

It may include:

* different navigation
* different controls
* different interaction patterns
* different component layouts
* touch behavior
* mobile-specific gestures
* desktop hover behavior

Do not remove behavior simply because a new responsive implementation looks visually equivalent.

---

# 36. Input and Interaction Compatibility

Existing input behavior is considered functionality.

Preserve, where applicable:

* mouse click
* mouse hover
* mouse movement
* touch
* swipe
* drag
* keyboard
* pointer events
* device-specific behavior

When replacing a component:

```text
old component
    ↓
inspect interactions
    ↓
list behaviors
    ↓
implement equivalent behavior
    ↓
verify
    ↓
remove old implementation
```

Visual similarity alone is not sufficient.

---

# 37. Legacy Migration

The current frontend modernization is a migration rather than a redesign.

A replacement implementation must be compared against the legacy implementation before the old implementation is removed.

The migration process is:

```text
Legacy implementation
        ↓
Inventory functionality
        ↓
Target architecture
        ↓
Functional comparison
        ↓
Migrate missing behavior
        ↓
Verification
        ↓
Remove obsolete code
```

Legacy behavior includes:

* UI behavior
* API calls
* navigation
* validation
* responsive behavior
* mouse behavior
* touch behavior
* swipe behavior
* map behavior
* image behavior
* keyboard behavior
* loading states
* error states
* animations when functionally relevant

Do not interpret "modernization" as permission to redesign or simplify functionality.

---

# 38. Comments and Code Clarity

Code should explain itself where possible.

Avoid comments that merely describe obvious operations.

Bad:

```ts
// Get trip
const trip = await getTrip(id);
```

Good:

```ts
// Backend derives the owner from the authenticated user; do not send ownerId.
```

Comments should explain:

* why
* architectural constraint
* security requirement
* backend contract requirement
* compatibility requirement
* workaround
* non-obvious browser behavior

Do not add comments solely to increase documentation volume.

---

# 39. Security Boundaries

The browser is not a trusted security boundary.

Never trust:

* frontend role state
* frontend ownership state
* hidden buttons
* hidden routes
* client-side validation
* locally stored permissions

The backend must enforce authorization.

Frontend checks are for:

* navigation
* UX
* avoiding unnecessary requests
* presenting appropriate UI

They are not security controls.

---

# 40. Secrets and Configuration

Secrets must never be included in browser-exposed code.

Anything available through client-side JavaScript must be considered public.

Environment configuration must distinguish between:

```text
server-only secrets
```

and:

```text
browser-exposed configuration
```

Google Maps browser configuration must follow the Google Maps platform's intended browser key restrictions.

Backend secrets never belong in frontend code.

---

# 41. Dependency Boundaries

Existing dependencies should be reused where appropriate.

Current relevant dependencies include:

* Next.js
* React
* MUI
* Axios
* Zod
* React Hook Form
* React Query
* Google Maps integration

Do not add another library solving an existing problem without an explicit reason.

In particular, do not introduce:

* another HTTP client
* another validation library
* another data-fetching library
* another Google Maps loader

without a documented architectural need.

---

# 42. React Query Boundary

React Query, where used, is a client-side server-state mechanism.

It does not replace:

* API modules
* services
* Axios client
* backend contract

Its responsibility is state lifecycle:

```text
query
cache
invalidate
refetch
mutation state
```

not HTTP transport configuration.

The HTTP boundary remains:

```text
React Query
    ↓
service/API
    ↓
api/client.ts
    ↓
backend
```

---

# 43. File and Folder Ownership

Each layer should have a clear responsibility.

```text
app/
    route/page composition

components/
    UI

api/
    backend HTTP operations

services/
    application orchestration

hooks/
    reusable React/browser behavior

validations/
    Zod validation

types/
    TypeScript models

constants/
    reusable constants

lib/
    low-level shared utilities

config/
    configuration
```

Do not place API calls in constants.

Do not place UI components in services.

Do not place backend transport logic in map components.

Do not place map SDK logic in the backend API client.

---

# 44. Migration Verification

Every migration batch must verify more than compilation.

At minimum:

```text
TypeScript
Lint
Build
Relevant tests
API contract
Legacy functionality
Responsive behavior
Authentication behavior
```

Where a component is replaced, verify its previous functionality.

Where an API operation is migrated, verify:

* endpoint
* method
* request payload
* authentication
* response handling
* error handling

---

# 45. Documentation Boundaries

The project has three distinct documentation responsibilities.

### `AGENTS.md`

Defines rules for coding agents and contributors.

### `docs/ARCHITECTURE.md`

Defines frontend architecture and boundaries.

### `docs/API_CONTRACT.md`

Defines the backend API contract.

These documents complement one another.

Do not create another frontend API contract.

Do not copy the complete backend contract into architecture documentation.

Do not modify the backend contract merely because the frontend architecture changed.

---

# 46. Modernization Scope

The current modernization should proceed incrementally.

Each batch should:

1. inspect existing implementation;
2. inspect legacy behavior where applicable;
3. identify the exact migration scope;
4. make the smallest coherent change;
5. preserve functionality;
6. verify the result;
7. commit the batch separately.

Do not combine unrelated modernization work into one large rewrite.

---

# 47. Current Architecture Direction

The target frontend architecture is:

```text
                         Next.js
                            │
              ┌─────────────┴─────────────┐
              │                           │
       Server Components           Client Components
              │                           │
              │                    hooks / interaction
              │                           │
              └─────────────┬─────────────┘
                            ↓
                         Services
                            ↓
                      Feature APIs
                            ↓
                       api/client.ts
                            ↓
                           Axios
                            ↓
                    HackTrip Backend
```

Separately:

```text
Client Components
       ↓
Google Maps integration
       ↓
Google Maps JavaScript SDK
```

Authentication:

```text
Login
  ↓
access token → memory

refresh token
  ↓
HttpOnly cookie
```

Session restoration:

```text
Reload
  ↓
GET /auth/session
  ↓
hasSession?
  ├── false → remain anonymous
  │
  └── true
        ↓
    /auth/refresh
        ↓
    HttpOnly cookie
        ↓
    new access token
        ↓
    memory
        ↓
    /auth/me
```

Authorization:

```text
Frontend guards → UX
Backend          → authority
```

---

# 48. Final Architectural Rule

HackTrip frontend modernization must improve architecture without silently changing application behavior.

The most important rule is:

> **Modernization is a migration, not a redesign. Existing functionality must be preserved unless its removal is explicitly required.**

When architecture and legacy behavior appear to conflict:

1. inspect the legacy implementation;
2. identify the behavior;
3. compare it with the target architecture;
4. migrate the behavior into the target architecture;
5. verify it;
6. only then remove obsolete code.

The backend API contract remains the authoritative source for backend communication.

The frontend architecture remains responsible for clean separation between:

* pages
* UI
* services
* API modules
* HTTP transport
* authentication
* browser integrations
* Google Maps
* validation
* configuration
* constants

No layer should silently absorb another layer's responsibility.

# 49. Public, User-Specific and Moderation Flows

These rules add frontend-specific behavior for functionality defined by `docs/API_CONTRACT.md`. The API contract remains authoritative for endpoint paths, DTOs, authentication, authorization and errors.

## 49.1 Public Top 5 Trips

Top 5 trips is a public feature. An anonymous visitor may load it without logging in.

The frontend must use the public endpoint defined by the API contract and must send the required `PUBLIC_FRONTEND_TOKEN` for public anonymous API access. It must not call `/auth/refresh` merely to load Top 5.

The response contains up to five trip groups, ranked by the number of likes associated with each trip group. If fewer than five trip groups exist, the frontend displays the returned groups only. Equal like counts are valid; the frontend must not invent a secondary ranking.

The returned items use the normal trip/trip-group response structure defined by the API contract.

## 49.2 My Trips and My Favorites

My Trips and My Favorites are authenticated-user features.

The frontend must not send a `userId` in these new requests when the API contract defines the current user from the authenticated session. The backend is responsible for determining the authenticated user.

My Trips returns the trip groups actually owned by the authenticated user.

My Favorites returns the trip groups for which the authenticated user has an actual persisted favorite record. A favorite is based on the backend relationship between the user and `tripGroupId`; the frontend must not infer a favorite from local UI state.

If the authenticated user has no favorites, the API response should be handled as the documented empty collection and the UI should represent that there are currently no favorites.

## 49.3 Background Images

Background images are public resources and must work for anonymous visitors.

The frontend must not read the Google Cloud Storage bucket directly and must not request the complete background-image list from Google Cloud Storage.

The backend's existing `refreshSlow()` flow loads background object names from Google Cloud Storage into dynamic configuration. A successful refresh replaces the stored list with the newly discovered names. If a later refresh fails, the last successful list remains available; the failure may be logged as a warning and must not break startup or dynamic-config refresh.

The backend background service selects a random image from the dynamic-config list and returns the ready-to-use public value through the public background endpoint.

The frontend calls that public endpoint when it needs a background image and consumes the single returned value. The frontend does not implement the random-selection algorithm.

The frontend must send the required `PUBLIC_FRONTEND_TOKEN` for this public anonymous API request. Loading a background image must not require user login or `/auth/refresh`.

## 49.4 Reports and Admin Triage

Reports are moderation data created when a user reports a trip or comment that may violate the application's content/good-conduct policy.

The frontend moderation area must retrieve current reports from the backend so existing reports appear automatically when an authorized moderation user opens the relevant page.

Report data includes at least trip reports and comment reports. The moderation flow supports listing/triage and deleting/removing resolved reports according to the API contract.

Only authenticated users with the required manager/admin privileges may access report-triage endpoints. A normal authenticated user must not be able to list, inspect or delete reports merely because they are logged in.

Report deletion/removal is a moderation action and must remain protected by backend authorization. The frontend guard is UX only.

Legacy report endpoints are migration references only. Once the new contract is implemented, the frontend must use the new documented endpoints rather than calling legacy admin endpoints directly.

## 49.5 Authentication Boundary on Public Reload

For any public route, the frontend must distinguish anonymous navigation from authenticated-session restoration without persisting authentication/session state in browser storage.

```text
Public page reload
        ↓
GET /auth/session
        ↓
hasSession?
   ┌────┴────┐
   ↓         ↓
 false      true
   ↓         ↓
anonymous   POST /auth/refresh
   ↓         ↓
no refresh  memory access token
                ↓
            GET /auth/me
                ↓
          authenticated
```

The frontend must not use `localStorage`, `sessionStorage`, IndexedDB, or another client-side persistence mechanism as a session-presence hint.

If `hasSession` is `false`, the frontend must not call `POST /auth/refresh`.

If `hasSession` is `true`, the frontend may intentionally attempt the normal refresh flow. A definitive refresh failure results in anonymous state and must not create a refresh loop.

`GET /auth/session` is read-only and returns only the boolean session-presence result. It does not expose or rotate tokens or account information.

## 49.6 Verification Requirements

When migrating these features, verify both functionality and access boundaries:

```text
Anonymous → Top 5 → public token → success
Anonymous → Background → public token → one random value → success
Anonymous → public page reload → no /auth/refresh
Authenticated → reload → refresh session → /auth/me
Authenticated → My Trips → own trip groups only
Authenticated → My Favorites → persisted favorite trip groups only
Manager/Admin → Reports → current trip/comment reports
Manager/Admin → delete report → authorized moderation action
Normal user → Reports → denied
```

These rules supplement the existing architecture and migration-verification sections. They do not remove or replace existing functionality or documentation.


# 49.7 Current-user Trip and Favorite API Boundary

The current-user endpoints are:

```text
GET /me/trips
GET /me/favorites
```

Both endpoints resolve the current user exclusively from the authenticated session. The frontend must not send a `userId` or `ownerId` as an ownership selector.

Both endpoints return the same unified trip-group response model used by the other modern trip GET endpoints:

```text
GET /me/trips      → TripGroupResponse[]
GET /me/favorites  → TripGroupResponse[]
```

Each returned item has the normal complete Trip Group structure:

```text
TripGroupResponse
├── tripGroupId
├── social
└── days[]
    ├── id
    ├── dayNumber
    ├── title
    ├── description
    ├── price
    ├── currency { id, code, name } | null
    ├── transport
    ├── group
    ├── images[] + social
    ├── social
    └── points[]
        ├── Point + social
        └── images[] + social
```

The frontend must consume these responses exactly as the unified Trip Group model. It must not expect the old `TripListItem` summary structure and must not maintain a separate response model for these two endpoints.

The Trip Group is only the container identified by `tripGroupId`. Trip-specific content belongs to `days[]`. The frontend must not expect `title`, `description`, `price`, `currency`, `transport` or `group` directly on the Trip Group.

For both endpoints:

* `tripGroupId` identifies the Trip Group.
* `days[].id` identifies the actual `trips` row/day.
* `days[].dayNumber` is the displayed/logical day number and is not the database ID.
* Existing day numbers must be preserved; the frontend must not generate missing days.
* Day, point and image social state must be consumed from their respective response levels.

### Security boundary

The response must not expose `userId`, `ownerId`, or an `author.id`/owner UUID for the trip owner. In particular, `GET /me/favorites` must never expose the UUID of another user's account merely because that user's trip was favorited.

The authenticated user identity is a backend security concern. The frontend must use the endpoint result without receiving or relying on database user identifiers. The backend remains responsible for resolving the current user, checking ownership/favorite relationships and enforcing authorization.

For `GET /me/trips`, only groups owned by the authenticated user are returned.

For `GET /me/favorites`, only groups for which the authenticated user has a persisted favorite relationship are returned. The frontend must not infer favorite state from local UI state.

The frontend should call these endpoints through the existing service/API-client architecture:

```text
Page / hook
    ↓
service
    ↓
feature API
    ↓
api/client.ts
    ↓
Axios
    ↓
GET /me/trips or GET /me/favorites
```

The frontend does not provide the user ID and does not infer ownership client-side. Backend authentication, authorization, ownership and favorite checks remain authoritative.

# 49.8 Public Trip Discovery and Background API Boundary

The public endpoints remain:

```text
GET /trips/top
GET /trips/background
```

Both are available to anonymous visitors using the required public Frontend authentication contract. They must use the public Frontend token and must not require an authenticated user session.

`GET /trips/top` returns up to five trip groups ranked by their total likes. The frontend consumes the normal trip response structure and does not implement the ranking or grouping logic.

`GET /trips/background` returns one ready background value. Background images are not read directly from Google Cloud Storage by the frontend. The backend refreshes the available filenames through its slow dynamic-config refresh, keeps the last successful list when a refresh fails, and the backend background service selects the random image.

The frontend therefore performs only:

```text
public page / component
    ↓
service / API module
    ↓
GET /trips/background
    ↓
single ready background value
```

Loading a background image must work for an anonymous visitor and must not require `/auth/refresh`.
