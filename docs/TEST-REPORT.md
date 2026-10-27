# Final test report — business upgrade

Date: 2026-10-27. Project `/home/thunder/shared/Saakh`. Node 26.11.1 / npm 11.20.0 / Chromium Playwright / Vitest 5.0.5. This replaces the current test summary; earlier report retained in history/pre-business-upgrade-TEST-REPORT.md. Final source includes ledger cleanup/export guards, upgraded dependencies and contrast adjustments.

## Final executed results

| Exact command / check | Result |
|---|---|
| `npm ci` | Passed; clean lockfile install, 363 packages added, audited 364 on install |
| `npm audit --json > /tmp/saakh-audit-final.json` | Passed, zero reported vulnerabilities after upgrades; raw JSON in evidence/npm-audit.json |
| `npm run typecheck` | Passed, 0 TypeScript errors |
| `npm run lint` | Passed, 0 ESLint errors, 0 warnings |
| `npm test` | **75 passed, 0 failed; 6 files**. 39 business financial/service tests, 6 business store tests; existing 22 engine, 4 credit store, 2 component and 2 boundary tests preserved |
| `npm run build` | Passed; strict tsc build and Vite 6.4.5, final observed build 9.73 s after contrast update; warnings below |
| `npm run test:e2e` | **33 passed, 0 failed**, 1.3 min in final full run: 13 pre-existing credit/browser/profile tests plus 19 business workflows/viewports and 1 business profile test |
| `npx playwright test tests/business.spec.ts tests/business-profile.spec.ts --grep 'responsive\|keyboard\|measure local'` | **8 passed, 0 failed**, 27.5 s after final contrast-only edit; rechecks themes, six widths, native dialog and rendering |
| `npm run test:pages` | **17 passed, 0 failed**, 31.8 s in final run; static `/Saakh/` artifact, routing, refresh, all assets, evidence/scenarios/exports/history, fallback and viewports |
| `SAAKH_BASE_PATH=/ npm run build -- --outDir /tmp/saakh-business-root --emptyOutDir` | Passed; separate root artifact; default dist retains `/Saakh/` |
| `SAAKH_BASE_PATH=/ SAAKH_DIST_DIR=/tmp/saakh-business-root npx playwright test --config playwright.pages.config.ts --grep 'production entry\|all workspace routes\|unsupported WebGL\|unknown client routes\|business workspace direct\|business legacy clean'` | **6 passed, 0 failed**, 7.7 s; selected smoke checks repeat tests under root base, not six new independent test cases |
| `node --input-type=module -` using js-yaml | Workflow parsed; main push trigger, both browser-test commands and dist artifact verified |
| `/tmp/saakh-actionlint /home/thunder/shared/Saakh/.github/workflows/deploy.yml` | Passed, exit 0, no diagnostics. Official v1.7.12 archive SHA-256 verified before execution |
| `python3 -` relative-luminance calculation | Six palette pairs checked, ratios 4.61–10.71; see evidence/contrast-checks.json |

## Financial correctness coverage

Balanced journals and balance-sheet equality; rounded discounts/taxes; credit sales with no cash; collection without repeated revenue; separate bills/payments; standard-cost variance; multi-version corrections and stock reversal; insufficient/consumed-stock rejection; proportional credits and cash-sale refunds; loan principal/interest/fees; noncash depreciation; transfer invariance; zero and invalid inputs; role/context rejection; explicit opening source; daily forecast arithmetic/reproducibility/horizons; zero-actual WAPE; flat/reducing periodic schedules and month ends; reconciliation without duplicate income or reused match; bounded CSV/XLSX sample parsing and deduplication; quotes; consent/revoke/unavailable adapters; assistant evidence/refusal; credit bridge; atomic save failure/rollback/concurrency/restore; owned-key deletion and staff denial.

Browser flows create/post an invoice, collect partly, refresh/restore, match a collection, switch forecasts, export actual balanced reports, test staff/admin guards, query assistant, onboard a second scoped business, create RFQ/quote/shortlist/outcome, round-trip the XLSX sample and remove owner data after rejecting staff deletion. Existing six Attack Lab scenarios and credit journey remain passing.

