# File changes — Saakh1 publishing release

Baseline: remote/user commit `4cd6e8c16a2c71695f3fe6cbbfac645b531a6c64`, with concurrent user workflow additions at d6eeee4/a4a4b24 captured separately before repair; after a clean fast-forward from original local `23f6402e60242587a03e9c62f71fc71e59d6b574`. Counts for **this task only**: **14 Created, 14 Modified, 0 Renamed, 0 Deleted** (28 files). Earlier 47-created/15-modified business-upgrade work is pre-existing, not newly claimed.

The specified remote base correction is preserved and credited to its existing commit; this release did not recreate it. Backup branch: `backup/pre-saakh1-release-20261027`. Original origin was already the correct repository and was not replaced. All 93 tracked files matched remote main after fast-forward; no missing financial module needed reconstruction.

Git status/diff/stat/name-status/check, staged diff and untracked-file checks were performed. There were no pre-existing local modifications. Generated/ignored node_modules, dist, test-results, playwright-report, .git and tsbuildinfo are excluded. Concurrent user-created deployment templates were fetched and preserved in ancestry; their competing publication behavior was intentionally repaired. No user history was force-pushed, deleted or reverted. Unchanged financial/domain/state/3D source files are preserved.

| File | Change type | Reason / purpose | Validation |
|---|---|---|---|
| `docs/GITHUB-DEPLOYMENT-REPORT.md` | Created | Document actual release actions and boundaries | Cross-checked against Git, actual test results and workflow/live evidence |
| `docs/GITHUB-SYNC-REPORT.md` | Created | Document actual release actions and boundaries | Cross-checked against Git, actual test results and workflow/live evidence |
| `docs/LIVE-SITE-VALIDATION.md` | Created | Document actual release actions and boundaries | Cross-checked against Git, actual test results and workflow/live evidence |
| `docs/history/pre-saakh1-release-DEPLOYMENT-VALIDATION.md` | Created | Preserve prior reports unchanged | SHA-256 compared with captured baseline |
| `docs/history/pre-saakh1-release-FILE-CHANGES-REPORT.md` | Created | Preserve prior reports unchanged | SHA-256 compared with captured baseline |
| `docs/history/pre-saakh1-release-GITHUB-PAGES-FIX-REPORT.md` | Created | Preserve prior reports unchanged | SHA-256 compared with captured baseline |
| `docs/history/pre-saakh1-release-TEST-REPORT.md` | Created | Preserve prior reports unchanged | SHA-256 compared with captured baseline |
| `docs/release-evidence/github-deployment.json` | Created | Retain actual release validation evidence | JSON parsed; recorded statuses cross-checked with executed tools |
| `docs/release-evidence/initial-live-failure.json` | Created | Retain actual release validation evidence | JSON parsed; recorded statuses cross-checked with executed tools |
| `docs/release-evidence/intermediate-live-response.json` | Created | Retain actual release validation evidence | JSON parsed; recorded statuses cross-checked with executed tools |
| `docs/release-evidence/live-pages.json` | Created | Retain actual release validation evidence | JSON parsed; recorded statuses cross-checked with executed tools |
| `docs/release-evidence/local-pages.json` | Created | Retain actual release validation evidence | JSON parsed; recorded statuses cross-checked with executed tools |
| `docs/release-evidence/npm-audit.json` | Created | Retain actual release validation evidence | JSON parsed; recorded statuses cross-checked with executed tools |
| `tests/pages/release.spec.ts` | Created | Add explicit release acceptance and all requested widths | 13 of 30 local production tests passed; live results recorded separately |
| `.github/workflows/deploy.yml` | Modified | Tie deployed artifact to its exact source revision | actionlint exit 0; commands rerun locally; actual cloud result in deployment report |
| `.github/workflows/jekyll-gh-pages.yml` | Modified | Stop a competing Jekyll deployment from overwriting the compiled app | actionlint; only deploy.yml runs on repair revision |
| `.github/workflows/static.yml` | Modified | Stop direct repository publishing of source TSX | actionlint; raw-source failure observed before repair and exact-SHA live check after |
| `.gitignore` | Modified | Prevent local credentials from entering the release | git check-ignore; source secret-pattern review |
| `CHANGELOG.md` | Modified | Record this deployment release without losing history | Original text remains present |
| `README.md` | Modified | Make current setup/publishing instructions unambiguous | Commands executed; links checked |
| `docs/DEPLOYMENT-VALIDATION.md` | Modified | Document actual release actions and boundaries | Cross-checked against Git, actual test results and workflow/live evidence |
| `docs/FILE-CHANGES-REPORT.md` | Modified | Document actual release actions and boundaries | Cross-checked against Git, actual test results and workflow/live evidence |
| `docs/GITHUB-PAGES-FIX-REPORT.md` | Modified | Document actual release actions and boundaries | Cross-checked against Git, actual test results and workflow/live evidence |
| `docs/TEST-REPORT.md` | Modified | Document actual release actions and boundaries | Cross-checked against Git, actual test results and workflow/live evidence |
| `playwright.pages.config.ts` | Modified | Validate both local artifact and actual public deployment | Local Pages suite and live-compatible acceptance test design |
| `scripts/serve-pages.mjs` | Modified | Match local static emulation to the real repository | 30 production tests at /Saakh1/ |
| `src/business/PublicInfo.tsx` | Modified | Send project feedback to the intended repository | Type/lint/build and public-route browser checks |
| `vite.config.ts` | Modified | Expose the compiled release identity and correct help text | Strict build, marker/MIME/asset tests |

