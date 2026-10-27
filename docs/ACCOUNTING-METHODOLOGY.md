# Accounting methodology — business-ledger-1

Reviewed 27 October 2026. This describes the local demonstration, not statutory, audited or GST-compliant accounts. The original credit methodology remains in FINANCIAL-METHODOLOGY.md.

## Units, validation and transaction boundary

Amounts are integer paise; INR input is rounded once with Math.round(amount × 100). Per line: gross = round(quantity × unit price); discount = round(gross × discount%); net = gross − discount; tax = round(net × tax%). Document total is the sum of line net and tax. Quantities may be fractional. Every journal line has one positive debit or credit, every journal balances exactly, dates must be valid, within the selected April–March FY and not future actuals. Positive document totals and quantities, party type, duplicate document numbers, selected-business references and optimistic document versions are checked.

The store clones the entire local ledger, runs the operation and invariants, persists one IndexedDB value, then publishes the new state. Failure or quota rejection leaves the prior visible ledger untouched. This is a single-browser snapshot transaction, not a distributed transaction or safe concurrent multi-tab editing. Pure services mutate their supplied draft; callers must use the store transaction boundary.

## Journal rules

| Event | Debit | Credit | Cash effect |
|---|---|---|---|
| Confirmed opening bank balance | Bank | Owner capital | Increase |
| Credit sale | Receivable incl tax, cost of sales | Revenue net, output GST, inventory | None |
| Cash invoice | Bank, cost of sales | Revenue, output GST, inventory | Increase |
| Invoice collection | Cash/bank | Receivable | Increase, no repeated revenue |
| Stock bill | Inventory at standard cost; expense price variance; input GST | Payable; favourable variance credits expense | None |
| Expense/equipment bill | Expense/equipment and illustrative input GST | Payable | None |
| Supplier payment | Payable | Cash/bank | Decrease, no repeated expense |
| Loan received | Cash/bank | Loan principal liability | Increase, no revenue |
| Loan repayment | Loan principal, interest, charges separately | Cash/bank | Decrease; principal excluded from profit expense |
| Owner funds/drawings | Bank/drawings | Capital/bank | Separate from trading profit |
| Depreciation | Depreciation expense | Accumulated depreciation | None; capped at equipment carrying value |
| Own-account transfer | Destination cash account | Source cash account | Combined cash unchanged |

Inventory uses fixed standard cost on each product. Opening stock credits capital. Purchases at a different net price recognize the price variance in expense. This is neither weighted-average costing nor tax inventory valuation. Overselling/over-returning stock is blocked. Untracked service cash-sales fixtures do not consume grain stock.

## Corrections, credits and refunds

Drafts have no ledger effect. Posted corrections require confirmation, the current version and no prior payment/credit. Original journals and stock movements are reversed, then a new version posts. Cancellation retains source and audit. Paid documents require credits/refunds rather than destructive edits. Corrections restate the original date; this prototype has no period lock or filed-return adjustment workflow.

Returns allocate across all original lines proportionally to document value; they are not item-selective return authorizations. Credit up to the remaining unpaid balance reduces receivable/payable. Any excess is a confirmed bank refund, not a negative outstanding. Outstanding = original total − collections/payments − credits + refunded credit portion. Cumulative net allocation limits repeated-rounding drift. Tax and cost reversal need professional review for unusual fractional/multiple returns. No payment gateway or money transfer is invoked.

## Financial statements and data health

Balances sum posted journal debits less credits. Cash = cash account + bank account. Revenue is the negative revenue balance. Profit = revenue − cost of sales − expense − interest − fees − depreciation. Assets include cash, receivables, standard-cost stock, input GST and equipment less accumulated depreciation. Liabilities include payables, output GST and loan principal. Equity = contributed capital − drawings + profit. Assets − liabilities − equity must equal zero. GST figures are recorded arithmetic, not ITC eligibility or confirmed tax liability.

Reconciliation compares book bank independently with statement opening + signed imported rows. Accepting one or multiple existing journals changes match status, never repeats revenue. Exact signed sums and no reused match are required. Recording a genuinely missing movement creates and matches one journal. Collection against an existing invoice must use that invoice’s payment form; categorizing it as a new sale would misstate revenue.

## Forecasts

30/60/90 daily periods: closing = opening + collections + cash sales − suppliers − operating costs − debt − tax. Buffer gap = max(0, configured buffer − closing). Existing AR/AP schedules are separate from the historical direct-cash-sales baseline. The latest up-to-90 recorded-day span feeds seven-day moving average, linear trend and exponential smoothing (alpha 0.3). With 28+ days, up to 14 rolling origins compare one-step absolute errors using earlier training dates only. Lowest MAE selects the baseline; WAPE is undefined when actuals sum to zero. The selected one-step cash-sales level repeats across the future horizon. No seasonal fit or probabilistic confidence interval is claimed. This is not multi-step extrapolated regression.

Downside adds 14 collection days, −20% cash sales, +15% costs and seven supplier-delay days to editable assumptions. Supplier timing requires agreement; inflation on outstanding bills is a scenario assumption, not an accounting change. Missing dates in the observed span count as zero, which can bias the result. Monthly debt repeats every 30 days and tax is a one-time day-15 assumption. Saved snapshots retain inputs, method, dates, metrics and journal IDs. Actual comparison is only available after the forecast end, based on then-recorded ledger entries.

## Indicative financing

Reducing payment = P×r/[1−(1+r)^−n], or P/n at zero rate; r = annual stated rate / 12, 52 or 365. Flat interest = round(P×annual rate×months/12), allocated across periods with a final rounding adjustment. Weekly/daily n = round(months/12×52 or 365); monthly n = months. Principal residual settles in the final period. Monthly due dates use calendar anniversaries with month-end clamping; weekly dates add seven days and daily dates one day. Upfront fees add to total repayment, not principal. No holiday adjustment, penal charge, APR certification or actual product convention is implied. All cards say SAMPLE — NOT A REAL OFFER.

## Ledger-to-credit bridge

Explicit age, debt payment, request amount and term combine with trailing-30-day recorded accrual revenue/operating costs and current cash. The original four credit engines remain unchanged. Network availability is off and the credit graph remains a separate synthetic illustration. Fewer than six recorded calendar months disables the history availability input. The bridge is not an independent data verification or bank connection. Business audit and credit-run persistence use separate local keys and are not one cross-store atomic transaction.
