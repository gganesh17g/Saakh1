# Saakh 3.0 file changes report

Baseline: clean main `353ecf73f226747570653b24aca144683bf4b222`, 109 tracked files; matching origin on initial fetch. No pre-existing modified/staged/untracked user files. Recoverable backup `backup/pre-saakh3-20261028`. Exact task totals: **32 Created, 14 Modified, 0 Renamed, 0 Deleted** (46 files). No previous documentation deleted; earlier README/CHANGELOG content is retained. No original credit engine, graph or financial fixture source was replaced. Workflow and /Saakh1/ configuration remain unchanged.

Git status --short, diff --stat/name-status/check, staged changes, untracked and ignored files were inspected. Counts compare actual file hashes to the captured baseline and include this report/evidence, excluding .git, node_modules, dist, browser artifacts and tsbuildinfo. No force push or unrelated-history rewrite is used. Final commit identity is available in release.json and the delivery summary; a report cannot contain its own future commit SHA.

| Exact relative path | Change | Purpose | Validation |
|---|---|---|---|
| `docs/AUTOMATIC-INVOICING-WORKFLOW.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/CUSTOMER-DATA-MODEL.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/FINANCIAL-INTEGRATION-TESTS.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/PAYROLL-AND-GST-READINESS.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/PAYROLL-METHODOLOGY.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/RETURNS-ACCOUNTING-RULES.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/SAAKH-3-DEPLOYMENT-VALIDATION.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/SAAKH-3-FILE-CHANGES-REPORT.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/SAAKH-3-IMPLEMENTATION-PLAN.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/SAAKH-3-IMPLEMENTATION-REPORT.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/SAAKH-3-KNOWN-LIMITATIONS.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/SAAKH-3-REQUIREMENTS-MATRIX.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/SAAKH-3-TEST-REPORT.md` | Created | Document actual 3.0 implementation and policy boundaries | Cross-checked with final source, executed commands, source references and stated limitations |
| `docs/saakh3-evidence/development-performance.json` | Created | Retain actual test/audit/performance/release evidence | JSON parse and actual result cross-check; no historical pass substituted for current verification |
| `docs/saakh3-evidence/npm-audit.json` | Created | Retain actual test/audit/performance/release evidence | JSON parse and actual result cross-check; no historical pass substituted for current verification |
| `docs/saakh3-evidence/production-performance.json` | Created | Retain actual test/audit/performance/release evidence | JSON parse and actual result cross-check; no historical pass substituted for current verification |
| `docs/saakh3-evidence/production-tests.json` | Created | Retain actual test/audit/performance/release evidence | JSON parse and actual result cross-check; no historical pass substituted for current verification |
| `docs/saakh3-evidence/unit-tests.json` | Created | Retain actual test/audit/performance/release evidence | JSON parse and actual result cross-check; no historical pass substituted for current verification |
| `src/business/Customers3.tsx` | Created | Expose the shared customer master | Repeat-customer browser flow and customer/domain tests |
| `src/business/Payroll3.tsx` | Created | Provide connected payroll operations | Scenario A, privacy/refresh and all eight widths |
| `src/business/Reports3.tsx` | Created | Join operations with business reporting/activity | Balanced JSON, activity search, source reconciliation and original report regressions |
| `src/business/Returns3.tsx` | Created | Separate stock/credit/cash review workflows | Scenarios B/C and quantity/accounting/refund tests |
| `src/business/UI3.tsx` | Created | Share accessible operations UI primitives | Keyboard, modal, PDF/CSV and responsive cases |
| `src/business/documents3.ts` | Created | Generate documents from current source records | PDF headers/content/amount browser checks, payslip/source assertions and typography unit test |
| `src/business/fixtures3.ts` | Created | Supply coherent opt-in examples | Seed conservation/balances test and browser examples/refresh |
| `src/business/migration.ts` | Created | Add operations without erasing old data | Old-record preservation and unsupported-format tests |
| `src/business/money3.ts` | Created | Avoid binary decimal payroll ratio errors | Large rational, tie-rounding and invalid-input tests |
| `src/business/operations3.test.ts` | Created | Exercise new financial requirements and invariants | 121 total unit/integration/store tests pass |
| `src/business/operations3.ts` | Created | Centralize operation calculations/posting transitions | 45 operation tests and complete A–E browser flows |
| `src/business/operationsModel.ts` | Created | Define reproducible operation records | Strict compilation and source-model tests |
| `src/business/validation3.ts` | Created | Validate financial coherence before every save | Corrupt-state tests and every successful atomic/browser commit |
| `tests/pages/operations3.spec.ts` | Created | Verify actual connected production workflows | Complete 42 Pages suite; final live status recorded after deployment |
| `CHANGELOG.md` | Modified | Record actual operations upgrade | Original content retained |
| `README.md` | Modified | Explain current release/setup/demos and boundaries | Commands executed, old content inclusion checked |
| `index.html` | Modified | Identify the new business release | Build and production entry/asset checks |
| `package-lock.json` | Modified | Reproducible PDF dependency installation | Install, audit and production build |
| `package.json` | Modified | Version and real PDF dependency | npm install, npm audit zero, strict build and browser PDF file assertions |
| `src/business/BusinessApp.tsx` | Modified | Connect new modules to existing owner workflows | 33 development, 42 production and actual PDF/accounting acceptance checks |
| `src/business/accounting.ts` | Modified | Include new operations in the same ledger and prevent invoice reuse | 121 unit cases, new browser balances and original accounting regressions |
| `src/business/analytics.ts` | Modified | Forecast only actual remaining obligations/commitments | Salary, credit/refund and dispute forecast tests plus existing forecast browser regression |
| `src/business/business.css` | Modified | Style new grouped navigation and linked metrics consistently | Eight new widths plus original responsive/keyboard/theme regressions |
| `src/business/business.test.ts` | Modified | Keep unsupported-schema regression valid after v2 upgrade | Original 75 assertions plus new operations tests |
| `src/business/model.ts` | Modified | Extend the existing common business model | Strict types, migration/financial/store tests and all regressions |
| `src/business/store.test.ts` | Modified | Validate recovery without overwriting saved original | Included in 121 passing tests |
| `src/business/store.ts` | Modified | Preserve v1 records and recover invalid storage safely | Migration, recovery, failed-write and restoration tests; browser reload |
| `src/main.tsx` | Modified | Repair skip focus race exposed by final browser validation | Full 42 production suite including previously failing skip-focus case |