## Detailed changes

### `docs/GITHUB-DEPLOYMENT-REPORT.md` — Created

- Reason: Document actual release actions and boundaries.
- Previous behavior: Historical or absent release-specific report.
- New behavior / important changes: Record current commit/sync/test/deployment/live status, distinguishing pending from verified.
- Affected features: Deployment/reporting.
- Validation: Cross-checked against Git, actual test results and workflow/live evidence.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/GITHUB-SYNC-REPORT.md` — Created

- Reason: Document actual release actions and boundaries.
- Previous behavior: Historical or absent release-specific report.
- New behavior / important changes: Record current commit/sync/test/deployment/live status, distinguishing pending from verified.
- Affected features: Deployment/reporting.
- Validation: Cross-checked against Git, actual test results and workflow/live evidence.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/LIVE-SITE-VALIDATION.md` — Created

- Reason: Document actual release actions and boundaries.
- Previous behavior: Historical or absent release-specific report.
- New behavior / important changes: Record current commit/sync/test/deployment/live status, distinguishing pending from verified.
- Affected features: Deployment/reporting.
- Validation: Cross-checked against Git, actual test results and workflow/live evidence.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/history/pre-saakh1-release-DEPLOYMENT-VALIDATION.md` — Created

- Reason: Preserve prior reports unchanged.
- Previous behavior: No Saakh1-specific archived copy.
- New behavior / important changes: Retain exact pre-release report contents.
- Affected features: Report provenance.
- Validation: SHA-256 compared with captured baseline.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/history/pre-saakh1-release-FILE-CHANGES-REPORT.md` — Created

- Reason: Preserve prior reports unchanged.
- Previous behavior: No Saakh1-specific archived copy.
- New behavior / important changes: Retain exact pre-release report contents.
- Affected features: Report provenance.
- Validation: SHA-256 compared with captured baseline.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/history/pre-saakh1-release-GITHUB-PAGES-FIX-REPORT.md` — Created

- Reason: Preserve prior reports unchanged.
- Previous behavior: No Saakh1-specific archived copy.
- New behavior / important changes: Retain exact pre-release report contents.
- Affected features: Report provenance.
- Validation: SHA-256 compared with captured baseline.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/history/pre-saakh1-release-TEST-REPORT.md` — Created

