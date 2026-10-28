# Saakh 4.0 — financial operating workspace

This release extends the existing local MSME platform with role-aware workspace tools, searchable business switching, tasks and alerts, recoverable invoice forms, source-linked records, Insights and saved scenarios, a business financial network, and validated separate-business backup restoration. Financial posting still uses the existing paise ledger and credit engines.

**Local demonstration only:** no secure accounts, live banking, tax filing, transfers, external messaging or cloud synchronization. Use fictional data. Backups are unencrypted. [Requirements and boundaries](docs/SAAKH-4-REQUIREMENTS-MATRIX.md).

Verified application `673a972` passed cloud 156 unit, 33 development-browser and 61 production-browser tests, plus all 61 live acceptance tests. [Deployment evidence](docs/SAAKH-4-DEPLOYMENT-VALIDATION.md) distinguishes the application from its later reports/test-harness follow-up.

## Run and validate

From `/home/thunder/shared/Saakh`, using Node 26:

```sh
npm ci
npx playwright install chromium
npm run dev
```

Development: `http://localhost:5173/`. Production commands:

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run test:pages
npm run preview
```

Preview: `http://localhost:4173/Saakh1/#/business`. `npm run preview:pages` serves the strict static Pages-subpath test fixture on port 4175. Run browser suites serially; copy their evidence before another suite cleans `test-results`.

Public entry offers Business Demo, Continue Previous Session and Team Roles. Inside the business workspace, use **+ Create**, **Search** (Ctrl/Cmd+K), **Alerts**, **Ask Saakh**, and the separate **Demo roles** screen. New routes include `tasks`, `approvals`, `roles`, `insights`, `scenarios`, `explorer`, `preferences`, `help`, and `data` under `#/business/`.

**Data Management:** export the selected business, validate a backup preview, and explicitly restore it as a separate business. Original records are retained. Financial forms never post through autosave. Supported invoice editor drafts can be resumed after navigation or refresh.

See [implementation](docs/SAAKH-4-IMPLEMENTATION-REPORT.md), [requirements](docs/SAAKH-4-REQUIREMENTS-MATRIX.md), [architecture](docs/SAAKH-4-ARCHITECTURE.md), [financial integrity](docs/SAAKH-4-FINANCIAL-INTEGRITY.md), [migration](docs/SAAKH-4-DATA-MIGRATION.md), [accessibility](docs/SAAKH-4-UX-ACCESSIBILITY.md), [3D/performance](docs/SAAKH-4-3D-PERFORMANCE.md), [test results](docs/SAAKH-4-TEST-RESULTS.md), [deployment](docs/SAAKH-4-DEPLOYMENT-VALIDATION.md), and [file changes](docs/SAAKH-4-FILE-CHANGES.md). Exact final validation and live status are recorded in those reports.

## Saakh 3.0 release documentation — preserved

# Saakh 3.0 — connected business operations

Verified application release `3e372fa` passed its deployment workflow and 25 live acceptance tests (123 unit, 33 development and 42 production tests also passed). The subsequent report-only commit preserves the same application code; current artifact identity is available in `release.json`.

This release extends the existing local MSME platform with **Payroll Management**, **Customer Management**, **Sales Returns**, **Purchase Returns** and automatic FY invoice generation in the existing Sales & Invoices form. All use the same paise ledger, stock, local persistence and audit events. Earlier documentation remains below for provenance.

Run from `/home/thunder/shared/Saakh` using Node 26:

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run test:pages
npm run preview
```

Production preview: `http://localhost:4173/Saakh1/#/business`. New routes: `#/business/customers`, `#/business/payroll`, `#/business/sales-returns`, `#/business/purchase-returns`. Source remains `gganesh17g/Saakh1` main; only the existing tested Vite dist workflow publishes. Browser tests require `npx playwright install chromium` when not installed. No API keys required.

Start with **Business Pulse → Load operations examples** to add coherent fictional employees, payroll, repeat sales, customer credit and supplier refund receivable to the selected business without resetting existing data. Or create a customer, leave the new sale's number blank for automatic FY numbering, and use invoice Details to create a quantity return. For payroll, add an employee/salary and effective assumption rule, review attendance, create/calculate/approve/finalize a run, then separately record payments. Payslips/invoices/statements have actual PDF and browser print outputs.

Existing v1 storage is migrated additively to v2 in the same IndexedDB key, including an additive operations revision for noncash credit metadata. Export a backup before experimenting. A failed restore blocks writes and offers the untouched recovery record. The original Team & Settings typed deletion remains available; no silent reset occurs.

All employee/customer/payment records must be synthetic. Contributions/taxes are entered, effective-dated **illustrative assumptions**, not certified statutory calculations. No real bank transfers, filing, IRN, messages or production authorization. Monthly split-period, PDF-font and stock-cost boundaries are documented in [known limitations](docs/SAAKH-3-KNOWN-LIMITATIONS.md).

