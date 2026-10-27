import { type Borrower, type Sources } from "../domain/model";
import {
  type BusinessState,
  type Context,
  authorize,
  today,
  plusDays,
} from "./model";
import { financials, health } from "./accounting";
export function creditBridge(
  s: BusinessState,
  c: Context,
  assumptions: {
    age: number;
    monthlyDebt: number;
    requestedLoan: number;
    term: number;
  },
): {
  borrower: Borrower;
  sources: Sources;
  evidence: string[];
  limitations: string[];
} {
  authorize(s, c, "read");
  const b = s.businesses.find((b) => b.id === c.businessId)!,
    f = financials(s, c.businessId);
  const journals = s.journals.filter(
    (j) =>
      j.businessId === c.businessId &&
      j.date > plusDays(today(), -30) &&
      j.date <= today(),
  );
  const revenue =
    -journals
      .flatMap((j) => j.lines)
      .filter((l) => l.account === "revenue")
      .reduce((v, l) => v + l.debit - l.credit, 0) / 100;
  const expenses =
    journals
      .flatMap((j) => j.lines)
      .filter((l) =>
        ["costOfSales", "expense", "depreciation"].includes(l.account),
      )
      .reduce((v, l) => v + l.debit - l.credit, 0) / 100;
  const history = Object.entries(
    s.journals
      .filter((j) => j.businessId === c.businessId && j.date <= today())
      .reduce(
        (all, j) => {
          const k = j.date.slice(0, 7);
          all[k] =
            (all[k] || 0) -
            j.lines
              .filter((l) => l.account === "revenue")
              .reduce((v, l) => v + l.debit - l.credit, 0) /
              100;
          return all;
        },
        {} as Record<string, number>,
      ),
  )
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)
    .filter((v) => v > 0);
  if (revenue <= 0 || f.cash < 0 || expenses < 0)
    throw new Error(
      "Bridge requires positive recorded trailing revenue, nonnegative expenses and cash. Review ledger before simulating.",
    );
  return {
    borrower: {
      id: "ledger-" + b.id,
      name: b.name,
      city: b.location,
      sector: b.type === "Services" ? "Services" : "Retail",
      age: assumptions.age,
      revenue,
      expenses,
      debt: assumptions.monthlyDebt,
      loan: assumptions.requestedLoan,
      term: assumptions.term,
      cash: f.cash / 100,
      delay: 7,
      concentration: 1 / 3,
      shock: 0,
      inflation: 0.04,
      history,
    },
    sources: {
      bank: true,
      invoices: s.documents.some(
        (d) => d.businessId === c.businessId && d.status === "Posted",
      ),
      aa: false,
      uli: false,
      network: false,
      history: health(s, c.businessId).historyMonths >= 6,
    },
    evidence: journals.map((j) => j.id),
    limitations: [
      "Amounts use recorded trailing-30-day accrual activity, not independently verified financials.",
      "Age, monthly debt, requested loan and term are explicit user assumptions. Receivables delay 7 days, equal counterparties and 4% inflation are illustrative.",
      "The existing credit graph is a separate synthetic illustration; network availability is off. Partial calendar months are not normalized.",
    ],
  };
}