- Reason: Preserve prior reports unchanged.
- Previous behavior: No Saakh1-specific archived copy.
- New behavior / important changes: Retain exact pre-release report contents.
- Affected features: Report provenance.
- Validation: SHA-256 compared with captured baseline.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/release-evidence/github-deployment.json` — Created

- Reason: Retain actual release validation evidence.
- Previous behavior: No corresponding current-release evidence.
- New behavior / important changes: Record real test/audit/live results without substituting historical passes.
- Affected features: Release verification.
- Validation: JSON parsed; recorded statuses cross-checked with executed tools.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/release-evidence/initial-live-failure.json` — Created

- Reason: Retain actual release validation evidence.
- Previous behavior: No corresponding current-release evidence.
- New behavior / important changes: Record real test/audit/live results without substituting historical passes.
- Affected features: Release verification.
- Validation: JSON parsed; recorded statuses cross-checked with executed tools.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/release-evidence/intermediate-live-response.json` — Created

- Reason: Retain actual release validation evidence.
- Previous behavior: No corresponding current-release evidence.
- New behavior / important changes: Record real test/audit/live results without substituting historical passes.
- Affected features: Release verification.
- Validation: JSON parsed; recorded statuses cross-checked with executed tools.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/release-evidence/live-pages.json` — Created

- Reason: Retain actual release validation evidence.
- Previous behavior: No corresponding current-release evidence.
- New behavior / important changes: Record real test/audit/live results without substituting historical passes.
- Affected features: Release verification.
- Validation: JSON parsed; recorded statuses cross-checked with executed tools.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/release-evidence/local-pages.json` — Created

- Reason: Retain actual release validation evidence.
- Previous behavior: No corresponding current-release evidence.
- New behavior / important changes: Record real test/audit/live results without substituting historical passes.
- Affected features: Release verification.
- Validation: JSON parsed; recorded statuses cross-checked with executed tools.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/release-evidence/npm-audit.json` — Created

- Reason: Retain actual release validation evidence.
- Previous behavior: No corresponding current-release evidence.
- New behavior / important changes: Record real test/audit/live results without substituting historical passes.
- Affected features: Release verification.
- Validation: JSON parsed; recorded statuses cross-checked with executed tools.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `tests/pages/release.spec.ts` — Created

- Reason: Add explicit release acceptance and all requested widths.
- Previous behavior: No full eight-width/current-commit deployment acceptance suite.
- New behavior / important changes: 13 cases: identity/assets, public/all modules/deep links, credit/graph/scenarios, invoice/payment/export, 8 widths.
- Affected features: Regression/live verification.
- Validation: 13 of 30 local production tests passed; live results recorded separately.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `.github/workflows/deploy.yml` — Modified

- Reason: Tie deployed artifact to its exact source revision.
- Previous behavior: Built correct metadata-derived base without an externally observable source marker.
- New behavior / important changes: Pass github.sha through SAAKH_RELEASE_SHA; retain official pinned workflow/test gates/dist-only artifact.
- Affected features: CI/deployment.
- Validation: actionlint exit 0; commands rerun locally; actual cloud result in deployment report.
- Potential side effects: New builds include public commit metadata; no credentials or financial inputs are exposed.

### `.github/workflows/jekyll-gh-pages.yml` — Modified

- Reason: Stop a competing Jekyll deployment from overwriting the compiled app.
- Previous behavior: User-added during this task at d6eeee4; push-triggered Jekyll publisher.
- New behavior / important changes: Preserve filename/history; manual guidance only, no deployment permissions or artifact upload.
- Affected features: Deployment safety.
- Validation: actionlint; only deploy.yml runs on repair revision.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `.github/workflows/static.yml` — Modified

- Reason: Stop direct repository publishing of source TSX.
- Previous behavior: User-added during this task at a4a4b24; uploaded repository root.
- New behavior / important changes: Preserve filename/history; manual guidance only, no deployment permissions or artifact upload.
- Affected features: Deployment safety.
- Validation: actionlint; raw-source failure observed before repair and exact-SHA live check after.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `.gitignore` — Modified