See [implementation](docs/SAAKH-3-IMPLEMENTATION-REPORT.md), [requirements](docs/SAAKH-3-REQUIREMENTS-MATRIX.md), [payroll method](docs/PAYROLL-METHODOLOGY.md), [regulatory readiness](docs/PAYROLL-AND-GST-READINESS.md), [returns](docs/RETURNS-ACCOUNTING-RULES.md), [invoicing](docs/AUTOMATIC-INVOICING-WORKFLOW.md), [customers](docs/CUSTOMER-DATA-MODEL.md), [financial tests](docs/FINANCIAL-INTEGRATION-TESTS.md), [test report](docs/SAAKH-3-TEST-REPORT.md), [deployment](docs/SAAKH-3-DEPLOYMENT-VALIDATION.md) and [file changes](docs/SAAKH-3-FILE-CHANGES-REPORT.md).

## Earlier releases — preserved documentation

# Current Saakh1 release and deployment

Target repository: **gganesh17g/Saakh1**, branch **main**. Live URL: https://gganesh17g.github.io/Saakh1/. Production base: `/Saakh1/`; development remains `/`. The earlier `/Saakh/` instructions below are retained historical documentation and are superseded by this section.

```sh
cd /home/thunder/shared/Saakh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run test:pages
npm run preview
```

Preview: `http://localhost:4173/Saakh1/#/business`. Strict static host: `npm run preview:pages`, then `http://127.0.0.1:4175/Saakh1/`. Install Chromium with `npx playwright install chromium` when needed. Production uses HashRouter; `/Saakh1/#/business`, `/Saakh1/#/app` and `/Saakh1/#/product/accounting` support copied links and refresh. Recognized old clean paths migrate through the generated 404 document.

**Verified release:** Application revision `e84d9c4` passed live exact-commit acceptance (13/13). Reports distinguish application verification from the later evidence commit. Two concurrent raw/Jekyll templates are now manual guidance only; keep `deploy.yml` as the sole publisher.

**Publishing:** Settings → Pages → Source must be **GitHub Actions**, rather than a branch/Jekyll build. The existing official pinned workflow runs lockfile install, type/lint/unit/build and both browser suites, uploads only `dist`, then deploys. No credentials, source TSX, node_modules or test output belong in the Pages artifact. The workflow passes its exact commit SHA as `SAAKH_RELEASE_SHA`; generated `release.json` and the HTML `saakh-release` meta value identify the artifact being served. Local builds identify as `local`.

Live-compatible acceptance checks:

```sh
SAAKH_TEST_URL=https://gganesh17g.github.io/Saakh1/ SAAKH_EXPECTED_SHA=ACTUAL_DEPLOYED_COMMIT npx playwright test --config playwright.pages.config.ts tests/pages/release.spec.ts
```

This runs isolated synthetic browser contexts; it does not delete existing users’ browser data or contact banks, lenders or government systems. All 14 business modules, credit engines, WebGL graph and local data boundaries are retained. The assistant and financial services remain synthetic demonstration tools.

Current evidence: [deployment](docs/GITHUB-DEPLOYMENT-REPORT.md), [sync](docs/GITHUB-SYNC-REPORT.md), [live site](docs/LIVE-SITE-VALIDATION.md), [tests](docs/TEST-REPORT.md), [file changes](docs/FILE-CHANGES-REPORT.md).

## Earlier project documentation — retained for provenance

# Saakh — digital munim & credit intelligence demo

Know your money. Plan your next move.

The business upgrade adds `/business` alongside the original `/app` credit workspace. Both use local synthetic data. Browser demo roles are not secure accounts. No bank, lender, messaging, GST, AA or ONDC integration is live.

## Exact local commands

Run from `/home/thunder/shared/Saakh` with Node 26 and npm (validated environment: Node 26.11.1, npm 11.20.0).

```sh
npm ci
npm run dev
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run test:pages
npm run preview
```

Development: `http://localhost:5173/business`. Production preview uses the `/Saakh/` base: `http://localhost:4173/Saakh/#/business`. Strict static Pages emulation: `npm run preview:pages` → `http://127.0.0.1:4175/Saakh/#/business`. `SAAKH_BASE_PATH=/ npm run build` builds a root-hosted artifact. Rebuild the default artifact before deploying to repository Pages. No environment secrets are needed.

First visit seeds Shree Ganesh Traders synthetic data. New business requires explicit source/date/opening confirmation. Owners may select demo staff/accountant/admin views to test function guards; these are not authenticated permissions. Use synthetic uploads only. Reports exports actual current records; Team & Settings removes owned saved keys after typed DELETE. Browser deletion does not remove downloaded copies.

