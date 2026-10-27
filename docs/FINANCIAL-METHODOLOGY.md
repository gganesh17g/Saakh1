# Financial methodology · formulas-1

All monetary inputs are INR, monthly unless stated otherwise. Clamping limits normalized values to 0–100. Formula rules are illustrative choices, not calibrated credit methodology.

## Saakh Score

Six factors contribute `normalized value × weight × 10` points. Missing factors contribute zero; weights are never redistributed. Availability confidence is sum of available factor weights × 100, not accuracy. Below 60% confidence the total is null. Illustrative bands: 750+ lower, 550–749 moderate, below 550 higher. No approval threshold exists.

| Factor                         | Weight | Normalization                                                | Required source               |
| ------------------------------ | -----: | ------------------------------------------------------------ | ----------------------------- |
| Cash-flow stability            |    25% | clamp(100 − revenue CV × 250 − receivable delay × .6)        | Bank and history              |
| Repayment capacity             |    25% | clamp((revenue × (1 + shock) − expenses) / max(debt,1) × 35) | Bank                          |
| Business continuity            |    15% | clamp(age × 12.5)                                            | Borrower input                |
| Buyer/supplier diversity proxy |    10% | clamp((1 − largest counterparty share) × 120)                | Network                       |
| Revenue consistency            |    15% | clamp(100 − CV × 300 + min(0,shock) × 100)                   | History, at least six periods |
| Data completeness              |    10% | enabled context sources / six × 100                          | Source snapshot               |

CV = population standard deviation / mean of synthetic historical revenues. AA and ULI are context sources only; their inclusion in completeness is illustrative, not proof of financial evidence. The diversity factor uses one shared largest-counterparty assumption for the synthetic buyers and suppliers.

## Trade-Graph Shield

Stable IDs link node, invoice and transaction evidence. Rules: duplicate invoice identifier; reciprocal opposite-direction flow; length-three directed cycle; >2 repeated values within 0.5%; >15 period transactions; a buyer above 65% of incoming value; settlement below 50%; overlapping reciprocal/cycle patterns as a cluster. Graph rules run only with both network and invoice availability. Absence of alerts with missing evidence does not imply safety. Rules flag review needs, never fraud. These are fixture thresholds, not calibrated population anomaly models.

## Season-or-Slide

12 forward months, UI horizon 6 or 12. Seasonal amplitude by sector: Agriculture .30, Food Processing .12, Textiles .22, Manufacturing .08, Retail .20, Services .06. Revenue(m) = monthly revenue × (1 + shock) × (1 + amplitude × sin(mπ/6)). Expenses(m) = monthly expenses × (1 + inflation × m/12). Cash accumulates revenue × (1 − delay/180), less expenses and debt. Low/high bands = cash ± revenue × .15 × month. Bands are assumption ranges, not confidence intervals.

Classification precedence: missing history or fewer than six periods → Insufficient Data; shock below −25% → Emerging Business Deterioration; collection delay above 45 days or negative minimum daily cash → Temporary Cash-Flow Stress; otherwise Expected Seasonality. A negative shock may be temporary in real life: classification is an illustrative rule, not a causal diagnosis.

## Cash-Flow Coach

30-day ledger starts with borrower cash. Six receipts arrive every fifth day, totaling adjusted monthly revenue × (1 − delay/180). Operating expenses accrue equally each day; debt is paid in thirds every tenth day. Closing = opening + receipts − payments. Next day's opening equals prior closing. Gap = max(0, −minimum daily closing). Debt service capacity = (revenue − expenses)/debt, or no-debt label for zero. Receivables estimate = revenue × delay/30; ageing bucket follows delay. This is a haircut approximation, not a proper receivable waterfall or amortization schedule.

Requested loan and term are validated context fields. No disbursement or new-loan instalment is assumed; debt means existing supplied obligations. Recommendations explain the actual cash/delay trigger, suggested collection/reserve action and synthetic-calendar limitation. Payment priority is a review prompt, not a payment instruction.

## Impact economics

Baseline = annual applications × unit assessment cost. Projected = baseline × (1 − manual review share × processing reduction). Savings = baseline − projected. Avoided loss = loan book × avoidable-loss assumption. Gross = savings + avoided losses. Net = gross − platform cost. BCR = gross/platform cost. Payback months = platform cost/gross × 12. Zero denominators return null. No loan-volume multiplier or duplicate savings benefit is added. Assumes evenly accruing annual benefits. Default ₹500 crore scenario calculates 7×, not a guaranteed 8× claim.