- Reason: Prevent local credentials from entering the release.
- Previous behavior: Ignored generated directories, but not general .env files.
- New behavior / important changes: Ignore .env/.env.* while allowing a future documented .env.example.
- Affected features: Source hygiene.
- Validation: git check-ignore; source secret-pattern review.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `CHANGELOG.md` — Modified

- Reason: Record this deployment release without losing history.
- Previous behavior: Business-upgrade and earlier repair entries only.
- New behavior / important changes: Prepend Saakh1 release changes; preserve every previous entry.
- Affected features: History.
- Validation: Original text remains present.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `README.md` — Modified

- Reason: Make current setup/publishing instructions unambiguous.
- Previous behavior: Retained original Saakh paths and historical publication limits.
- New behavior / important changes: Prepend Saakh1 current instructions, hash routes, live acceptance command and reports; preserve old text under history heading.
- Affected features: Delivery/setup.
- Validation: Commands executed; links checked.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/DEPLOYMENT-VALIDATION.md` — Modified

- Reason: Document actual release actions and boundaries.
- Previous behavior: Historical or absent release-specific report.
- New behavior / important changes: Record current commit/sync/test/deployment/live status, distinguishing pending from verified.
- Affected features: Deployment/reporting.
- Validation: Cross-checked against Git, actual test results and workflow/live evidence.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/FILE-CHANGES-REPORT.md` — Modified

- Reason: Document actual release actions and boundaries.
- Previous behavior: Historical or absent release-specific report.
- New behavior / important changes: Record current commit/sync/test/deployment/live status, distinguishing pending from verified.
- Affected features: Deployment/reporting.
- Validation: Cross-checked against Git, actual test results and workflow/live evidence.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/GITHUB-PAGES-FIX-REPORT.md` — Modified

- Reason: Document actual release actions and boundaries.
- Previous behavior: Historical or absent release-specific report.
- New behavior / important changes: Record current commit/sync/test/deployment/live status, distinguishing pending from verified.
- Affected features: Deployment/reporting.
- Validation: Cross-checked against Git, actual test results and workflow/live evidence.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `docs/TEST-REPORT.md` — Modified

- Reason: Document actual release actions and boundaries.
- Previous behavior: Historical or absent release-specific report.
- New behavior / important changes: Record current commit/sync/test/deployment/live status, distinguishing pending from verified.
- Affected features: Deployment/reporting.
- Validation: Cross-checked against Git, actual test results and workflow/live evidence.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `playwright.pages.config.ts` — Modified

- Reason: Validate both local artifact and actual public deployment.
- Previous behavior: Default /Saakh/; always started a local server.
- New behavior / important changes: Default /Saakh1/; SAAKH_TEST_URL selects external host and disables local server startup.
- Affected features: Production/live QA.
- Validation: Local Pages suite and live-compatible acceptance test design.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `scripts/serve-pages.mjs` — Modified

- Reason: Match local static emulation to the real repository.
- Previous behavior: Default mount /Saakh/ mismatched corrected production artifact.
- New behavior / important changes: Default /Saakh1/; override and strict static behavior retained.
- Affected features: Preview/testing.
- Validation: 30 production tests at /Saakh1/.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `src/business/PublicInfo.tsx` — Modified

- Reason: Send project feedback to the intended repository.
- Previous behavior: Linked earlier Ganesh-g18/Saakh issues.
- New behavior / important changes: Link gganesh17g/Saakh1/issues; all product copy/functional behavior retained.
- Affected features: Contact.
- Validation: Type/lint/build and public-route browser checks.
- Potential side effects: No financial formula or saved-data schema change. Demo-only and production/security limitations remain; documentation status is limited to observed evidence.

### `vite.config.ts` — Modified

- Reason: Expose the compiled release identity and correct help text.
- Previous behavior: Remote base correction already selected /Saakh1/; no commit marker.
- New behavior / important changes: Preserve 4cd6e8c correction; emit release.json and HTML meta; fix stale example/comment.
- Affected features: Build/diagnosis.
- Validation: Strict build, marker/MIME/asset tests.
- Potential side effects: New builds include public commit metadata; no credentials or financial inputs are exposed.
