# Live-site validation — actual browser evidence

Repository **gganesh17g/Saakh1**, branch **main**; project `/home/thunder/shared/Saakh`. Verified application/publishing revision `e84d9c43b475ff792564edf193449085ce2924b5`. [Successful build/test/deploy workflow](https://github.com/gganesh17g/Saakh1/actions/runs/40458297033). [Published site](https://gganesh17g.github.io/Saakh1/). Production base `/Saakh1/`; production HashRouter, development BrowserRouter. User explicitly confirmed changing Pages Source to **GitHub Actions**; no authenticated settings API read is claimed.

The following evidence describes this exact application revision. The subsequent documentation/acceptance-test evidence commit does not change financial application code; the currently served revision is always exposed by [release.json](https://gganesh17g.github.io/Saakh1/release.json) and matching HTML metadata. A commit cannot contain its own SHA or the results of its own future deployment. Final follow-up deployment identity is checked after publication and reported in the delivery summary.

| Check | Reproduced competing-publisher state | Repaired local production | Exact application revision live |
|---|---|---|---|
| Asset loading | **Failed**: source module 404 | **Passed** | **Passed**: compiled JS/CSS/favicon status and MIME |
| React Router navigation | **Failed**: entry unavailable | **Passed** | **Passed**: all business/credit/public routes |
| Direct URL access | **Failed** for functioning React content | **Passed** | **Passed**: copied hash link/new tab |
| Nested route refresh | **Not Tested** as functioning application | **Passed** | **Passed**: all inspected hash routes |
| JavaScript console | **Failed**: source-entry resource error | **Passed** | **Passed**: zero monitored console/page errors |
| Network requests | **Failed**: source module and release marker 404 | **Passed** | **Passed**: zero monitored failed requests |
| Production build | **Passed** but competing publisher bypassed it | **Passed** | **Passed** in associated Actions build |
| GitHub Pages deployment | **Failed** to serve compiled app | **Passed** static subpath emulation | **Passed**: release.json and HTML exact SHA |

Local checks: 75/75 unit/component/store tests (six files), 33/33 development browser tests, 30/30 production Pages tests. Strengthened X-ray/time/evidence/replay/story interaction check: 1/1 focused, then included in the final 30. TypeScript zero errors; ESLint zero errors/warnings; build passed; npm audit zero vulnerabilities; actionlint exit 0. Fresh npm ci installed 363 packages and audited 364. Live acceptance: **13/13 passed, zero failed**, using isolated synthetic contexts. Exact commands and warnings are in TEST-REPORT.md.

Eight live widths **320, 375, 430, 768, 1024, 1280, 1440, 1920** passed: public site, business navigation, forms/dialog, charts/tables, financial routes and 3D view; no accidental horizontal overflow. Local suite additionally covers 360/390. No FPS, real-world credit accuracy, universal accessibility or all-device compatibility claim is made. Existing measured local render timings are device-specific; production build retains the large lazy WebGL chunk advisory and Zod annotation warnings.

## Actual functional acceptance

Chromium loaded the public website and all 11 feature/company/legal/support routes, all 14 business modules, all nine credit/resource routes, copied links/new tabs/Back/Forward and nested refresh. The credit case ran a modified-revenue scenario and simulation, checked score explanation and time scrubber, selected invoice/transaction evidence, ran all six Attack Lab checks, operated recorded-stage replay and reproducible snapshot, then used and skipped Story Mode. The WebGL canvas, pause/resume and camera reset worked.

The financial workflow created a confirmed synthetic ₹1,000 credit invoice, recorded ₹250 collection, checked ₹750 outstanding, refreshed/restored the record and exported actual JSON whose accounting equation balanced to zero. This ran in fresh isolated browser storage; existing users' records were not cleared. Impact and other calculated screens rendered without monitored runtime errors. Existing local tests exercise deeper financial arithmetic.

Raw live results: release-evidence/live-pages.json. Live screenshots are retained in the local test-results/pages directory and delivery outputs, not substituted for functional UI. The initial failed attempt is retained: one failed, one interrupted, eleven not run; after diagnosis and repair the complete thirteen passed. No failed attempt is hidden or counted as success.