## File-by-file evidence

### `docs/AUTOMATIC-INVOICING-WORKFLOW.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/CUSTOMER-DATA-MODEL.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/FINANCIAL-INTEGRATION-TESTS.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/PAYROLL-AND-GST-READINESS.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/PAYROLL-METHODOLOGY.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/RETURNS-ACCOUNTING-RULES.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/SAAKH-3-DEPLOYMENT-VALIDATION.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/SAAKH-3-FILE-CHANGES-REPORT.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/SAAKH-3-IMPLEMENTATION-PLAN.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/SAAKH-3-IMPLEMENTATION-REPORT.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/SAAKH-3-KNOWN-LIMITATIONS.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/SAAKH-3-REQUIREMENTS-MATRIX.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/SAAKH-3-TEST-REPORT.md` — Created

- Reason: Document actual 3.0 implementation and policy boundaries.
- Previous behavior: No corresponding 3.0-specific document.
- New behavior / important changes: Record implemented behavior, formulas, source attribution, official research limits and actual validation/deployment status.
- Related module: Documentation/readiness.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Cross-checked with final source, executed commands, source references and stated limitations.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/saakh3-evidence/development-performance.json` — Created

- Reason: Retain actual test/audit/performance/release evidence.
- Previous behavior: No corresponding 3.0 evidence.
- New behavior / important changes: Actual machine-readable executed results, distinguishing local/cloud/live contexts.
- Related module: Verification.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: JSON parse and actual result cross-check; no historical pass substituted for current verification.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/saakh3-evidence/npm-audit.json` — Created

