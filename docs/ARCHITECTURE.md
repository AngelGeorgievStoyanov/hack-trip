# HackTrip Frontend Architecture

## 1. Overview

HackTrip is a React and TypeScript web application backed by the HackTrip REST API.

The frontend architecture separates:

* presentation
* application behavior
* backend API operations
* external service clients
* request validation
* constants
* configuration
* shared types and utilities

The application communicates with the backend through the versioned API:

```text
/api/v1
```

The canonical backend contract is:

```text
docs/API_CONTRACT.md
```

That document is the authoritative definition of backend behavior.

---

## 2. Architectural Model

The frontend follows this general flow:

```text
                         ┌─────────────────────┐
                         │      Pages          │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │ Components / Hooks  │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │      API Layer      │
                         └──────────┬──────────┘
                                    │
                         ┌──────────▼──────────┐
                         │       Clients       │
                         └───────┬───────┬──────┘
                                 │       │
                              Axios    Google
                                 │       │
                                 ▼       ▼
                              Backend  Google
```

The API layer communicates with HackTrip.

The clients layer owns external communication mechanisms.

The UI does not bypass these boundaries.

---

## 3. Source Structure

The established structure is:

```text
src/
├── clients/
│   ├── axios/
│   ├── google/
│   └── ...
├── api/
├── validations/
│   ├── auth/
│   ├── trips/
│   ├── points/
│   ├── comments/
│   ├── social/
│   └── admin/
├── constants/
│   ├── api/
│   ├── auth/
│   ├── routes/
│   ├── roles/
│   ├── trips/
│   ├── points/
│   ├── images/
│   └── ui/
├── components/
├── pages/
├── hooks/
├── types/
├── utils/
└── config/
```

Each directory has a defined architectural responsibility.

---

## 4. `clients/`

`clients/` is the external communication boundary.

### `clients/axios/`

The Axios client is the centralized HTTP transport for HackTrip backend communication.

It owns transport-level concerns such as:

* base URL
* common headers
* client identification
* authorization
* credentials
* request/response interception
* refresh handling
* transport error handling

There is one established backend HTTP client rather than independent Axios instances scattered throughout the application.

### `clients/google/`

Google integrations are isolated here.

This includes the application's integration with Google services such as:

* Google Maps
* Places
* Geocoding
* other Google APIs or SDKs used by the application

Google SDK initialization and provider-specific configuration stay inside the Google client boundary.

Components consume higher-level application functionality rather than initializing Google services independently.

### Additional clients

Other external services follow the same model:

```text
clients/
├── provider-a/
├── provider-b/
└── ...
```

Each external system has its own boundary.

---

## 5. `api/`

The API layer represents HackTrip backend functionality.

It is organized by business domain.

```text
api/
├── auth/
├── trips/
├── points/
├── comments/
├── social/
├── config/
└── admin/
```

The API layer:

* calls the centralized Axios client
* exposes typed application operations
* constructs exact backend request objects
* validates requests using the corresponding Zod schema
* consumes documented response DTOs
* follows `API_CONTRACT.md`

The API layer does not:

* initialize external SDKs
* contain page-specific UI logic
* store refresh tokens
* redefine backend authorization rules
* invent undocumented API behavior

---

## 6. Backend API Contract

The backend contract is maintained in:

```text
docs/API_CONTRACT.md
```

It is the single canonical API reference for the frontend.

The documented backend pipeline is:

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

The frontend only depends on the externally visible API contract.

---

## 7. Client Identification

Every frontend request to `/api/v1` carries:

```http
x-hacktrip-client: web
```

This identifies the request as belonging to the web frontend.

It is not an authentication credential.

It is not an authorization mechanism.

It is enforced independently from the `Authorization` header.

The rule applies equally to:

```text
/auth/register
/auth/login
/auth/verify-email
/auth/resend-verification
/auth/forgot-password
/auth/reset-password
/auth/refresh
/auth/logout
```

and to all other `/api/v1` endpoints.

---

## 8. Public API Context

Public frontend reads use:

```http
Authorization: Bearer <PUBLIC_FRONTEND_TOKEN>
```

The default documented value is:

```text
hacktrip-public-v1
```

This value is intentionally public and copyable.

It does not represent:

* a user
* a session
* an ownership identity
* an authentication credential

It provides the anonymous read context defined by the backend.

Public access is read-only.

---

## 9. Authentication Architecture

Authentication uses two token mechanisms.

### Access token

The backend returns a short-lived JWT.

The frontend uses the access token for authenticated API requests.

### Refresh token

The refresh token is an HttpOnly browser cookie.

The frontend cannot read it.

The refresh token is never stored in:

```text
localStorage
sessionStorage
IndexedDB
React state
application state
```

Credentialed HTTP requests use:

```text
credentials: 'include'
```

or Axios:

```text
withCredentials: true
```

The refresh endpoint obtains the refresh token from the browser cookie.

---

## 10. Authentication Lifecycle

The normal authenticated flow is:

