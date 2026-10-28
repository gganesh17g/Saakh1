# Saakh 4.0 financial integrity

The existing integer-paise double-entry engine remains authoritative. No accounting, payroll or credit-scoring formula was replaced. Invoice issue, payment, return credit/refund, payroll finalization/payment and reversals use their existing confirmed operations and source-state eligibility checks.

- Draft autosave writes no document, journal, payment or approval; it excludes posting mode and confirmation flags. Restored invoice submission tokens preserve existing idempotent issue behavior.
- Tasks, search, notifications, network selection and scenarios never post a journal.
- Return approvals change review state; credit, dispatch and refund remain separate actions. Payroll approval is separate from finalization and payment.
- Scenario calculations call `forecastBusiness` with explicit assumptions and retain result snapshots. Staleness compares relevant saved source snapshots, not a fabricated confidence percentage.
- Period finance reports calculate revenue/expense/profit as end balance minus the day-before-start balance using the same engine. Cash, receivables and payables are labelled period-end balances. Invoice report balances are explicitly current balances for invoices issued within the selected dates.
- Restore revalidates balanced journals, schema compatibility, payment/source references, operations arithmetic, business membership, workspace structure, inventory item references, duplicate identities and collection counts. Source records are copied under a new business; existing balances remain unchanged.

Backups and audit history are not independently authenticated or tamper-proof. Record counts detect truncation, not a malicious editor who rewrites both data and metadata. Tax, payroll and lending limitations from Saakh 3.0 continue to apply; no statutory certification, live transfer or real lending decision is introduced.
