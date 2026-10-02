# HackTrip Frontend — AGENTS.md

## 1. Project Identity

HackTrip Frontend is the production web application for the HackTrip platform.

The application is built with:

* React
* TypeScript
* Vite
* MUI
* Axios
* Zod
* Google Maps / Google services
* React Router
* the project's established supporting libraries

The frontend communicates with the HackTrip Backend through the versioned `/api/v1` API.

The frontend is a client application, not a second implementation of backend business logic. Backend behavior, request contracts, authorization rules, response DTOs, validation constraints, and API semantics are defined by the backend contract.

---

## 2. Source of Truth

### Backend API

`docs/API_CONTRACT.md` is the canonical API contract.

It defines:

* all API endpoints
* HTTP methods
* URL paths
* request bodies
* query parameters
* route parameters
* Zod constraints
* response DTOs
* authentication requirements
* authorization requirements
* public access rules
* roles
* ownership rules
* status codes
* error codes
* pagination
* sorting
* filtering
* image uploads
* refresh-token behavior
* public frontend token behavior
* request headers
* security semantics

Frontend code follows this contract exactly.

If frontend code and `API_CONTRACT.md` appear to disagree, the backend implementation and canonical contract are investigated before changing frontend behavior.

The API contract is not duplicated into multiple competing frontend documents.

---

## 3. Established Architecture

The frontend uses a layered architecture.

```text
Pages / Components
        |
        v
Hooks / Application Logic
        |
        v
API Modules
        |
        v
Clients
        |
        +---- Axios -> HackTrip Backend
        |
        +---- Google -> Google APIs / SDKs
        |
        v
Validation / DTO handling
```

Responsibilities remain separated.

### Pages

Pages compose application functionality and screen-level behavior.

Pages do not contain duplicated HTTP implementation, authentication transport logic, or large blocks of request validation.

### Components

Components are responsible for UI presentation and reusable interaction.

Components do not create independent Axios instances.

Components do not contain backend authentication mechanics.

### Hooks

Hooks connect UI components to application state, API operations, routing, and reusable behavior.

### API

The `api/` layer represents HackTrip backend operations.

It knows which backend endpoint performs a particular operation.

It does not create external provider clients.

### Clients

The `clients/` layer contains communication clients and their transport configuration.

Examples:

```text
src/clients/
├── axios/
├── google/
└── ...
```

Axios is the central HTTP client for HackTrip backend communication.

Google integrations have their own client boundary.

External providers are not accessed directly from arbitrary components.

---

## 4. Directory Structure

The established source structure is organized by responsibility:

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

The repository may contain additional established directories where the responsibility is clear and consistent with this architecture.

The structure is organized by responsibility rather than by arbitrary file accumulation.

---

## 5. Clients

`src/clients/` is the boundary for external communication.

### Axios

The application uses a centralized Axios client for HackTrip backend requests.

The Axios layer owns:

* API base URL configuration
* common request headers
* `x-hacktrip-client`
* authorization transport
* credentialed requests
* response handling
* authentication-related interception
* refresh handling
* common API error normalization where applicable

Individual components never create their own Axios instances for normal backend communication.

### Google

Google integrations live under:

```text
src/clients/google/
```

Google Maps, Places, Geocoding, or other Google integrations use the established Google client boundary.

Google-specific implementation details do not leak into unrelated API modules.

### Other external services

Every external provider has a clearly isolated client boundary.

A third-party SDK is not initialized repeatedly inside UI components.

---

## 6. API Layer

The `api/` directory contains backend API operations.

API modules are organized around the backend domains.

Typical domains include:

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

The exact existing file names are preserved unless there is a concrete reason to change them.

API functions:

* use the centralized Axios client
* follow `API_CONTRACT.md`
* send only declared request properties
* validate request data using the corresponding Zod schema
* consume the documented response DTO shape
* preserve documented HTTP semantics
* do not invent undocumented endpoints
* do not silently rename backend properties

Backend-generated properties are not sent back to the API unless the contract explicitly requires them.

---

## 7. API Request Headers