See [implementation status](docs/IMPLEMENTATION-REPORT.md), [requirements matrix](docs/PRODUCT-REQUIREMENTS-MATRIX.md), [ledger methodology](docs/ACCOUNTING-METHODOLOGY.md), [tests](docs/TEST-REPORT.md), [limitations](docs/KNOWN-LIMITATIONS.md), [regulatory research](docs/REGULATORY-RESEARCH-SOURCES.md), and [file changes](docs/FILE-CHANGES-REPORT.md).

## Prior credit-platform documentation (preserved)

# Saakh (साख) · v1.2.0

Credit Intelligence Beyond the Credit Score

A local-first MSME credit intelligence demonstration for Hackathon 4.0, Track 3: FinTech AI, IES MCRC Mumbai. All businesses, transactions, scores and estimates are synthetic. No lending decisions or financial integrations occur.

## Requirements and setup

Developed with Node 26.11.1 and npm 11.20.0 on Linux. Use a modern Node version supporting Vite 6.

```sh
cd /home/thunder/shared/Saakh
npm ci
npm run dev
```

Open http://localhost:5173. No environment variables, API keys, login, backend, or cloud account is required.

```sh
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
npm run preview
npm run format
```

Production preview normally serves http://localhost:4173/Saakh/. Publish only `dist/`; production uses hash routes and a generated legacy-route 404 migration. Browser IndexedDB storage is origin-specific; development and preview histories are separate.

## Product

- Public product story and interactive synthetic surplus sensitivity.
- Overview with explainable score, cash charts, source coverage, interactive trade network and time inspection.
- Generate Simulation: borrower CRUD, source toggles, financial twin editing and up to three scenario comparisons.
- Verify & Investigate: identifier search, evidence links, graph inspection, notes and audit stages.
- Attack Lab: six repeatable scenarios, expected/actual outcomes and regression indicators.
- Impact Dashboard: editable lender cost and benefit model.
- Reports: reproducible JSON, daily ledger CSV, history export, stage replay, print/save-PDF.
- Responsible AI, Settings and a five-checkpoint guided demonstration.

## Structure

`src/domain` schemas/types; `src/fixtures` synthetic borrowers; `src/engines` pure calculations; `src/state` Zustand pipeline and IndexedDB; `src/components` graph/charts; `src/pages` workspace routes; `src/utils` exports; `tests` browser acceptance; `docs` methodology and limitations.

Read [methodology](docs/FINANCIAL-METHODOLOGY.md), [limitations](docs/LIMITATIONS.md) and [test report](docs/TEST-REPORT.md) before interpreting results. This is a functional prototype, not a validated production lending system.

## Disclaimer

Saakh is a prototype simulation for demonstration and educational purposes. Scores, forecasts, alerts, recommendations, and financial-impact estimates use synthetic data and illustrative assumptions. They are not credit ratings, lending offers, fraud determinations, or financial advice.

## GitHub Pages deployment

The verified repository is `Ganesh-g18/Saakh`, published at https://ganesh-g18.github.io/Saakh/. Production builds default to `/Saakh/`; local development remains at `/`. Production uses hash routes, such as `/Saakh/#/app/verify`, so static hosting can refresh and open direct application links. The generated `404.html` migrates legacy clean `/app` URLs.

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run test:pages
npm run preview:pages
```

`preview:pages` serves only the built files under http://127.0.0.1:4175/Saakh/ with no implicit SPA fallback. `npm run test:e2e` retains the development regression suite; `npm run test:pages` validates the real production artifact at its deployment prefix. Chromium must be installed (`npx playwright install chromium`).

In GitHub **Settings → Pages → Build and deployment**, select **GitHub Actions**. Push the source and `.github/workflows/deploy.yml` to `main`, or dispatch the workflow manually. It installs locked dependencies, runs checks/tests, builds, validates the actual Pages metadata path, uploads only `dist`, and deploys using official Pages Actions. No API keys or manually created secrets are required; the workflow uses GitHub's scoped token. Do not publish the source tree or `docs/` as the website.

For a root/custom-domain deployment, build with `SAAKH_BASE_PATH=/ npm run build`; use the same override for local Pages preview/tests. The workflow derives this setting from `actions/configure-pages` metadata instead of guessing a repository name.

Detailed deployment instructions and the actual verification status are in [GITHUB-PAGES-DEPLOYMENT.md](docs/GITHUB-PAGES-DEPLOYMENT.md), [GITHUB-PAGES-FIX-REPORT.md](docs/GITHUB-PAGES-FIX-REPORT.md), [FILE-CHANGES-REPORT.md](docs/FILE-CHANGES-REPORT.md), and [DEPLOYMENT-VALIDATION.md](docs/DEPLOYMENT-VALIDATION.md). Local validation is not evidence that GitHub has published the repaired version.