- Reason: Retain actual test/audit/performance/release evidence.
- Previous behavior: No corresponding 3.0 evidence.
- New behavior / important changes: Actual machine-readable executed results, distinguishing local/cloud/live contexts.
- Related module: Verification.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: JSON parse and actual result cross-check; no historical pass substituted for current verification.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/saakh3-evidence/production-performance.json` — Created

- Reason: Retain actual test/audit/performance/release evidence.
- Previous behavior: No corresponding 3.0 evidence.
- New behavior / important changes: Actual machine-readable executed results, distinguishing local/cloud/live contexts.
- Related module: Verification.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: JSON parse and actual result cross-check; no historical pass substituted for current verification.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/saakh3-evidence/production-tests.json` — Created

- Reason: Retain actual test/audit/performance/release evidence.
- Previous behavior: No corresponding 3.0 evidence.
- New behavior / important changes: Actual machine-readable executed results, distinguishing local/cloud/live contexts.
- Related module: Verification.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: JSON parse and actual result cross-check; no historical pass substituted for current verification.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `docs/saakh3-evidence/unit-tests.json` — Created

- Reason: Retain actual test/audit/performance/release evidence.
- Previous behavior: No corresponding 3.0 evidence.
- New behavior / important changes: Actual machine-readable executed results, distinguishing local/cloud/live contexts.
- Related module: Verification.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: JSON parse and actual result cross-check; no historical pass substituted for current verification.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/Customers3.tsx` — Created

- Reason: Expose the shared customer master.
- Previous behavior: Basic buyer directory only.
- New behavior / important changes: Dedicated profile CRUD/archive/search/filter/sort, history/observed insights, date-filtered statement preview/CSV/PDF.
- Related module: Customers.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Repeat-customer browser flow and customer/domain tests.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/Payroll3.tsx` — Created

- Reason: Provide connected payroll operations.
- Previous behavior: No payroll screen.
- New behavior / important changes: Role-guarded employee/salary/attendance/rules, guided payroll lifecycle, payslip, payment/batch/reversal/advance/remittance and department/month summaries.
- Related module: Payroll.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Scenario A, privacy/refresh and all eight widths.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/Reports3.tsx` — Created

- Reason: Join operations with business reporting/activity.
- Previous behavior: No operations source/liability report.
- New behavior / important changes: Linked Pulse metrics, ledger reconciliations, actual report exports, source search/type filters/navigation and evidence.
- Related module: Dashboard/reports.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Balanced JSON, activity search, source reconciliation and original report regressions.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/Returns3.tsx` — Created

- Reason: Separate stock/credit/cash review workflows.
- Previous behavior: No distinct return workbenches.
- New behavior / important changes: Quantity/condition source drafts, approval, separate dispatch, partial supplier credits/disputes, refund/allocation/reversal, documents and reason summaries.
- Related module: Returns.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Scenarios B/C and quantity/accounting/refund tests.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/UI3.tsx` — Created

- Reason: Share accessible operations UI primitives.
- Previous behavior: No new operation screen helpers.
- New behavior / important changes: Labelled fields/tables, modal confirmation, printable preview, guarded CSV/PDF actions and error handling using existing store/design.
- Related module: Shared UI.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Keyboard, modal, PDF/CSV and responsive cases.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/documents3.ts` — Created

- Reason: Generate documents from current source records.
- Previous behavior: JSON/CSV and whole-page print only.
- New behavior / important changes: Source-exact invoice/payslip/statement documents; dynamically imported real PDF; escaped selected-document print; typography normalization and explicit unsupported-script recovery.
- Related module: Documents/export.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: PDF headers/content/amount browser checks, payslip/source assertions and typography unit test.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/fixtures3.ts` — Created

- Reason: Supply coherent opt-in examples.
- Previous behavior: Original synthetic business fixtures only.
- New behavior / important changes: Idempotent user-confirmed addition of fictional employees/payroll, partial pay, repeat sales/customer credit and supplier refund receivable; no reset.
- Related module: Demo data.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Seed conservation/balances test and browser examples/refresh.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/migration.ts` — Created

