# Saakh 4.0 file changes report

Comparison baseline: `4d5f43899e69b3ae77c8c05cbf245753dc2016e9`. The entry working tree and staged index were clean. All listed changes were made for this task; no pre-existing user modifications are claimed. Existing release documents are retained.

**Task totals: 25 Created, 15 Modified, 0 Renamed, 0 Deleted — 40 files.** Documentation-only follow-ups to these same files do not change their task-level classification.

Verified commands: `git status --short`, `git diff --stat`, `git diff --name-status`, `git diff --check`, staged name/status/diff checks and untracked-file inspection. Financial engine paths (`src/engines`, `accounting.ts`, `operations3.ts`, `analytics.ts`, `migration.ts`) have no task diff. No force push, destructive reset, unrelated deletion or source-only Pages publishing is used.

| File | Change Type | Purpose | Validation |
| --- | --- | --- | --- |
| `CHANGELOG.md` | Modified | Preserve release history | Diff and report consistency review |
| `README.md` | Modified | Current setup and feature entry | Commands executed; links/path review |
| `docs/SAAKH-4-3D-PERFORMANCE.md` | Created | 3D Performance | Path/link consistency, final code/test/deployment cross-check |
| `docs/SAAKH-4-ARCHITECTURE.md` | Created | Architecture | Path/link consistency, final code/test/deployment cross-check |
| `docs/SAAKH-4-DATA-MIGRATION.md` | Created | Data Migration | Path/link consistency, final code/test/deployment cross-check |
| `docs/SAAKH-4-DEPLOYMENT-VALIDATION.md` | Created | Deployment Validation | Path/link consistency, final code/test/deployment cross-check |
| `docs/SAAKH-4-FILE-CHANGES.md` | Created | File Changes | Path/link consistency, final code/test/deployment cross-check |
| `docs/SAAKH-4-FINANCIAL-INTEGRITY.md` | Created | Financial Integrity | Path/link consistency, final code/test/deployment cross-check |
| `docs/SAAKH-4-IMPLEMENTATION-REPORT.md` | Created | Implementation Report | Path/link consistency, final code/test/deployment cross-check |
| `docs/SAAKH-4-REQUIREMENTS-MATRIX.md` | Created | Requirements Matrix | Path/link consistency, final code/test/deployment cross-check |
| `docs/SAAKH-4-TEST-RESULTS.md` | Created | Test Results | Path/link consistency, final code/test/deployment cross-check |
| `docs/SAAKH-4-UX-ACCESSIBILITY.md` | Created | Ux Accessibility | Path/link consistency, final code/test/deployment cross-check |
| `docs/saakh4-evidence/cloud-deployment.json` | Created | Machine-readable validation/deployment evidence | JSON parsing and cross-check against executed tool output and reports |
| `docs/saakh4-evidence/dependency-audit.json` | Created | Machine-readable validation/deployment evidence | JSON parsing and cross-check against executed tool output and reports |
| `docs/saakh4-evidence/development-performance.json` | Created | Machine-readable validation/deployment evidence | JSON parsing and cross-check against executed tool output and reports |
| `docs/saakh4-evidence/development-tests.json` | Created | Machine-readable validation/deployment evidence | JSON parsing and cross-check against executed tool output and reports |
| `docs/saakh4-evidence/live-tests.json` | Created | Machine-readable validation/deployment evidence | JSON parsing and cross-check against executed tool output and reports |
| `docs/saakh4-evidence/production-performance.json` | Created | Machine-readable validation/deployment evidence | JSON parsing and cross-check against executed tool output and reports |
| `docs/saakh4-evidence/production-tests.json` | Created | Machine-readable validation/deployment evidence | JSON parsing and cross-check against executed tool output and reports |
| `docs/saakh4-evidence/unit-tests.json` | Created | Machine-readable validation/deployment evidence | JSON parsing and cross-check against executed tool output and reports |
| `index.html` | Modified | Theme initialization and release identity | Build, asset-path, appearance and browser suites |
| `package-lock.json` | Modified | Synchronized lock metadata | JSON/package consistency, dependency audit, CI npm ci |
| `package.json` | Modified | Release metadata | Typecheck, lint, unit, build and browser commands |
| `src/business/BusinessApp.tsx` | Modified | Connected role-aware shell and financial workflow UX | Full development/Pages suites, invoice/payment/payroll/returns, responsive and recovery tests |
| `src/business/Customers3.tsx` | Modified | Customer workflow and context | Existing customer/invoice/statement flow, Create/source-search browser tests, drawer screenshot |
| `src/business/Drawer4.tsx` | Created | Accessible adaptive short form | Existing customer flows, native dialog behavior and 390px visual check |
| `src/business/UI3.tsx` | Modified | Shared mobile record presentation | Typecheck, existing operations browser suites and responsive widths |
| `src/business/Workspace4.tsx` | Created | Functional workspace tools and screens | 19 new Pages cases plus all retained suites and visual inspection |
| `src/business/model.ts` | Modified | Additive restored-workspace metadata | Strict TypeScript, migration/restore/financial invariant tests |
| `src/business/store.test.ts` | Modified | Privacy regression coverage | Final unit/integration suite |
| `src/business/store.ts` | Modified | Storage integrity and complete deletion | Store persistence/failure/deletion tests and browser restoration |
| `src/business/view4.ts` | Created | Context-preserving view state | Filter persistence and repeated-create browser case |
| `src/business/workspace4.css` | Created | Consistent responsive/comfort surfaces | Overflow checks 320–1920px, appearance/density and screenshots |
| `src/business/workspace4.test.ts` | Created | Financial and persistence regression evidence | 155 total tests passed, including 32 new cases |
| `src/business/workspace4.ts` | Created | Local workspace domain and persistence | 32 new unit cases within the final 155 suite, production task/restore/scenario tests |
| `src/components/Network.tsx` | Modified | Adaptive reusable scene | Original graph/unsupported-WebGL/keyboard tests and new business 3D test |
| `src/main.tsx` | Modified | Clear public entry and resilient theme preference | Public launch, themes, navigation and routing tests |
| `tests/business.spec.ts` | Modified | Adapt retained acceptance tests to deliberate UX changes | Final full development suite: 33/33 |
| `tests/pages/operations3.spec.ts` | Modified | Preserve payroll/returns privacy acceptance after role-picker relocation | All 12 original operations Pages cases pass |
| `tests/pages/workspace4.spec.ts` | Created | Connected 4.0 acceptance coverage | 61 total production-browser tests passed |

