# Financial integration test evidence

Executed suite: npm test — 121 passed in seven files. The original 75 cases remain (one unsupported-version test now uses version 999 because version 2 is supported). New operations3.test.ts covers 45 financial/customer cases; an additional store recovery case protects failed migration from overwrite. Final browser totals and release status are in SAAKH-3-TEST-REPORT.md.

| Invariant | Executed evidence |
|---|---|
| Every journal balances and balance sheet reconciles | shared balanced() assertion after payroll/returns/refunds/credits/reversals; original accounting suite |
| Finalization differs from cash payment | Payroll expense/liability changes with unchanged cash; salary payment changes only payable/bank; partial liability reconciliation |
| No duplicate source posting | finalized-period and repeat-finalization guards, stable sale token, duplicate payment/settlement/supplier-credit references, invalid repeated return transition |
| Effective history remains reproducible | salary version lock/future version test, attendance-change approval rejection, finalized payslip snapshot accuracy |
| Payroll deductions/advances/remittances are separate | rational gross/net/employer calculations, unpaid leave, advance evidence/recovery, remittance without repeated expense, payment/payroll reversal |
| Customer credit is not cash | paid return creates customerCredit liability; partial refund changes bank only at explicit settlement; allocation to future invoice has no cash |
| Stock eligibility/condition | full/multiple partial return limit; returned sellable units, quarantine unavailable to sale, written-off goods do not restore inventory; repeat reversal blocked |
| Purchase approval differs from dispatch/credit | approval has no physical movement; dispatch creates pending asset; supplier credit adjusts payable or refund receivable; actual receipt changes bank |
| Partial supplier credits reconcile | cumulative net/tax/cost allocation across separate supplier references; final pending asset zero; duplicate reference rejection |
| Returns conserve available credit | received = applied + refunded + available; corrupted persisted credit is rejected |
| Financial reports share source truth | signed customer statement reconciles receivable minus credits; invoice/collection does not double revenue; original P&L/stock/forecast/reconciliation tests preserved |
| Forecast avoids duplicate commitments | only remaining finalized salary scheduled once; credits alone excluded; documented refunds included once; disputed supplier refunds excluded |
| Migration/privacy | additive old-record preservation; unknown business record rejection; staff/manager cannot post payroll; invalid restore blocks writes and offers recovery |
| Actual documents | browser scenarios download real %PDF files with current payroll/invoice/statement contents and export balanced JSON; Unicode typography guard avoids silently corrupted PDF text |

Browser scenarios A–F create employee/payroll/payslip/payment; customer/sale/invoice/partial receipt/return/refund/repeat sale/statement; supplier bill/dispatch/credit/payment; source reports, persistence and Pages refresh. No real financial account or integration is involved.
