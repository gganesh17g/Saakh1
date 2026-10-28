import {
  type BusinessState,
  type Context,
  type ForecastAssumptions,
  type ForecastRun,
  authorize,
  today,
  plusDays,
  rupees,
} from "./model";
import { payrollOutstanding } from "./operations3";
import { balances, due, financials, cashDelta } from "./accounting";
function predict(values: number[], method: string) {
  if (!values.length) return 0;
  if (method === "Moving average")
    return (
      values.slice(-7).reduce((a, b) => a + b, 0) / Math.min(7, values.length)
    );
  if (method === "Exponential smoothing")
    return values.reduce((v, x) => 0.3 * x + 0.7 * v, values[0]);
  const n = values.length,
    x = (n - 1) / 2,
    y = values.reduce((a, b) => a + b, 0) / n;
  const den = values.reduce((v, _, i) => v + (i - x) ** 2, 0);
  const slope = den
    ? values.reduce((v, a, i) => v + (i - x) * (a - y), 0) / den
    : 0;
  return Math.max(0, y + slope * (n - x));
}
export const methods = [
  "Moving average",
  "Linear trend",
  "Exponential smoothing",
];
export function backtest(values: number[]) {
  return methods.map((method) => {
    const errors: number[] = [],
      actuals: number[] = [];
    for (
      let origin = Math.max(14, values.length - 14);
      origin < values.length;
      origin++
    ) {
      errors.push(
        Math.abs(predict(values.slice(0, origin), method) - values[origin]),
      );
      actuals.push(Math.abs(values[origin]));
    }
    return {
      method,
      mae: errors.length
        ? Math.round(errors.reduce((a, b) => a + b, 0) / errors.length)
        : 0,
      wape:
        actuals.reduce((a, b) => a + b, 0) > 0
          ? errors.reduce((a, b) => a + b, 0) /
            actuals.reduce((a, b) => a + b, 0)
          : null,
    };
  });
}
export const defaultAssumptions: ForecastAssumptions = {
  collectionDelay: 7,
  salesChange: 0,
  costChange: 0,
  deliveryDelay: 0,
  monthlyDebt: 0,
  taxPayment: 0,
  minimumBuffer: 500000,
};
export function forecastBusiness(
  s: BusinessState,
  c: Context,
  horizon = 30,
  scenario: "Base" | "Downside" = "Base",
  assumptions = defaultAssumptions,
  asOf = today(),
): ForecastRun {
  authorize(s, c, "read");
  if (![30, 60, 90].includes(horizon))
    throw new Error("Forecast horizon must be 30, 60 or 90 days");
  if (
    Object.values(assumptions).some((v) => !Number.isFinite(v)) ||
    assumptions.collectionDelay < 0 ||
    assumptions.collectionDelay > 180 ||
    assumptions.salesChange < -0.9 ||
    assumptions.salesChange > 1 ||
    assumptions.costChange < -0.5 ||
    assumptions.costChange > 2 ||
    assumptions.deliveryDelay < 0 ||
    assumptions.monthlyDebt < 0 ||
    assumptions.taxPayment < 0 ||
    assumptions.minimumBuffer < 0
  )
    throw new Error("Invalid forecast assumptions");
  const journals = s.journals.filter(
    (j) => j.businessId === c.businessId && j.date <= asOf,
  );
  const first = journals.map((j) => j.date).sort()[0] || asOf;
  const daysHistory = Math.min(
    90,
    Math.floor((Date.parse(asOf) - Date.parse(first)) / 86400000) + 1,
  );
  const sales = Array.from({ length: daysHistory }, (_, i) => {
    const date = plusDays(asOf, i - daysHistory + 1);
    return journals
      .filter(
        (j) => j.date === date && ["cashSale", "Cash sale"].includes(j.kind),
      )
      .reduce((v, j) => v + Math.max(0, cashDelta(j)), 0);
  });
  const expenses = Array.from({ length: daysHistory }, (_, i) => {
    const date = plusDays(asOf, i - daysHistory + 1);
    return journals
      .filter((j) => j.date === date && j.kind === "Operating expense")
      .reduce((v, j) => v + Math.max(0, -cashDelta(j)), 0);
  });
  const metrics = backtest(sales),
    method =
      sales.length >= 28
        ? [...metrics].sort((a, b) => a.mae - b.mae)[0].method
        : "Moving average";
  const dailySales = Math.round(predict(sales, method)),
    dailyExpense = Math.round(predict(expenses, "Moving average"));
  const adjustment =
    scenario === "Downside"
      ? {
          delay: assumptions.collectionDelay + 14,
          sales: Math.max(-0.9, assumptions.salesChange - 0.2),
          cost: assumptions.costChange + 0.15,
          delivery: assumptions.deliveryDelay + 7,
        }
      : {
          delay: assumptions.collectionDelay,
          sales: assumptions.salesChange,
          cost: assumptions.costChange,
          delivery: assumptions.deliveryDelay,
        };
  let cash = financials(s, c.businessId, asOf).cash;
  const documents = s.documents.filter(
    (d) =>
      d.businessId === c.businessId && d.status === "Posted" && due(s, d) > 0,
  );
  const out = Array.from({ length: horizon }, (_, i) => {
    const date = plusDays(asOf, i + 1),
      opening = cash;
    const collections = documents
      .filter(
        (d) =>
          d.kind === "sale" &&
          plusDays(
            d.dueDate < asOf ? asOf : d.dueDate,
            Math.max(1, adjustment.delay),
          ) === date,
      )
      .reduce((v, d) => v + due(s, d), 0);
    const suppliers = documents
      .filter(
        (d) =>
          d.kind !== "sale" &&
          plusDays(
            d.dueDate <= asOf ? asOf : d.dueDate,
            Math.max(1, adjustment.delivery),
          ) === date,
      )
      .reduce((v, d) => v + Math.round(due(s, d) * (1 + adjustment.cost)), 0);
    const cashSales = Math.max(
        0,
        Math.round(dailySales * (1 + adjustment.sales)),
      ),
      expense = Math.round(dailyExpense * (1 + adjustment.cost)),
      debt = (i + 1) % 30 === 0 ? Math.round(assumptions.monthlyDebt) : 0,
      tax = i === 14 ? Math.round(assumptions.taxPayment) : 0,
      salaryDue = s.payrollRuns
        .filter(
          (r) =>
            r.businessId === c.businessId &&
            r.journalId &&
            r.status !== "Reversed" &&
            (r.paymentDate <= asOf ? plusDays(asOf, 1) : r.paymentDate) ===
              date,
        )
        .reduce(
          (a, r) =>
            a +
            r.lines.reduce(
              (a, l) => a + payrollOutstanding(s, r.id, l.employeeId),
              0,
            ),
          0,
        ),
      expectedReturns = s.returns.filter(
        (r) =>
          r.businessId === c.businessId &&
          !r.disputed &&
          r.expectedDate &&
          r.preference === "Refund" &&
          r.creditBalance > 0 &&
          !["Reversed", "Rejected"].includes(r.status) &&
          (r.expectedDate <= asOf ? plusDays(asOf, 1) : r.expectedDate) ===
            date,
      ),
      refundIn = expectedReturns
        .filter((r) => r.kind === "purchase")
        .reduce((a, r) => a + r.creditBalance, 0),
      refundOut = expectedReturns
        .filter((r) => r.kind === "sale")
        .reduce((a, r) => a + r.creditBalance, 0),
      inflows = collections + cashSales + refundIn,
      outflows = suppliers + expense + debt + tax + salaryDue + refundOut;
    cash += inflows - outflows;
    return {
      date,
      opening,
      collections,
      cashSales,
      suppliers,
      expenses: expense + salaryDue + refundOut,
      debt,
      tax,
      inflows,
      outflows,
      closing: cash,
      gap: Math.max(0, assumptions.minimumBuffer - cash),
    };
  });
  return {
    id: `FCT-${s.sequence + 1}-${horizon}-${scenario}`,
    businessId: c.businessId,
    asOf,
    generatedAt: new Date().toISOString(),
    horizon,
    scenario,
    method,
    assumptions: { ...assumptions },
    days: out,
    warnings: [
      sales.length < 28
        ? "Insufficient history for method selection; seven-day baseline only."
        : "Method chosen by rolling-origin one-step validation on up to 14 historical days; no held-out deployment accuracy claim.",
      "No reliable seasonality estimate: fewer than two annual cycles.",
      "Unrecorded days inside the observed fixture span are treated as zero; omitted transactions can bias estimates.",
      "Finalized unpaid payroll is scheduled once on its payment date. Refund forecasts require an explicit expected date; uncommitted credits are excluded. Payroll/remittance cash is not re-extrapolated as operating expenses.",
      "All receipts, supplier timing and cost changes are assumptions; no supplier consent is implied.",
    ],
    metrics: sales.length >= 28 ? metrics : [],
    inputJournalIds: journals.map((j) => j.id),
  };
}
export function ageing(s: BusinessState, id: string, asOf = today()) {
  return s.documents
    .filter((d) => d.businessId === id && d.kind === "sale" && due(s, d) > 0)
    .map((d) => {
      const days = Math.max(
        0,
        Math.floor((Date.parse(asOf) - Date.parse(d.dueDate)) / 86400000),
      );
      return {
        document: d,
        amount: due(s, d),
        days,
        bucket:
          d.dueDate >= asOf
            ? "Not due"
            : days <= 30
              ? "1–30 days"
              : days <= 60
                ? "31–60 days"
                : "Over 60 days",
      };
    });
}
export function loanSchedule(v: {
  principal: number;
  annualRate: number;
  months: number;
  fees: number;
  type: "reducing" | "flat";
  frequency: "monthly" | "weekly" | "daily";
  start: string;
}) {
  if (
    !Number.isSafeInteger(v.principal) ||
    v.principal <= 0 ||
    !Number.isFinite(v.annualRate) ||
    v.annualRate < 0 ||
    v.annualRate > 100 ||
    !Number.isInteger(v.months) ||
    v.months < 1 ||
    v.months > 120 ||
    !Number.isSafeInteger(v.fees) ||
    v.fees < 0 ||
    isNaN(Date.parse(v.start))
  )
    throw new Error("Invalid indicative financing inputs");
  const periodsPerYear =
    v.frequency === "monthly" ? 12 : v.frequency === "weekly" ? 52 : 365;
  const count =
    v.frequency === "monthly"
      ? v.months
      : Math.max(1, Math.round((v.months / 12) * periodsPerYear));
  const rate = v.annualRate / 100 / periodsPerYear;
  const payment =
    v.type === "flat"
      ? (v.principal +
          Math.round((((v.principal * v.annualRate) / 100) * v.months) / 12)) /
        count
      : rate === 0
        ? v.principal / count
        : (v.principal * rate) / (1 - (1 + rate) ** -count);
  let balance = v.principal;
  let allocatedInterest = 0;
  const flatTotal = Math.round(
    (((v.principal * v.annualRate) / 100) * v.months) / 12,
  );
  const rows = Array.from({ length: count }, (_, i) => {
    const interest =
      v.type === "flat"
        ? i === count - 1
          ? flatTotal - allocatedInterest
          : Math.round(flatTotal / count)
        : Math.round(balance * rate);
    allocatedInterest += interest;
    const principal =
      i === count - 1
        ? balance
        : Math.min(balance, Math.max(0, Math.round(payment) - interest));
    balance -= principal;
    let date: string;
    if (v.frequency === "monthly") {
      const start = new Date(v.start + "T00:00:00Z"),
        day = start.getUTCDate(),
        year = start.getUTCFullYear(),
        month = start.getUTCMonth() + i + 1;
      const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      date = new Date(Date.UTC(year, month, Math.min(day, last)))
        .toISOString()
        .slice(0, 10);
    } else
      date = plusDays(v.start, (i + 1) * (v.frequency === "weekly" ? 7 : 1));
    return {
      period: i + 1,
      date,
      principal,
      interest,
      payment: principal + interest,
      balance,
    };
  });
  const totalInterest = rows.reduce((v, r) => v + r.interest, 0),
    repayments = rows.reduce((v, r) => v + r.payment, 0);
  return {
    rows,
    totalInterest,
    totalRepayment: repayments + v.fees,
    fees: v.fees,
    periodsPerYear,
    convention: `${v.type} rate; ${periodsPerYear} equal periods/year; ${count} payments. Fees paid upfront. Fixed-length daily/weekly year convention; monthly dates use calendar anniversaries with month-end clamping. No holiday adjustment or regulatory APR is claimed.`,
  };
}
export function reconciliation(s: BusinessState, id: string) {
  const book = balances(s, id).bank,
    rows = s.statements.filter((r) => r.businessId === id),
    statement =
      (s.statementOpening[id] || 0) + rows.reduce((v, r) => v + r.amount, 0);
  return {
    book,
    statement,
    difference: statement - book,
    unmatched: rows.filter((r) => r.status !== "Matched"),
  };
}
export function answer(s: BusinessState, c: Context, q: string) {
  authorize(s, c, "read");
  const lower = q.toLowerCase(),
    date = today(),
    f = financials(s, c.businessId);
  if (
    /post|pay|record|delete|send|cancel/.test(lower) &&
    !/payment.*due|payments.*due/.test(lower)
  )
    return {
      text: "No transaction was posted. Use the relevant validated form; review amount, party, date and direction, then explicitly confirm. Reminder drafts do not send messages.",
      sources: [],
      estimate: false,
    };
  if (/owe|overdue|dues|collection/.test(lower)) {
    const list = ageing(s, c.businessId).filter(
      (x) => !lower.includes("overdue") || x.days > 0,
    );
    return {
      text: `As of ${date}, ${list.length} posted invoices have ${rupees(list.reduce((v, x) => v + x.amount, 0))} outstanding. ${list.map((x) => `${x.document.number}: ${rupees(x.amount)}, due ${x.document.dueDate}`).join("; ") || "No outstanding invoices."}`,
      sources: list.map((x) => x.document.id),
      estimate: false,
    };
  }
  if (/supplier|bill/.test(lower)) {
    const docs = s.documents.filter(
      (d) =>
        d.businessId === c.businessId && d.kind !== "sale" && due(s, d) > 0,
    );
    return {
      text: `Supplier payables are ${rupees(f.payables)} as of ${date}. ${docs.map((d) => `${d.number}: ${rupees(due(s, d))}, due ${d.dueDate}`).join("; ")}`,
      sources: docs.map((d) => d.id),
      estimate: false,
    };
  }
  if (/bank|balance.*different|reconcil/.test(lower)) {
    const r = reconciliation(s, c.businessId);
    return {
      text: `As of ${date}, book bank balance is ${rupees(r.book)}, imported statement balance is ${rupees(r.statement)}, difference ${rupees(r.difference)}. ${r.unmatched.length} statement rows need review. Matching existing entries never posts revenue again. Statement coverage may differ from the book period.`,
      sources: r.unmatched.map((r) => r.id),
      estimate: false,
    };
  }
  if (/forecast|next month|cash.*look/.test(lower)) {
    const r = forecastBusiness(s, c, 30);
    return {
      text: `Estimate generated ${r.generatedAt}: ${r.method} Base scenario closing cash ${rupees(r.days.at(-1)!.closing)} after 30 days, from opening ${rupees(f.cash)}. This assumes recorded collections, supplier timing, and a historical cash-sales baseline. ${r.warnings[0]}`,
      sources: r.inputJournalIds.slice(-6),
      estimate: true,
    };
  }
  if (/financ|loan|scenario/.test(lower))
    return {
      text: `As of ${date}, cash is ${rupees(f.cash)} and overdue invoices total ${rupees(
        ageing(s, c.businessId)
          .filter((x) => x.days > 0)
          .reduce((v, x) => v + x.amount, 0),
      )}. Compare rate type, fees, payment dates and total repayment in Loans & Working Capital. All cards are SAMPLE — NOT A REAL OFFER; no approval or submission occurs.`,
      sources: ageing(s, c.businessId).map((x) => x.document.id),
      estimate: true,
    };
  return {
    text: `As of ${date}, cash is ${rupees(f.cash)}, receivables ${rupees(f.receivables)} and payables ${rupees(f.payables)}. Ask who owes money, which bills are due, why bank differs, or next-month cash. Answers use deterministic local queries, not trained AI.`,
    sources: s.journals
      .filter((j) => j.businessId === c.businessId)
      .slice(-4)
      .map((j) => j.id),
    estimate: false,
  };
}
