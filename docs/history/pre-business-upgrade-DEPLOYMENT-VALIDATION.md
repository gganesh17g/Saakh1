# Deployment validation · 26 October 2026

## Final scope and status

**Locally verified only.** The working production artifact was tested at exactly `/Saakh/` on a strict static host. The published URL exists, but its repaired version has not been deployed or verified live. No authenticated repository write connection was available; the GitHub integration was found to be uninstalled and offered for connection without blocking local work.

Host validation runtime: Node **26.8.1**, npm **12.0.2**. The restricted shell reports Node 26.11.1/npm 11.20.0; filesystem/network operations and npm checks ran through the authorized host executor. These are distinct environments, not a claim of matching runtime versions.

## Exact validation commands and actual results

| Command                                                                                                | Result               | Evidence / limits                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------ | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm ci --no-audit --no-fund`                                                                          | Passed               | Locked installation; final lockfile reinstallation checked. No vulnerability audit claimed.                                                                      |
| `npm install --save-dev @types/node@^26 --no-audit --no-fund`                                          | Passed               | Explicit Node configuration types; package and lockfile updated.                                                                                                 |
| `npm run typecheck`                                                                                    | Passed               | Final strict source/config check: zero TypeScript errors. First attempt failed TS2580 for missing Node process types; repaired with the explicit dev dependency. |
| `npm run lint`                                                                                         | Passed               | ESLint: zero errors and zero warnings.                                                                                                                           |
| `npm test`                                                                                             | Passed               | **30 tests / 4 files**, final 21.42-second run: 22 engine, 4 lifecycle/persistence, 2 existing components, 2 new error-boundary tests.                           |
| `npm run build`                                                                                        | Passed               | Vite 6.4.5 production artifact, base /Saakh/, emitted 404.html and .nojekyll. Existing large-WebGL-chunk advisory remains; not a compilation failure.            |
| `npm run test:pages`                                                                                   | Passed               | **14/14** tests, final 31.3-second run, no skipped/flaky tests in the recorded successful run; strict static host on port 4175 at /Saakh/.                       |
| `npm run test:e2e`                                                                                     | Passed               | **13/13** existing development browser regression tests, 59.9 seconds in recorded run.                                                                           |
| `/tmp/saakh-actionlint /home/thunder/shared/Saakh/.github/workflows/deploy.yml`                        | Passed               | actionlint **v1.7.12**, exit 0, no diagnostics. Official release asset SHA256 checked against release digest. Does not execute GitHub Actions.                   |
| `npx prettier --write ...` (explicit changed files) and final `npx prettier --check ...`               | Passed               | YAML/code/report formatting; exact final file list is the source inventory.                                                                                      |
| `SAAKH_BASE_PATH=/ npm run build -- --outDir /tmp/saakh-pages-root`                                    | Passed               | Separate root-base artifact; default dist remains the /Saakh/ build.                                                                                             |
| `SAAKH_BASE_PATH=/ SAAKH_DIST_DIR=/tmp/saakh-pages-root npm run test:pages -- --grep 'production entry | all workspace routes | unsupported WebGL                                                                                                                                                | unknown client'` | Passed | **4/4** root override smoke tests, 8.8 seconds. This is root-hosting validation, not custom DNS validation. |

## Warnings retained

Dependency installation reports existing deprecations for whatwg-encoding, Recharts 2 and ESLint 9. npm also reports the esbuild postinstall script was blocked by its install-script policy; the installed platform binary builds successfully, so no global script approval or dependency upgrade was performed. Vite retains its >500 KB lazy-WebGL chunk advisory. Root-base scratch build warns that the external outDir is not automatically emptied; it was a new task-owned directory. Playwright emits environment NO_COLOR/FORCE_COLOR warnings. These are distinct from ESLint, which reports zero warnings/errors.

## Failures observed and resolved

1. First TypeScript/build attempt: TS2580, missing `process` types in Vite configuration. Added explicit @types/node and synchronized package lock; final checks pass.
2. First production suite: **13 passed, 1 failed**; skip focus was not retained because its target was inside lazy content. Moved the target to the persistent workspace main; final focus test passes.
3. Next production suite: **13 passed, 1 failed**; an immediate reload outran the fire-and-forget IndexedDB note write. New deployment test now verifies the real committed notes record before intentionally refreshing. Persistence implementation was preserved; an unload during an in-flight write remains an existing limitation.
4. Root-base scratch suite initially had **3 passed, 1 assertion timeout** while the correct migrated route was visibly loading its lazy workspace. The Pages assertion budget is now explicitly 15 seconds (test budget 60 seconds), with no retries; final root smoke checks pass. This does not establish a performance target.
5. Repaired production suite: **14 passed**, zero unexpected/flaky/skipped tests. All existing 13 browser regressions passed. No failed attempts are presented as successful validation.

## Browser/network findings

Live before repair: HTML HTTP 200 with empty rendered body; entry `https://ganesh-g18.github.io/src/main.tsx` returned **404**, a resource-load console error and net::ERR_ABORTED for that missing module. No JavaScript exception was recorded because the module never loaded. Source favicon also referenced host root; its source reference was confirmed, but a separate favicon network failure was not recorded in the captured browser run.