```text
Login
  ↓
Backend returns access token
  ↓
Backend sets HttpOnly refresh cookie
  ↓
Frontend uses access token for API requests
  ↓
Access token expires
  ↓
Frontend calls refresh
  ↓
Browser sends HttpOnly refresh cookie
  ↓
Backend validates and rotates refresh token
  ↓
Backend returns new access token
  ↓
Frontend continues authenticated operation
```

The frontend never needs to know the refresh token value.

Logout invalidates the refresh session through the backend.

---

## 11. Authentication Boundaries

The backend defines three important authentication behaviors.

### Public/optional authentication

A public token creates anonymous context.

A valid user JWT creates authenticated context.

An invalid user JWT is not converted into anonymous context.

### Required authentication

Protected endpoints require an authenticated user.

The public token is rejected.

### Role authorization

Role checks are performed against backend user state.

The frontend may use the role to adjust UI visibility, but backend authorization remains authoritative.

---

## 12. Zod Validation Architecture

Frontend Zod schemas mirror backend request schemas.

The modules are separated by domain:

```text
validations/
├── auth/
├── trips/
├── points/
├── comments/
├── social/
└── admin/
```

Route parameter schemas are also kept in the appropriate domain validation area.

The frontend validation model preserves the backend's strict behavior.

```text
Declared property
        ↓
Accepted

Unknown property
        ↓
Rejected
```

This is especially important because backend schemas use `.strict()`.

---

## 13. Request Construction

Frontend API requests are explicit.

The application does not blindly serialize complete domain objects into API request bodies.

For example, a UI model may contain:

```text
id
owner
createdAt
updatedAt
local UI state
pointNumber
```

while the backend update request accepts only a subset.

The API layer constructs the documented request shape explicitly.

This prevents frontend-only properties from reaching strict backend validation.

---

## 14. Server-Generated Data

Certain values are generated by the backend.

They are not frontend-owned input.

Examples include:

```text
pointNumber
numberPoint
ownerId
user identity
server timestamps
image storage paths
authentication/session identifiers
```

The frontend consumes these values when returned by the backend.

It does not manufacture them for API requests unless the contract explicitly defines them as client input.

---

## 15. Constants Architecture

Application-wide constants are centralized:

```text
src/constants/
```

The directory is divided by domain:

```text
constants/
├── api/
├── auth/
├── routes/
├── roles/
├── trips/
├── points/
├── images/
└── ui/
```

This provides one discoverable location for application-wide fixed values.

Examples:

### `constants/api/`

* API paths
* API-related identifiers
* transport constants

### `constants/auth/`

* authentication-related values
* authentication state identifiers

### `constants/routes/`

* frontend route paths
* navigation identifiers

### `constants/roles/`

* `user`
* `manager`
* `admin`

### `constants/trips/`

* trip-related fixed values
* documented domain enumerations

### `constants/points/`

* point-related fixed values

### `constants/images/`

* image-related frontend limits and identifiers where applicable

### `constants/ui/`

* shared UI constants
* pagination defaults
* shared UI options

Environment-dependent runtime values remain in `config/`.

---

## 16. Configuration

Runtime configuration is separated from static constants.

```text
config/
```

contains configuration resolution and environment-dependent values.

The distinction is:

```text
constants/
    fixed application values

config/
    runtime/environment configuration
```

Environment variables are not duplicated throughout components or API modules.

---

## 17. Pages

Pages represent route-level application screens.

A page composes:

```text
components
hooks
API operations
application state
routing
```

Pages do not become the central location for:

* Axios configuration
* Google SDK initialization
* reusable validation
* global constants
* authentication transport

---

## 18. Components

Components are primarily presentation and interaction units.

Reusable components remain independent of backend transport details wherever practical.

For example, a reusable form component should not need to know:

```text
Axios instance
refresh cookie
JWT transport
backend base URL
```

The page/application layer connects the component to the relevant hook and API operation.

---

## 19. Hooks

Hooks provide reusable application behavior.

Typical responsibilities include:

* fetching data
* mutations
* authentication state
* route-aware behavior
* UI/application state
* reusable asynchronous operations

Hooks use the API layer rather than implementing HTTP requests independently.

---

## 20. Types

TypeScript types represent frontend domain and API data.

API response types correspond to the documented backend DTOs.

Types are not used as a substitute for runtime validation.

The combination is:

```text
TypeScript
    ↓
compile-time guarantees

Zod
    ↓
runtime request validation
```

Backend response assumptions remain aligned with `API_CONTRACT.md`.

---

## 21. Error Architecture

The backend uses:

```json
{
  "error": {
    "code": "<CODE>",
    "message": "<message>"
  }
}
```

The frontend handles the documented error code.

Important distinctions include:

```text
400 VALIDATION_ERROR
401 UNAUTHORIZED
403 FORBIDDEN
403 EMAIL_NOT_VERIFIED
403 ACCOUNT_SUSPENDED
403 ACCOUNT_DEACTIVATED
404 NOT_FOUND
404 TRIP_NOT_FOUND
409 CONFLICT
500 INTERNAL_SERVER_ERROR
```

