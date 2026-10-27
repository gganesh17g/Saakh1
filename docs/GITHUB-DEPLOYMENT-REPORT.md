# GitHub Pages deployment — verified application release

Repository **gganesh17g/Saakh1**, branch **main**; project `/home/thunder/shared/Saakh`. Verified application/publishing revision `e84d9c43b475ff792564edf193449085ce2924b5`. [Successful build/test/deploy workflow](https://github.com/gganesh17g/Saakh1/actions/runs/40458297033). [Published site](https://gganesh17g.github.io/Saakh1/). Production base `/Saakh1/`; production HashRouter, development BrowserRouter. User explicitly confirmed changing Pages Source to **GitHub Actions**; no authenticated settings API read is claimed.

The following evidence describes this exact application revision. The subsequent documentation/acceptance-test evidence commit does not change financial application code; the currently served revision is always exposed by [release.json](https://gganesh17g.github.io/Saakh1/release.json) and matching HTML metadata. A commit cannot contain its own SHA or the results of its own future deployment. Final follow-up deployment identity is checked after publication and reported in the delivery summary.

## Confirmed diagnosis and repair

The blank screen was reproduced during this task after concurrent publishing workflows appeared. Live HTML returned HTTP 200 with `<script type="module" src="/src/main.tsx">`; that host-root module returned 404, and release.json was absent (404). React could not load its entry. This is confirmed evidence, not a suspected engine or WebGL problem. See release-evidence/intermediate-live-response.json and initial-live-failure.json.

The concurrent user commits d6eeee4 (Jekyll template) and a4a4b24 (static template) were fetched without rewriting history. Both triggered on main; the static workflow uploaded `.` and Jekyll built source instead of Vite dist. Run 40457782305 published Jekyll while the Vite run was cancelled. The earlier first release run 40457643022 itself passed, but competing publication means its success did not establish what the URL served. At the start of this task the site had rendered; therefore this later reproduced failure is distinguished from the initially healthy baseline and from the historical original Saakh incident.

Repair e84d9c4 preserves both template filenames and Git ancestry, but converts them into manual guidance jobs with read-only contents permission and no upload/deploy. Only deploy.yml publishes: npm ci → strict type/lint/unit → Vite build → development/production browser tests → upload dist → deploy-pages. Existing remote correction 4cd6e8c for /Saakh1/ is preserved and credited to its author. Current release metadata establishes artifact identity; aligned preview/test defaults and feedback link do not change any financial calculation or saved-data schema.

## Validation

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

## Remaining boundaries

No manual deployment action is currently required after the user's Source change. Keep Source set to GitHub Actions and deploy.yml as the sole publisher. Avoid re-enabling raw-source/Jekyll publication. Official pinned Actions and scoped permissions are retained; no private administrator token is added. Browser-local data is not secure multi-user storage; banking, lenders, AA, messaging, GST filing and production authentication remain demo-only. The root error boundary cannot recover a missing bootstrap script, which is why correct artifact publication is required.

References reviewed: [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages), [Pages settings API permission requirements](https://docs.github.com/en/rest/pages/pages#update-information-about-a-github-pages-site). GitHub requires Administration-write plus Pages-write for that settings API; the user performed the admin setting change.
