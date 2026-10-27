import {
  schema,
  type Borrower,
  type Sources,
  type Graph,
  type Alert,
  type Run,
  type Factor,
} from "../domain/model";
export const VERSION = "saakh-1.2.0/formulas-1";
const clamp = (v: number) => Math.max(0, Math.min(100, v));
export function graphFor(b: Borrower): Graph {
  return {
    nodes: [
      { id: b.id, name: b.name, kind: "borrower" },
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `${b.id}-n${i}`,
        name:
          i < 3
            ? ["Metro Foods", "Sahyadri Mart", "Urban Basket"][i]
            : ["Grain Collective", "Packwell", "Fresh Logistics"][i - 3],
        kind: i < 3 ? ("buyer" as const) : ("supplier" as const),
      })),
    ],
    edges: Array.from({ length: 6 }, (_, i) => ({
      id: `${b.id}-tx${i}`,
      from: i < 3 ? `${b.id}-n${i}` : b.id,
      to: i < 3 ? b.id : `${b.id}-n${i}`,
      amount:
        (i < 3 ? b.revenue : b.expenses) *
        (i % 3 === 0 ? b.concentration : (1 - b.concentration) / 2),
      invoice: `${b.id}-inv${i}`,
      paid: 0.95,
    })),
  };
}
export function detect(g: Graph): Alert[] {
  const a: Alert[] = [];
  const add = (rule: string, edges: typeof g.edges, detail: string) =>
    a.push({
      id: `A${a.length + 1}`,
      rule,
      detail,
      evidence: edges.map((e) => e.id),
    });
  const seen = new Set<string>();
  for (const e of g.edges) {
    if (seen.has(e.invoice))
      add(
        "Duplicate invoices",
        [e],
        `Invoice ${e.invoice} appears more than once`,
      );
    seen.add(e.invoice);
    const reciprocal = g.edges.find((x) => x.from === e.to && x.to === e.from);
    if (reciprocal && e.id < reciprocal.id)
      add(
        "Reciprocal transactions",
        [e, reciprocal],
        "Opposing flows require commercial context",
      );
    if (e.paid < 0.5)
      add("Evidence mismatch", [e], "Recorded settlement below 50% of invoice");
  }
  for (const e of g.edges) {
    const second = g.edges.find((x) => x.from === e.to && x.to !== e.from);
    const third =
      second && g.edges.find((x) => x.from === second.to && x.to === e.from);
    if (second && third && !a.some((x) => x.rule === "Circular invoicing"))
      add(
        "Circular invoicing",
        [e, second, third],
        "Three linked invoices return to their origin",
      );
  }
  const incoming = g.edges.filter(
    (e) => g.nodes.find((n) => n.id === e.to)?.kind === "borrower",
  );
  const total = incoming.reduce((s, e) => s + e.amount, 0);
  for (const e of incoming)
    if (e.amount / total > 0.65)
      add(
        "Counterparty concentration",
        [e],
        `${Math.round((e.amount / total) * 100)}% of buyer receipts`,
      );
  const similar = g.edges.filter((e, i) =>
    g.edges.some(
      (x, j) =>
        j < i && Math.abs(x.amount - e.amount) < Math.max(1, e.amount * 0.005),
    ),
  );
  if (similar.length > 2)
    add(
      "Invoice-value similarity",
      similar,
      "More than two invoice values within 0.5%",
    );
  if (g.edges.length > 15)
    add(
      "Abnormal transaction volume",
      g.edges,
      "More than 15 transactions in this fixture period",
    );
  if (
    a.filter((x) =>
      ["Circular invoicing", "Reciprocal transactions"].includes(x.rule),
    ).length > 1
  )
    add(
      "Suspicious network cluster",
      g.edges,
      "Overlapping reciprocal and circular patterns",
    );
  return a;
}
export function score(b: Borrower, s: Sources) {
  const mean = b.history.reduce((a, v) => a + v, 0) / (b.history.length || 1);
  const cv = mean
    ? Math.sqrt(
        b.history.reduce((a, v) => a + (v - mean) ** 2, 0) / b.history.length,
      ) / mean
    : 1;
  const completeness = (Object.values(s).filter(Boolean).length / 6) * 100;
  const factors: Factor[] = [
    {
      name: "Cash-flow stability",
      value: clamp(100 - cv * 250 - b.delay * 0.6),
      weight: 0.25,
      available: s.bank && s.history && b.history.length >= 6,
      formula: "clamp(100 − revenue CV × 250 − delay days × 0.6)",
      inputs: `CV ${cv.toFixed(3)} · delay ${b.delay} days`,
    },
    {
      name: "Repayment capacity",
      value: clamp(
        ((b.revenue * (1 + b.shock) - b.expenses) / (b.debt || 1)) * 35,
      ),
      weight: 0.25,
      available: s.bank,
      formula: "clamp((adjusted revenue − expenses) / max(debt, 1) × 35)",
      inputs: `Revenue ${b.revenue * (1 + b.shock)}; expenses ${b.expenses}; debt ${b.debt}`,
    },
    {
      name: "Business continuity",
      value: clamp(b.age * 12.5),
      weight: 0.15,
      available: true,
      formula: "clamp(business age × 12.5)",
      inputs: `${b.age} years`,
    },
    {
      name: "Counterparty diversity",
      value: clamp((1 - b.concentration) * 120),
      weight: 0.1,
      available: s.network,
      formula: "clamp((1 − largest buyer share) × 120)",
      inputs: `Largest share ${b.concentration * 100}%`,
    },
    {
      name: "Revenue consistency",
      value: clamp(100 - cv * 300 + Math.min(0, b.shock) * 100),
      weight: 0.15,
      available: s.history && b.history.length >= 6,
      formula: "clamp(100 − CV × 300 + min(0, shock) × 100)",
      inputs: `${b.history.length} months; shock ${b.shock}`,
    },
    {
      name: "Data completeness",
      value: completeness,
      weight: 0.1,
      available: true,
      formula: "available source toggles / 6 × 100",
      inputs: `${Object.values(s).filter(Boolean).length} of 6 context sources`,
    },
  ];
  const confidence = Math.round(
    factors.reduce((v, f) => v + (f.available ? f.weight : 0), 0) * 100,
  );
  return {
    factors,
    confidence,
    score:
      confidence < 60
        ? null
        : Math.round(
            factors.reduce(
              (v, f) => v + (f.available ? f.value * f.weight : 0),
              0,
            ) * 10,
          ),
  };
}
export function forecast(b: Borrower, horizon = 12) {
  let cash = b.cash;
  const amp = {
    Agriculture: 0.3,
    "Food Processing": 0.12,
    Textiles: 0.22,
    Manufacturing: 0.08,
    Retail: 0.2,
    Services: 0.06,
  }[b.sector];
  return Array.from({ length: horizon }, (_, i) => {
    const revenue =
      b.revenue * (1 + b.shock) * (1 + amp * Math.sin(((i + 1) * Math.PI) / 6));
    const expenses = b.expenses * (1 + (b.inflation * (i + 1)) / 12);
    cash += revenue * (1 - b.delay / 180) - expenses - b.debt;
    return {
      month: `M${i + 1}`,
      revenue,
      expenses,
      cash,
      low: cash - revenue * 0.15 * (i + 1),
      high: cash + revenue * 0.15 * (i + 1),
    };
  });
}
export function cashflow(b: Borrower) {
  let cash = b.cash;
  return Array.from({ length: 30 }, (_, i) => {
    const opening = cash;
    const receipts =
      (i + 1) % 5 === 0
        ? (b.revenue * (1 + b.shock) * (1 - b.delay / 180)) / 6
        : 0;
    const payments = b.expenses / 30 + ((i + 1) % 10 === 0 ? b.debt / 3 : 0);
    cash += receipts - payments;
    return { day: i + 1, opening, receipts, payments, closing: cash };
  });
}
export const scenarios = [
  "Circular Invoicing",
  "Duplicate Invoices",
  "Revenue Inflation",
  "Buyer Concentration",
  "Seasonal Shock",
  "Receivables Delay",
];
export function scenario(b: Borrower, name: string) {
  const x = structuredClone(b);
  if (name === "Revenue Inflation") x.revenue *= 1.6;
  if (name === "Buyer Concentration") x.concentration = 0.9;
  if (name === "Seasonal Shock") x.shock = -0.35;
  if (name === "Receivables Delay") x.delay = 90;
  return x;
}
export function simulate(
  b: Borrower,
  s: Sources,
  attack = "",
  timestamp = new Date().toISOString(),
): Run {
  schema.parse(b);
  const graph = graphFor(b);
  if (attack === "Circular Invoicing") {
    const ids = graph.nodes.map((n) => n.id);
    graph.edges.push(
      {
        id: "loop-1",
        from: ids[0],
        to: ids[1],
        amount: 50000,
        invoice: "loop-i1",
        paid: 1,
      },
      {
        id: "loop-2",
        from: ids[1],
        to: ids[2],
        amount: 51000,
        invoice: "loop-i2",
        paid: 1,
      },
      {
        id: "loop-3",
        from: ids[2],
        to: ids[0],
        amount: 52000,
        invoice: "loop-i3",
        paid: 1,
      },
    );
  }
  if (attack === "Duplicate Invoices")
    graph.edges.push({ ...graph.edges[0], id: "duplicate-tx" });
  if (attack === "Revenue Inflation") graph.edges[0].paid = 0.2;
  const result = score(b, s),
    f = forecast(b),
    days = cashflow(b);
  const alerts = s.network && s.invoices ? detect(graph) : [];
  const min = Math.min(...days.map((d) => d.closing));
  const recommendations = [
    {
      title:
        min < 0 ? "Close the working-capital gap" : "Preserve liquidity buffer",
      trigger: `Minimum 30-day cash ₹${Math.round(min)}`,
      action:
        min < 0
          ? "Review collection dates and negotiate supplier timing with an analyst."
          : "Maintain reserves and monitor receipts weekly.",
      limitation: "Synthetic payment cadence; actual due dates may differ.",
    },
    {
      title:
        b.delay > 30
          ? "Prioritize overdue receivables"
          : "Review receivables ageing",
      trigger: `Collection assumption ${b.delay} days`,
      action: "Confirm invoice acceptance and follow up on oldest balances.",
      limitation:
        "No actual customer contact or collection instruction is performed.",
    },
  ];
  const raw = JSON.stringify({ b, s, attack, version: VERSION });
  let hash = 2166136261;
  for (const c of raw) hash = Math.imul(hash ^ c.charCodeAt(0), 16777619);
  return {
    scenario: attack,
    id: `SK-${(hash >>> 0).toString(16).toUpperCase()}`,
    version: VERSION,
    timestamp,
    borrower: structuredClone(b),
    sources: { ...s },
    ...result,
    graph,
    alerts,
    forecast: f,
    days,
    classification:
      !s.history || b.history.length < 6
        ? "Insufficient Data"
        : b.shock < -0.25
          ? "Emerging Business Deterioration"
          : b.delay > 45 || min < 0
            ? "Temporary Cash-Flow Stress"
            : "Expected Seasonality",
    recommendations,
    audit: [
      "Inputs validated",
      "Source snapshot captured",
      "Weighted factors calculated",
      "Trade rules evaluated",
      "Seasonal assumptions projected",
      "Daily cash ledger calculated",
      "Recommendations linked to metrics",
      "Completed result persisted locally",
    ],
  };
}
export function impact(
  book: number,
  volume: number,
  cost: number,
  review: number,
  reduction: number,
  loss: number,
  platform: number,
) {
  if (
    [book, volume, cost, review, reduction, loss, platform].some(
      (x) => !Number.isFinite(x) || x < 0,
    ) ||
    [review, reduction, loss].some((x) => x > 1)
  )
    throw new RangeError(
      "Impact assumptions must be finite nonnegative numbers; shares must be 0–1",
    );
  const baseline = volume * cost;
  const projected = baseline * (1 - review * reduction);
  const savings = baseline - projected;
  const avoided = book * loss;
  const gross = savings + avoided;
  return {
    baseline,
    projected,
    savings,
    avoided,
    gross,
    net: gross - platform,
    ratio: platform > 0 ? gross / platform : null,
    payback: gross > 0 ? (platform / gross) * 12 : null,
  };
}
