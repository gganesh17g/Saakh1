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
