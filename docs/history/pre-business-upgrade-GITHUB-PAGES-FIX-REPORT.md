# GitHub Pages blank-screen repair report

## Status

**Repair status: Partially Fixed — local code/artifact repair verified; live publication pending.**

Project: `/home/thunder/shared/Saakh`. Verified repository: [Ganesh-g18/Saakh](https://github.com/Ganesh-g18/Saakh), default branch main. Reported site: [https://ganesh-g18.github.io/Saakh/](https://ganesh-g18.github.io/Saakh/). Source changes: **11 created, 10 modified, 0 renamed, 0 deleted**, 21 files total. No original source/documentation file was deleted or renamed.

## Confirmed root cause

The published HTML is the **unbuilt Vite source index.html**, not dist/index.html. The live page returns HTTP 200 but contains `<script type="module" src="/src/main.tsx"></script>`. That resolves to `https://ganesh-g18.github.io/src/main.tsx`, which returns **404**. The browser records a failed-resource console error, failed request, and an empty rendered body. React cannot bootstrap because its entry module never loads. The live 598-byte HTML matches the pre-edit source entry.

The repository has no `.github/workflows` directory in the public API inspection. This supports the missing build/deployment-pipeline diagnosis; the exact authenticated Pages branch/source setting was not available and is **not claimed as confirmed**.

## Additional confirmed deployment defects

- Vite had no configured base and emitted host-root `/assets/...` URLs. Mounting the original compiled artifact under `/Saakh/` reproduced missing JS/CSS and a blank body. Thus merely uploading the old dist would still be unsafe at this project prefix.
- BrowserRouter used clean `/app/...` paths without a static-host fallback; the real `/Saakh/app/verify` request returned 404.
- Source favicon used `/favicon.svg`, outside the project prefix.
- There was no root React recovery boundary or fallback for a WebGL exception occurring after capability detection. No WebGL failure was observed as the cause of the live blank page.

No case-sensitive import mismatch, missing production runtime package, API key, or financial engine defect was identified. Successful Linux builds and loaded lazy modules provide evidence against those causes in the tested artifact, not an exhaustive proof for all devices.

## Targeted repair

`vite.config.ts` now selects root base for local development and verified /Saakh/ for builds/previews, with a validated SAAKH_BASE_PATH override. GitHub Actions takes base_path from configure-pages metadata. `index.html` uses %BASE_URL% for its public favicon. Production HashRouter keeps application routes in the URL fragment without a basename; React Router links become `/Saakh/#/app/...`. The development BrowserRouter remains unchanged. Landing section links and skip focus preserve the hash router.

The build emits .nojekyll and an explicit 404 document: legacy clean /app URLs migrate to the equivalent hash route; unrelated missing pages show a recovery link. A root ErrorBoundary logs and shows actual post-bootstrap React failures, with retry/reload/home recovery. A graph-scoped boundary reuses the existing data-driven SVG inspector when Canvas fails. An error boundary cannot repair a missing initial script; publishing a correct built artifact solves that root cause.

The official Actions workflow installs via npm ci, runs strict type/lint/unit checks, builds with metadata-derived base, runs the 14-test strict production suite, uploads only dist, then deploys via Pages. Scoped permissions, protected github-pages environment, serialized deployments and full action SHA pins are included. No node_modules, credentials or unrelated product changes are introduced into deployment artifacts.

## Before and after

| Item                    | Before                                                                                                | Repaired local production                               | Repaired live deployment                 |
| ----------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------- |
| Asset loading           | **Failed** — raw source module 404; old compiled JS/CSS prefix reproduction also fails                | **Passed** — every emitted JS/CSS and favicon 200       | **Blocked** — not published              |
| React Router navigation | **Failed** — live React never bootstrapped; browser-history strategy unsuitable for static deep links | **Passed** — all five areas, back/forward               | **Blocked**                              |
| Direct URL access       | **Failed** — clean app URL 404                                                                        | **Passed** — hash links and tested legacy 404 migration | **Blocked**                              |
| Browser refresh         | **Not Tested** as a working live app before repair; direct clean URL failure confirmed                | **Passed** — all five hash routes refresh               | **Blocked**                              |
| JavaScript console      | **Failed** — resource-load error; no JS exception because entry missing                               | **Passed** — zero errors in normal monitored flows      | **Blocked**                              |
| Network requests        | **Failed** — source module 404; compiled-prefix baseline JS/CSS 404                                   | **Passed** — no failed normal flow requests             | **Blocked**                              |
| Production build        | **Not Tested** as a fresh before-repair command; existing bad-prefix artifact inspected               | **Passed** — final strict build, 404/.nojekyll emitted  | **Blocked** for cloud execution          |
| GitHub Pages behavior   | **Failed** — blank published page observed                                                            | **Passed** on exact-prefix strict static fixture        | **Blocked** pending authenticated deploy |

## Validation and residual risks

30/30 unit/component/state tests, 13/13 existing browser regressions, 14/14 production Pages tests and 4/4 root-base smoke checks. TypeScript and ESLint pass; actionlint v1.7.12 reports no diagnostics. Full commands, intermediate failures and environment details are in DEPLOYMENT-VALIDATION.md.

The existing large 3D bundle advisory remains. A page unload during an uncommitted asynchronous note write can lose that last write; the regression test verifies durable commit before reloading. Browser-local synthetic-data limitations remain unchanged. The workflow has not run on GitHub; permissions, Pages source setting and any environment approval must be confirmed there.

No authenticated GitHub write tool was connected and the local directory lacks Git metadata; no source push or live settings change was made. Local production validation passed but **live GitHub Pages verification remains pending**.

## Primary references

- [Vite static deployment guidance](https://vite.dev/guide/static-deploy): project-repository base and publishing built dist.
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): official build/upload/deploy flow and permissions.
- [GitHub publishing-source settings](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site): select GitHub Actions.
- [React Router HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter): route fragment is not sent to the server.
- [configure-pages metadata outputs](https://github.com/actions/configure-pages/blob/45bfe0192ca1faeb007ade9deae92b16b8254a0d/action.yml): authoritative base_path output.

Reviewed 26 October 2026. Action SHAs were taken from the official Vite workflow example and the workflow was checked with actionlint. These references describe platform behavior, not successful deployment of this repair.
