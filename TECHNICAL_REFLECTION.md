# Technical Reflection

This document answers the five reflection questions from the Koda fullstack assessment and discloses how AI tools were used.

---

## 1. Why did you choose this implementation approach?

**Frontend — React + Vite + TypeScript + a custom Radix-based UI kit.** I wanted a modern, type-safe SPA with a strong design system. Tailwind v4 with Radix UI primitives gives a clean, professional admin look without custom CSS debt, and TanStack Query + TanStack Table handle the two hardest parts of a CRUD admin — server state and data grids — in a well-tested way.

**Backend — Laravel + Interface-Service-Repository.** Laravel is a mature, convention-driven framework that makes the REST API and validation trivial, and the Interface Service Repository architecture  keeps each layer's responsibility explicit and testable. The flow is deterministic and predictable for a team:

```
Route → FormRequest → Controller → ServiceInterface → Service → RepositoryInterface → Repository → Eloquent → Resource
```

**SQLite by default.** Zero-friction local setup (no DB server), and the schema is portable to MySQL/PostgreSQL via `.env` — the `DB_CONNECTION` is configurable.

**Declarative filtering (EloquentFilter).** I mirror the pattern used in a real production Laravel codebase: query filtering lives in a `ModelFilter` class (`ProjectFilter`) instead of a pile of `when()` clauses in the repository. It keeps the repository a clean one-liner and scales to many filters without ballooning.

**A dev-only mock API.** Because the backend was built after the frontend, the UI ships with an in-browser mock adapter (seeded from the same `test_data.json`) gated behind `VITE_USE_MOCK`. This let me develop and verify the entire UI before the API existed, and it's still how someone can run the frontend standalone.

## 2. What tradeoffs did you make?

- **ISR indirection.** Interfaces + service + repository is more files and indirection than calling Eloquent from a controller. The payoff is testability (swap implementations), clear ownership, and team predictability — worth it for a codebase meant to grow. Method signatures are deliberately kept to **at most two parameters** (`object $payload`, `string $uuid`) to keep contracts simple.
- **Server-driven table vs. client-side.** All pagination/filtering/sorting happens on the backend; the URL is the single source of truth. This costs a round-trip per interaction but scales to large datasets and makes every view state shareable/bookmarkable. It also means the frontend stays thin.
- **Storing status/priority as display strings** (e.g. `"In Progress"`) rather than normalized codes. This matches the seed data and API contract exactly with zero mapping, at the cost of not being as "normalized" as a strict DBA might prefer.
- **SQLite over MySQL for the default.** Chosen for instant local setup. The schema and queries are portable; I verified the migration/seed path on MySQL too.
- **`LIKE '%term%'` search.** Substring search with a leading wildcard can't use a B-tree index, so search is a scan. I checked how the database actually executes the query and accepted it for this dataset size; the production path (trigram/FULLTEXT indexes or a search service) is documented in code.
- **Skipped optional bonus items** — authentication, Docker, deployment. They're explicitly optional in the brief, and I preferred to ship a verified, coherent core (plus search/filter/sort and tests) than half-build a login flow at the end.

## 3. What would you improve with additional time?

- **Authentication** via Laravel Sanctum (already installed) — a real token login flow + a login page, plus seeding a demo user. I deliberately left it out to protect the verified build.
- **A `clients` resource.** `clientName` is currently a field; a normalized clients table with its own CRUD would round out the domain.
- **Richer search** — PostgreSQL trigram/FULLTEXT or a search service for indexed substring matching at scale.
- **Cursor (keyset) pagination** for deep pages — it avoids OFFSET scans, at the cost of dropping `total`/`last_page`; worth it only once the dataset grows.
- **End-to-end tests** (Playwright) for the browser flows, and more granular architecture-QA tests that re-enforce the layer rules.
- **API documentation** (e.g. Scribe/Swagger) generated from the code.
- **Bulk operations** (bulk status change / delete) and export.

## 4. What was the most challenging part of this assessment?

Keeping the **frontend ↔ backend contract perfectly aligned** while building them separately. The camelCase JSON shape, the pagination `meta`, the camelCase `422` error keys, and the bracket-array query params (`status[]=...`) all had to match exactly so the React form could map server errors onto fields and the table could drive the URL state. The server-driven table — bridging URL search params ↔ TanStack Table state ↔ backend query params — was the fiddliest piece to get right as one coherent whole.

A close second was **optimizing the repository's SQL honestly**: I traced how the database executed each real query and found an in-memory sort happening whenever a status/priority filter was combined with the default `created_at` sort. I fixed it with composite indexes so the database can walk the index already in sort order. It's easy to *claim* a query is optimized — harder to prove it against what the database actually does.

## 5. Did you use AI tools during development?

**Yes.** I used a mix of AI coding assistants throughout.

**Which tools:**
- **FCC (Free Claude Code)** — the free Claude Code CLI, used as the main agent for planning, code generation, and review. I proxy the **OpenCode** API key to it, so all agent calls run through the OpenCode subscription.
- **OpenCode** — a $5/month subscription providing the **DeepSeek V4 Flash** model via API, which FCC connects to through the proxied key.
- **Antigravity** — Google's agentic coding platform (running the Gemini model), used to help diagnose and fix UI bugs in the frontend.

**How they were used:**
- **Planning & architecture** — turning the brief into a concrete plan, and aligning the backend to a strict Interface-Service-Repository convention from a reference codebase.
- **Code generation** — scaffolding the Laravel slice (interfaces, service, repository, requests, resource, migration, seeder), the React feature (data table, dialogs, forms, API client, mock adapter), enums, and the EloquentFilter layer.
- **UI fixes** — the Antigravity agent (powered by Gemini) was used to diagnose and fix frontend UI bugs.
- **Design reference** — the frontend reuses the design language of an admin UI template I provided as a reference; the AI adapted it into the Projects tracker.
- **Code review & QA** — catching type errors, contract mismatches, and layer-boundary issues; verifying how the database executes the queries before optimizing.
- **Documentation** — drafting this reflection, the README, and setup guides.

I reviewed and tested every AI-generated change; the final architecture and API contract decisions were mine.
