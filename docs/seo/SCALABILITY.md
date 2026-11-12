# SEO Scalability

> Status: **Documented – Not Implemented**
>
> Scope: Frontend repository, SEO sitemap generation.
>
> This document records a known scalability limitation. It does not authorize or imply a change to the current implementation.

## 1. Current sitemap implementation

The dynamic trip sitemap currently has these operational limits:

- It requests up to **100 API pages**.
- It requests up to **100 trips per API page**.
- Its maximum retrieval capacity is therefore **10,000 trip records**.
- API pages are fetched sequentially.
- The sitemap route uses `revalidate = 3600` (one-hour revalidation).
- Only public trips with sufficient SEO content are included.
- Trips that do not meet the existing content-quality rules are excluded.

**Important distinction:** 10,000 is the maximum number of trip records the current retrieval loop can inspect, not a guarantee that 10,000 URLs will appear in the sitemap. Content eligibility filters may reduce the final URL count.

When the number of eligible public trips exceeds the records the loop can retrieve, later records may not be represented in the generated sitemap.

## 2. Why this matters

The current cap is an implementation limit, not a Google indexing limit.

As HackTrip grows, the sitemap may stop discovering all eligible public trip pages. This can reduce the completeness of URL discovery, even though the pages themselves may remain accessible through the website.

## 3. Future implementation

When scale requires it, replace the fixed retrieval ceiling with a sitemap architecture that supports multiple sitemap files and a sitemap index.

The future design should:

1. Generate a sitemap index that references separate sitemap files.
2. Split URLs into manageable sitemap shards.
3. Support separate sitemap groups by content type where useful (for example, static pages, trips, and future destination pages).
4. Obtain a reliable total count or cursor from the API, or use another bounded and reliable pagination strategy.
5. Avoid missing or duplicating URLs across shards.
6. Preserve the existing rules for public visibility and SEO content eligibility.
7. Use accurate `lastModified` values derived from source content; do not substitute the current generation time.
8. Keep caching and revalidation predictable, without requiring every sitemap request to refetch the entire dataset.
9. Log and surface partial-generation failures rather than silently presenting an incomplete sitemap as complete.

Each sitemap file must respect the sitemap protocol limits in force at implementation time. The implementation should use a safety margin rather than generating files at the exact protocol maximum.

## 4. Backend/API dependency

Before implementation, inspect the Backend API contract and available pagination metadata.

The preferred API support is:

- Stable pagination (cursor-based pagination is preferable for large or frequently changing datasets), or
- Reliable page-based pagination with a total count and deterministic ordering.

If the API does not provide sufficient information, plan the smallest required API extension. Do not introduce unnecessary changes to the Prisma schema or existing business rules.

The frontend sitemap implementation must remain independent of unrelated trip UI and SEO modules.

## 5. Architecture requirements

The future implementation must be:

- **Modular:** sitemap URL selection, data retrieval, sharding, and XML/index generation should have separate responsibilities.
- **Extensible:** new content types should be addable without rewriting trip sitemap logic.
- **Bounded:** control API load, memory use, execution time, and cache regeneration.
- **Deterministic:** stable ordering and deduplication should prevent URLs moving unpredictably between shards.
- **Observable:** report API failures, incomplete retrieval, and shard-generation errors.
- **Backward-compatible:** preserve current canonical URL rules, indexability decisions, and public/private access rules.

Do not couple sitemap generation to future AI features or unrelated SEO modules.

## 6. Out of scope for the current version

Until a dedicated implementation task is approved:

- Do not change the current 100-page / 100-record retrieval limits.
- Do not add sitemap sharding or a sitemap index.
- Do not change Backend API pagination.
- Do not weaken the current SEO content eligibility rules.
- Do not make unrelated SEO or application changes as part of this documented limitation.

## 7. Revisit criteria

Revisit this work when any of the following occurs:

- Eligible public trip records approach the current 10,000-record retrieval ceiling.
- Sitemap monitoring shows eligible pages missing because of the retrieval cap.
- A new content type materially increases sitemap volume.
- The current sequential retrieval strategy creates unacceptable generation time or API load.

**Current decision:** keep the existing implementation unchanged and address sitemap scalability in a separate, explicitly scoped task when needed.
