import { creditBridge } from "./creditBridge";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { seedBusiness } from "./fixtures";
import { contextFor, validateBusinessState } from "./store";
import {
  type BusinessState,
  type DocumentInput,
  journalSchema,
  dateSchema,
  today,
  plusDays,
  emptyState,
} from "./model";
import {
  financials,
  saveDocument,
  settle,
  totals,
  due,
  quantity,
  cancelDocument,
  creditReturn,
  manual,
  balances,
} from "./accounting";
import {
  forecastBusiness,
  backtest,
  defaultAssumptions,
  loanSchedule,
  reconciliation,
  answer,
} from "./analytics";
import {
  reconcile,
  suggestMatches,
  recordStatementRow,
  onboard,
  addRFQ,
  addQuote,
  quoteTotal,
  saveConsent,
  revokeConsent,
} from "./operations";
import {
  csvRows,
  importStatement,
  csvCell,
  sampleXLSX,
  xlsxRows,
} from "./imports";
import { integrationAdapter } from "./integrations";
let s: BusinessState;
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-27T12:00:00Z"));
  s = seedBusiness();
});
const input = (kind: DocumentInput["kind"] = "sale"): DocumentInput => ({
  kind,
  partyId: kind === "sale" ? "P-C1" : "P-S1",
  number: "TEST-1",
  issueDate: today(),
  dueDate: plusDays(today(), 30),
  cashSale: false,
  lines: [
    {
      description: "Service",
      quantity: 2,
      price: 100000,
      discount: 10,
      tax: 18,
    },
  ],
});
describe("double-entry accounting", () => {
  it("seed journals balance and balance sheet reconciles", () => {
    s.journals.forEach((j) =>
      expect(journalSchema.safeParse(j).success).toBe(true),
    );
    const f = financials(s, s.activeBusiness);
    expect(f.assets - f.liabilities - f.equity).toBe(0);
    expect(quantity(s, "SKU-001")).toBe(27);
  });
  it("calculates line discount before rounded tax in integer paise", () =>
    expect(totals(input().lines)).toEqual({
      net: 180000,
      tax: 32400,
      discount: 20000,
      total: 212400,
    }));
  it("credit invoice creates receivable and revenue, no cash", () => {
    const c = contextFor(s),
      before = financials(s, c.businessId);
    saveDocument(s, c, input(), true, true);
    const after = financials(s, c.businessId);
    expect(after.cash).toBe(before.cash);
    expect(after.receivables - before.receivables).toBe(212400);
    expect(after.revenue - before.revenue).toBe(180000);
  });
  it("draft has no ledger effect; posting version creates one entry", () => {
    const c = contextFor(s),
      n = s.journals.length,
      d = saveDocument(s, c, input(), false, false);
    expect(s.journals.length).toBe(n);
    saveDocument(s, c, d, true, true, d.id, d.version);
    expect(s.journals.length).toBe(n + 1);
  });
  it("partial collection reduces receivable without second revenue", () => {
    const c = contextFor(s),
      d = saveDocument(s, c, input(), true, true),
      before = financials(s, c.businessId);
    settle(s, c, d.id, 100000, today(), "bank", true);
    const f = financials(s, c.businessId);
    expect(f.revenue).toBe(before.revenue);
    expect(f.cash - before.cash).toBe(100000);
    expect(due(s, d)).toBe(112400);
  });
  it("overpayment, unconfirmed payment and pre-invoice payment rejected", () => {
    const c = contextFor(s),
      d = saveDocument(s, c, input(), true, true);
    expect(() => settle(s, c, d.id, 999999, today(), "bank", true)).toThrow(
      /exceed/,
    );
    expect(() => settle(s, c, d.id, 100, today(), "bank", false)).toThrow(
      /Confirm/,
    );
    expect(() =>
      settle(s, c, d.id, 100, plusDays(today(), -1), "bank", true),
    ).toThrow(/precede/);
  });
  it("supplier bill creates payable, payment no second expense", () => {
    const c = contextFor(s),
      d = saveDocument(s, c, input("expense"), true, true),
      before = financials(s, c.businessId);
    settle(s, c, d.id, 50000, today(), "bank", true);
    const f = financials(s, c.businessId);
    expect(f.operatingExpenses).toBe(before.operatingExpenses);
    expect(f.payables).toBe(before.payables - 50000);
  });
  it("stock purchase at different price books standard cost and variance", () => {
    const c = contextFor(s),
      v = input("purchase");
    v.lines = [
      {
        itemId: "SKU-001",
        description: "bags",
        quantity: 2,
        price: 45000,
        discount: 0,
        tax: 5,
      },
    ];
    const f = financials(s, c.businessId);
    saveDocument(s, c, v, true, true);
    const a = financials(s, c.businessId);
    expect(a.balances.inventory - f.balances.inventory).toBe(80000);
    expect(a.balances.expense - f.balances.expense).toBe(10000);
    expect(quantity(s, "SKU-001")).toBe(29);
  });
  it("posted corrections reverse journals and correct stock once per version", () => {
    const c = contextFor(s),
      v = input();
    v.lines = [
      {
        itemId: "SKU-001",
        description: "bags",
        quantity: 2,
        price: 65000,
        discount: 0,
        tax: 0,
      },
    ];
    const d = saveDocument(s, c, v, true, true);
    expect(quantity(s, "SKU-001")).toBe(25);
    saveDocument(
      s,
      c,
      { ...v, lines: [{ ...v.lines[0], quantity: 3 }] },
      true,
      true,
      d.id,
      d.version,
    );
    expect(quantity(s, "SKU-001")).toBe(24);
    saveDocument(
      s,
      c,
      { ...v, lines: [{ ...v.lines[0], quantity: 1 }] },
      true,
      true,
      d.id,
      d.version,
    );
    expect(quantity(s, "SKU-001")).toBe(26);
    cancelDocument(s, c, d.id, true);
    expect(quantity(s, "SKU-001")).toBe(27);
    expect(
      financials(s, c.businessId).assets -
        financials(s, c.businessId).liabilities -
        financials(s, c.businessId).equity,
    ).toBe(0);
  });
  it("rejects stale version, duplicate numbers and negative stock", () => {
    const c = contextFor(s),
      d = saveDocument(s, c, input(), true, true);
    expect(() => saveDocument(s, c, input(), true, true, d.id, 99)).toThrow(
      /changed/,
    );
    expect(() => saveDocument(s, c, input(), true, true)).toThrow(/Duplicate/);
    const clean = seedBusiness(),
      v = input();
    v.lines = [
      {
        itemId: "SKU-001",
        description: "too many",
        quantity: 999,
        price: 65000,
        discount: 0,
        tax: 0,
      },
    ];
    expect(() => saveDocument(clean, contextFor(clean), v, true, true)).toThrow(
      /stock/,
    );
  });
  it("proportional credit reverses revenue/tax and outstanding", () => {
    const c = contextFor(s),
      d = saveDocument(s, c, input(), true, true),
      before = financials(s, c.businessId);
    creditReturn(s, c, d.id, 106200, today(), true);
    const f = financials(s, c.businessId);
    expect(f.revenue).toBe(before.revenue - 90000);
    expect(due(s, d)).toBe(106200);
    expect(f.assets - f.liabilities - f.equity).toBe(0);
  });
  it("loan principal, interest, fees and transfer have distinct effects", () => {
    const c = contextFor(s),
      before = financials(s, c.businessId);
    manual(s, c, {
      kind: "Loan disbursement",
      amount: 1000000,
      date: today(),
      memo: "synthetic loan",
      account: "bank",
      confirmed: true,
    });
    manual(s, c, {
      kind: "Loan repayment",
      amount: 115000,
      principal: 100000,
      interest: 10000,
      fees: 5000,
      date: today(),
      memo: "repayment",
      account: "bank",
      confirmed: true,
    });
    let f = financials(s, c.businessId);
    expect(f.loan).toBe(900000);
    expect(f.profit - before.profit).toBe(-15000);
    const cash = f.cash;
    manual(s, c, {
      kind: "Transfer",
      amount: 50000,
      date: today(),
      memo: "bank to cash",
      account: "bank",
      confirmed: true,
    });
    f = financials(s, c.businessId);
    expect(f.cash).toBe(cash);
  });
  it("depreciation is noncash and limited to carrying value", () => {
    const c = contextFor(s);
    saveDocument(s, c, input("equipment"), true, true);
    const f = financials(s, c.businessId);
    manual(s, c, {
      kind: "Depreciation",
      amount: 10000,
      date: today(),
      memo: "equipment depreciation",
      account: "bank",
      confirmed: true,
    });
    expect(financials(s, c.businessId).cash).toBe(f.cash);
    expect(financials(s, c.businessId).profit).toBe(f.profit - 10000);
    expect(() =>
      manual(s, c, {
        kind: "Depreciation",
        amount: 9999999,
        date: today(),
        memo: "too much",
        account: "bank",
        confirmed: true,
      }),
    ).toThrow(/carrying/);
  });
  it("cash invoice records payment without outstanding", () => {
    const c = contextFor(s),
      v = { ...input(), cashSale: true },
      f = financials(s, c.businessId),
      d = saveDocument(s, c, v, true, true);
    expect(due(s, d)).toBe(0);
    expect(financials(s, c.businessId).cash - f.cash).toBe(
      totals(v.lines).total,
    );
  });
  it("demo staff cannot post; foreign records rejected", () => {
    const c = contextFor(s);
    expect(() =>
      saveDocument(s, { ...c, role: "staff" }, input(), true, true),
    ).toThrow(/allow post/);
    expect(() =>
      saveDocument(s, { ...c, businessId: "other" }, input(), false, false),
    ).toThrow(/outside/);
  });
  it("calendar and journal validation reject malformed money and dates", () => {
    expect(dateSchema.safeParse("2026-02-30").success).toBe(false);
    expect(
      journalSchema.safeParse({
        ...s.journals[0],
        lines: [
          { account: "cash", debit: 100, credit: 0 },
          { account: "revenue", debit: 0, credit: 99 },
        ],
      }).success,
    ).toBe(false);
    expect(() =>
      validateBusinessState({ ...s, version: 999 } as unknown as BusinessState),
    ).toThrow(/format/);
  });
  it("onboarding needs confirmed source and separate opening capital", () => {
    const draft = emptyState(),
      business = { ...s.businesses[0], id: "new" };
    expect(() => onboard(draft, business, false)).toThrow(/confirm/);
    onboard(draft, business, true);
    expect(balances(draft, "new").bank).toBe(business.openingCash);
    expect(draft.journals.length).toBe(1);
  });
});
describe("forecasts and financing", () => {
  it.each([30, 60, 90])(
    "reproducible %i-day forecast has continuous arithmetic",
    (h) => {
      const c = contextFor(s),
        a = forecastBusiness(s, c, h),
        b = forecastBusiness(s, c, h);
      expect(a).toEqual(b);
      expect(a.days).toHaveLength(h);
      a.days.forEach((d, i) => {
        expect(d.closing).toBe(d.opening + d.inflows - d.outflows);
        if (i) expect(d.opening).toBe(a.days[i - 1].closing);
      });
      expect(a.inputJournalIds).toHaveLength(s.journals.length);
    },
  );
  it("downside reduces closing cash with same source state", () =>
    expect(
      forecastBusiness(s, contextFor(s), 30, "Downside").days.at(-1)!.closing,
    ).toBeLessThan(forecastBusiness(s, contextFor(s)).days.at(-1)!.closing));
  it("zero actuals produce undefined WAPE; insufficient history honest", () => {
    expect(backtest(Array(30).fill(0)).every((m) => m.wape === null)).toBe(
      true,
    );
    s.journals = [];
    s.documents = [];
    const r = forecastBusiness(s, contextFor(s));
    expect(r.metrics).toEqual([]);
    expect(r.warnings[0]).toMatch(/Insufficient/);
  });
  it("invalid assumptions and horizons rejected", () => {
    expect(() => forecastBusiness(s, contextFor(s), 40)).toThrow(/horizon/);
    expect(() =>
      forecastBusiness(s, contextFor(s), 30, "Base", {
        ...defaultAssumptions,
        salesChange: -2,
      }),
    ).toThrow(/assumptions/);
  });
  it.each(["monthly", "weekly", "daily"] as const)(
    "flat %s schedule preserves exact principal and interest",
    (frequency) => {
      const r = loanSchedule({
        principal: 10000003,
        annualRate: 13.7,
        months: 7,
        fees: 12500,
        type: "flat",
        frequency,
        start: "2026-01-31",
      });
      expect(r.rows.reduce((v, r) => v + r.principal, 0)).toBe(10000003);
      expect(r.totalInterest).toBe(Math.round((10000003 * 0.137 * 7) / 12));
      expect(r.rows.at(-1)!.balance).toBe(0);
      expect(r.totalRepayment).toBe(10000003 + r.totalInterest + 12500);
    },
  );
  it("reducing zero-rate schedule and month-end dates correct", () => {
    const r = loanSchedule({
      principal: 1000000,
      annualRate: 0,
      months: 3,
      fees: 0,
      type: "reducing",
      frequency: "monthly",
      start: "2026-01-31",
    });
    expect(r.rows[0].date).toBe("2026-02-28");
    expect(r.totalRepayment).toBe(1000000);
  });
});
describe("reconciliation, trade, consent and exports", () => {
  it("match and rejection never change ledger balances", () => {
    const c = contextFor(s),
      before = financials(s, c.businessId),
      row = s.statements[0],
      j = suggestMatches(s, c, row.id).find((j) => j.kind === "collection")!;
    reconcile(s, c, row.id, [j.id]);
    expect(row.status).toBe("Matched");
    expect(financials(s, c.businessId)).toEqual(before);
    reconcile(s, c, row.id, [], true);
    expect(row.status).toBe("Rejected");
  });
  it("rejects mismatching amounts and journal reuse", () => {
    const c = contextFor(s),
      row = s.statements[0],
      j = suggestMatches(s, c, row.id).find((j) => j.kind === "collection")!;
    expect(() => reconcile(s, c, row.id, [s.journals[0].id])).toThrow(/equal/);
    reconcile(s, c, row.id, [j.id]);
    s.statements.push({ ...row, id: "copy", status: "Unmatched" });
    expect(() => reconcile(s, c, "copy", [j.id])).toThrow(/already/);
  });
  it("categorization adds one journal and matched statement without duplicate income", () => {
    const c = contextFor(s),
      n = s.journals.length,
      rev = financials(s, c.businessId).revenue;
    recordStatementRow(s, c, "BANK-002", "Owner capital", true);
    expect(s.journals.length).toBe(n + 1);
    expect(s.statements[1].status).toBe("Matched");
    expect(financials(s, c.businessId).revenue).toBe(rev);
    expect(reconciliation(s, c.businessId).difference).toBe(0);
  });
  it("quoted CSV parsed, exact duplicates skipped, no automatic journal", () => {
    const rows = csvRows(
        'date,narration,amount\r\n2026-10-27,"demo, receipt",750.00\r\n',
      ),
      n = s.journals.length;
    const c = contextFor(s);
    expect(importStatement(s, c, rows, "test.csv").added).toBe(1);
    expect(importStatement(s, c, rows, "test.csv").duplicates).toBe(1);
    expect(s.journals.length).toBe(n);
    expect(() => csvRows('"broken')).toThrow(/Unclosed/);
    expect(csvCell("=SUM(A1)")).toBe('"\'=SUM(A1)"');
  });
  it("malformed CSV amounts cannot silently become zero", () =>
    expect(() =>
      importStatement(
        s,
        contextFor(s),
        csvRows("date,narration,amount\n2026-10-27,test,abc"),
        "bad",
      ),
    ).toThrow(/finite/));
  it("RFQ quotations compare delivered amount with tax", () => {
    const c = contextFor(s),
      r = addRFQ(s, c, {
        product: "Synthetic bags",
        quantity: 10,
        location: "Pune",
        deliveryDate: plusDays(today(), 5),
        specification: "demo",
        budget: 1000000,
        terms: "net30",
      }),
      q = addQuote(s, c, {
        rfqId: r.id,
        supplierId: "P-S1",
        unitPrice: 40000,
        freight: 10000,
        tax: 5,
        leadDays: 3,
        validUntil: plusDays(today(), 3),
        terms: "demo terms",
      });
    expect(quoteTotal(s, q.id)).toBe(430500);
  });
  it("consent records purpose and revocation but adapters never connect", async () => {
    const c = contextFor(s),
      x = saveConsent(s, c, {
        purpose: "Demo cash visibility",
        scope: "Demo invoices",
        recipient: "Demo analyst",
        expiresAt: plusDays(today(), 3),
      });
    revokeConsent(s, c, x.id);
    expect(x.revokedAt).toBeDefined();
    expect(
      (
        await integrationAdapter("Account Aggregator").request({
          businessId: c.businessId,
          purpose: "demo",
          consentId: x.id,
        })
      ).ok,
    ).toBe(false);
  });
  it("assistant answers have local evidence and refuses language-based posting", () => {
    const c = contextFor(s),
      n = s.journals.length;
    expect(answer(s, c, "Who owes money?").sources.length).toBeGreaterThan(0);
    expect(answer(s, c, "Post a payment").text).toMatch(/No transaction/);
    expect(s.journals.length).toBe(n);
  });
});

