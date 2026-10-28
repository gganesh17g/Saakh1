# Saakh 4.0 executed test results

Validated on 28 October 2026 in `/home/thunder/shared/Saakh`, Linux, Node v26.8.1, npm 12.0.2. Baseline was clean `4d5f43899e69b3ae77c8c05cbf245753dc2016e9`; no pre-existing working-tree modifications were claimed as this task's work.

| Exact command | Final result |
| --- | --- |
| `npm run typecheck` | Passed; zero TypeScript errors. |
| `npm run lint` | Passed; zero ESLint errors/warnings. |
| `npm test` | 156 passed, 0 failed, 8 test files. |
| `npx vitest run --reporter=json --outputFile=/tmp/saakh4-final-unit.json` | 156 passed, 0 failed, 0 pending; saved summary. Vitest reports 28 nested test suites, which is not the file count. |
| `npm run build` | Passed; latest recorded Vite build 12.01 seconds, 3200 modules. |
| `PLAYWRIGHT_JSON_OUTPUT_NAME=/tmp/saakh4-final-dev.json npm run test:e2e -- --reporter=list,json` | 33 passed, 0 failed, 0 skipped, 0 flaky; 79.648 seconds. |
| `npm run test:pages` | 61 passed, 0 failed, 0 skipped, 0 flaky; 87.599 seconds. Production artifact served strictly below `/Saakh1/`. |
| `npm audit --json --cache /tmp/saakh4-npm-cache` | 0 known vulnerabilities (info/low/moderate/high/critical all zero). |
| `git diff --check` | Passed; no whitespace errors. |

## Coverage

All original engine/business tests remain. New cases cover no writes before workspace hydration, queued concurrent saves, failed persistence/recovery, actual populated employee search privacy, named forecast snapshots and unchanged ledger, corrupted/truncated/unsafe/cross-business backups, business preference remapping, maximum-length names, full payroll/return source restoration, and unsupported Assistant queries.

The 19 new production-browser cases cover tasks/read-state/safe bulk completion, actual Create destinations and Ctrl+K source search, draft recovery without posting, named scenario operations, validated separate restore and non-resurrection after deletion, role filtering, source-linked 2D/3D selection, report CSV scope, repeated Create, view-context restoration, density and responsive layouts. Existing suites cover complete invoice/payment/return/payroll/reconciliation/credit/scenario/export/history workflows and routing.

Responsive widths across final suites: **320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920 pixels**. No unwanted horizontal page overflow in tested routes. Keyboard checks include skip links, Ctrl/Cmd+K search, native modal confirmation/Escape, and network alternatives. Reduced motion and theme persistence are exercised. Console/page-error/request-failure monitors passed in their covered flows; this is not a claim that every possible browser interaction was exhaustively tested.

## Baseline and repaired failures

The unchanged Saakh 3 baseline was separately built from `git archive HEAD` in `/tmp/saakh4-baseline`; original typecheck/lint, 123 unit tests, build and 42 production-browser tests passed. An initial archive command used the wrong working directory and was corrected without modifying project files.

Early upgrade checks found unused imports, TypeScript inference of a UUID template type during token recovery, and an over-broad scene prop edit. They were corrected. Superseded production builds exposed a real pre-hydration sidebar write overwriting workspace records, and queued preference handlers reading a reset event target. Hydration guards, serialization and immediate value capture fixed these; regression tests were added. An imported archive was additionally guarded with a one-time synchronization marker so deleting a restored scenario cannot resurrect it.

Browser runs against superseded builds were interrupted after diagnosed failures and are not counted as final passes. A development run produced 32 passed / 1 failed because its old onboarding test expected the prior empty-state wording and raw business selector; the test now exercises the searchable switcher and retains its source-record/isolation assertions. Its final full rerun passed 33/33. Legacy role-selection tests navigate the dedicated demo-role screen; forbidden financial controls are asserted absent, while domain authorization rejection tests remain intact. No test was deleted or weakened to hide a financial failure.

## Performance observations and limits

One local production static-preview measurement: desktop 1440px ready **1082 ms**, first contentful paint **120 ms**; warm mobile 390px ready **460 ms**, first contentful paint **80 ms**. Conditions are recorded in the JSON: headless Chromium, no physical mobile/network throttling, one cold and one warm load, not a statistical benchmark. Development timings differ and remain in their separate artifact.

The large lazy WebGL chunk is approximately **920.70 kB minified / 248.65 kB gzip**; Vite's >500 kB advisory and upstream Zod PURE-annotation warnings remain. No FPS claim. No independent screen-reader/WCAG certification, native OS print-dialog automation, all-browser/hardware test, or cross-tab transaction coordinator is claimed.

Machine-readable evidence: `docs/saakh4-evidence/unit-tests.json`, `development-tests.json`, `production-tests.json`, `development-performance.json`, `production-performance.json`, `dependency-audit.json`. Live results and cloud workflow results are separate; see deployment validation.

Final visual review also corrected distinct Overview/Scenario Lab panel visibility and made Enhanced Contrast affect the actual workspace border tokens. The corresponding browser assertions remain in the production suite.

A later development-only repeat produced 32/33 with a transient reset from running to the illustrative credit baseline. The cause was not confirmed, so no speculative financial-engine change was made. Three focused repeats passed (3/3, 15.496 seconds), and the subsequent final full run passed 33/33, followed by the full 61/61 production run. This earlier intermittent result is disclosed rather than erased or labelled a confirmed fix. Malformed statement-opening, item-price, document-item and statement-journal backup cases were then explicitly covered by the final 156-test suite.

Final role review corrected Create-menu stock eligibility: draft authority does not grant inventory journal authority. A shared operation-specific action selector, unit regression and Staff browser assertion verify the fix. Original ledger authorization already rejected the action; no financial formula changed. Final local tests are 156/156, 33/33 and 61/61.

## Verified cloud and live application

Application `673a972fedca0359af3a8f94f95c2e59c34ea6c3` passed cloud **156/33/61** (unit/development/production) and live **61/61** in **98.982 seconds**. Exact identity, workflow, artifact and test records are in deployment validation and JSON evidence. The first live run was 60/61 because the test assumed public `.nojekyll` visibility; all runtime assets passed. The artifact-presence/public-visibility contract was corrected, targeted local/live checks passed, then the entire live suite passed. No test was removed and no runtime-asset requirement was relaxed.
