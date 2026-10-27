# Deployment validation — final business upgrade

Date 2026-10-27. **Locally verified only; live publication not verified.** Project `/home/thunder/shared/Saakh`. Earlier report is preserved in history/pre-business-upgrade-DEPLOYMENT-VALIDATION.md.

## Configuration and observed repository

- Repository confirmed through GitHub connector: `Ganesh-g18/Saakh`, public, default branch `main`. Local directory has no Git metadata. Push permission was reported by the connector, admin permission was false; no remote changes were made.
- Production Vite base `/Saakh/`, development root `/`. `SAAKH_BASE_PATH` overrides and validates a directory path. Default dist contains compiled assets, `.nojekyll` and `404.html`, not an unbuilt source entry.
- Production HashRouter: `/Saakh/#/business`, `/Saakh/#/app`, `/Saakh/#/product/privacy`; development BrowserRouter for clean localhost routes. Legacy clean business/product paths are now included in the static 404 migrator along with existing app paths.
- `.github/workflows/deploy.yml`: main push/manual trigger, Node 26, npm ci, strict type/lint/unit, metadata-derived Pages base, production build, Chromium, both `test:e2e` and `test:pages`, upload **dist only**, official pinned Actions and deploy job. Workflow structure and actionlint passed locally; this modified workflow has not run remotely.

## Executed production checks

Final `/Saakh/`: **17/17 passed**. Root-base artifact: **6/6 selected smoke checks passed**. Full development browser suite: **33/33 passed** plus **8/8** focused view/theme/keyboard checks after the final contrast edit. Type/lint/build and **75/75** unit/component/store tests passed. Exact commands, warnings, failures repaired and measured results are in TEST-REPORT.md. Evidence: evidence/pages-tests.json, evidence/root-hosting-tests.json, evidence/validation-summary.json.

| Item | Before current upgrade | Final local production | Current public URL |
|---|---|---|---|
| Asset loading | Not Tested afresh; existing Pages repair already present in baseline | Passed — every compiled asset and favicon requested successfully | Failed — supplied entry URL returned HTTP 404; current asset payload unavailable |
| Router navigation | Not Tested afresh; preserved original credit routes | Passed — credit and business hash links, back/forward | Blocked by unavailable entry |
| Direct URL access | Not Tested afresh | Passed — hash links and emitted legacy migrator | Failed for provided root URL |
| Browser refresh | Not Tested afresh | Passed — inspected hash routes refresh | Not Tested as a functioning live app |
| JavaScript console | Not Tested against untouched baseline | Passed in monitored normal routes | Not Tested in this task against live browser; HTTP-only current check |
| Network requests | Not Tested against untouched baseline | Passed — no unexpected normal-flow asset failures | Failed — public entry 404 |
| Production build | Not Tested against untouched baseline | Passed — final strict build plus root override | Not Tested on cloud for this upgrade |
| GitHub Pages publication | Prior report recorded source-HTML blank screen | Passed on strict local static host | Failed availability check; actual hosting/configuration cause unconfirmed |

## Live evidence and remaining action

[Provided public URL](https://ganesh-g18.github.io/Saakh/) returned **HTTP 404** during the 2026-10-27 read-only check (evidence/live-site-check.json). Do not describe it as a successfully deployed upgrade. Public Actions history contained an older successful “pages build and deployment” run at commit `4e86817d814d4a1e24afb4dcaa7c09d920a17d2b` on Oct 26, 2026; that does not establish the public URL is available or that this local source was deployed. See evidence/remote-workflows.json. Exact current Pages source/settings could not be established from those facts; no cause such as a wrong setting, deletion, disabled Pages or cache is claimed as confirmed.

To publish, compare this local upgrade with remote main without overwriting remote work, commit/push a reviewed integration, select **Settings → Pages → Source: GitHub Actions**, run the supplied workflow, satisfy any github-pages environment approval, and inspect the resulting published URL, assets, refresh and main flows. An administrator may need to configure Pages. Do not upload repository source or node_modules as the site. Live verification remains pending; no push, workflow dispatch, settings change or deployment was attempted.

## Start locally

```sh
cd /home/thunder/shared/Saakh
npm ci
npm run dev
```

Production preview after `npm run build`: `npm run preview`, then `http://localhost:4173/Saakh/#/business`. Strict static emulation: `npm run preview:pages`, then `http://127.0.0.1:4175/Saakh/#/business`. No API keys or external database required.