describe("spreadsheet sample", () => {
  it("round-trips valid XLSX sample through local parser", () => {
    const rows = xlsxRows(sampleXLSX());
    expect(rows[0]).toEqual(["date", "narration", "amount"]);
    expect(rows).toHaveLength(3);
    expect(importStatement(s, contextFor(s), rows, "sample.xlsx").added).toBe(
      2,
    );
  });
});

describe("confirmed refunds", () => {
  it("cash-sale return refunds bank and reverses inventory/COGS without negative outstanding", () => {
    const c = contextFor(s),
      v = input();
    v.cashSale = true;
    v.lines = [
      {
        itemId: "SKU-001",
        description: "bag",
        quantity: 2,
        price: 65000,
        discount: 0,
        tax: 5,
      },
    ];
    const before = financials(s, c.businessId),
      d = saveDocument(s, c, v, true, true);
    creditReturn(s, c, d.id, totals(v.lines).total, today(), true);
    expect(due(s, d)).toBe(0);
    expect(financials(s, c.businessId)).toEqual(before);
    expect(quantity(s, "SKU-001")).toBe(27);
    expect(validateBusinessState(s)).toBe(s);
  });
});

describe("stock reversal safeguards", () => {
  it("does not cancel consumed stock purchases", () => {
    const c = contextFor(s),
      v = input("purchase");
    v.lines = [
      {
        itemId: "SKU-001",
        description: "bag",
        quantity: 1,
        price: 40000,
        discount: 0,
        tax: 0,
      },
    ];
    const d = saveDocument(s, c, v, true, true);
    s.movements.push({
      id: "consumed",
      businessId: c.businessId,
      itemId: "SKU-001",
      quantity: -28,
      cost: 40000,
      date: today(),
      kind: "Sale",
      sourceId: "synthetic-test",
    });
    expect(() => cancelDocument(s, c, d.id, true)).toThrow(/consumed/);
  });
});

describe("ledger credit bridge", () => {
  it("maps trailing sources without presenting an actual trade graph", () => {
    const bridge = creditBridge(s, contextFor(s), {
      age: 5,
      monthlyDebt: 1000,
      requestedLoan: 100000,
      term: 12,
    });
    expect(bridge.borrower.cash).toBe(
      financials(s, s.activeBusiness).cash / 100,
    );
    expect(bridge.sources.network).toBe(false);
    expect(bridge.sources.history).toBe(false);
    expect(bridge.sources.aa).toBe(false);
    expect(bridge.evidence.length).toBeGreaterThan(0);
    expect(bridge.borrower.revenue).toBeGreaterThan(0);
  });
});
