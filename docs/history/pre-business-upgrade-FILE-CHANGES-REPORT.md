# File changes report · GitHub Pages repair

## Attribution and scope

Actual source/config/test/documentation changes: **21 files — 11 created, 10 modified, 0 renamed, 0 deleted**. No source rename or deletion occurred. This inventory includes all four newly requested/runbook reports and the changelog update; it is computed from the 35-file pre-edit SHA-256 snapshot rather than assumed from a plan.

The directory has no Git metadata. Every baseline file, including changes the user may have made before this task, was treated as pre-existing. Earlier Saakh implementation work is not claimed as part of this repair. Only differences after this task's snapshot are attributed here. No unrelated original documentation, financial engine, model, fixture, state implementation, existing test, or stylesheet source was replaced/deleted. README and CHANGELOG are intentionally updated; all earlier changelog entries remain.

## Summary

| File                                    | Change type | Purpose                                                                                                                                                                                                                                                                                     | Validation                                                                                                           |
| --------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy.yml`          | Created     | Adds main push/manual workflow using official SHA-pinned checkout/setup/configure/upload/deploy Actions. npm ci → typecheck/lint/unit tests → metadata-base build → Chromium production tests → dist artifact → protected Pages deployment.                                                 | actionlint v1.7.12 exit 0; YAML formatting; local commands and artifact smoke tests. Cloud execution pending.        |
| `CHANGELOG.md`                          | Modified    | Prepends an Unreleased repair entry while retaining the entire previous 1.2.0 entry.                                                                                                                                                                                                        | Previous changelog entry checked against baseline; final inventory confirms preservation.                            |
| `README.md`                             | Modified    | Adds correct production /Saakh/ preview/hash-route instructions, strict preview/test commands, workflow/settings guidance and report links.                                                                                                                                                 | Commands exercised locally; instructions cross-checked with final config/workflow.                                   |
| `docs/DEPLOYMENT-VALIDATION.md`         | Created     | Records exact check commands, failures and repairs, final pass counts, console/network findings, responsive results, and pending cloud verification.                                                                                                                                        | Synchronized after last app code change and final validation runs.                                                   |
| `docs/FILE-CHANGES-REPORT.md`           | Created     | Records actual source-file differences including these reports, pre-existing ownership limits and generated artifact inventory.                                                                                                                                                             | SHA-256 snapshot comparison, Git check results, final change inventory and whitespace validation.                    |
| `docs/GITHUB-PAGES-DEPLOYMENT.md`       | Created     | Documents exact verified repository, settings, commands, hash and legacy URLs, root override, workflow, troubleshooting and live verification steps.                                                                                                                                        | Matches code and tested commands; official primary references linked.                                                |
| `docs/GITHUB-PAGES-FIX-REPORT.md`       | Created     | Records live source-entry 404 evidence, independently reproduced compiled-prefix failure, targeted solution, before/after status and deployment limits.                                                                                                                                     | Cross-references captured public HTTP/browser evidence and final test results.                                       |
| `index.html`                            | Modified    | Favicon uses %BASE_URL%favicon.svg; Vite rewrites the entry module and asset URLs at build time. Source module entry is intentionally retained for Vite.                                                                                                                                    | Production HTML and favicon HTTP/MIME checks.                                                                        |
| `package-lock.json`                     | Modified    | Locks @types/node and its undici-types dependency and root development declaration.                                                                                                                                                                                                         | Fresh npm ci and all compiler/build/tests.                                                                           |
| `package.json`                          | Modified    | Adds preview:pages, test:pages, and @types/node; existing scripts/runtime dependency requirements and product version remain.                                                                                                                                                               | npm ci, typecheck, lint, unit/build/browser commands.                                                                |
| `playwright.config.ts`                  | Modified    | Ignores **/pages/**; existing development tests and server behavior are preserved.                                                                                                                                                                                                          | Existing 13/13 browser tests; no production-suite leakage.                                                           |
| `playwright.pages.config.ts`            | Created     | Runs only tests/pages against the strict server and a consistent SAAKH_BASE_PATH; 60-second test/15-second assertion budgets, JSON results and isolated output directory.                                                                                                                   | 14/14 production tests at /Saakh/ and root-base smoke subset.                                                        |
| `scripts/serve-pages.mjs`               | Created     | Adds loopback-only strict static fixture, configurable path/directory/port, explicit MIME types, real missing-file 404s and emitted 404 document handling.                                                                                                                                  | Missing host-root asset checks, all asset MIME checks, route/legacy/root-base smoke tests.                           |
| `src/components/ErrorBoundary.test.tsx` | Created     | Tests thrown render failure, actual message, successful retry, and a scoped graphics fallback. Expected injected error logs are mocked only in these tests.                                                                                                                                 | 2/2 recovery tests; full unit suite 30/30.                                                                           |
| `src/components/ErrorBoundary.tsx`      | Created     | Adds class error boundary, console error reporting, actual error text, retry, reload and base-safe homepage recovery. Supports scoped fallbacks.                                                                                                                                            | Two fault-injection component tests, healthy production flow has no captured console errors.                         |
| `src/components/Network.tsx`            | Modified    | Extracts the existing SVG graph as Network2D and reuses it in a graph-scoped ErrorBoundary fallback; actual graphics errors are visible. Existing WebGL geometry, controls, IDs and selection callbacks remain.                                                                             | WebGL production canvas, unsupported-WebGL selection, boundary fallback unit test and existing graph/keyboard tests. |
| `src/main.tsx`                          | Modified    | Production uses HashRouter without a basename; development retains BrowserRouter. Section links prevent default hash replacement and scroll instead. Skip link focuses a stable main target; root ErrorBoundary wraps App.                                                                  | Direct links, refresh, back/forward, section/skip links, mobile navigation, existing 13 regressions.                 |
| `src/pages/Workspace.tsx`               | Modified    | Moves only the skip-target ID from the title to the persistent workspace main in main.tsx; all financial/page behavior is preserved.                                                                                                                                                        | Production skip-focus test and all development regression tests.                                                     |
| `src/vite-env.d.ts`                     | Created     | References vite/client for typed PROD and BASE_URL.                                                                                                                                                                                                                                         | Strict TypeScript passes.                                                                                            |
| `tests/pages/pages.spec.ts`             | Created     | Adds 14 production tests: every compiled asset, routing/refresh/history, simulation/evidence/scenarios/export/storage, unsupported WebGL, anchors/skip, legacy/custom 404, six widths, mobile menu and screenshot. Waits for the real IndexedDB note commit before intentionally reloading. | 14/14 at /Saakh/; root override subset; initial failing test history is retained in DEPLOYMENT-VALIDATION.           |
| `vite.config.ts`                        | Modified    | Development remains at /; builds/previews default to verified /Saakh/, with validated SAAKH_BASE_PATH override. Emits 404.html and .nojekyll. The 404 migrates only legacy /app paths to hash URLs.                                                                                         | Strict build/assets, direct/refresh/legacy route tests; root-base smoke checks.                                      |

## Detailed per-file changes

### `.github/workflows/deploy.yml`

- **Change type:** Created.
- **Original problem / reason:** Public repository had no workflow; the live site served unbuilt source. Exact authenticated Pages publishing settings could not be inspected.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Adds main push/manual workflow using official SHA-pinned checkout/setup/configure/upload/deploy Actions. npm ci → typecheck/lint/unit tests → metadata-base build → Chromium production tests → dist artifact → protected Pages deployment.
- **Features affected and potential side effects:** Cloud deployment. Requires GitHub Actions publishing source and allowed environment/token permissions; workflow not executed on GitHub in this session.
- **Validation performed:** actionlint v1.7.12 exit 0; YAML formatting; local commands and artifact smoke tests. Cloud execution pending.

### `CHANGELOG.md`

- **Change type:** Modified.
- **Original problem / reason:** No record of this deployment repair.
- **Previous behavior:** No record of this deployment repair.
- **New behavior and important code/configuration:** Prepends an Unreleased repair entry while retaining the entire previous 1.2.0 entry.
- **Features affected and potential side effects:** Documentation only; package/product version unchanged.
- **Validation performed:** Previous changelog entry checked against baseline; final inventory confirms preservation.

### `README.md`

- **Change type:** Modified.
- **Original problem / reason:** Instructions assumed root hosting with history fallback.
- **Previous behavior:** Instructions assumed root hosting with history fallback.
- **New behavior and important code/configuration:** Adds correct production /Saakh/ preview/hash-route instructions, strict preview/test commands, workflow/settings guidance and report links.
- **Features affected and potential side effects:** Developer/deployer guidance. Distinguishes local validation from live publication.
- **Validation performed:** Commands exercised locally; instructions cross-checked with final config/workflow.

### `docs/DEPLOYMENT-VALIDATION.md`

- **Change type:** Created.
- **Original problem / reason:** No current deployment-specific validation journal.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Records exact check commands, failures and repairs, final pass counts, console/network findings, responsive results, and pending cloud verification.
- **Features affected and potential side effects:** Validation audit only; old historical TEST-REPORT.md remains intact.
- **Validation performed:** Synchronized after last app code change and final validation runs.

### `docs/FILE-CHANGES-REPORT.md`

- **Change type:** Created.
- **Original problem / reason:** No baseline-aware per-file inventory.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Records actual source-file differences including these reports, pre-existing ownership limits and generated artifact inventory.
- **Features affected and potential side effects:** Audit documentation only. Dependency/test-result trees are explicitly excluded from source counts.
- **Validation performed:** SHA-256 snapshot comparison, Git check results, final change inventory and whitespace validation.

### `docs/GITHUB-PAGES-DEPLOYMENT.md`

- **Change type:** Created.
- **Original problem / reason:** No GitHub Pages deployment runbook.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Documents exact verified repository, settings, commands, hash and legacy URLs, root override, workflow, troubleshooting and live verification steps.
- **Features affected and potential side effects:** Operations documentation. GitHub settings/push remain user or authenticated publisher actions.
- **Validation performed:** Matches code and tested commands; official primary references linked.

### `docs/GITHUB-PAGES-FIX-REPORT.md`

- **Change type:** Created.
- **Original problem / reason:** No evidence-based root-cause and repair record.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Records live source-entry 404 evidence, independently reproduced compiled-prefix failure, targeted solution, before/after status and deployment limits.
- **Features affected and potential side effects:** Repair audit documentation; makes no successful live deployment claim.
- **Validation performed:** Cross-references captured public HTTP/browser evidence and final test results.

### `index.html`

- **Change type:** Modified.
- **Original problem / reason:** Favicon was hardcoded to /favicon.svg. Source HTML is a Vite input, not a deployable artifact.
- **Previous behavior:** Favicon was hardcoded to /favicon.svg. Source HTML is a Vite input, not a deployable artifact.
- **New behavior and important code/configuration:** Favicon uses %BASE_URL%favicon.svg; Vite rewrites the entry module and asset URLs at build time. Source module entry is intentionally retained for Vite.
- **Features affected and potential side effects:** Brand favicon and asset loading. Publishing this source file directly still fails; deploy dist.
- **Validation performed:** Production HTML and favicon HTTP/MIME checks.

### `package-lock.json`

- **Change type:** Modified.
- **Original problem / reason:** Lockfile did not include the newly required Node type dependency.
- **Previous behavior:** Lockfile did not include the newly required Node type dependency.
- **New behavior and important code/configuration:** Locks @types/node and its undici-types dependency and root development declaration.
- **Features affected and potential side effects:** Reproducible tooling installation. No API keys or runtime integration added.
- **Validation performed:** Fresh npm ci and all compiler/build/tests.

### `package.json`

- **Change type:** Modified.
- **Original problem / reason:** No strict Pages preview/test commands; Node config types were not an explicit development dependency.
- **Previous behavior:** No strict Pages preview/test commands; Node config types were not an explicit development dependency.
- **New behavior and important code/configuration:** Adds preview:pages, test:pages, and @types/node; existing scripts/runtime dependency requirements and product version remain.
- **Features affected and potential side effects:** Build tooling only; two extra development packages via the lockfile.
- **Validation performed:** npm ci, typecheck, lint, unit/build/browser commands.

### `playwright.config.ts`

- **Change type:** Modified.
- **Original problem / reason:** Default recursive test discovery would include the new production-only suite on the development server.
- **Previous behavior:** Default recursive test discovery would include the new production-only suite on the development server.
- **New behavior and important code/configuration:** Ignores **/pages/**; existing development tests and server behavior are preserved.
- **Features affected and potential side effects:** Test selection only. The two suites must be invoked separately.
- **Validation performed:** Existing 13/13 browser tests; no production-suite leakage.

### `playwright.pages.config.ts`

- **Change type:** Created.
- **Original problem / reason:** No production static-prefix suite existed.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Runs only tests/pages against the strict server and a consistent SAAKH_BASE_PATH; 60-second test/15-second assertion budgets, JSON results and isolated output directory.
- **Features affected and potential side effects:** Production acceptance testing. Requires an installed Chromium browser and unused port 4175.
- **Validation performed:** 14/14 production tests at /Saakh/ and root-base smoke subset.

### `scripts/serve-pages.mjs`

- **Change type:** Created.
- **Original problem / reason:** Vite development/preview fallback could conceal static-host route and asset mistakes.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Adds loopback-only strict static fixture, configurable path/directory/port, explicit MIME types, real missing-file 404s and emitted 404 document handling.
- **Features affected and potential side effects:** Validation/preview only, not a production backend. Defaults to port 4175 and /Saakh/.
- **Validation performed:** Missing host-root asset checks, all asset MIME checks, route/legacy/root-base smoke tests.

### `src/components/ErrorBoundary.test.tsx`

- **Change type:** Created.
- **Original problem / reason:** Recovery behavior had no regression coverage.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Tests thrown render failure, actual message, successful retry, and a scoped graphics fallback. Expected injected error logs are mocked only in these tests.
- **Features affected and potential side effects:** Test coverage; production errors remain logged.
- **Validation performed:** 2/2 recovery tests; full unit suite 30/30.

### `src/components/ErrorBoundary.tsx`

- **Change type:** Created.
- **Original problem / reason:** No React render/lazy-module recovery UI existed.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Adds class error boundary, console error reporting, actual error text, retry, reload and base-safe homepage recovery. Supports scoped fallbacks.
- **Features affected and potential side effects:** Post-bootstrap React failures. Cannot recover a missing initial JavaScript entry before React executes; the deployment fix addresses that cause.
- **Validation performed:** Two fault-injection component tests, healthy production flow has no captured console errors.

### `src/components/Network.tsx`

- **Change type:** Modified.
- **Original problem / reason:** Capability detection provided 2D when WebGL was absent, but a later Canvas initialization exception could escape to the app.
- **Previous behavior:** Capability detection provided 2D when WebGL was absent, but a later Canvas initialization exception could escape to the app.
- **New behavior and important code/configuration:** Extracts the existing SVG graph as Network2D and reuses it in a graph-scoped ErrorBoundary fallback; actual graphics errors are visible. Existing WebGL geometry, controls, IDs and selection callbacks remain.
- **Features affected and potential side effects:** 3D/2D recovery. A failed graphics view displays its error and 2D inspector rather than clearing the workspace.
- **Validation performed:** WebGL production canvas, unsupported-WebGL selection, boundary fallback unit test and existing graph/keyboard tests.

### `src/main.tsx`

- **Change type:** Modified.
- **Original problem / reason:** BrowserRouter generated clean URLs; static Pages could not refresh them. Raw fragment anchors would conflict with HashRouter. No root recovery boundary.
- **Previous behavior:** BrowserRouter generated clean URLs; static Pages could not refresh them. Raw fragment anchors would conflict with HashRouter. No root recovery boundary.
- **New behavior and important code/configuration:** Production uses HashRouter without a basename; development retains BrowserRouter. Section links prevent default hash replacement and scroll instead. Skip link focuses a stable main target; root ErrorBoundary wraps App.
- **Features affected and potential side effects:** Navigation, accessibility and post-bootstrap recovery. Production deep links now use #/app/...; old clean app links migrate via generated 404.
- **Validation performed:** Direct links, refresh, back/forward, section/skip links, mobile navigation, existing 13 regressions.

### `src/pages/Workspace.tsx`

- **Change type:** Modified.
- **Original problem / reason:** Skip target was on a lazily rendered title, and could be absent during navigation.
- **Previous behavior:** Skip target was on a lazily rendered title, and could be absent during navigation.
- **New behavior and important code/configuration:** Moves only the skip-target ID from the title to the persistent workspace main in main.tsx; all financial/page behavior is preserved.
- **Features affected and potential side effects:** Keyboard navigation; no engine, borrower, notes or report calculation changes.
- **Validation performed:** Production skip-focus test and all development regression tests.

### `src/vite-env.d.ts`

- **Change type:** Created.
- **Original problem / reason:** Vite import.meta.env flags/base needed explicit client typing.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** References vite/client for typed PROD and BASE_URL.
- **Features affected and potential side effects:** Compile-time declarations only.
- **Validation performed:** Strict TypeScript passes.

### `tests/pages/pages.spec.ts`

- **Change type:** Created.
- **Original problem / reason:** No tests reproduced the exact deployment prefix, host-root failures or static refresh behavior.
- **Previous behavior:** File did not exist; no behavior supplied by this file.
- **New behavior and important code/configuration:** Adds 14 production tests: every compiled asset, routing/refresh/history, simulation/evidence/scenarios/export/storage, unsupported WebGL, anchors/skip, legacy/custom 404, six widths, mobile menu and screenshot. Waits for the real IndexedDB note commit before intentionally reloading.
- **Features affected and potential side effects:** Validation only. Legacy HTTP 404 is expected before migration; normal flows assert zero console/errors/failed requests.
- **Validation performed:** 14/14 at /Saakh/; root override subset; initial failing test history is retained in DEPLOYMENT-VALIDATION.

### `vite.config.ts`

- **Change type:** Modified.
- **Original problem / reason:** Default Vite base was /; a project-prefix build requested host-root assets. No Pages 404 artifact existed.
- **Previous behavior:** Default Vite base was /; a project-prefix build requested host-root assets. No Pages 404 artifact existed.
- **New behavior and important code/configuration:** Development remains at /; builds/previews default to verified /Saakh/, with validated SAAKH_BASE_PATH override. Emits 404.html and .nojekyll. The 404 migrates only legacy /app paths to hash URLs.
- **Features affected and potential side effects:** Base normalization, production/public assets, legacy links. An override must be a valid absolute directory; stale artifacts require rebuilding.
- **Validation performed:** Strict build/assets, direct/refresh/legacy route tests; root-base smoke checks.

## Generated output and excluded directories

The source count above excludes Git-ignored **node_modules/**, **dist/**, **test-results/**, **playwright-report/** and **tsconfig.tsbuildinfo**. These are regenerated dependencies/build/test/incremental artifacts, not hand-authored source changes. npm ci restored the locked dependencies; installing explicit Node types added the @types/node and undici-types tooling packages. No dependency tree or test report output is intended to be committed. The existing financial source files remain byte-identical to the pre-edit snapshot.

The dist changes below are separately documented because the actual published artifact matters to this repair. Hash-named chunks are marked Created/Deleted rather than falsely called source renames. Their changes arise from rebuilding with deployment-safe URLs and the recovery wrapper. Baseline dist was copied before rebuilding, so this is an observed comparison.

| Generated file                       | Change type | Reason / validation                                                                      |
| ------------------------------------ | ----------- | ---------------------------------------------------------------------------------------- |
| `dist/.nojekyll`                     | Created     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/404.html`                      | Created     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/Charts-BXxtGA9Q.js`     | Deleted     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/Charts-kZy1RFKL.js`     | Created     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/Network-B3DUoG5W.js`    | Deleted     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/Network-DEh9p2XY.js`    | Created     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/Workspace-BMuHhmld.js`  | Deleted     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/Workspace-a5WCK72i.js`  | Created     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/index-BdVEm21r.js`      | Deleted     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/index-CIVig51-.js`      | Created     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/index-CWlM4rnW.css`     | Created     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/index-CgnVBj51.css`     | Deleted     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/rotate-ccw-Dlfp5vvv.js` | Deleted     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/assets/rotate-ccw-Xz_W7H3M.js` | Created     | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |
| `dist/index.html`                    | Modified    | Rebuilt production artifact; prefix/assets/MIME/404 checks and production browser suite. |

Every emitted JS/CSS file, public favicon and .nojekyll is requested by the production suite. Generated 404.html is checked through a real legacy-route HTTP 404 response and client migration. Test screenshots/JSON reports and incremental compiler metadata were generated during validation, remain ignored, and are not counted as source edits. Source of truth for those outputs is the executed tests, not fabricated manually edited results.

## Git, staging, untracked files and whitespace

All requested Git checks and additional staged/untracked checks were attempted: status --short; diff --stat; diff --name-status; diff --check; diff --cached --stat/name-status/check; ls-files --others --exclude-standard. Every command exited 128 because this folder is not a repository. No staging state, branch, remote or untracked classification is claimed. No Git history was created or changed.

A source snapshot comparison independently establishes the exact files above. The final snapshot/no-index diff is checked for whitespace errors; formatting is checked with Prettier. Baseline and final manifests are retained with the task evidence. Any future push must be reviewed against the actual remote checkout so newer user changes are preserved.

Final no-index whitespace result: exit 1 for differing snapshots, no whitespace diagnostics (empty stdout/stderr). All 21 changed source/config/test/documentation files passed Prettier validation. Financial engine/model/fixture/state and stylesheet source hashes match the pre-edit baseline; the original changelog content remains intact.
