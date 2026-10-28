# Saakh 4.0 requirements matrix

Status meanings: **Implemented** = connected behavior exists and is included in final validation; **Preserved** = existing working behavior reused; **Qualified** = useful implementation with an explicit boundary. This is a demonstration release, not production authentication or statutory software.

| Brief sections | Delivery | Evidence / boundary |
| --- | --- | --- |
| 1–2: audit, safeguards, baseline | Implemented | Clean `4d5f438` baseline, backup branch, original 123 unit and 42 production-browser tests; existing ledger/source calculations retained. |
| 3: visual system, appearance, density | Implemented | Shared navy/teal language, early theme initialization, System/Light/Dark persistence, Comfortable/Compact, scoped cards/drawers/mobile styles. |
| 4: public entry | Implemented / Preserved | Existing cinematic public site/credit preview retained; Business Demo, Continue Previous Session and separate Team Roles entry. Starting as Owner preserves financial records. |
| 5: business switcher | Implemented | Searchable local businesses, new-business onboarding, switch confirmation, business/role view reset, separate-copy restore and source-scoped selectors. Not secure tenancy. |
| 6: seven role templates | Implemented | Original engine permissions plus centralized destinations; confidential payroll, search, Create, tasks and exports apply relevant role rules. No authenticated account claims. |
| 7: navigation and context | Qualified | Collapsible remembered desktop groups, active-route reveal, mobile Home/Work/Tasks/More, native Back/Forward and record links. Customer/document filters retain business/role/module scope. Not every legacy screen persists every scroll position or filter. |
| 8: Universal Create | Implemented | Real invoice/customer/purchase/product/task/payroll destinations, searchable native modal, read-only explanation and repeated same-page create support. |
| 9: adaptive forms | Qualified | Customer drawer/full-screen mobile panel; original validated complex financial editors retained. Not every legacy short form is converted into a drawer. |
| 10: autosave/recovery | Qualified | Invoice/purchase editor eligible form recovery, debounced writes, status, resume/discard, navigation flush, stable draft/submission identities; never posts. Payroll and all legacy forms do not claim automatic recovery. |
| 11: approvals and financial safety | Preserved / Implemented | Return review transitions and payroll review queue use existing operations. Financial issuance/finalization/payment/refund remain separate confirmed actions, source-state validation and existing idempotence/reversal rules. No general configurable approval-policy engine. |
| 12: notifications | Implemented | Real draft/overdue/low-stock/task conditions, categories, persisted read markers, resolved filtering, read-only navigation and category preference. No external push service. |
| 13: Universal Search | Implemented | Source invoices, parties, items, permitted employees/journals/statement rows, tasks and useful pages; Ctrl/Cmd+K, native dialog, business/role filtering. |
| 14: role-aware Pulse | Implemented | Role-specific summary, permitted tasks/reviews, optional sections/order/default reset, source-derived checklist; existing Owner financial dashboard retained. |
| 15: records | Qualified | Invoice register query/status/sort/pagination and selected export; mobile semantic cards; linked record overview/payments/related/activity sections. Existing module-specific detail views remain authoritative; no universal rewrite of every legacy list. |
| 16: bulk operations | Implemented | Selected document JSON export; task Select Visible/Clear/confirmed completion with successful/skipped/failed outcomes. No bulk financial posting. |
| 17: My Tasks | Implemented | Title, description, due date, priority, role assignment, source link, open/done, creation/completion timestamps, scoped search/notifications/Pulse. Local only. |
| 18–19: Help/checklist | Implemented | Searchable seven-category Help, professional accounting explanations, optional derived checklist and layout controls. No mandatory walkthrough or language switch. |
| 20: Reports Centre | Qualified | Permission-aware categories, selected dates/query, source-period explanations, exact-current-row PDF/CSV/print and preserved original XLSX/detailed exports. Specialized legacy reports keep their original controls. |
| 21: activity | Implemented | Record-linked actual audit events, actor, timestamp, before/after details and related source links. Calculated overdue state is labelled separately; not tamper-proof. |
| 22–23: freshness and explanations | Implemented | Current/outdated scenario input comparison, explicit recalculation-as-new, Understand/Calculate/Verify balances, source ledger links, period/method/assumptions and missing-data limitations. |
| 24: Insights Centre | Implemented | Overview, Cash Flow, Business Drivers, Scenario Lab, contextual Pulse link and deterministic source values. No invented confidence or causal/predictive accuracy. |
| 25: Assistant | Implemented | Header panel/full workspace, shared session context scoped by business/role, supported local queries, source references, unsupported-query explanation, no autonomous financial actions. |
| 26–27: functional 3D | Implemented / Preserved | Existing R3F scene, actual posted-document business graph, customer/supplier/cash/risk presets, split source selection, keyboard/table/2D fallback, quality and reduced-motion behavior. Risk preset does not invent extra fraud rules. |
| 28: scenarios | Implemented | Named immutable result snapshots, assumptions/input reference, rename/duplicate/delete, multiple comparison chart/table, JSON export, stale labels and explicit new recalculation. No postings. |
| 29: backup/restore | Qualified | Versioned selected-business JSON, count integrity metadata, schema/arithmetic/reference checks, preview, conflict explanation and explicit restore-as-separate with new IDs. Destructive replace/merge is deliberately unavailable. Unencrypted, not authenticated. |
| 30: Recovery | Implemented / Preserved | Visible storage/validation failures, original invalid-ledger export, explicit verified workspace recovery, no blind financial retry; imported workspace archive survives a second-store error. No cross-device disaster recovery. |
| 31–32: settings/accessibility | Qualified | Preferences hub, profile edit, fixed role templates, data/help links, motion/contrast/chart/presentation settings, native dialogs, semantic labels, focus styles and touch navigation. No independent WCAG certification or universal assistive-device audit. |
| 33: adaptive performance | Qualified | Lazy 3D/PDF, capability-based DPR/manual override, off-screen pause, reduced-motion precedence. No measured FPS feedback controller or invented benchmark claims. |
| 34–37: workflows/integrity/QA | Implemented | Existing and added unit/integration/browser suites; source posting, payment, payroll, returns, reconciliation, forecasts, restore, role privacy, responsive and routing checks. Exact final outcomes in test report. |
| 38–39: phased implementation/Pages | Implemented / pending final evidence | Existing base/hash/static artifact pipeline preserved; no force push. Final live deployment status is in the deployment report. |
| 40–42: documentation/delivery | Implemented | Ten Saakh 4 reports, preserved older docs, README/changelog additions and exact file/test/deployment evidence. Remaining boundaries are disclosed rather than labelled complete production capabilities. |

## Remaining product boundaries

This upgrade does not add real authentication, a backend database, cloud sync, bank/UPI integrations, tax filing, statutory payroll certification, automated lending decisions, live messaging or encrypted remote backups. Existing Saakh 3 accounting/payroll/Indic-PDF limitations continue to apply. Cross-tab financial concurrency, universal autosave across all legacy forms, every legacy view's scroll restoration, destructive backup replacement and FPS-driven quality adaptation are outside the verified behavior.
