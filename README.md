# HACK-TRIP - https://github.com/AngelGeorgievStoyanov/hack-trip
# https://www.hack-trip.com
## Author: Angel Stoyanov

### Technologies used
* Next.js (App Router)
* React + TypeScript
* MUI
* Zod + React Hook Form
* React Query
* Axios
* MySQL (via the HackTrip REST API)
* Express.js / Node.js (backend)
* Google Maps
* Google Cloud

### Functionality
* Guests can browse public trips, trip details and points (server-rendered, SEO-friendly).
* Logged-in users can create/edit/delete trips, like/favorite/report content, and comment.
* Trips owners (and moderators) can edit and delete their trips.
* Comments' authors can edit and delete their own comments.

### Connection with REST API MySQL
* The frontend consumes the HackTrip REST API through the centralized `src/api/*` layer (Axios).
* Canonical API contract: `docs/API_CONTRACT.md`

### REST API MySQL - https://github.com/AngelGeorgievStoyanov/REST-API-MYSQL

### Getting Started with Next.js

This project uses **Next.js** (App Router) as the frontend framework and routing layer.

Environment variables use the `NEXT_PUBLIC_*` prefix:

* `NEXT_PUBLIC_API_BASE_URL`
* `NEXT_PUBLIC_SITE_URL`
* `NEXT_PUBLIC_GOOGLE_KEY`
* `NEXT_PUBLIC_SITE_KEY2`
* `NEXT_PUBLIC_SITE_KEY3`

### Available Scripts

* `npm run dev` — starts the Next.js development server (http://localhost:3000)
* `npm run build` — production build
* `npm run start` — serves the production build
* `npm run lint` — ESLint over `src` and `app`

### Tests

No test script is currently configured.