## `CHANGELOG.md` — Modified

- **Reason:** Preserve release history.
- **Previous behavior:** Latest entry described 3.0.
- **New behavior:** Prepends the 4.0 change entry without deleting prior releases.
- **Important changes:** Evidence links distinguish local from pending/verified live publication.
- **Features affected:** Release history.
- **Potential side effects:** Documentation only.
- **Validation:** Diff and report consistency review.

## `README.md` — Modified

- **Reason:** Current setup and feature entry.
- **Previous behavior:** The top of README described 3.0.
- **New behavior:** Prepends 4.0 setup, source boundaries, new routes and reports; all previous text is preserved.
- **Important changes:** Exact setup/build/test/preview commands and limitations.
- **Features affected:** Developer/demo guidance.
- **Potential side effects:** Historical sections remain explicitly labelled.
- **Validation:** Commands executed; links/path review.

## `docs/SAAKH-4-3D-PERFORMANCE.md` — Created

- **Reason:** 3D Performance.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/SAAKH-4-ARCHITECTURE.md` — Created

- **Reason:** Architecture.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/SAAKH-4-DATA-MIGRATION.md` — Created

- **Reason:** Data Migration.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/SAAKH-4-DEPLOYMENT-VALIDATION.md` — Created

- **Reason:** Deployment Validation.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/SAAKH-4-FILE-CHANGES.md` — Created

- **Reason:** File Changes.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/SAAKH-4-FINANCIAL-INTEGRITY.md` — Created

- **Reason:** Financial Integrity.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/SAAKH-4-IMPLEMENTATION-REPORT.md` — Created

- **Reason:** Implementation Report.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/SAAKH-4-REQUIREMENTS-MATRIX.md` — Created

- **Reason:** Requirements Matrix.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/SAAKH-4-TEST-RESULTS.md` — Created