Independent local before reproduction mounted the original built dist under /Saakh/: host-root `/assets/index-BdVEm21r.js` and `/assets/index-CgnVBj51.css` both returned 404; rendered body remained empty and two resource-load console errors were captured.

Repaired normal production flows assert **zero JavaScript exceptions, zero console errors, zero failed requests and zero HTTP >=400 responses**. Every emitted JS/CSS asset is requested and checked for HTTP 200 and appropriate MIME type; favicon and .nojekyll are checked too. Lazy workspace/chart/graph modules are exercised by navigation. Unsupported WebGL yields selectable 2D data-driven graph. Expected fault-injection logs are mocked only in the two component tests. The separate legacy-clean-route test intentionally expects an HTTP 404 document before its script migrates to a healthy hash route; this is not counted as a failed normal asset request.

## Responsive and navigation evidence

All six widths **1440, 1280, 1024, 768, 390, 360** visit the landing and all five primary areas with expected headings and no horizontal document overflow. A separate 360px test opens mobile navigation and reaches every primary area. Hash direct links, reload, back/forward, section scrolling, skip focus, unknown route recovery, legacy 404 migration, simulation/evidence/Attack Lab/economics/JSON download and real IndexedDB restoration are covered.

No new FPS, network-performance, comprehensive accessibility, cross-browser or real-device certification is claimed. Existing financial engines, source fixtures and state/persistence implementations were not modified.

## Git verification

The folder is not a Git repository. `git status --short`, `git diff --stat`, `git diff --name-status`, `git diff --check`, `git diff --cached --stat`, `git diff --cached --name-status`, `git diff --cached --check`, and `git ls-files --others --exclude-standard` were attempted; all exit 128 with "not a git repository". Staging/untracked ownership cannot be inferred. No git init, reset, checkout, commit, push or remote change was performed. A pre-edit SHA-256 snapshot of 35 source/documentation files was used for exact attribution instead. A no-index diff of the baseline/final source snapshots is used for an independent whitespace check.

## Cloud status

- Repository: **Ganesh-g18/Saakh**, public API confirmed, default branch **main**, has_pages=true.
- Intended URL: **https://ganesh-g18.github.io/Saakh/**; inspected existing broken page, not a successfully repaired release.
- Workflow: `.github/workflows/deploy.yml`, main push and workflow_dispatch; uploads **dist** via official Pages Actions.
- Manual setting: Settings → Pages → Build and deployment → Source → **GitHub Actions**. Required repository/environment permission and any deployment approval must be allowed.
- GitHub Actions execution, deployment branch/source setting, artifact installation on GitHub, DNS/CDN/cache behavior and repaired live site: **Blocked / not verified** without authenticated publication.
- Final public recheck remains source HTML; local production validation passed but live GitHub Pages verification remains pending.

Final snapshot whitespace check: `git diff --no-index --check` returned 1 because the compared source trees differ, with empty stdout/stderr and no whitespace diagnostics. Changed-file Prettier validation passed. The public final recheck at 2026-10-26 16:37:37 UTC still returned the source HTML (HTTP 200) and a missing `/src/main.tsx` entry (HTTP 404); no repaired live publication is claimed.