## Intermediate failures and repairs (not hidden)

- Early TypeScript test access to inferred consent.revokedAt failed once; return record now uses the explicit Consent type. Unused analytics import caused one initial ESLint error; removed.
- Initial business-only browser run: 14 passed / 1 failed; exact label selection for Scenario timed out. Correct accessible-role lookup passed; controls subsequently received explicit accessible names.
- First expanded full browser run: 29 passed / 2 failed. RFQ select label lookup and an uploaded Playwright download path without its XLSX filename failed. Explicit control naming and a named binary upload fixed these. Both selected workflows then passed, followed by 32/32 and final 33/33 full runs.
- Python YAML validation initially failed because PyYAML was unavailable. No workflow success was claimed from that attempt; js-yaml validation and checksum-verified actionlint subsequently passed.
- Initial audit: four findings (one moderate, one high, two critical). Explicit compatible upgrades to Zod 4.6.7 / Vitest 5.0.5 resolved them; clean install, all tests and final audit passed. No blanket force-fix was used.
- Official-source TLS/read failures are documented in REGULATORY-RESEARCH-SOURCES.md, not treated as reviewed content.

## Responsive, keyboard and console checks

Widths **1440, 1280, 1024, 768, 390, 360** passed horizontal-overflow and visible-heading checks in the legacy routes and new business routes. New mobile drawer navigation, responsive forms, both themes and native dialog Escape dismissal were exercised. Existing Tab focus, reduced-motion preference and keyboard graph inspector tests passed. Screenshots were inspected. Monitored main business and Pages flows had no unexpected console errors, page exceptions or asset failures. Intentional legacy clean-path migration returns an HTTP 404 document before recovering; it is not a missing JavaScript module.

This is not a complete WCAG, screen-reader, touch-device or contrast certification. Selected palette ratios were calculated; all rendered color combinations were not exhaustively measured.

## Measured production render observations

Local strict static Pages server, headless Chromium, one desktop load and one warm mobile-width reload. Timing includes page navigation until heading and chart visibility; it is not FPS or a physical-device/network-throttled benchmark.

| Viewport | Ready until heading/chart | First contentful paint | Observed resources |
|---|---|---|---|
| 1440px | 1192 ms | 144 ms | 6 |
| 390px | 410 ms | 56 ms | 6 |

Raw development and production observations are in evidence/development-performance.json and evidence/production-performance.json. Early cold development loading reached about 9.6 s during dependency optimization; the final saved development sample is reported verbatim, not substituted for production. Cached observations cannot establish a general performance guarantee.

Final main entry ~393.33 kB / 123.12 kB gzip; business lazy module ~122.58 kB / 39.89 kB gzip; Recharts lazy chart ~394.76 kB; existing 3D lazy chunk ~920.10 kB / 249.52 kB gzip. The business route does not load the 3D scene. A >500 kB chunk advisory remains. Zod emits two Rollup comment-annotation warnings (comments removed by bundler), not compile errors. npm ci also reported deprecations for Recharts 2, ESLint 9 and whatwg-encoding and an esbuild install-script allowlist notice. Playwright NO_COLOR/FORCE_COLOR notices are tooling warnings.

## Verification limits

No real bank/AA/lender/GST/ONDC/messaging integration or secure backend was tested because none exists. No real forecasting accuracy, fraud-detection accuracy, statutory accounting compliance or regulatory approval is established. Live site HTTP check failed with 404; local artifact tests do not prove public deployment. Git checks could not operate without .git; details in FILE-CHANGES-REPORT.md.

## Post-generation delivery checks

Executed a Python inventory/link/archive check after report generation: all 93 source/config/documentation/test files matched the recorded 47-created / 15-modified inventory; every changed path appears in FILE-CHANGES-REPORT.md; no baseline path was deleted; original README/CHANGELOG/architecture/features/guide text was preserved; relative links in new/current reports resolved. `git diff --no-index --check <captured-baseline-file> <current-file>` produced no whitespace diagnostics for modified code/configuration. Default dist still references `/Saakh/assets/`, not `/src/main.tsx`. The delivered production preview was also opened and its populated Business Pulse verified in the browser.
