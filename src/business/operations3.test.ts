import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { seedBusiness } from "./fixtures";
import { type BusinessState, type Context, today, emptyState } from "./model";
import { contextFor, validateBusinessState } from "./store";
import {
  totals,
  due,
  quantity,
  balances,
  financials,
  saveDocument,
  cancelDocument,
  settle,
} from "./accounting";
import { forecastBusiness } from "./analytics";
import { type Salary, type ReturnLine } from "./operationsModel";
import * as op from "./operations3";
import { payslipDocument, invoiceDocument } from "./documents3";
import { migrateBusinessState } from "./migration";
import { seedOperationsExamples } from "./fixtures3";
let s: BusinessState, c: Context;
const salary: Salary = {
  effective: "2026-10-01",
  basic: 1000000,
  hra: 200000,
  allowance: 100000,
  incentive: 50000,
  bonus: 0,
  arrears: 0,
  reimbursement: 50000,
  overtimeRate: 10000,
  withholding: 20000,
  professionalTax: 10000,
  miscellaneous: 0,
};
function employee() {
  return op.saveEmployee(
    s,
    c,
    {
      name: "Fictional Employee",
      department: "Operations",
      title: "Associate",
      employment: "Full-time",
      joined: "2026-10-01",
      location: "Pune",
      method: "bank",
      reference: "No real account",
      leaveEntitlement: 18,
      notes: "Fictional",
      pf: true,
      esi: true,
    },
    salary,
  );
}
function rule() {
  return op.savePayrollRule(s, c, {
    effective: "2026-10-01",
    label: "Illustrative test fixture",
    source: "Test-only assumptions; not statutory applicability",
    pfEmployeeBps: 1000,
    pfEmployerBps: 1000,
    pfCap: 0,
    esiEmployeeBps: 100,
    esiEmployerBps: 200,
    esiCeiling: 0,
  });
}
function attendance(id: string, unpaid = 0, reviewed = true) {
  return op.saveAttendance(s, c, {
    employeeId: id,
    period: "2026-10",
    working: 26,
    present: 26 - unpaid,
    paidLeave: 0,
    unpaid,
    overtime: 2,
    bonus: 10000,
    advance: 0,
    reviewed,
    notes: "Test evidence",
  });
}
function payroll() {
  const e = employee();
  rule();
  attendance(e.id);
  const r = op.createPayroll(s, c, "2026-10", "2026-10-30");
  op.calculatePayroll(s, c, r.id);
  return { e, r };
}
function sale(cashSale = false, quantity = 4) {
  return op.issueSale(
    s,
    c,
    {
      kind: "sale",
      partyId: "P-C1",
      issueDate: today(),
      dueDate: today(),
      cashSale,
      token: "SALE-" + s.sequence,
      prefix: "TEST",
      lines: [
        {
          itemId: "SKU-001",
          description: "Synthetic bags",
          quantity,
          price: 65000,
          discount: 10,
          tax: 5,
        },
      ],
    },
    true,
  );
}
function purchase() {
  return saveDocument(
    s,
    c,
    {
      kind: "purchase",
      partyId: "P-S1",
      number: "BILL-" + s.sequence,
      issueDate: today(),
      dueDate: today(),
      cashSale: false,
      lines: [
        {
          itemId: "SKU-001",
          description: "Bags",
          quantity: 4,
          price: 40000,
          discount: 0,
          tax: 5,
        },
      ],
    },
    true,
    true,
  );
}
function ret(
  id: string,
  qty = 1,
  disposition: ReturnLine["disposition"] = "Restock",
  index = 0,
) {
  return op.createReturn(s, c, {
    documentId: id,
    date: today(),
    reason: "Defective product",
    condition: "Inspected",
    preference: "Refund",
    notes: "Synthetic evidence",
    evidence: "TEST-INSPECTION",
    lines: [{ index, quantity: qty, disposition }],
  });
}
function credit(id: string, purchase = false) {
  op.transitionReturn(s, c, id, "Submit");
  op.transitionReturn(s, c, id, "Approve", true);
  if (purchase) op.transitionReturn(s, c, id, "Dispatch", true);
  op.transitionReturn(s, c, id, "Credit", true, "SUPPLIER-CN-TEST");
}
function balanced() {
  const f = financials(s, c.businessId);
  expect(f.assets - f.liabilities - f.equity).toBe(0);
  for (const j of s.journals)
    expect(j.lines.reduce((a, l) => a + l.debit - l.credit, 0)).toBe(0);
  validateBusinessState(s);
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-28T10:00:00Z"));
  s = seedBusiness();
  c = contextFor(s);
});
afterEach(() => vi.useRealTimers());
describe("payroll engine and immutable posting", () => {
  it("calculates gross, configured deductions, reimbursement and employer cost exactly", () => {
    const { r } = payroll(),
      l = r.lines[0];
    expect(l.gross).toBe(1380000);
    expect(l.deduction).toBe(143800);
    expect(l.net).toBe(1286200);
    expect(l.employer).toBe(127600);
    expect(l.cost).toBe(1557600);
  });
  it("unpaid leave prorates recurring earnings but keeps bonus separate", () => {
    const e = employee(),
      v = rule(),
      a = attendance(e.id, 13);
    const l = op.calculatePayrollLine(e, a, v);
    expect(l.earnings.Basic).toBe(500000);
    expect(l.earnings.Bonus).toBe(10000);
    expect(l.gross).toBe(705000);
  });
  it("selects historical effective salary and leaves past snapshot reproducible", () => {
    const { e, r } = payroll();
    op.saveEmployee(
      s,
      c,
      e,
      { ...salary, effective: "2026-11-01", basic: 2000000 },
      e.id,
    );
    expect(r.lines[0].salary.basic).toBe(1000000);
    expect(e.salaries).toHaveLength(2);
  });
  it("blocks changing an existing salary version", () => {
    const e = employee();
    expect(() =>
      op.saveEmployee(s, c, e, { ...salary, basic: 999 }, e.id),
    ).toThrow(/effective date/);
  });
  it("blocks unreviewed attendance approval", () => {
    const e = employee();
    rule();
    attendance(e.id, 0, false);
    const r = op.createPayroll(s, c, "2026-10", today());
    op.calculatePayroll(s, c, r.id);
    expect(r.status).toBe("Needs Review");
    expect(() => op.approvePayroll(s, c, r.id)).toThrow(/reviewed/);
  });
  it("blocks approval after attendance changed until recalculated", () => {
    const { e, r } = payroll();
    attendance(e.id, 1);
    expect(() => op.approvePayroll(s, c, r.id)).toThrow(/changed/);
  });
  it("finalization records liability and expense without cash; payment does not repeat expense", () => {
    const { e, r } = payroll();
    const before = financials(s, c.businessId);
    op.approvePayroll(s, c, r.id);
    expect(() => op.finalizePayroll(s, c, r.id, false)).toThrow();
    op.finalizePayroll(s, c, r.id, true);
    const final = financials(s, c.businessId);
    expect(final.cash).toBe(before.cash);
    expect(final.operatingExpenses - before.operatingExpenses).toBe(
      r.lines[0].cost,
    );
    op.paySalary(s, c, r.id, e.id, 100000, today(), "SAL-001");
    const after = financials(s, c.businessId);
    expect(after.cash).toBe(before.cash - 100000);
    expect(after.operatingExpenses).toBe(final.operatingExpenses);
    expect(-after.balances.salaryPayable).toBe(r.lines[0].net - 100000);
    balanced();
  });
  it("prevents duplicate finalization and payroll periods", () => {
    const { r } = payroll();
    op.approvePayroll(s, c, r.id);
    op.finalizePayroll(s, c, r.id, true);
    expect(() => op.finalizePayroll(s, c, r.id, true)).toThrow();
    expect(() => op.createPayroll(s, c, "2026-10", today())).toThrow(/already/);
  });
  it("prevents overpayment and duplicate reference", () => {
    const { e, r } = payroll();
    op.approvePayroll(s, c, r.id);
    op.finalizePayroll(s, c, r.id, true);
    op.paySalary(s, c, r.id, e.id, 100000, today(), "REF1");
    expect(() =>
      op.paySalary(s, c, r.id, e.id, 100000, today(), "REF1"),
    ).toThrow(/already/);
    expect(() =>
      op.paySalary(s, c, r.id, e.id, r.lines[0].net, today(), "REF2"),
    ).toThrow(/exceeds/);
  });
  it("payslip agrees exactly with finalized snapshot and never falsely confirms payment", () => {
    const { e, r } = payroll();
    expect(() => payslipDocument(s, c, r.id, e.id)).toThrow(/finalized/);
    op.approvePayroll(s, c, r.id);
    op.finalizePayroll(s, c, r.id, true);
    const p = payslipDocument(s, c, r.id, e.id);
    expect(p.rows.find(([k]) => k === "Payment status")![1]).toContain(
      "Unpaid",
    );
    expect(p.rows.find(([k]) => k === "Gross")![1]).toContain("13,800");
  });
  it("reverses failed payment then payroll without erasing snapshots", () => {
    const { e, r } = payroll();
    const before = financials(s, c.businessId);
    op.approvePayroll(s, c, r.id);
    op.finalizePayroll(s, c, r.id, true);
    op.paySalary(s, c, r.id, e.id, 100000, today(), "PAY1");
    expect(() => op.reversePayroll(s, c, r.id, "Correction")).toThrow(
      /payments/,
    );
    op.reverseSalaryPayment(
      s,
      c,
      s.salaryPayments.at(-1)!.id,
      "Failed payment",
    );
    op.reversePayroll(s, c, r.id, "Correct payroll");
    expect(r.status).toBe("Reversed");
    expect(op.payrollDashboard(s, c, r.id).paid).toBe(0);
    expect(r.lines).toHaveLength(1);
    expect(financials(s, c.businessId)).toEqual(before);
    balanced();
  });
  it("records advances separately and prevents recovery beyond evidence", () => {
    const e = employee();
    rule();
    const a = attendance(e.id);
    a.advance = 10000;
    const r = op.createPayroll(s, c, "2026-10", today());
    expect(() => op.calculatePayroll(s, c, r.id)).toThrow(/advance/i);
    op.payrollCashEvent(s, c, e.id, 10000, today(), "ADV-1", "advance");
    op.calculatePayroll(s, c, r.id);
    op.approvePayroll(s, c, r.id);
    op.finalizePayroll(s, c, r.id, true);
    expect(balances(s, c.businessId).employeeAdvance).toBe(0);
    balanced();
  });
  it("remittance settles deduction liability without repeating payroll expense", () => {
    const { r } = payroll();
    op.approvePayroll(s, c, r.id);
    op.finalizePayroll(s, c, r.id, true);
    const before = financials(s, c.businessId);
    op.payrollCashEvent(s, c, "", 10000, today(), "REM-1", "remittance");
    expect(financials(s, c.businessId).operatingExpenses).toBe(
      before.operatingExpenses,
    );
    expect(balances(s, c.businessId).deductionPayable).toBe(
      before.balances.deductionPayable + 10000,
    );
    balanced();
  });
  it("payroll is inaccessible for staff; attendance-only manager cannot finalize", () => {
    expect(() =>
      op.saveEmployee(s, { ...c, role: "staff" }, {}, salary),
    ).toThrow(/allow/);
    expect(() =>
      op.createPayroll(s, { ...c, role: "manager" }, "2026-10", today()),
    ).toThrow(/allow/);
  });
  it("forecast schedules only remaining finalized salary once", () => {
    const { e, r } = payroll();
    op.approvePayroll(s, c, r.id);
    op.finalizePayroll(s, c, r.id, true);
    const before = forecastBusiness(s, c);
    op.paySalary(s, c, r.id, e.id, 10000, today(), "PAY1");
    const after = forecastBusiness(s, c);
    expect(before.days[1].expenses - after.days[1].expenses).toBe(10000);
    expect(before.days[0].opening - after.days[0].opening).toBe(10000);
  });
});
describe("quantity returns, inventory, credits and settlement", () => {
  it("sales draft and approval do not post cash or stock", () => {
    const d = sale(),
      n = s.journals.length,
      q = quantity(s, "SKU-001"),
      cash = financials(s, c.businessId).cash;
    const r = ret(d.id);
    op.transitionReturn(s, c, r.id, "Submit");
    op.transitionReturn(s, c, r.id, "Approve", true);
    expect(s.journals).toHaveLength(n);
    expect(quantity(s, "SKU-001")).toBe(q);
    expect(financials(s, c.businessId).cash).toBe(cash);
  });
  it("unpaid return reduces receivable and restores sellable stock/COGS without refund", () => {
    const d = sale(),
      q = quantity(s, "SKU-001"),
      cash = financials(s, c.businessId).cash;
    const r = ret(d.id);
    credit(r.id);
    expect(due(s, d)).toBe(totals(d.lines).total - r.amount);
    expect(r.creditBalance).toBe(0);
    expect(quantity(s, "SKU-001")).toBe(q + 1);
    expect(financials(s, c.businessId).cash).toBe(cash);
    balanced();
  });
  it("paid return creates customer liability; partial refund alone changes cash", () => {
    const d = sale(true),
      cash = financials(s, c.businessId).cash;
    const r = ret(d.id);
    credit(r.id);
    expect(r.creditBalance).toBe(r.amount);
    expect(financials(s, c.businessId).cash).toBe(cash);
    op.settleReturn(s, c, r.id, 10000, today(), "Refund", "REFUND-1");
    expect(r.creditBalance).toBe(r.amount - 10000);
    expect(financials(s, c.businessId).cash).toBe(cash - 10000);
    balanced();
  });
  it("supports multiple partial returns and blocks over-return / duplicate credit", () => {
    const d = sale();
    const r = ret(d.id, 2);
    credit(r.id);
    const r2 = ret(d.id, 2);
    credit(r2.id);
    expect(() => ret(d.id, 1)).toThrow(/eligible/);
    expect(() => op.transitionReturn(s, c, r.id, "Credit", true)).toThrow(
      /transition/,
    );
    expect(due(s, d)).toBe(0);
    balanced();
  });
  it("quarantined goods are not available for resale and hold separate value", () => {
    const d = sale(true),
      q = quantity(s, "SKU-001");
    const r = ret(d.id, 1, "Quarantine");
    credit(r.id);
    expect(quantity(s, "SKU-001")).toBe(q);
    expect(balances(s, c.businessId).quarantineInventory).toBe(40000);
    balanced();
  });
  it("written-off goods do not restore stock or reverse cost of sales", () => {
    const d = sale(true),
      q = quantity(s, "SKU-001"),
      cost = balances(s, c.businessId).costOfSales;
    const r = ret(d.id, 1, "Write off");
    credit(r.id);
    expect(quantity(s, "SKU-001")).toBe(q);
    expect(balances(s, c.businessId).costOfSales).toBe(cost);
    balanced();
  });
  it("refund cannot exceed credit and reversal restores credit and cash", () => {
    const d = sale(true),
      r = ret(d.id);
    credit(r.id);
    expect(() =>
      op.settleReturn(s, c, r.id, r.amount + 1, today(), "Refund", "REF1"),
    ).toThrow(/exceeds/);
    const cash = financials(s, c.businessId).cash;
    const p = op.settleReturn(s, c, r.id, 10000, today(), "Refund", "REF1");
    op.reverseSettlement(s, c, p.id, "Failed refund");
    expect(r.creditBalance).toBe(r.amount);
    expect(financials(s, c.businessId).cash).toBe(cash);
    expect(() => op.reverseSettlement(s, c, p.id, "Again")).toThrow(/Already/);
    balanced();
  });
  it("customer credit allocates to same-customer future invoice without cash", () => {
    const d = sale(true),
      r = ret(d.id);
    credit(r.id);
    const next = sale(),
      cash = financials(s, c.businessId).cash;
    op.settleReturn(
      s,
      c,
      r.id,
      r.amount,
      today(),
      "Allocation",
      "ALLOC-1",
      next.id,
    );
    expect(due(s, next)).toBe(totals(next.lines).total - r.amount);
    expect(r.creditBalance).toBe(0);
    expect(financials(s, c.businessId).cash).toBe(cash);
    balanced();
  });
  it("return reversal preserves evidence and blocks duplicate reversal", () => {
    const d = sale(true),
      before = financials(s, c.businessId),
      q = quantity(s, "SKU-001"),
      r = ret(d.id);
    credit(r.id);
    op.reverseReturn(s, c, r.id, "Incorrect inspected return");
    expect(r.status).toBe("Reversed");
    expect(financials(s, c.businessId)).toEqual(before);
    expect(quantity(s, "SKU-001")).toBe(q);
    expect(() => op.reverseReturn(s, c, r.id, "Again")).toThrow();
    balanced();
  });
  it("supplier approval does not dispatch or change cash; dispatch and credit separate", () => {
    const d = purchase(),
      r = ret(d.id),
      q = quantity(s, "SKU-001"),
      cash = financials(s, c.businessId).cash;
    op.transitionReturn(s, c, r.id, "Submit");
    op.transitionReturn(s, c, r.id, "Approve", true);
    expect(quantity(s, "SKU-001")).toBe(q);
    op.transitionReturn(s, c, r.id, "Dispatch", true);
    expect(quantity(s, "SKU-001")).toBe(q - 1);
    expect(due(s, d)).toBe(totals(d.lines).total);
    expect(balances(s, c.businessId).returnsPending).toBe(40000);
    op.transitionReturn(s, c, r.id, "Credit", true, "SUPPLIER-1");
    expect(due(s, d)).toBe(126000);
    expect(financials(s, c.businessId).cash).toBe(cash);
    balanced();
  });
  it("paid supplier return creates refund receivable; receipt only then increases bank", () => {
    const d = purchase();
    settle(s, c, d.id, totals(d.lines).total, today(), "bank", true);
    const cash = financials(s, c.businessId).cash,
      r = ret(d.id);
    credit(r.id, true);
    expect(r.creditBalance).toBe(42000);
    expect(financials(s, c.businessId).cash).toBe(cash);
    op.settleReturn(s, c, r.id, 20000, today(), "Refund", "SUP-REF1");
    expect(financials(s, c.businessId).cash).toBe(cash + 20000);
    expect(balances(s, c.businessId).supplierCredit).toBe(22000);
    balanced();
  });
  it("supplier credit requires evidence, blocks duplicates and over-return", () => {
    const d = purchase(),
      r = ret(d.id, 4);
    op.transitionReturn(s, c, r.id, "Submit");
    op.transitionReturn(s, c, r.id, "Approve", true);
    op.transitionReturn(s, c, r.id, "Dispatch", true);
    expect(() => op.transitionReturn(s, c, r.id, "Credit", true, "")).toThrow(
      /reference/,
    );
    op.transitionReturn(s, c, r.id, "Credit", true, "SUP-CN");
    expect(() =>
      op.transitionReturn(s, c, r.id, "Credit", true, "SUP-CN"),
    ).toThrow();
    expect(() => ret(d.id, 1)).toThrow(/eligible/);
    balanced();
  });
  it("rejecting a draft releases reserved quantities without posting", () => {
    const d = sale(),
      r = ret(d.id, 4);
    op.transitionReturn(s, c, r.id, "Submit");
    op.transitionReturn(s, c, r.id, "Reject");
    expect(op.returnEligible(s, d.id, 0)).toBe(4);
  });
  it("credits alone do not forecast cash; documented refund does once", () => {
    const d = sale(true),
      r = ret(d.id);
    credit(r.id);
    const a = forecastBusiness(s, c);
    r.expectedDate = "2026-10-29";
    const b = forecastBusiness(s, c);
    expect(b.days[0].outflows - a.days[0].outflows).toBe(r.amount);
  });
});
describe("customer and automatic invoice integration", () => {
  it("creates/edits/archives customer and warns on duplicate without merging", () => {
    const p = op.saveCustomer(s, c, {
      name: "Synthetic Customer",
      location: "Pune",
      termsDays: 10,
      notes: "",
    });
    expect(() =>
      op.saveCustomer(s, c, {
        name: p.name,
        location: "Pune",
        termsDays: 10,
        notes: "",
      }),
    ).toThrow(/duplicate/);
    op.saveCustomer(s, c, { ...p, phone: "12345" }, p.id);
    expect(p.phone).toBe("12345");
    op.archiveCustomer(s, c, p.id);
    expect(p.archived).toBe(true);
  });
  it("atomically issues unique FY numbers and deduplicates submission tokens", () => {
    const input = {
      kind: "sale" as const,
      partyId: "P-C1",
      issueDate: today(),
      dueDate: today(),
      cashSale: false,
      lines: [
        {
          description: "Service",
          quantity: 1,
          price: 100000,
          discount: 10,
          tax: 18,
        },
      ],
      token: "SAME",
    };
    const d = op.issueSale(s, c, input, true),
      n = s.journals.length;
    expect(op.issueSale(s, c, input, true).id).toBe(d.id);
    expect(s.journals).toHaveLength(n);
    const d2 = op.issueSale(s, c, { ...input, token: "NEW" }, true);
    expect(d.number).not.toBe(d2.number);
    expect(d.number).toMatch(/SA\/2026-27\/00001/);
    expect(totals(d.lines).total).toBe(106200);
    balanced();
  });
  it("creates a customer in the same sale and uses saved record on repeat purchase", () => {
    const d = op.issueSale(
      s,
      c,
      {
        kind: "sale",
        customer: {
          name: "New Synthetic Buyer",
          location: "Pune",
          termsDays: 30,
          notes: "",
        },
        issueDate: today(),
        dueDate: today(),
        cashSale: false,
        lines: [
          {
            description: "Service",
            quantity: 1,
            price: 10000,
            discount: 0,
            tax: 0,
          },
        ],
        token: "NEW-CUS",
      },
      true,
    );
    op.issueSale(
      s,
      c,
      {
        kind: "sale",
        partyId: d.partyId,
        issueDate: today(),
        dueDate: today(),
        cashSale: false,
        lines: d.lines,
        token: "REPEAT",
      },
      true,
    );
    expect(op.customerSummary(s, c, d.partyId).orders).toBe(2);
    expect(op.customerStatement(s, c, d.partyId).closing).toBe(20000);
  });
  it("cash and credit sale differ; collection does not repeat revenue", () => {
    const before = financials(s, c.businessId),
      d = sale(false);
    expect(financials(s, c.businessId).cash).toBe(before.cash);
    const rev = financials(s, c.businessId).revenue;
    settle(s, c, d.id, 10000, today(), "bank", true);
    expect(financials(s, c.businessId).revenue).toBe(rev);
    expect(financials(s, c.businessId).cash - before.cash).toBe(10000);
    balanced();
  });
  it("immutable issued numbers; duplicate creates new draft without posting", () => {
    const d = sale(),
      n = s.journals.length;
    expect(() =>
      saveDocument(
        s,
        c,
        { ...d, number: "CHANGED" },
        true,
        true,
        d.id,
        d.version,
      ),
    ).toThrow(/immutable/);
    const copy = op.duplicateInvoice(s, c, d.id);
    expect(copy.status).toBe("Draft");
    expect(copy.number).not.toBe(d.number);
    expect(s.journals).toHaveLength(n);
  });
  it("statement closing reconciles receivable minus customer credit across refunds", () => {
    const d = sale(true),
      r = ret(d.id);
    credit(r.id);
    op.settleReturn(s, c, r.id, 10000, today(), "Refund", "RF1");
    const v = op.customerStatement(s, c, "P-C1");
    const all = s.journals
      .filter(
        (j) =>
          j.sourceId === d.id ||
          j.sourceId === r.id ||
          r.settlementIds.includes(j.sourceId),
      )
      .flatMap((j) => j.lines)
      .filter((l) => ["receivable", "customerCredit"].includes(l.account))
      .reduce((a, l) => a + l.debit - l.credit, 0);
    const other = s.documents
      .filter((x) => x.partyId === "P-C1" && x.id !== d.id)
      .reduce((a, x) => a + due(s, x), 0);
    expect(v.closing).toBe(all + other);
    balanced();
  });
  it("invoice preview contains actual current numbers and is not an IRN", () => {
    const d = sale();
    const p = invoiceDocument(s, c, d.id);
    expect(p.title).toContain(d.number);
    expect(p.rows.find(([k]) => k === "Total")![1]).toContain("2,457");
    expect(p.rows.at(-1)![1]).toContain("not an IRN");
  });
  it("v1 migration preserves all old records and adds empty collections without reset", () => {
    const old = structuredClone(s) as unknown as Record<string, unknown>;
    old.version = 1;
    for (const key of [
      "employees",
      "payrollRules",
      "attendance",
      "payrollRuns",
      "salaryPayments",
      "returns",
      "returnSettlements",
      "invoiceSequences",
      "saleRequests",
    ])
      delete old[key];
    const migrated = migrateBusinessState(old);
    expect(migrated.version).toBe(2);
    expect(migrated.documents).toEqual(s.documents);
    expect(migrated.employees).toEqual([]);
    expect(validateBusinessState(migrated)).toBe(migrated);
    expect((old as { version: number }).version).toBe(1);
    expect(() => migrateBusinessState({ ...old, version: 999 })).toThrow();
  });
  it("connected synthetic examples reconcile and cannot silently reload", () => {
    seedOperationsExamples(s, c);
    expect(s.employees).toHaveLength(3);
    expect(s.returns).toHaveLength(2);
    expect(s.payrollRuns[0].status).toBe("Partially Paid");
    expect(() => seedOperationsExamples(s, c)).toThrow(/already/);
    balanced();
  });
  it("empty v2 state validates and unknown business-scoped records fail", () => {
    expect(validateBusinessState(emptyState()).version).toBe(2);
    const p = employee();
    p.businessId = "UNKNOWN";
    expect(() => validateBusinessState(s)).toThrow(/known business/);
  });
});
it("supplier partial credit receipts allocate expense/tax/stock cumulatively without duplicate credit", () => {
  const d = purchase(),
    r = ret(d.id, 2);
  op.transitionReturn(s, c, r.id, "Submit");
  op.transitionReturn(s, c, r.id, "Approve", true);
  op.transitionReturn(s, c, r.id, "Dispatch", true);
  op.transitionReturn(s, c, r.id, "Credit", true, "PART-CN-1", 30000);
  expect(r.status).toBe("Awaiting Supplier Credit");
  expect(r.creditReceived).toBe(30000);
  expect(balances(s, c.businessId).returnsPending).toBeGreaterThan(0);
  expect(() =>
    op.transitionReturn(s, c, r.id, "Credit", true, "PART-CN-1", 10000),
  ).toThrow(/already/);
  op.transitionReturn(s, c, r.id, "Credit", true, "PART-CN-2");
  expect(r.creditReceived).toBe(r.amount);
  expect(balances(s, c.businessId).returnsPending).toBe(0);
  expect(r.creditReceipts).toHaveLength(2);
  balanced();
});
it("large rational monetary arithmetic uses exact half-up integer rounding", async () => {
  const { roundedRatio } = await import("./money3");
  expect(roundedRatio([1000000000000, 3333], 10000)).toBe(333300000000);
  expect(roundedRatio([1, 1], 2)).toBe(1);
  expect(() => roundedRatio([Infinity], 1)).toThrow();
});
it("disputed documented supplier refunds are excluded from forecast receipts", () => {
  const d = purchase();
  settle(s, c, d.id, totals(d.lines).total, today(), "bank", true);
  const r = ret(d.id);
  credit(r.id, true);
  r.expectedDate = "2026-10-29";
  const before = forecastBusiness(s, c);
  r.disputed = true;
  const after = forecastBusiness(s, c);
  expect(before.days[0].inflows - after.days[0].inflows).toBe(r.creditBalance);
});
it("manual issued sale numbers are unique across customers and cannot reuse cancellation numbers", () => {
  const d = sale();
  expect(() =>
    saveDocument(s, c, { ...d, partyId: "P-C2" }, true, true),
  ).toThrow(/Duplicate/);
  cancelDocument(s, c, d.id, true);
  expect(() =>
    saveDocument(s, c, { ...d, partyId: "P-C2" }, true, true),
  ).toThrow(/Duplicate/);
});
it("PDF text normalizes financial typography and rejects unsupported scripts rather than corrupting output", async () => {
  const { pdfText } = await import("./documents3");
  expect(pdfText("₹1,000 → ₹500 · 2 × 5")).toBe(
    "INR 1,000  to  INR 500 | 2 x 5",
  );
  expect(() => pdfText("साख")).toThrow(/Print document/);
});
it("return receipt conservation rejects corrupted saved credit amounts", () => {
  const d = sale(true),
    r = ret(d.id);
  credit(r.id);
  r.creditBalance++;
  expect(() => validateBusinessState(s)).toThrow(/reconcile/);
});
