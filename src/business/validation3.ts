import { balances } from "./accounting";
import { type BusinessState, moneySchema, dateSchema } from "./model";
import {
  salarySchema,
  employeeSchema,
  payrollOutstanding,
} from "./operations3";
export function validateOperations(s: BusinessState) {
  const ids = new Set<string>();
  for (const [key, value] of Object.entries(s))
    if (Array.isArray(value) && key !== "businesses")
      for (const row of value as { id?: string }[]) {
        if (row.id) {
          if (ids.has(row.id)) throw Error("Duplicate stored record ID");
          ids.add(row.id);
        }
      }
  for (const e of s.employees) {
    employeeSchema.parse(e);
    if (!e.salaries.length) throw Error("Missing salary version");
    e.salaries.forEach((x) => salarySchema.parse(x));
  }
  for (const rule of s.payrollRules) {
    dateSchema.parse(rule.effective);
    for (const v of Object.values(rule))
      if (typeof v === "number") moneySchema.parse(v);
  }
  for (const a of s.attendance) {
    if (
      !s.employees.some(
        (e) => e.id === a.employeeId && e.businessId === a.businessId,
      )
    )
      throw Error("Attendance employee mismatch");
    if (
      a.present + a.paidLeave + a.unpaid !== a.working ||
      a.working <= 0 ||
      a.working > 31
    )
      throw Error("Invalid stored attendance");
  }
  for (const r of s.payrollRuns) {
    for (const l of r.lines) {
      salarySchema.parse(l.salary);
      for (const key of [
        "gross",
        "reimbursement",
        "deduction",
        "net",
        "employer",
        "cost",
      ] as const)
        moneySchema.parse(l[key]);
      if (
        !s.employees.some(
          (e) => e.id === l.employeeId && e.businessId === r.businessId,
        )
      )
        throw Error("Payroll employee mismatch");
      if (
        l.net !== l.gross + l.reimbursement - l.deduction ||
        l.cost !== l.gross + l.reimbursement + l.employer
      )
        throw Error("Payroll snapshot does not reconcile");
      if (payrollOutstanding(s, r.id, l.employeeId) < 0)
        throw Error("Salary overpaid");
    }
    if (
      r.journalId &&
      !s.journals.some(
        (j) => j.id === r.journalId && j.businessId === r.businessId,
      )
    )
      throw Error("Payroll journal missing");
  }
  for (const p of s.salaryPayments) {
    moneySchema.positive().parse(p.amount);
    if (
      !s.journals.some(
        (j) => j.id === p.journalId && j.businessId === p.businessId,
      )
    )
      throw Error("Payroll payment journal mismatch");
  }
  for (const r of s.returns) {
    dateSchema.parse(r.date);
    if (r.expectedDate) dateSchema.parse(r.expectedDate);
    moneySchema.parse(r.creditReceived);
    const source = s.documents.find((d) => d.id === r.documentId);
    for (const l of r.lines)
      if (
        !source?.lines[l.index] ||
        !Number.isFinite(l.quantity) ||
        l.quantity <= 0
      )
        throw Error("Invalid return line quantity");
    if (
      !s.documents.some(
        (d) => d.id === r.documentId && d.businessId === r.businessId,
      )
    )
      throw Error("Return document mismatch");
    for (const key of [
      "amount",
      "net",
      "tax",
      "creditBalance",
      "applied",
      "refunded",
      "stockCost",
    ] as const)
      moneySchema.parse(r[key]);
    if (
      r.status !== "Reversed" &&
      r.creditReceived !== r.applied + r.refunded + r.creditBalance
    )
      throw Error("Return credit balance does not reconcile");
    if (r.amount !== r.net + r.tax) throw Error("Return amount mismatch");
    if (
      r.journalIds.some(
        (id) =>
          !s.journals.some((j) => j.id === id && j.businessId === r.businessId),
      )
    )
      throw Error("Return posting evidence missing");
  }
  for (const b of s.businesses) {
    const recorded = s.payrollRuns
      .filter(
        (r) => r.businessId === b.id && r.journalId && r.status !== "Reversed",
      )
      .reduce(
        (a, r) =>
          a +
          r.lines.reduce(
            (a, l) => a + payrollOutstanding(s, r.id, l.employeeId),
            0,
          ),
        0,
      );
    if (-balances(s, b.id).salaryPayable !== recorded)
      throw Error(
        "Payroll source liabilities do not reconcile with the ledger",
      );
  }
  for (const p of s.returnSettlements) {
    moneySchema.positive().parse(p.amount);
    if (
      !s.returns.some(
        (r) => r.id === p.returnId && r.businessId === p.businessId,
      ) ||
      !s.journals.some(
        (j) => j.id === p.journalId && j.businessId === p.businessId,
      )
    )
      throw Error("Settlement evidence mismatch");
  }
}