- Reason: Add operations without erasing old data.
- Previous behavior: v1-only stored state.
- New behavior / important changes: Clone and add empty collections on v1→v2; reject unsupported schema or malformed collections.
- Related module: Migration.
- Integration impact: Common v2 schema adds accounts/collections and preserves v1 records; old app versions cannot read newly saved v2 data, so export before upgrade.
- Tests executed: Old-record preservation and unsupported-format tests.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/money3.ts` — Created

- Reason: Avoid binary decimal payroll ratio errors.
- Previous behavior: No payroll rounding policy.
- New behavior / important changes: Safe nonnegative integer BigInt product/divisor with half-up rounding.
- Related module: Money precision.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Large rational, tie-rounding and invalid-input tests.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/operations3.test.ts` — Created

- Reason: Exercise new financial requirements and invariants.
- Previous behavior: No tests for the requested operation models.
- New behavior / important changes: 45 meaningful payroll, returns, invoice, customer, migration, forecast, precision and corruption tests.
- Related module: Financial QA.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: 121 total unit/integration/store tests pass.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/operations3.ts` — Created

- Reason: Centralize operation calculations/posting transitions.
- Previous behavior: Only original manual and proportional services.
- New behavior / important changes: Customer selectors/validation; existing-engine auto invoices; quantity return/dispatch/credit/refund/reversal; effective payroll/approval/finalization/payment/advance/remittance; source-derived dashboard summaries.
- Related module: Financial events.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: 45 operation tests and complete A–E browser flows.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/operationsModel.ts` — Created

- Reason: Define reproducible operation records.
- Previous behavior: No operation-specific entities.
- New behavior / important changes: Employee/salary/rule/attendance/payroll/payment/quantity-return/receipt/settlement/sequence/token types and empty collections.
- Related module: Domain schema.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Strict compilation and source-model tests.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/validation3.ts` — Created

- Reason: Validate financial coherence before every save.
- Previous behavior: No new collection validation.
- New behavior / important changes: Salary snapshot/source-payable reconciliation, return conservation/lines/dates, duplicate IDs and source business/journal evidence.
- Related module: Data integrity.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Corrupt-state tests and every successful atomic/browser commit.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `tests/pages/operations3.spec.ts` — Created

- Reason: Verify actual connected production workflows.
- Previous behavior: No browser coverage for new operations.
- New behavior / important changes: 12 tests: A–E workflows, real PDF content, role/privacy/refresh, eight widths/keyboard, monitored errors; live-compatible hash paths.
- Related module: Production/live QA.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Complete 42 Pages suite; final live status recorded after deployment.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `CHANGELOG.md` — Modified

- Reason: Record actual operations upgrade.
- Previous behavior: Prior release entries.
- New behavior / important changes: Prepend 3.0.0-demo changes; previous entries preserved.
- Related module: History.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Original content retained.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `README.md` — Modified

- Reason: Explain current release/setup/demos and boundaries.
- Previous behavior: Earlier Saakh1 documentation.
- New behavior / important changes: Prepend 3.0 instructions and new route/workflow/report links; previous content preserved verbatim.
- Related module: Delivery.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Commands executed, old content inclusion checked.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `index.html` — Modified

- Reason: Identify the new business release.
- Previous behavior: Credit-only page title.
- New behavior / important changes: Saakh 3.0 business operations and credit intelligence title; entry/base unchanged.
- Related module: Public identity.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Build and production entry/asset checks.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `package-lock.json` — Modified

- Reason: Reproducible PDF dependency installation.
- Previous behavior: Prior lockfile without jspdf.
- New behavior / important changes: npm-generated lockfile plus application version; no manual transitive resolution.
- Related module: Dependencies.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Install, audit and production build.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `package.json` — Modified

- Reason: Version and real PDF dependency.
- Previous behavior: 1.2.0 with no client PDF generator.
- New behavior / important changes: 3.0.0-demo and jspdf dependency; existing scripts remain.
- Related module: Release/PDF.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: npm install, npm audit zero, strict build and browser PDF file assertions.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/BusinessApp.tsx` — Modified