Every frontend request to `/api/v1` carries:

```http
x-hacktrip-client: web
```

This header identifies the frontend client request shape.

It is not authentication.

It is not authorization.

The requirement applies to every API endpoint, including authentication endpoints:

```text
register
login
verify-email
resend-verification
forgot-password
reset-password
refresh
logout
me
profile endpoints
```

`OPTIONS` CORS preflight is handled separately according to the backend contract.

---

## 8. Public Frontend Authentication Context

Public API reads use the documented public frontend bearer token:

```http
Authorization: Bearer <PUBLIC_FRONTEND_TOKEN>
```

The default backend value is:

```text
hacktrip-public-v1
```

The public token is:

* non-secret
* copyable
* not a JWT
* not a user credential
* not an identity
* read-only

It never grants ownership or write permissions.

The frontend does not treat this token as a user session.

---

## 9. User Authentication

Authenticated requests use the backend-issued access JWT.

The access token is used through the established authentication mechanism.

The refresh token is stored exclusively by the browser as an HttpOnly cookie.

The frontend never:

* reads the refresh token
* stores the refresh token in localStorage
* stores the refresh token in sessionStorage
* places the refresh token into application state
* sends the refresh token manually in a request body

Credentialed requests use:

```text
credentials: 'include'
```

or, where Axios configuration is used:

```text
withCredentials: true
```

This is particularly important for:

* refresh
* logout
* any request that relies on the refresh cookie

---

## 10. Authentication State

The frontend distinguishes between:

```text
anonymous/public context
authenticated user
authentication failure
account status failure
```

A failed user JWT is never converted into anonymous access.

The frontend follows backend status semantics for:

* `EMAIL_NOT_VERIFIED`
* `ACCOUNT_SUSPENDED`
* `ACCOUNT_DEACTIVATED`
* `UNAUTHORIZED`
* `FORBIDDEN`

Authentication behavior is not inferred from UI state alone.

The backend remains authoritative.

---

## 11. Zod Validation

Frontend request validation mirrors the backend request contract.

All request schemas follow the backend's strict Zod semantics.

Unknown properties are not silently accepted.

The frontend validation modules are organized by domain:

```text
src/validations/
├── auth/
├── trips/
├── points/
├── comments/
├── social/
└── admin/
```

The validation layer covers the documented request schemas and route parameters.

The frontend does not invent alternative request shapes.

### Important rule

Backend-generated fields are never treated as normal frontend input.

Examples include:

```text
pointNumber
numberPoint
ownerId
userId
parent references generated by the backend
administrative identity fields
credentials that belong exclusively to backend authentication
```

The exact rules are defined in `API_CONTRACT.md`.

---

## 12. Strict Request Construction

Because the backend uses strict Zod validation:

```text
unknown JSON field -> 400 VALIDATION_ERROR
unknown query parameter -> 400 VALIDATION_ERROR
unknown route parameter -> 400 VALIDATION_ERROR
```

Frontend API calls therefore send only documented properties.

Do not add convenience fields to requests merely because they exist in local application state.

Do not spread entire objects into request bodies when only selected properties belong to the API request.

Avoid patterns such as:

```ts
api.updateTrip({
  ...trip,
  localUiState,
  temporaryValue,
});
```

when those fields are not part of the API contract.

Construct explicit request objects.

---

## 13. Constants

Application-wide constants are centralized under:

```text
src/constants/
```

Constants are grouped by responsibility:

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

Constants that are shared across multiple modules do not get duplicated in individual components.

Avoid magic strings and magic numbers when the value has application-wide meaning.

Examples include:

* API paths
* route names
* role names
* authentication values
* image limits
* pagination defaults
* UI limits
* domain-specific enumerations

Runtime environment configuration is handled through the established `config/` layer rather than being disguised as a compile-time constant.

---

## 14. Routing

Application routes are managed centrally through the routing layer.

Route paths used by the UI correspond to the established routing configuration.

Backend API paths and frontend navigation paths are separate concepts.

Authentication redirects use the configured application routes and backend contract where applicable.

Do not hard-code the same route string across unrelated components.

