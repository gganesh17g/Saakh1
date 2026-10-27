import { describe, it, expect } from "vitest";
import { profiles } from "../fixtures/borrowers";
import { schema, defaultSources } from "../domain/model";
import {
  simulate,
  score,
  forecast,
  cashflow,
  graphFor,
  detect,
  scenario,
  scenarios,
  impact,
} from "./index";
import { csv } from "../utils/export";
const b = profiles[0],
  s = defaultSources;
describe("Saakh scoring", () => {
  it("honors weighted factors and bounds for every profile", () => {
    for (const b of profiles) {
      const r = score(b, s);
      expect(r.factors.reduce((a, f) => a + f.weight, 0)).toBeCloseTo(1);
      expect(r.score).toBe(
        Math.round(
          r.factors.reduce(
            (a, f) => a + (f.available ? f.value * f.weight : 0),
            0,
          ) * 10,
        ),
      );
      expect(r.score).toBeGreaterThanOrEqual(0);
      expect(r.score).toBeLessThanOrEqual(1000);
    }
  });
  it("improves or holds when debt falls", () =>
    expect(score({ ...b, debt: b.debt / 2 }, s).score!).toBeGreaterThanOrEqual(
      score(b, s).score!,
    ));
  it("reduces score with collection delay", () =>
    expect(score({ ...b, delay: 90 }, s).score!).toBeLessThan(
      score(b, s).score!,
    ));
  it("does not invent score with insufficient evidence", () => {
    const r = score(b, {
      bank: false,
      history: false,
      invoices: false,
      network: false,
      aa: false,
      uli: false,
    });
    expect(r.score).toBeNull();
    expect(r.confidence).toBe(25);
  });
  it("handles zero debt", () =>
    expect(score({ ...b, debt: 0 }, s).score).not.toBeNaN());
});
describe("Forecast and daily cash", () => {
  it("is deterministic across sectors and horizons", () => {
    for (const b of profiles) {
      expect(forecast(b)).toEqual(forecast(b));
      expect(forecast(b, 6)).toHaveLength(6);
    }
  });
  it("balances each daily ledger and monthly totals", () => {
    const days = cashflow(b);
    expect(days).toHaveLength(30);
    days.forEach((d, i) => {
      expect(d.closing).toBeCloseTo(d.opening + d.receipts - d.payments);
      if (i) expect(d.opening).toBe(days[i - 1].closing);
    });
    expect(days.reduce((a, d) => a + d.payments, 0)).toBeCloseTo(
      b.expenses + b.debt,
    );
    expect(days[29].closing).toBeCloseTo(
      b.cash + b.revenue * (1 - b.delay / 180) - b.expenses - b.debt,
    );
  });
  it("distinguishes seasonality, stress, deterioration and missing history", () => {
    expect(simulate(b, s).classification).toBe("Expected Seasonality");
    expect(simulate({ ...b, delay: 90 }, s).classification).toBe(
      "Temporary Cash-Flow Stress",
    );
    expect(simulate({ ...b, shock: -0.35 }, s).classification).toBe(
      "Emerging Business Deterioration",
    );
    expect(simulate(b, { ...s, history: false }).classification).toBe(
      "Insufficient Data",
    );
  });
});
describe("Trade-Graph Shield", () => {
  it("has stable identifiers and no baseline flags", () => {
    expect(graphFor(b)).toEqual(graphFor(b));
    expect(detect(graphFor(b))).toEqual([]);
  });
  it("detects reciprocal, similar value, abnormal volume and cluster signals", () => {
    const g = graphFor(b);
    const first = g.edges[0];
    g.edges.push({
      ...first,
      id: "reciprocal",
      from: first.to,
      to: first.from,
      invoice: "other",
    });
    for (let i = 0; i < 12; i++)
      g.edges.push({ ...first, id: `extra${i}`, invoice: `e${i}` });
    const rules = detect(g).map((a) => a.rule);
    expect(rules).toContain("Reciprocal transactions");
    expect(rules).toContain("Invoice-value similarity");
    expect(rules).toContain("Abnormal transaction volume");
  });
});
describe("All six Attack Lab scenarios", () => {
  for (const name of scenarios)
    it(name, () => {
      const r = simulate(scenario(b, name), s, name);
      const base = simulate(b, s);
      if (name === "Circular Invoicing")
        expect(r.alerts.some((a) => a.rule === "Circular invoicing")).toBe(
          true,
        );
      if (name === "Duplicate Invoices")
        expect(r.alerts.some((a) => a.rule === "Duplicate invoices")).toBe(
          true,
        );
      if (name === "Revenue Inflation")
        expect(r.alerts.some((a) => a.rule === "Evidence mismatch")).toBe(true);
      if (name === "Buyer Concentration")
        expect(
          r.alerts.some((a) => a.rule === "Counterparty concentration"),
        ).toBe(true);
      if (name === "Seasonal Shock") {
        expect(r.forecast[0].revenue).toBeLessThan(base.forecast[0].revenue);
        expect(r.score!).toBeLessThan(base.score!);
      }
      if (name === "Receivables Delay")
        expect(r.days[29].closing).toBeLessThan(base.days[29].closing);
      expect(
        r.alerts.every((a) =>
          a.evidence.every((id) => r.graph.edges.some((e) => e.id === id)),
        ),
      ).toBe(true);
    });
});
describe("Pipeline, validation and exports", () => {
  it("reproduces ID and snapshots without mutation", () => {
    const first = simulate(b, s);
    const second = simulate(b, s);
    expect(first.id).toBe(second.id);
    expect(first.audit).toHaveLength(8);
    expect(first.borrower).not.toBe(b);
    expect(simulate({ ...b, delay: 30 }, s).id).not.toBe(first.id);
  });
  it("validates invalid fields and periods", () => {
    for (const x of [
      { revenue: -1 },
      { term: 0 },
      { delay: 181 },
      { concentration: 2 },
      { shock: -1 },
      { name: "" },
    ])
      expect(schema.safeParse({ ...b, ...x }).success).toBe(false);
  });
  it("exports computed cash and version metadata", () => {
    const r = simulate(b, s);
    const data = csv(r);
    expect(data).toContain(r.id);
    expect(data).toContain(r.version);
    expect(data).toContain(String(r.days[29].closing));
    expect(JSON.parse(JSON.stringify(r)).borrower).toEqual(b);
  });
});
describe("Lender impact economics", () => {
  it("avoids double counting", () => {
    const r = impact(5e9, 12000, 2500, 0.6, 0.5, 0.001, 2e6);
    expect(r.baseline).toBe(30e6);
    expect(r.projected).toBe(21e6);
    expect(r.savings).toBe(9e6);
    expect(r.avoided).toBe(5e6);
    expect(r.gross).toBe(14e6);
    expect(r.net).toBe(12e6);
    expect(r.ratio).toBe(7);
    expect(r.payback).toBeCloseTo(12 / 7);
  });
  it("handles zero denominators", () => {
    const r = impact(0, 0, 0, 0, 0, 0, 0);
    expect(r.ratio).toBeNull();
    expect(r.payback).toBeNull();
  });
});

it("keeps largest counterparty share consistent with the three-buyer fixture", () => {
  expect(schema.safeParse({ ...b, concentration: 0.2 }).success).toBe(false);
  for (const concentration of [1 / 3, 0.35, 0.9, 1]) {
    const graph = graphFor({ ...b, concentration });
    const receipts = graph.edges.filter((e) => e.to === b.id);
    expect(receipts.reduce((sum, e) => sum + e.amount, 0)).toBeCloseTo(
      b.revenue,
    );
    expect(Math.max(...receipts.map((e) => e.amount)) / b.revenue).toBeCloseTo(
      concentration,
    );
  }
});