- Reason: Connect new modules to existing owner workflows.
- Previous behavior: 14 business screens, manual numbers and proportional immediate-refund form.
- New behavior / important changes: 18 routes grouped in navigation; current invoice form supports atomic auto numbering/inline customer/guest and metadata; real document preview/duplicate; new returns links replace primary immediate-refund form; operations Pulse/reports and recovery UI.
- Related module: Business UX/invoicing/integration.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: 33 development, 42 production and actual PDF/accounting acceptance checks.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/accounting.ts` — Modified

- Reason: Include new operations in the same ledger and prevent invoice reuse.
- Previous behavior: No payroll/return credit accounts; sales number uniqueness scoped to party.
- New behavior / important changes: Financials/P&L/balance sheet include new accounts; immutable issued numbers and cross-customer/cancelled-number uniqueness; linked-return correction guards; targeted duplicate source checks.
- Related module: Ledger/inventory/reports.
- Integration impact: Common v2 schema adds accounts/collections and preserves v1 records; old app versions cannot read newly saved v2 data, so export before upgrade.
- Tests executed: 121 unit cases, new browser balances and original accounting regressions.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/analytics.ts` — Modified

- Reason: Forecast only actual remaining obligations/commitments.
- Previous behavior: Only existing documents, operating pattern/debt/tax assumptions.
- New behavior / important changes: Unpaid finalized salary once; explicitly scheduled undisputed refund inflow/outflow; credits alone excluded; assumptions documented.
- Related module: Cash forecasts.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Salary, credit/refund and dispute forecast tests plus existing forecast browser regression.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/business.css` — Modified

- Reason: Style new grouped navigation and linked metrics consistently.
- Previous behavior: Existing navy/teal/warm-white responsive system.
- New behavior / important changes: Small additive grouped-nav, metric-button, month input and print rules; existing theme/mobile tokens preserved.
- Related module: Presentation/accessibility.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Eight new widths plus original responsive/keyboard/theme regressions.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/business.test.ts` — Modified

- Reason: Keep unsupported-schema regression valid after v2 upgrade.
- Previous behavior: Test deliberately rejected version 2.
- New behavior / important changes: Reject unknown version 999; financial assertions retained.
- Related module: Regression QA.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Original 75 assertions plus new operations tests.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/model.ts` — Modified

- Reason: Extend the existing common business model.
- Previous behavior: v1 state, basic parties and old account list.
- New behavior / important changes: v2 operations collections, new expense/liability/asset accounts, customer fields/optional invoice metadata, payroll/manager/auditor demo roles.
- Related module: Shared domain/permissions.
- Integration impact: Common v2 schema adds accounts/collections and preserves v1 records; old app versions cannot read newly saved v2 data, so export before upgrade.
- Tests executed: Strict types, migration/financial/store tests and all regressions.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/store.test.ts` — Modified

- Reason: Validate recovery without overwriting saved original.
- Previous behavior: Existing atomic persistence tests.
- New behavior / important changes: Add recovery-state reset in setup and one invalid-restore write-block test.
- Related module: Storage QA.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Included in 121 passing tests.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/business/store.ts` — Modified

- Reason: Preserve v1 records and recover invalid storage safely.
- Previous behavior: v1-only validation; invalid restore could leave an empty writable view.
- New behavior / important changes: Additive migration; validate v2 and financial source invariants; retain recovery JSON and block writes after restore failure; existing atomic clone/save retained.
- Related module: Persistence/lifecycle.
- Integration impact: Common v2 schema adds accounts/collections and preserves v1 records; old app versions cannot read newly saved v2 data, so export before upgrade.
- Tests executed: Migration, recovery, failed-write and restoration tests; browser reload.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.

### `src/main.tsx` — Modified

- Reason: Repair skip focus race exposed by final browser validation.
- Previous behavior: Skip focused the old main if lazy navigation replaced it immediately afterward.
- New behavior / important changes: Observe main replacement once, transfer skip focus, disconnect on transfer/timeout; ignore ordinary child mutations.
- Related module: Keyboard navigation.
- Integration impact: Uses existing business-ID scope, atomic persistence, common source records and accounting rather than a second ledger; original credit routes remain supported.
- Tests executed: Full 42 production suite including previously failing skip-focus case.
- Risks / limitations: browser-local synthetic roles/storage are not secure production authorization; payroll/tax assumptions are not statutory certification. Monthly/stock-cost/PDF-font limits are documented; actual cloud/live status is limited to observed evidence.