---

## 15. Error Handling

Backend errors follow:

```json
{
  "error": {
    "code": "<CODE>",
    "message": "<message>"
  }
}
```

The frontend respects the backend error code rather than attempting to infer errors from message text.

Important documented codes include:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
EMAIL_NOT_VERIFIED
ACCOUNT_SUSPENDED
ACCOUNT_DEACTIVATED
NOT_FOUND
TRIP_NOT_FOUND
CONFLICT
INTERNAL_SERVER_ERROR
```

There is no frontend assumption that rate limiting returns `429`.

The backend contract defines rate limiting as:

```text
403 FORBIDDEN
```

---

## 16. Images

Images use the backend's established upload architecture.

Frontend image requests:

* use multipart form data
* use the documented field name
* respect the one-file-per-request contract
* respect backend file-size/type limitations
* do not send image metadata that belongs to backend processing
* consume the returned image DTO

The frontend does not construct permanent image URLs independently when the backend provides the documented image DTO.

---

## 17. Roles and Authorization

The frontend may use roles to control UI visibility and navigation.

The frontend does not replace backend authorization.

The backend remains authoritative for:

```text
user
manager
admin
```

Ownership checks and moderation permissions are enforced by the backend.

Hiding a button is not considered authorization.

A request that the UI does not expose may still be rejected by the backend, and that rejection is handled according to the API contract.

---

## 18. Dependencies and Packages

The root `package.json` is the authoritative dependency list.

Packages are kept only when they have an established use in the application.

Before adding a dependency:

1. existing project functionality is checked;
2. existing dependencies are considered;
3. the package's maintenance and security state are considered;
4. the dependency is added only when it provides real value.

Unused dependencies are removed.

Duplicate libraries serving the same responsibility are avoided unless there is a documented architectural reason.

Security auditing uses:

```bash
npm audit
```

The dependency tree is kept free of known resolvable vulnerabilities without using:

```bash
npm audit --force
```

Forced major-version upgrades are not used as a shortcut for dependency cleanup.

---

## 19. Code Quality

TypeScript remains strongly typed.

Avoid:

```text
any
```

unless an integration boundary genuinely requires it and the usage is isolated and justified.

Do not duplicate:

* API clients
* validation schemas
* constants
* authentication logic
* error parsing
* route definitions
* provider initialization

Prefer existing abstractions.

Before introducing a new abstraction, inspect the current architecture.

---

## 20. Backend Contract Discipline

The frontend does not redefine backend behavior.

Do not:

* invent endpoints
* invent request fields
* invent response fields
* change backend enum values locally
* assume anonymous access when the backend requires a bearer
* treat the public token as a user token
* store refresh tokens in browser-accessible storage
* bypass Zod validation
* bypass the centralized API client
* duplicate Google/provider clients
* duplicate constants
* silently transform backend semantics

When backend behavior changes, `API_CONTRACT.md` is updated from the implemented backend behavior and frontend code follows the resulting contract.

---

## 21. Agent Working Rules

An agent working in this repository first reads:

```text
AGENTS.md
ARCHITECTURE.md
docs/API_CONTRACT.md
```

before making architectural changes.

The existing implementation is treated as an established production codebase.

Agents preserve working architecture rather than replacing it with a new structure merely because another structure is familiar.

Changes are focused, minimal, and consistent with existing conventions.

Do not create migration plans inside source files or architecture documentation.

Do not describe established architecture using future-tense language such as:

```text
will add
will create
should eventually
needs to be migrated
planned
TODO
future architecture
```

These documents describe the architecture as it exists and operates.

---

## 22. Definition of Done

A change is complete when:

* TypeScript compiles
* linting passes
* API requests conform to `API_CONTRACT.md`
* Zod validation remains strict
* authentication behavior remains intact
* refresh-token security remains intact
* existing architecture is preserved
* unused dependencies are not introduced
* no unnecessary files or abstractions are created
* security-sensitive behavior is not weakened
* relevant tests/checks pass where present

The result must fit the existing production architecture rather than creating a parallel architecture.
