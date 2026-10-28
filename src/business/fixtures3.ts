import {
  type BusinessState,
  type Context,
  today,
  plusDays,
  authorize,
  audit,
} from "./model";
import { saveDocument, settle } from "./accounting";
import * as op from "./operations3";
export function seedOperationsExamples(s: BusinessState, c: Context) {
  authorize(s, c, "payroll");
  if (
    s.audit.some(
      (a) =>
        a.businessId === c.businessId &&
        a.action === "Operations examples loaded",
    )
  )
    throw Error(
      "Operations examples already loaded; existing records were not reset",
    );
  const date = today(),
    period = date.slice(0, 7),
    start = period + "-01";
  op.savePayrollRule(s, c, {
    effective: start,
    label: "Synthetic zero statutory assumption",
    source:
      "Explicit demo only: no exemption or statutory applicability is asserted; configure reviewed rules before use",
    pfEmployeeBps: 0,
    pfEmployerBps: 0,
    pfCap: 0,
    esiEmployeeBps: 0,
    esiEmployerBps: 0,
    esiCeiling: 0,
  });
  const employees = ["Meera Demo", "Kabir Example", "Tara Sample"].map(
    (name, i) => {
      const e = op.saveEmployee(
        s,
        c,
        {
          name,
          department: i === 2 ? "Sales" : "Operations",
          title: i === 2 ? "Sales associate" : "Operations associate",
          employment: "Full-time",
          joined: start,
          location: "Pune (synthetic)",
          method: "Bank record only",
          reference: "No real account information",
          leaveEntitlement: 18,
          notes: "Fictional identity",
          pf: false,
          esi: false,
        },
        {
          effective: start,
          basic: (18000 + i * 2000) * 100,
          hra: 500000,
          allowance: 100000,
          incentive: 0,
          bonus: 0,
          arrears: 0,
          reimbursement: 50000,
          overtimeRate: 10000,
          withholding: 0,
          professionalTax: 0,
          miscellaneous: 0,
        },
      );
      op.saveAttendance(s, c, {
        employeeId: e.id,
        period,
        working: 26,
        present: 26,
        paidLeave: 0,
        unpaid: 0,
        overtime: 0,
        bonus: 0,
        advance: 0,
        reviewed: true,
        notes: "Synthetic attendance",
      });
      return e;
    },
  );
  const run = op.createPayroll(s, c, period, plusDays(date, 2));
  op.calculatePayroll(s, c, run.id);
  op.approvePayroll(s, c, run.id);
  op.finalizePayroll(s, c, run.id, true);
  op.paySalary(
    s,
    c,
    run.id,
    employees[0].id,
    100000,
    date,
    "SYNTHETIC-PARTIAL",
  );
  const customer = op.saveCustomer(s, c, {
    name: "Saanvi Synthetic Stores",
    location: "Pune",
    termsDays: 15,
    notes: "Fictional repeat customer",
  });
  const item = s.items.find((i) => i.businessId === c.businessId);
  if (item) {
    const invoice = op.issueSale(
      s,
      c,
      {
        kind: "sale",
        partyId: customer.id,
        issueDate: date,
        dueDate: date,
        cashSale: true,
        lines: [
          {
            itemId: item.id,
            description: item.name,
            quantity: 1,
            price: item.price,
            discount: 0,
            tax: 0,
          },
        ],
        token: "operations-example-sale",
        prefix: "DEMO",
      },
      true,
    );
    const ret = op.createReturn(s, c, {
      documentId: invoice.id,
      date,
      reason: "Excess quantity",
      condition: "Sellable",
      preference: "Credit",
      notes: "Synthetic partial return",
      evidence: "Demo inspection",
      lines: [{ index: 0, quantity: 0.5, disposition: "Restock" }],
    });
    op.transitionReturn(s, c, ret.id, "Submit");
    op.transitionReturn(s, c, ret.id, "Approve", true);
    op.transitionReturn(s, c, ret.id, "Credit", true);
    op.issueSale(
      s,
      c,
      {
        kind: "sale",
        partyId: customer.id,
        issueDate: date,
        dueDate: plusDays(date, 15),
        cashSale: false,
        lines: [
          {
            description: "Synthetic packing service",
            quantity: 1,
            price: 200000,
            discount: 0,
            tax: 0,
          },
        ],
        token: "operations-example-repeat",
        prefix: "DEMO",
      },
      true,
    );
    const supplier = s.parties.find(
      (p) => p.businessId === c.businessId && p.type === "supplier",
    );
    if (supplier) {
      const bill = saveDocument(
        s,
        c,
        {
          kind: "purchase",
          partyId: supplier.id,
          number: "OPS-BILL-" + s.sequence,
          issueDate: date,
          dueDate: date,
          cashSale: false,
          lines: [
            {
              itemId: item.id,
              description: item.name,
              quantity: 2,
              price: item.cost,
              discount: 0,
              tax: 0,
            },
          ],
        },
        true,
        true,
      );
      settle(s, c, bill.id, item.cost * 2, date, "bank", true);
      const pr = op.createReturn(s, c, {
        documentId: bill.id,
        date,
        reason: "Defective product",
        condition: "Returned to supplier",
        preference: "Refund",
        notes: "Synthetic supplier refund receivable",
        evidence: "Demo dispatch evidence",
        lines: [{ index: 0, quantity: 1, disposition: "Write off" }],
      });
      op.transitionReturn(s, c, pr.id, "Submit");
      op.transitionReturn(s, c, pr.id, "Approve", true);
      op.transitionReturn(s, c, pr.id, "Dispatch", true);
      op.transitionReturn(s, c, pr.id, "Credit", true, "SUPPLIER-DEMO-CN");
      pr.expectedDate = plusDays(date, 5);
    }
  }
  audit(s, c, "Operations examples loaded", c.businessId, null, {
    period,
    employees: employees.map((e) => e.id),
    payroll: run.id,
  });
}
