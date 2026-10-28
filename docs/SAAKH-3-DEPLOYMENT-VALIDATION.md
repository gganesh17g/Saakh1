# Saakh 3.0 — verified deployment

Date: 28 October 2026. **Status: application published and verified live.** Project `/home/thunder/shared/Saakh`; repository `gganesh17g/Saakh1`, branch `main`; [published site](https://gganesh17g.github.io/Saakh1/). Verified application source **3e372fa51f7ca37771e2b9f859074a06cadd5096**; [successful workflow](https://github.com/gganesh17g/Saakh1/actions/runs/40640349523). The later report/evidence-only commit does not change application code. Its exact current source identity is exposed by release.json and HTML saakh-release metadata and checked after publication in the final delivery record; a document cannot contain its own future commit SHA.

## Source synchronization

Initial local/origin main was 353ecf73f226747570653b24aca144683bf4b222, clean with 109 tracked files. Backup branch backup/pre-saakh3-20261028 preserves it. Authenticated connector confirmed push permission. Initial operations release c962e2b and payroll privacy follow-up c42359d both passed their workflows. Final reviewed application 3e372fa includes additive credit-metadata migration, source liability separation, salary-version normalization and non-stock supplier returns. Expected-head, non-force updates preserved all ancestry. Local staged tree SHA matched each API-created tree before updating main; fetched remote and local index were compared before advancing the local ref. No unrelated user changes, force push or source replacement.

## Hosting

Production base /Saakh1/, development /, HashRouter and generated legacy-route 404 migrator preserved. No workflow file was changed. Only deploy.yml automatically publishes tested compiled dist; raw-source/Jekyll templates remain manual guidance. Source settings were previously confirmed by the user as GitHub Actions; this task does not claim a fresh authenticated settings API read. configure-pages, compiled upload and deploy steps succeeded. No admin token, source TSX, credentials, node_modules or local browser data were published as site content.

The associated build and deploy jobs both succeeded; uploaded github-pages artifact ID 12795247343, 821160 bytes, not expired when checked. Cloud log excerpts confirm **123 unit/integration tests**, **33 development browser tests**, **42 production Pages tests**, zero failures; build **9.33 seconds**. Exact jobs/steps/artifact data: saakh3-evidence/cloud-deployment.json.

## Actual live acceptance

Command executed:

```sh
SAAKH_TEST_URL=https://gganesh17g.github.io/Saakh1/ SAAKH_EXPECTED_SHA=3e372fa51f7ca37771e2b9f859074a06cadd5096 npx playwright test --config playwright.pages.config.ts tests/pages/operations3.spec.ts tests/pages/release.spec.ts
```

**25 passed, 0 failed, 54.1 seconds**, in isolated synthetic browser contexts. Raw final application-run JSON: saakh3-evidence/live-tests.json. Root HTML references compiled /Saakh1/assets JavaScript/CSS; no /src/main.tsx or doubled prefix. release.json and HTML meta matched the exact expected application SHA. JS/CSS/favicon status and MIME checks passed. Zero monitored console/page errors or failed requests in the acceptance flows.

| Acceptance | Result / actual behavior |
|---|---|
| Public/old/new modules | Passed — public feature/company/legal routes, all original 14 business modules, 4 new routes and original credit/resource routes |
| Payroll A | Passed — fictional employee, salary/attendance/rule, calculate/approve/finalize, payslip real PDF, partial payment, restored state, salary payable and balanced exported financials |
| Customer sales B/D | Passed — register customer, auto numbered stock sale/invoice PDF, partial collection, quantity return/credit/refund, repeat sale using saved profile, statement PDF/history and reload |
| Supplier return C/E | Passed — bill/stock receipt, return approval, distinct dispatch, supplier credit, remaining payment, zero pending asset and balanced report |
| Privacy/recovery data | Passed — staff payroll restriction and hidden personal payroll journals, attendance-only manager, committed owner restoration, seeded employee edit and source activity search; old-record migrations tested in unit/store suite |
| Original intelligence | Passed — simulation/scenario, factor X-ray, time scrubber, evidence, graph pause/reset, six Attack Lab checks, replay/snapshot and guided tour |
| Navigation/persistence | Passed — direct hash links, nested refresh, copied new-tab link, Back/Forward and local restored records |
| Responsive/keyboard | Passed — 320, 375, 430, 768, 1024, 1280, 1440, 1920; forms, tables, new routes, 3D and keyboard form opening; no page-level horizontal overflow |

Live screenshot artifacts (375 and 1440 payroll plus all-width forms) are retained in local test-results/pages and copied into the delivery outputs; they show actual rendered records, not substitutes for functional screens. Real print document paths exist; headless tests verify generated PDF contents, not native OS print-dialog interaction. Local performance measurements are disclosed in the test report; no FPS claim.

## Local start and limits

Node 26; npm ci, npm run dev. Verify with npm run typecheck, npm run lint, npm test, npm run build, npm run test:e2e, npm run test:pages. npm run preview → http://localhost:4173/Saakh1/#/business. No API keys/cloud database needed. See SAAKH-3-KNOWN-LIMITATIONS.md for browser-local authorization, monthly payroll/statutory assumptions, standard-cost stock, PDF fonts and non-operational external integrations. No manual GitHub action is currently required; keep deploy.yml as the sole publisher.
