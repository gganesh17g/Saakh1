# Saakh1 release test report — 27 October 2026

Previous business-upgrade report is preserved verbatim in history/pre-saakh1-release-TEST-REPORT.md. These are fresh results for this release, not reused historical counts.

| Executed command | Actual result |
|---|---|
| `npm ci` | Passed, clean lockfile installation; 363 packages installed, audit zero |
| `npm run typecheck` | Passed, zero TypeScript errors |
| `npm run lint` | Passed, zero ESLint errors/warnings |
| `npm test` | 75 passed, 0 failed, 6 files; Vitest 5.0.5 |
| `npm run build` | Passed; Vite 6.4.5 compiled artifact under /Saakh1/; 22.50 s initially and 12.52 s after clean install |
| `npm run test:e2e` | 33 passed, 0 failed; 1.5 min |
| `npm run test:pages` | 30 passed, 0 failed; 52.5 s; raw results release-evidence/local-pages.json |
| `npm audit --json > /tmp/saakh1-audit.json` | Zero reported vulnerabilities; raw JSON release-evidence/npm-audit.json |
| `/tmp/saakh-actionlint .github/workflows/deploy.yml` | Passed, exit 0, no diagnostics |
| `git diff --check` | Passed, no whitespace diagnostics |

## Coverage

Existing 75 calculation/component/store tests cover all four credit engines, attack scenarios, paise accounting, balanced financial statements, no duplicate revenue, refunds/stock/reversals/loans, forecast/financing arithmetic, imports, access guards and atomic persistence. Existing 33 development browser tests freshly passed, including business CRUD/payment/refund-related paths, role checks, RFQ/quote, imports, restored history, deletion and the original credit/3D journey.

The 30 production tests include the previous 17 static-host checks plus 13 release acceptance cases: exact artifact identity; compiled JS/CSS/favicon response and MIME checks; all 11 product/info pages with refresh; all 14 business modules; copied deep link in a new tab, Back/Forward; all credit/resource routes; WebGL controls; scenario comparison; simulation and evidence; all six Attack Lab scenarios; confirmed credit invoice, partial collection, balanced JSON export and restored status; eight responsive cases at **320, 375, 430, 768, 1024, 1280, 1440, 1920 px**, including forms/charts/tables/3D routes.

Monitored production flows recorded no uncaught exceptions, console errors or failed requests. Recognized legacy clean paths intentionally serve the generated HTTP-404 recovery document before redirecting to a hash route. No financial engines were replaced with mock pages, and the tests use isolated synthetic contexts rather than clearing existing user data.

## Warnings and limits

Build retains the existing >500 kB lazy WebGL chunk advisory and two Zod comment-annotation warning categories. Playwright prints NO_COLOR/FORCE_COLOR notices. These are disclosed warnings, not compilation failures. No current test failures occurred in this release run. The initial attempt to read an incorrect job ID returned 404; the actual historical workflow job was then read and its configure-pages Not Found error verified. GitHub settings public read returned 404 and the browser settings page was signed out; neither establishes the current authenticated Source value.

These results are local validation. Cloud workflow and live exact-SHA checks are pending publication and are recorded separately in GITHUB-DEPLOYMENT-REPORT.md and LIVE-SITE-VALIDATION.md. They do not establish regulated-service accuracy, production authentication, tax compliance or live bank/lender integration.

After clean npm ci, typecheck, lint, all 75 unit tests and the production build passed again. Install emitted existing Recharts/ESLint/whatwg-encoding deprecation and esbuild allowlist notices; no lockfile or dependency changes were made by this release.

A generated report initially had an extra blank line at EOF; git diff --check detected it. The generator was corrected and the final whitespace check passed before staging.
