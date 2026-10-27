# Production security architecture — planned, not deployed

The browser demo cannot enforce a trustworthy financial-data boundary. This design is a prerequisite plan, not a claim of implementation.

Use an authenticated server API with secure HttpOnly/SameSite sessions, CSRF protection, rate limiting, account recovery and monitored access. Resolve business membership on the server; do not trust a client businessId or role. Owner/staff/accountant grants should have explicit scopes, expiry and revocation checked per request; administration requires a separate privileged identity. All access/downloads need server audit records.

Use a relational database with businesses, users, memberships, parties, products, documents/versions, journals/lines, payments, credits, stock movements, statement imports/matches, forecasts, RFQs/quotes, consents and immutable audit events. Foreign keys include business_id. Row-level policies and API tests must prohibit cross-business read/write/export. Post financial workflows inside one database transaction with idempotency keys, uniqueness constraints, optimistic versions and a deferred balanced-journal assertion. Corrections append reversals rather than rewriting posted journal rows. Add period locks and migration tests.

Original uploads belong in protected object storage with per-tenant paths, verified content types, malware scanning, quotas, retention and expiring authorized downloads. Store digests and provenance in the database. Browser MIME assertions are insufficient. Encrypt transit and managed storage; keep partner secrets in server secret management, rotate keys and test recovery. Adopt backup/PITR, restore drills, incident playbooks, access alerts and vendor-processing contracts.

Partner calls belong behind an audited integration service and job queue with idempotency, signed callbacks, retries, delivery states and consent purpose/scope/expiry checks. Revocation must halt future access and invoke downstream workflows subject to lawful retention. Do not route lender money through the app. AA, bank, lender, ONDC, messaging and GST enablement each require role/contract/legal validation and sandbox-to-production acceptance evidence.

Acceptance gates: cross-tenant negative tests; privilege/expiry/revocation tests; export access checks; double-spend/idempotency/race tests; journal invariants; upload abuse limits; secrets scan; restore drills; partner callback integrity; privacy rights and deletion/retention tests; independent security assessment. None of these server guarantees is provided by GitHub Pages hosting alone.