Rate limiting is represented by:

```text
403 FORBIDDEN
```

not `429`.

Error handling is centralized at the transport/application boundary where possible rather than duplicated in every component.

---

## 22. Images

The image architecture follows the backend contract.

Frontend uploads use:

```text
multipart/form-data
```

with the documented:

```text
file
```

field.

The frontend respects the backend limits and consumes returned image DTOs.

The backend owns:

* image validation
* storage
* generated filenames
* thumbnail generation
* image URL construction
* ownership
* cleanup

The frontend does not reproduce backend storage logic.

---

## 23. Trips, Days and Points

The frontend follows the backend's domain model exactly.

A Day is represented by a `Trip` database row in the backend model.

Therefore:

```text
dayId = the day's Trip.id
dayNumber = ordering value
```

`dayNumber` is not an identifier.

Point numbering is server-generated:

```text
pointNumber
numberPoint
```

The frontend does not treat these as client-generated identifiers.

Trips, days and points are represented in UI models as convenient, but API requests preserve the backend contract exactly.

---

## 24. Social Features

Social API operations are grouped by responsibility.

```text
comments
likes
favorites
reports
```

The frontend uses the exact backend target-type semantics.

Where the backend defines aliases or canonical returned values, the frontend follows the documented API contract rather than creating a second naming convention.

---

## 25. Authorization and UI

The frontend can use authentication and role state for:

* showing or hiding controls
* navigation
* preventing obviously invalid actions
* displaying appropriate UI states

This is not the security boundary.

The backend enforces:

```text
authentication
ownership
role authorization
moderation permissions
```

A hidden button does not constitute authorization.

---

## 26. Dependency Architecture

Dependencies are managed from the root:

```text
package.json
package-lock.json
```

The project uses established libraries for their defined responsibilities.

Examples include:

```text
React
TypeScript
MUI
Axios
Zod
React Router
Google SDKs
```

The exact installed versions are defined by the repository lockfile and package manifest.

Dependencies are not duplicated to solve the same problem without a clear reason.

Unused packages are removed.

Security auditing is performed with:

```bash
npm audit
```

The project does not use:

```bash
npm audit --force
```

as a normal dependency-management strategy.

---

## 27. Separation of Concerns

The following boundaries are intentional:

```text
UI
 ↓
Hooks
 ↓
API
 ↓
Clients
```

and:

```text
UI
 ↓
Validation
 ↓
API request
```

while:

```text
External provider
 ↓
Provider client
```

remains separate from:

```text
HackTrip backend
 ↓
Axios client
```

This prevents external services, API transport, validation, and presentation from becoming coupled.

---

## 28. API and External Services

There are two distinct communication categories.

### HackTrip Backend

```text
api/
   ↓
clients/axios/
   ↓
HackTrip API
```

### External providers

```text
application code
   ↓
clients/google/
   ↓
Google services
```

An external service is not treated as a HackTrip backend endpoint.

The two boundaries remain separate.

---

## 29. Security Principles

The frontend architecture preserves the following security properties:

* refresh tokens remain HttpOnly
* refresh tokens are not stored in browser-accessible storage
* authenticated requests use the established access-token mechanism
* every `/api/v1` request carries `x-hacktrip-client: web`
* public frontend access uses the documented public bearer
* invalid user JWTs are never downgraded to anonymous access
* strict Zod request contracts are preserved
* backend authorization remains authoritative
* sensitive backend-only fields are not sent by the frontend
* provider credentials are not exposed through arbitrary components

---

## 30. Adding Features Within the Existing Architecture

A feature follows the existing boundaries.

For a backend-backed feature:

```text
1. API contract
       ↓
2. Zod validation
       ↓
3. API module
       ↓
4. Axios client
       ↓
5. Hook/application logic
       ↓
6. Page/component
```

For an external provider:

```text
1. Provider client
       ↓
2. Application/API-facing abstraction
       ↓
3. Hook/application logic
       ↓
4. UI
```

Constants are placed in `constants/`.

Runtime configuration is placed in `config/`.

Types are placed in `types/`.

Reusable UI is placed in `components/`.

This keeps the architecture predictable and makes responsibilities easy to locate.

---

## 31. Repository Rules

The repository is treated as an established production codebase.

Existing working architecture is preserved.

A new implementation does not create a competing pattern when an established pattern already exists.

Examples:

```text
No second Axios architecture
No second validation architecture
No second constants location
No random provider initialization
No duplicated authentication mechanism
No API calls directly from arbitrary UI components
```

The canonical API behavior remains:

```text
docs/API_CONTRACT.md
```

The frontend architecture remains:

```text
clients
api
validations
constants
components
pages
hooks
types
utils
config
```

The documentation describes the architecture as it operates, not as a migration plan.

There are no implied future migrations, planned architectural phases, or unfinished architectural components in this document.