- **Reason:** Test Results.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/SAAKH-4-UX-ACCESSIBILITY.md` — Created

- **Reason:** Ux Accessibility.
- **Previous behavior:** No Saakh 4 report existed; older release documents are preserved.
- **New behavior:** Documents actual implementation, boundaries, source changes and applicable executed evidence.
- **Important changes:** Source-specific Markdown report; includes qualified scope and final status.
- **Features affected:** Documentation and review.
- **Potential side effects:** No runtime effect; historic results remain dated separately.
- **Validation:** Path/link consistency, final code/test/deployment cross-check.

## `docs/saakh4-evidence/cloud-deployment.json` — Created

- **Reason:** Machine-readable validation/deployment evidence.
- **Previous behavior:** This Saakh 4 evidence artifact did not exist.
- **New behavior:** Records the actual named test, audit, performance or deployment result; pending states are explicit until verified.
- **Important changes:** Preserves counts, environment/source identity and observed status rather than fabricated success.
- **Features affected:** Release verification.
- **Potential side effects:** Recorded observations have the stated scope/time; not universal certification.
- **Validation:** JSON parsing and cross-check against executed tool output and reports.

## `docs/saakh4-evidence/dependency-audit.json` — Created

- **Reason:** Machine-readable validation/deployment evidence.
- **Previous behavior:** This Saakh 4 evidence artifact did not exist.
- **New behavior:** Records the actual named test, audit, performance or deployment result; pending states are explicit until verified.
- **Important changes:** Preserves counts, environment/source identity and observed status rather than fabricated success.
- **Features affected:** Release verification.
- **Potential side effects:** Recorded observations have the stated scope/time; not universal certification.
- **Validation:** JSON parsing and cross-check against executed tool output and reports.

## `docs/saakh4-evidence/development-performance.json` — Created

- **Reason:** Machine-readable validation/deployment evidence.
- **Previous behavior:** This Saakh 4 evidence artifact did not exist.
- **New behavior:** Records the actual named test, audit, performance or deployment result; pending states are explicit until verified.
- **Important changes:** Preserves counts, environment/source identity and observed status rather than fabricated success.
- **Features affected:** Release verification.
- **Potential side effects:** Recorded observations have the stated scope/time; not universal certification.
- **Validation:** JSON parsing and cross-check against executed tool output and reports.

## `docs/saakh4-evidence/development-tests.json` — Created

- **Reason:** Machine-readable validation/deployment evidence.
- **Previous behavior:** This Saakh 4 evidence artifact did not exist.
- **New behavior:** Records the actual named test, audit, performance or deployment result; pending states are explicit until verified.
- **Important changes:** Preserves counts, environment/source identity and observed status rather than fabricated success.
- **Features affected:** Release verification.
- **Potential side effects:** Recorded observations have the stated scope/time; not universal certification.
- **Validation:** JSON parsing and cross-check against executed tool output and reports.

## `docs/saakh4-evidence/live-tests.json` — Created

- **Reason:** Machine-readable validation/deployment evidence.
- **Previous behavior:** This Saakh 4 evidence artifact did not exist.
- **New behavior:** Records the actual named test, audit, performance or deployment result; pending states are explicit until verified.
- **Important changes:** Preserves counts, environment/source identity and observed status rather than fabricated success.
- **Features affected:** Release verification.
- **Potential side effects:** Recorded observations have the stated scope/time; not universal certification.
- **Validation:** JSON parsing and cross-check against executed tool output and reports.

## `docs/saakh4-evidence/production-performance.json` — Created

- **Reason:** Machine-readable validation/deployment evidence.
- **Previous behavior:** This Saakh 4 evidence artifact did not exist.
- **New behavior:** Records the actual named test, audit, performance or deployment result; pending states are explicit until verified.
- **Important changes:** Preserves counts, environment/source identity and observed status rather than fabricated success.
- **Features affected:** Release verification.
- **Potential side effects:** Recorded observations have the stated scope/time; not universal certification.
- **Validation:** JSON parsing and cross-check against executed tool output and reports.

## `docs/saakh4-evidence/production-tests.json` — Created

- **Reason:** Machine-readable validation/deployment evidence.
- **Previous behavior:** This Saakh 4 evidence artifact did not exist.
- **New behavior:** Records the actual named test, audit, performance or deployment result; pending states are explicit until verified.
- **Important changes:** Preserves counts, environment/source identity and observed status rather than fabricated success.
- **Features affected:** Release verification.
- **Potential side effects:** Recorded observations have the stated scope/time; not universal certification.
- **Validation:** JSON parsing and cross-check against executed tool output and reports.

## `docs/saakh4-evidence/unit-tests.json` — Created

- **Reason:** Machine-readable validation/deployment evidence.
- **Previous behavior:** This Saakh 4 evidence artifact did not exist.
- **New behavior:** Records the actual named test, audit, performance or deployment result; pending states are explicit until verified.
- **Important changes:** Preserves counts, environment/source identity and observed status rather than fabricated success.
- **Features affected:** Release verification.
- **Potential side effects:** Recorded observations have the stated scope/time; not universal certification.
- **Validation:** JSON parsing and cross-check against executed tool output and reports.

## `index.html` — Modified

- **Reason:** Theme initialization and release identity.
- **Previous behavior:** The title described Saakh 3 and the theme was applied only after React mounted.
- **New behavior:** The title identifies 4.0; a guarded head script applies the saved/system theme before rendering.
- **Important changes:** Inline initialization uses no credentials; system fallback works if local storage is blocked.
- **Features affected:** Public entry, Light/Dark/System.
- **Potential side effects:** Inline-script policies would need an explicit nonce/hash in a future strict CSP.
- **Validation:** Build, asset-path, appearance and browser suites.

## `package-lock.json` — Modified

- **Reason:** Synchronized lock metadata.
- **Previous behavior:** Root lock metadata identified 3.0.0-demo.
- **New behavior:** Both root package version fields identify 4.0.0-demo.
- **Important changes:** Dependency resolutions and integrity hashes retained.
- **Features affected:** Reproducible installation.
- **Potential side effects:** No dependency graph change; audit still applies to existing resolutions.
- **Validation:** JSON/package consistency, dependency audit, CI npm ci.

## `package.json` — Modified

- **Reason:** Release metadata.
- **Previous behavior:** The package identified 3.0.0-demo.
- **New behavior:** The package identifies 4.0.0-demo; scripts and dependencies are retained.
- **Important changes:** Changed only the root package version.
- **Features affected:** Tooling/release metadata.
- **Potential side effects:** No new runtime dependency or migration is installed.
- **Validation:** Typecheck, lint, unit, build and browser commands.

## `src/business/BusinessApp.tsx` — Modified

- **Reason:** Connected role-aware shell and financial workflow UX.
- **Previous behavior:** Original 18 business routes, header role selector, raw business select and unremembered document views.
- **New behavior:** Adds new workspace destinations, role-filtered groups, mobile navigation, header tools, source details, full-page document editing and eligible draft recovery.
- **Important changes:** Existing financial components are reused; URL filters/sorting/pagination/selected exports, compatible role setting and business profile edit; raw role/business header selectors relocated/replaced.
- **Features affected:** All business navigation, document forms, Settings, records.
- **Potential side effects:** Only supported invoice/purchase form drafts autosave; many legacy short forms retain their existing pattern. Role checks remain simulated.
- **Validation:** Full development/Pages suites, invoice/payment/payroll/returns, responsive and recovery tests.

## `src/business/Customers3.tsx` — Modified

- **Reason:** Customer workflow and context.
- **Previous behavior:** Customer forms appeared inline and list filters were transient.
- **New behavior:** Forms use an accessible adaptive drawer; URL/business-role scoped filters and linked record selection are restored.
- **Important changes:** Reuses existing customer save/statement functions; role-ineligible creation/editing controls are disabled.
- **Features affected:** Customers, Universal Create/Search.
- **Potential side effects:** Unsaved customer changes require discard confirmation; no claim of autosave for this form.
- **Validation:** Existing customer/invoice/statement flow, Create/source-search browser tests, drawer screenshot.

## `src/business/Drawer4.tsx` — Created

- **Reason:** Accessible adaptive short form.
- **Previous behavior:** Customer editor used a normal inline panel.
- **New behavior:** Native modal side panel/full-screen mobile with explicit discard confirmation.
- **Important changes:** Native focus containment/Escape with guarded close; cleanup closes the dialog.
- **Features affected:** New/edit customer.
- **Potential side effects:** Customer draft content is not auto-persisted.
- **Validation:** Existing customer flows, native dialog behavior and 390px visual check.

## `src/business/UI3.tsx` — Modified

- **Reason:** Shared mobile record presentation.
- **Previous behavior:** Shared tables had headers without cell-level mobile labels.
- **New behavior:** Cell labels derive from the same source headers and rows for mobile cards.
- **Important changes:** Clones valid React row/cell elements without recalculating financial values.
- **Features affected:** Customer/payroll/return/report lists.
- **Potential side effects:** Specialized child structures retain their original rendering; not an independent screen-reader audit.
- **Validation:** Typecheck, existing operations browser suites and responsive widths.

## `src/business/Workspace4.tsx` — Created

- **Reason:** Functional workspace tools and screens.
- **Previous behavior:** 4.0 shell tools and new connected screens were absent.
- **New behavior:** Adds genuine search/Create/business/notification/Assistant panels, role previews, tasks, Insights/scenarios, Help/Settings preferences, backup/recovery, Reports Centre, approvals and source-driven network.
- **Important changes:** Selectors and existing operations supply values; snapshots/exports use selected data; no fake sending, banking or independent posting implementation.
- **Features affected:** Nine new routes and shared tools.
- **Potential side effects:** Qualified legacy-UI coverage is recorded in the requirements matrix; no universal secure multi-user backend.
- **Validation:** 19 new Pages cases plus all retained suites and visual inspection.

## `src/business/model.ts` — Modified

- **Reason:** Additive restored-workspace metadata.
- **Previous behavior:** BusinessState v2 had no retained workspace restore archive.
- **New behavior:** Optional business-scoped restore archives preserve imported tasks/scenarios/drafts/preferences.
- **Important changes:** Financial schema v2 and operationsRevision 2 are retained; imports here are types only.
- **Features affected:** Restore persistence and recovery.
- **Potential side effects:** Older source builds do not expose new workspace UI; no existing financial array is replaced.
- **Validation:** Strict TypeScript, migration/restore/financial invariant tests.

## `src/business/store.test.ts` — Modified

- **Reason:** Privacy regression coverage.
- **Previous behavior:** Deletion assertions covered only original credit stores.
- **New behavior:** Deletion also asserts removal of the new workspace key.
- **Important changes:** Existing denial and preservation assertions retained.
- **Features affected:** Data deletion.
- **Potential side effects:** Tests use mocked IndexedDB calls; real restoration also has browser coverage.
- **Validation:** Final unit/integration suite.

## `src/business/store.ts` — Modified

- **Reason:** Storage integrity and complete deletion.
- **Previous behavior:** Atomic financial saves existed; new workspace data was not yet part of recovery/deletion.
- **New behavior:** Validates archive membership/preferences, freezes queued workspace writes during deletion, clears new saved workspace data.
- **Important changes:** Original clone→validate→persist→publish pipeline remains; explicit deletion remains role/confirmation guarded.
- **Features affected:** Persistence, recovery, privacy.
- **Potential side effects:** Browser-local single-process atomicity is not cross-tab or server security.
- **Validation:** Store persistence/failure/deletion tests and browser restoration.

## `src/business/view4.ts` — Created

- **Reason:** Context-preserving view state.
- **Previous behavior:** Legacy filters typically reset when returning to a module.
- **New behavior:** URL values are authoritative for Back/Forward; remembered values are scoped by business, role, path and key.
- **Important changes:** Search parameter updates preserve record/create flags and use replace for typing.
- **Features affected:** Customer/document registers.
- **Potential side effects:** Only adopted views use this helper; no universal scroll restoration claim.
- **Validation:** Filter persistence and repeated-create browser case.

## `src/business/workspace4.css` — Created

- **Reason:** Consistent responsive/comfort surfaces.
- **Previous behavior:** No shared 4.0 panel/drawer/mobile workspace styling.
- **New behavior:** Adds scoped navy/teal panels, focus outlines, density, reduced motion, mobile cards/bottom navigation and split network layout.
- **Important changes:** Reuses existing financial color tokens and avoids global financial-data transformations.
- **Features affected:** Desktop/mobile shell, cards, dialogs.
- **Potential side effects:** Rendering preferences do not change accounting values; browser/device coverage is finite.
- **Validation:** Overflow checks 320–1920px, appearance/density and screenshots.

## `src/business/workspace4.test.ts` — Created

- **Reason:** Financial and persistence regression evidence.
- **Previous behavior:** No 4.0 workspace tests existed.
- **New behavior:** Adds source isolation, populated payroll privacy, unchanged ledger/scenarios, safe backup copies/preferences, corruption/truncation/version/unsafe-key checks, hydration/write failures and supported-query tests.
- **Important changes:** Uses original synthetic fixtures and posting engines, not mirror-only UI assertions.
- **Features affected:** New workspace core.
- **Potential side effects:** Mocks IndexedDB for failure injection; real IndexedDB covered by browser tests.
- **Validation:** 155 total tests passed, including 32 new cases.

## `src/business/workspace4.ts` — Created

- **Reason:** Local workspace domain and persistence.
- **Previous behavior:** No shared 4.0 task/scenario/search/portable-restore domain existed.
- **New behavior:** Centralizes source-aware selectors, validation, named forecasts, backup/restore and serialized hydration-safe workspace persistence.
- **Important changes:** Uses existing engines; validates IDs, membership, cash arithmetic and backup counts; source identities remap; one-time imported archive synchronization is supported by UI.
- **Features affected:** Tasks, search, notifications, scenarios, backup/recovery.
- **Potential side effects:** Backups are unencrypted; count metadata is not a signature; all permissions are client-demo checks.
- **Validation:** 32 new unit cases within the final 155 suite, production task/restore/scenario tests.

## `src/components/Network.tsx` — Modified

- **Reason:** Adaptive reusable scene.
- **Previous behavior:** The data-driven scene already supported orbit, selection and 2D fallback with fixed capability heuristics.
- **New behavior:** Adds quality/reduced-motion overrides and off-screen rendering pause.
- **Important changes:** Capability DPR caps, IntersectionObserver cleanup, device-motion listener cleanup; existing graph inputs and selection are unchanged.
- **Features affected:** Credit and business 3D explorers.
- **Potential side effects:** Large lazy WebGL chunk remains; capability heuristics are not FPS feedback control.
- **Validation:** Original graph/unsupported-WebGL/keyboard tests and new business 3D test.

## `src/main.tsx` — Modified

- **Reason:** Clear public entry and resilient theme preference.
- **Previous behavior:** One main business entry and unguarded theme localStorage access.
- **New behavior:** Separate Business Demo, Continue Previous Session and Team Roles links; session fallback for blocked preference storage.
- **Important changes:** Original public/credit routes and lazy entry preserved; Owner entry is explicit and source-preserving.
- **Features affected:** Public landing, session entry, appearance.
- **Potential side effects:** A persisted browser preference is not an account session or authenticated role.
- **Validation:** Public launch, themes, navigation and routing tests.

## `tests/business.spec.ts` — Modified

- **Reason:** Adapt retained acceptance tests to deliberate UX changes.
- **Previous behavior:** Tests selected a header role/business dropdown and old empty-state wording.
- **New behavior:** Tests navigate the role-picker and searchable business panel while retaining source/isolation/financial assertions.
- **Important changes:** Forbidden controls are asserted absent; existing domain-denial tests remain; public CTA label updated.
- **Features affected:** Regression acceptance.
- **Potential side effects:** This is an intentional navigation contract change; no financial expectation was removed.
- **Validation:** Final full development suite: 33/33.

## `tests/pages/operations3.spec.ts` — Modified

- **Reason:** Preserve payroll/returns privacy acceptance after role-picker relocation.
- **Previous behavior:** Tests changed the header role dropdown.
- **New behavior:** Helper visits the separate role page, waits for committed identity, then restores the tested route.
- **Important changes:** All salary/return/source/payment/privacy and responsive assertions retained.
- **Features affected:** Original 3.0 operations acceptance.
- **Potential side effects:** Adds role-navigation steps without bypassing persistence.
- **Validation:** All 12 original operations Pages cases pass.

## `tests/pages/workspace4.spec.ts` — Created

- **Reason:** Connected 4.0 acceptance coverage.
- **Previous behavior:** No 4.0 end-to-end tests existed.
- **New behavior:** 19 cases cover actual tasks, source search, draft non-posting/recovery, scenario comparison and deletion, restore isolation, permissions, reports, 3D, views and nine new-suite widths.
- **Important changes:** Checks persisted results, exported data, unchanged journal snapshots, real WebGL canvas/2D fallback and runtime monitors.
- **Features affected:** New workspace end-to-end acceptance.
- **Potential side effects:** Headless Chromium is not physical device or universal browser certification.
- **Validation:** 61 total production-browser tests passed.
