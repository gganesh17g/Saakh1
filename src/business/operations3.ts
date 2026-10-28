import { roundedRatio } from "./money3";
import { z } from "zod";
import {
  type BusinessState,
  type Context,
  type DocumentInput,
  type Account,
  type Party,
  moneySchema as money,
  dateSchema,
  authorize,
  uid,
  audit,
  today,
  plusDays,
} from "./model";
import {
  type Salary,
  type PayrollRule,
  type PayrollLine,
  type PayrollRun,
  type Attendance,
  type TradeReturn,
  type ReturnLine,
} from "./operationsModel";
import {
  postJournal,
  saveDocument,
  due,
  totals,
  quantity,
  balances,
} from "./accounting";
const debit = (account: Account, debit: number) => ({
  account,
  debit,
  credit: 0,
});
const credit = (account: Account, credit: number) => ({
  account,
  debit: 0,
  credit,
});
const entry = (
  s: BusinessState,
  c: Context,
  date: string,
  sourceId: string,
  kind: string,
  lines: ReturnType<typeof debit>[],
  permission = "post",
) =>
  postJournal(
    s,
    c,
    {
      date,
      sourceId,
      kind,
      memo: `${kind} · ${sourceId}`,
      lines: lines.filter((l) => l.debit || l.credit),
    },
    permission,
  );
const find = <T extends { id: string; businessId: string }>(
  s: BusinessState,
  c: Context,
  rows: T[],
  id: string,
  permission = "read",
) => {
  const r = rows.find((r) => r.id === id);
  if (!r) throw Error("Record not found");
  authorize(s, c, permission, r.businessId);
  return r;
};
export const customerSchema = z.object({
  name: z.string().trim().min(2).max(90),
  location: z.string().min(2).max(150),
  termsDays: z.number().int().min(0).max(365),
  notes: z.string().max(1000),
  email: z.union([z.email(), z.literal("")]).default(""),
  phone: z
    .string()
    .max(20)
    .regex(/^[+\d ()-]*$/)
    .default(""),
  billing: z.string().max(400).default(""),
  delivery: z.string().max(400).default(""),
  gstin: z
    .string()
    .regex(/^$|^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/)
    .default(""),
  category: z.string().max(60).default("Retail"),
  creditLimit: money.default(0),
});
export function duplicateCustomers(
  s: BusinessState,
  c: Context,
  input: { name: string; email?: string; phone?: string },
) {
  return s.parties.filter(
    (p) =>
      p.businessId === c.businessId &&
      p.type !== "supplier" &&
      (p.name.trim().toLowerCase() === input.name.trim().toLowerCase() ||
        (input.email && p.email?.toLowerCase() === input.email.toLowerCase()) ||
        (input.phone && p.phone === input.phone)),
  );
}
export function saveCustomer(
  s: BusinessState,
  c: Context,
  input: unknown,
  id?: string,
  acknowledge = false,
) {
  authorize(s, c, "draft");
  const v = customerSchema.parse(input);
  if (duplicateCustomers(s, c, v).some((p) => p.id !== id) && !acknowledge)
    throw Error(
      "Potential duplicate customer: select the existing profile or explicitly confirm a separate customer. No automatic merge.",
    );
  const old = id ? find(s, c, s.parties, id) : undefined;
  if (old?.type === "supplier") throw Error("Use a customer profile");
  const before = old ? structuredClone(old) : null;
  const p: Party = {
    ...old,
    ...v,
    id: id || uid(s, "CUS"),
    businessId: c.businessId,
    type: old?.type || "customer",
    verification: "Self-reported",
    blocked: false,
    createdAt: old?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  if (old) Object.assign(old, p);
  else s.parties.push(p);
  audit(s, c, "Customer profile saved", p.id, before, p);
  return p;
}
export function archiveCustomer(s: BusinessState, c: Context, id: string) {
  authorize(s, c, "settings");
  const p = find(s, c, s.parties, id);
  const before = { ...p };
  p.archived = !p.archived;
  audit(s, c, "Customer archive status changed", id, before, p);
}
export function issueSale(
  s: BusinessState,
  c: Context,
  input: Omit<DocumentInput, "number" | "partyId"> & {
    partyId?: string;
    customer?: unknown;
    prefix?: string;
    token: string;
  },
  confirmed: boolean,
) {
  authorize(s, c, "post");
  if (!confirmed) throw Error("Confirm sale and stock posting");
  if (!input.token || input.token.length > 120)
    throw Error("Missing submission token");
  const existing = s.saleRequests.find(
    (x) => x.businessId === c.businessId && x.token === input.token,
  );
  if (existing) return find(s, c, s.documents, existing.documentId);
  const { token, customer, prefix = "SA", ...data } = input;
  let partyId = input.partyId;
  if (!partyId) {
    if (!customer) throw Error("Select or create a customer");
    partyId = saveCustomer(s, c, customer).id;
  }
  if (
    input.partyId === undefined &&
    input.customer &&
    typeof input.customer === "object" &&
    String((input.customer as { name?: string }).name).startsWith(
      "Guest cash",
    ) &&
    !input.cashSale
  )
    throw Error("Guest customers require a cash sale");
  const p = find(s, c, s.parties, partyId);
  if (p.archived || p.blocked || p.type === "supplier")
    throw Error("Select an active customer");
  const fy =
    +input.issueDate.slice(0, 4) - (input.issueDate.slice(5, 7) < "04" ? 1 : 0);
  if (!/^[A-Z0-9-]{1,12}$/.test(prefix))
    throw Error("Prefix must use 1–12 uppercase letters/digits/hyphens");
  let sequence = s.invoiceSequences.find(
    (x) =>
      x.businessId === c.businessId &&
      x.year === String(fy) &&
      x.prefix === prefix,
  );
  if (!sequence) {
    sequence = { businessId: c.businessId, year: String(fy), prefix, next: 1 };
    s.invoiceSequences.push(sequence);
  }
  let number = "";
  do {
    number = `${prefix}/${fy}-${String(fy + 1).slice(2)}/${String(sequence.next++).padStart(5, "0")}`;
  } while (
    s.documents.some(
      (d) => d.businessId === c.businessId && d.number === number,
    )
  );
  const total = totals(input.lines).total;
  if (
    !input.cashSale &&
    p.creditLimit &&
    customerSummary(s, c, p.id).outstanding + total > p.creditLimit
  )
    throw Error("Customer credit limit would be exceeded");
  const d = saveDocument(s, c, { ...data, partyId, number }, true, true);
  d.automated = true;
  s.saleRequests.push({ businessId: c.businessId, token, documentId: d.id });
  audit(s, c, "Sale automatically invoiced", d.id, null, {
    number,
    token,
    journalIds: s.journals.filter((j) => j.sourceId === d.id).map((j) => j.id),
  });
  return d;
}
export function duplicateInvoice(s: BusinessState, c: Context, id: string) {
  const d = find(s, c, s.documents, id);
  return saveDocument(
    s,
    c,
    {
      ...d,
      number: `DRAFT-${s.sequence + 1}`,
      issueDate: today(),
      dueDate: plusDays(today(), 30),
    },
    false,
    false,
  );
}
export function customerStatement(
  s: BusinessState,
  c: Context,
  id: string,
  from = "0000-01-01",
  to = today(),
) {
  find(s, c, s.parties, id);
  const ids = new Set(
    s.documents
      .filter((d) => d.businessId === c.businessId && d.partyId === id)
      .map((d) => d.id),
  );
  const returnIds = new Set(
    s.returns.filter((r) => ids.has(r.documentId)).map((r) => r.id),
  );
  const settlementIds = new Set(
    s.returnSettlements
      .filter((r) => returnIds.has(r.returnId))
      .map((r) => r.id),
  );
  const rows = s.journals
    .filter(
      (j) =>
        j.businessId === c.businessId &&
        (ids.has(j.sourceId) ||
          returnIds.has(j.sourceId) ||
          settlementIds.has(j.sourceId)),
    )
    .map((j) => ({
      id: j.id,
      date: j.date,
      event: j.memo,
      source: j.sourceId,
      change: j.lines
        .filter(
          (l) => l.account === "receivable" || l.account === "customerCredit",
        )
        .reduce((a, l) => a + l.debit - l.credit, 0),
    }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  let balance = rows
    .filter((r) => r.date < from)
    .reduce((a, r) => a + r.change, 0);
  const opening = balance;
  return {
    opening,
    rows: rows
      .filter((r) => r.date >= from && r.date <= to)
      .map((r) => ({ ...r, balance: (balance += r.change) })),
    closing: balance,
  };
}
export function customerSummary(s: BusinessState, c: Context, id: string) {
  const docs = s.documents.filter(
    (d) =>
      d.businessId === c.businessId &&
      d.partyId === id &&
      d.kind === "sale" &&
      d.status === "Posted",
  );
  const returns = s.returns.filter(
    (r) => docs.some((d) => d.id === r.documentId) && r.status !== "Reversed",
  );
  const sales = docs.reduce((a, d) => a + totals(d.lines).total, 0);
  return {
    sales,
    paid: s.payments
      .filter((p) => docs.some((d) => d.id === p.documentId))
      .reduce((a, p) => a + p.amount, 0),
    outstanding: docs.reduce((a, d) => a + due(s, d), 0),
    overdue: docs
      .filter((d) => d.dueDate < today())
      .reduce((a, d) => a + due(s, d), 0),
    credits: returns.reduce((a, r) => a + r.creditBalance, 0),
    orders: docs.length,
    average: docs.length ? Math.round(sales / docs.length) : 0,
    last:
      docs
        .map((d) => d.issueDate)
        .sort()
        .at(-1) || "No transactions",
    returns: returns.filter((r) => r.journalIds.length).length,
  };
}
export function returnEligible(
  s: BusinessState,
  documentId: string,
  index: number,
  exclude = "",
) {
  const d = s.documents.find((d) => d.id === documentId);
  if (!d) return 0;
  if (
    s.credits.some(
      (x) =>
        x.documentId === documentId &&
        !s.returns.some((r) => r.journalIds.includes(x.journalId)),
    )
  )
    return 0;
  return (
    d.lines[index].quantity -
    s.returns
      .filter(
        (r) =>
          r.documentId === documentId &&
          r.id !== exclude &&
          !["Rejected", "Reversed"].includes(r.status),
      )
      .flatMap((r) => r.lines)
      .filter((l) => l.index === index)
      .reduce((a, l) => a + l.quantity, 0)
  );
}
export function createReturn(
  s: BusinessState,
  c: Context,
  input: {
    documentId: string;
    date: string;
    reason: string;
    condition: string;
    preference: "Credit" | "Refund";
    notes: string;
    evidence: string;
    lines: ReturnLine[];
  },
) {
  authorize(s, c, "draft");
  const d = find(s, c, s.documents, input.documentId);
  if (d.status !== "Posted" || !["sale", "purchase"].includes(d.kind))
    throw Error("Select a posted sale or inventory purchase");
  dateSchema.parse(input.date);
  if (input.date < d.issueDate || input.date > today())
    throw Error("Return date must be between document date and today");
  if (
    input.reason.trim().length < 3 ||
    input.notes.length > 1000 ||
    !input.lines.length
  )
    throw Error("Provide reason and eligible line quantities");
  if (new Set(input.lines.map((l) => l.index)).size !== input.lines.length)
    throw Error("Duplicate return line");
  let net = 0,
    tax = 0,
    stockCost = 0;
  for (const l of input.lines) {
    const original = d.lines[l.index];
    if (
      !original ||
      !Number.isFinite(l.quantity) ||
      l.quantity <= 0 ||
      l.quantity > returnEligible(s, d.id, l.index) + 1e-8
    )
      throw Error("Return exceeds eligible quantity");
    if (!["Restock", "Quarantine", "Write off"].includes(l.disposition))
      throw Error("Invalid stock disposition");
    const prev = s.returns
      .filter(
        (r) =>
          r.documentId === d.id && !["Rejected", "Reversed"].includes(r.status),
      )
      .flatMap((r) => r.lines)
      .filter((x) => x.index === l.index)
      .reduce((a, x) => a + x.quantity, 0);
    const full = totals([original]);
    const allocated = (n: number) =>
      Math.round((n * (prev + l.quantity)) / original.quantity) -
      Math.round((n * prev) / original.quantity);
    net += allocated(full.net);
    tax += allocated(full.tax);
    if (original.itemId) {
      const source = s.movements.find(
        (m) =>
          m.sourceId === `${d.id}:v${d.version}` &&
          m.itemId === original.itemId,
      );
      if (!source) throw Error("Original stock evidence missing");
      l.stockCost = allocated(Math.round(original.quantity * source.cost));
      stockCost += l.stockCost;
    }
  }
  const r: TradeReturn = {
    ...input,
    id: uid(s, d.kind === "sale" ? "SR" : "PR"),
    businessId: c.businessId,
    kind: d.kind as "sale" | "purchase",
    status: "Draft",
    supplierReference: "",
    communication: "Not contacted",
    net,
    tax,
    amount: net + tax,
    stockCost,
    creditReceived: 0,
    creditReceipts: [],
    creditBalance: 0,
    applied: 0,
    refunded: 0,
    journalIds: [],
    settlementIds: [],
  };
  money.positive().parse(r.amount);
  s.returns.push(r);
  audit(s, c, "Return draft created", r.id, null, r);
  return r;
}
function returnCost(line: ReturnLine) {
  return line.stockCost || 0;
}
function returnMovement(
  s: BusinessState,
  c: Context,
  r: TradeReturn,
  direction: number,
) {
  const d = find(s, c, s.documents, r.documentId);
  for (const l of r.lines) {
    const source = d.lines[l.index];
    if (!source.itemId) continue;
    if (direction < 0 && quantity(s, source.itemId) < l.quantity)
      throw Error("Insufficient stock to dispatch return");
    if (direction > 0 && l.disposition !== "Restock") continue;
    const unit = s.movements.find(
      (m) =>
        m.sourceId === `${d.id}:v${d.version}` && m.itemId === source.itemId,
    )!.cost;
    s.movements.push({
      id: uid(s, "STK"),
      businessId: c.businessId,
      itemId: source.itemId,
      quantity: direction * l.quantity,
      cost: unit,
      date: today(),
      kind:
        direction > 0 ? "Sales return received" : "Purchase return dispatched",
      sourceId: r.id,
    });
  }
}
export function transitionReturn(
  s: BusinessState,
  c: Context,
  id: string,
  action: string,
  confirmed = false,
  reference = "",
  creditAmount?: number,
) {
  const r = find(s, c, s.returns, id, action === "Submit" ? "draft" : "post");
  const before = structuredClone(r);
  const allowed: Record<string, string[]> = {
    Submit: ["Draft", "Needs Review"],
    Review: ["Submitted"],
    Approve: ["Submitted", "Needs Review"],
    Reject: ["Submitted", "Needs Review"],
    Dispatch: ["Approved"],
    Await: ["Goods Dispatched"],
    Credit:
      r.kind === "sale"
        ? ["Approved"]
        : ["Goods Dispatched", "Awaiting Supplier Credit"],
    Close:
      r.kind === "sale"
        ? ["Credit Issued"]
        : ["Supplier Credit Received", "Settled"],
  };
  if (!allowed[action]?.includes(r.status))
    throw Error("Invalid return transition");
  if (["Approve", "Dispatch", "Credit", "Close"].includes(action) && !confirmed)
    throw Error("Explicitly confirm return action");
  if (action === "Submit") r.status = "Submitted";
  if (action === "Review") r.status = "Needs Review";
  if (action === "Reject") {
    r.status = "Rejected";
    r.notes += " · Rejected: " + reference;
  }
  if (action === "Approve") r.status = "Approved";
  if (action === "Dispatch") {
    returnMovement(s, c, r, -1);
    if (r.stockCost)
      r.journalIds.push(
        entry(s, c, today(), r.id, "returnDispatch", [
          debit("returnsPending", r.stockCost),
          credit("inventory", r.stockCost),
        ]).id,
      );
    r.status = "Goods Dispatched";
  }
  if (action === "Await") {
    r.status = "Awaiting Supplier Credit";
    r.communication = reference || "Supplier credit requested";
  }
  if (action === "Credit") {
    const d = find(s, c, s.documents, r.documentId);
    const amount =
      r.kind === "sale"
        ? r.amount
        : (creditAmount ?? r.amount - r.creditReceived);
    money.positive().parse(amount);
    if (amount > r.amount - r.creditReceived)
      throw Error("Supplier credit exceeds uncredited return value");
    if (
      r.kind === "purchase" &&
      r.creditReceipts.some((x) => x.reference === reference)
    )
      throw Error("Supplier credit reference already recorded");
    const allocated = (n: number) =>
      roundedRatio([n, r.creditReceived + amount], r.amount) -
      roundedRatio([n, r.creditReceived], r.amount);
    const net = allocated(r.net),
      tax = amount - net,
      stock = allocated(r.stockCost);
    const applied = Math.min(due(s, d), amount),
      balance = amount - applied;
    const lines =
      r.kind === "sale"
        ? [
            debit("revenue", r.net),
            debit("outputGST", r.tax),
            credit("receivable", applied),
            credit("customerCredit", balance),
          ]
        : [
            debit("payable", applied),
            debit("supplierCredit", balance),
            credit("returnsPending", stock),
            credit("inputGST", tax),
            ...(net >= stock
              ? [credit("expense", net - stock)]
              : [debit("expense", stock - net)]),
          ];
    if (r.kind === "sale") {
      returnMovement(s, c, r, 1);
      let restock = 0,
        quarantine = 0;
      for (const l of r.lines) {
        if (l.disposition === "Restock") restock += returnCost(l);
        if (l.disposition === "Quarantine") quarantine += returnCost(l);
      }
      if (restock) lines.push(debit("inventory", restock));
      if (quarantine) lines.push(debit("quarantineInventory", quarantine));
      if (restock + quarantine)
        lines.push(credit("costOfSales", restock + quarantine));
    } else if (reference.trim().length < 3)
      throw Error(
        "Record supplier-issued credit reference; internal form is not a supplier credit note",
      );
    const j = entry(
      s,
      c,
      today(),
      r.id,
      r.creditReceived
        ? "returnCredit:" + r.creditReceipts.length
        : "returnCredit",
      lines,
    );
    r.journalIds.push(j.id);
    r.applied += applied;
    r.creditBalance += balance;
    r.creditReceived += amount;
    r.creditReceipts.push({
      reference,
      amount,
      journalId: j.id,
      date: today(),
    });
    r.supplierReference = reference;
    r.status =
      r.kind === "sale"
        ? "Credit Issued"
        : r.creditReceived < r.amount
          ? "Awaiting Supplier Credit"
          : "Supplier Credit Received";
    s.credits.push({
      id: uid(s, "CRN"),
      businessId: c.businessId,
      documentId: d.id,
      amount,
      refundAmount: balance,
      date: today(),
      journalId: j.id,
    });
  }
  if (action === "Close") {
    if (r.creditBalance)
      throw Error("Settle or allocate remaining credit before closing");
    r.status = "Closed";
  }
  audit(s, c, `Return ${action}`, id, before, r);
  return r;
}
export function settleReturn(
  s: BusinessState,
  c: Context,
  id: string,
  amount: number,
  date: string,
  kind: "Refund" | "Allocation",
  reference: string,
  documentId?: string,
) {
  const r = find(s, c, s.returns, id, "pay");
  money.positive().parse(amount);
  dateSchema.parse(date);
  if (
    ![
      "Credit Issued",
      "Supplier Credit Received",
      "Settled",
      "Awaiting Supplier Credit",
    ].includes(r.status) ||
    amount > r.creditBalance ||
    date < r.date ||
    reference.trim().length < 3
  )
    throw Error(
      "Settlement exceeds available credit, lacks reference or has invalid date",
    );
  if (
    s.returnSettlements.some(
      (p) => p.returnId === id && p.reference === reference && !p.reversed,
    )
  )
    throw Error("Settlement reference already recorded");
  const settlementId = uid(s, "RSET");
  let lines;
  if (kind === "Refund")
    lines =
      r.kind === "sale"
        ? [debit("customerCredit", amount), credit("bank", amount)]
        : [debit("bank", amount), credit("supplierCredit", amount)];
  else {
    const target = find(s, c, s.documents, documentId || "");
    const source = find(s, c, s.documents, r.documentId);
    if (
      target.partyId !== source.partyId ||
      target.kind !== source.kind ||
      target.status !== "Posted" ||
      due(s, target) < amount ||
      date < target.issueDate
    )
      throw Error(
        "Select an eligible outstanding document for the same counterparty",
      );
    lines =
      r.kind === "sale"
        ? [debit("customerCredit", amount), credit("receivable", amount)]
        : [debit("payable", amount), credit("supplierCredit", amount)];
  }
  const j = entry(
    s,
    c,
    date,
    settlementId,
    kind === "Refund" ? "returnRefund" : "creditAllocation",
    lines,
    "pay",
  );
  if (kind === "Allocation")
    s.credits.push({
      id: uid(s, "CRN"),
      businessId: c.businessId,
      documentId: documentId!,
      amount,
      date,
      journalId: j.id,
    });
  const record = {
    id: settlementId,
    businessId: c.businessId,
    returnId: r.id,
    amount,
    date,
    kind,
    documentId,
    reference,
    journalId: j.id,
    reversed: false,
  };
  s.returnSettlements.push(record);
  r.creditBalance -= amount;
  if (kind === "Refund") r.refunded += amount;
  else r.applied += amount;
  r.settlementIds.push(settlementId);
  if (
    r.kind === "purchase" &&
    !r.creditBalance &&
    r.creditReceived === r.amount
  )
    r.status = "Settled";
  audit(s, c, `Return ${kind} recorded`, settlementId, null, record);
  return record;
}
export function reverseSettlement(
  s: BusinessState,
  c: Context,
  id: string,
  reason: string,
) {
  const p = find(s, c, s.returnSettlements, id, "pay");
  if (p.reversed || reason.trim().length < 4)
    throw Error("Already reversed or missing correction reason");
  const r = find(s, c, s.returns, p.returnId);
  const j = find(s, c, s.journals, p.journalId);
  postJournal(
    s,
    c,
    {
      date: today(),
      sourceId: p.id,
      kind: "returnSettlementReversal",
      memo: reason,
      reversalOf: j.id,
      lines: j.lines.map((l) => ({
        account: l.account,
        debit: l.credit,
        credit: l.debit,
      })),
    },
    "pay",
  );
  p.reversed = true;
  r.creditBalance += p.amount;
  if (p.kind === "Refund") r.refunded -= p.amount;
  else {
    r.applied -= p.amount;
    s.credits = s.credits.filter((x) => x.journalId !== j.id);
  }
  r.status =
    r.kind === "sale"
      ? "Credit Issued"
      : r.creditReceived < r.amount
        ? "Awaiting Supplier Credit"
        : "Supplier Credit Received";
  audit(s, c, "Return settlement reversed", id, null, {
    reason,
    journalId: j.id,
  });
}
export const salarySchema = z.object({
  effective: dateSchema,
  basic: money,
  hra: money,
  allowance: money,
  incentive: money,
  performance: money.optional(),
  bonus: money,
  arrears: money,
  reimbursement: money,
  overtimeRate: money,
  withholding: money,
  professionalTax: money,
  miscellaneous: money,
});
export const employeeSchema = z.object({
  name: z.string().trim().min(2).max(80),
  department: z.string().min(2),
  title: z.string().min(2),
  employment: z.string().min(2),
  joined: dateSchema,
  location: z.string().min(2),
  method: z.string().min(2),
  reference: z.string().max(80),
  leaveEntitlement: z.number().min(0).max(365),
  notes: z.string().max(1000),
  pf: z.boolean(),
  esi: z.boolean(),
});
export function saveEmployee(
  s: BusinessState,
  c: Context,
  input: unknown,
  salary: Salary,
  id?: string,
) {
  authorize(s, c, "payroll");
  const v = employeeSchema.parse(input);
  salarySchema.parse(salary);
  const old = id ? find(s, c, s.employees, id, "payroll") : undefined;
  if (
    old?.salaries.some((x) => x.effective === salary.effective) &&
    JSON.stringify(
      old.salaries.find((x) => x.effective === salary.effective),
    ) !== JSON.stringify(salary)
  )
    throw Error("Salary effective date exists: add a new version/date");
  const before = old ? structuredClone(old) : null;
  const e = {
    ...v,
    id: old?.id || uid(s, "EMP"),
    businessId: c.businessId,
    archived: old?.archived || false,
    salaries: old ? [...old.salaries] : [],
  };
  if (!e.salaries.some((x) => x.effective === salary.effective))
    e.salaries.push(structuredClone(salary));
  if (old) Object.assign(old, e);
  else s.employees.push(e);
  audit(s, c, "Employee / salary version saved", e.id, before, e);
  return e;
}
export function savePayrollRule(
  s: BusinessState,
  c: Context,
  input: Omit<PayrollRule, "id" | "businessId">,
) {
  authorize(s, c, "payroll");
  dateSchema.parse(input.effective);
  if (input.label.trim().length < 3 || input.source.trim().length < 3)
    throw Error("Provide rule label and assumption/source");
  for (const [k, v] of Object.entries(input))
    if (typeof v === "number") {
      money.parse(v);
      if (k.endsWith("Bps") && v > 10000)
        throw Error("Contribution rate exceeds 100%");
    }
  const rule = { ...input, id: uid(s, "RULE"), businessId: c.businessId };
  s.payrollRules.push(rule);
  audit(
    s,
    c,
    "Illustrative effective-dated payroll rule added",
    rule.id,
    null,
    rule,
  );
  return rule;
}
export function saveAttendance(
  s: BusinessState,
  c: Context,
  input: Omit<Attendance, "id" | "businessId">,
) {
  authorize(s, c, "attendance");
  const e = find(s, c, s.employees, input.employeeId);
  if (e.archived) throw Error("Employee archived");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(input.period))
    throw Error("Invalid payroll month");
  for (const k of [
    "working",
    "present",
    "paidLeave",
    "unpaid",
    "overtime",
    "bonus",
    "advance",
  ] as const)
    money.parse(input[k]);
  if (
    !input.working ||
    input.working > 31 ||
    input.present + input.paidLeave + input.unpaid !== input.working
  )
    throw Error(
      "Present + paid leave + unpaid leave must equal working days (1–31)",
    );
  if (
    s.payrollRuns.some(
      (r) =>
        r.businessId === c.businessId &&
        r.period === input.period &&
        !["Draft", "Needs Review", "Calculated", "Reversed"].includes(r.status),
    )
  )
    throw Error("Approved/finalized period is locked");
  const old = s.attendance.find(
    (a) => a.employeeId === input.employeeId && a.period === input.period,
  );
  if (
    c.role === "manager" &&
    (input.bonus !== (old?.bonus || 0) || input.advance !== (old?.advance || 0))
  )
    throw Error("Manager attendance view cannot change pay adjustments");
  const a = {
    ...input,
    id: old?.id || uid(s, "ATTN"),
    businessId: c.businessId,
  };
  if (old) Object.assign(old, a);
  else s.attendance.push(a);
  audit(s, c, "Attendance reviewed / adjusted", a.id, old || null, a);
  return a;
}
export function calculatePayrollLine(
  e: BusinessState["employees"][number],
  a: Attendance,
  rule: PayrollRule,
): PayrollLine {
  const periodEnd = plusDays(`${a.period}-01`, 32).slice(0, 7) + "-01";
  const start = `${a.period}-01`;
  const end = plusDays(periodEnd, -1);
  const salary = [...e.salaries]
    .filter((x) => x.effective <= end)
    .sort((a, b) => b.effective.localeCompare(a.effective))[0];
  if (!salary) throw Error("No effective salary structure");
  if (salary.effective > start && e.joined < start)
    throw Error(
      "Mid-month salary change needs reviewed split-period payroll; choose next-month effective date",
    );
  const activeStart = e.joined > start ? e.joined : start;
  const calendarDays = +end.slice(8);
  const eligible = Math.max(0, calendarDays - +activeStart.slice(8) + 1);
  const prorate = (n: number) =>
    roundedRatio(
      [n, Math.min(calendarDays, eligible), a.working - a.unpaid],
      calendarDays * a.working,
    );
  const earnings = {
    Basic: prorate(salary.basic),
    HRA: prorate(salary.hra),
    Allowances: prorate(salary.allowance),
    Incentives: prorate(salary.incentive),
    "Performance incentive": prorate(salary.performance || 0),
    Bonus: salary.bonus + a.bonus,
    Arrears: salary.arrears,
    Overtime: Math.round(a.overtime * salary.overtimeRate),
  };
  const gross = Object.values(earnings).reduce((a, b) => a + b, 0);
  const pfBase = e.pf
    ? Math.min(earnings.Basic, rule.pfCap || earnings.Basic)
    : 0;
  const esiBase =
    e.esi && (!rule.esiCeiling || gross <= rule.esiCeiling) ? gross : 0;
  const deductions = {
    EPF: roundedRatio([pfBase, rule.pfEmployeeBps], 10000),
    ESI: roundedRatio([esiBase, rule.esiEmployeeBps], 10000),
    "Professional tax (configured)": salary.professionalTax,
    "Withholding (entered)": salary.withholding,
    "Advance recovery": a.advance,
    "Authorized miscellaneous": salary.miscellaneous,
  };
  const deduction = Object.values(deductions).reduce((a, b) => a + b, 0),
    net = gross + salary.reimbursement - deduction,
    employer =
      roundedRatio([pfBase, rule.pfEmployerBps], 10000) +
      roundedRatio([esiBase, rule.esiEmployerBps], 10000);
  money.parse(net);
  return {
    employeeId: e.id,
    name: e.name,
    department: e.department,
    title: e.title,
    salary: structuredClone(salary),
    attendance: structuredClone(a),
    rule: structuredClone(rule),
    earnings,
    deductions,
    gross,
    reimbursement: salary.reimbursement,
    deduction,
    net,
    employer,
    cost: gross + salary.reimbursement + employer,
  };
}
export function createPayroll(
  s: BusinessState,
  c: Context,
  period: string,
  paymentDate: string,
) {
  authorize(s, c, "payroll");
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period))
    throw Error("Invalid payroll month");
  dateSchema.parse(paymentDate);
  if (paymentDate < period + "-01") throw Error("Payment date precedes period");
  if (
    s.payrollRuns.some(
      (r) =>
        r.businessId === c.businessId &&
        r.period === period &&
        r.status !== "Reversed",
    )
  )
    throw Error("Payroll period already exists");
  const r: PayrollRun = {
    id: uid(s, "PRUN"),
    businessId: c.businessId,
    period,
    paymentDate,
    status: "Draft" as const,
    lines: [],
    createdAt: new Date().toISOString(),
    formula: "payroll-paise-1" as const,
  };
  s.payrollRuns.push(r);
  audit(s, c, "Payroll draft created", r.id, null, r);
  return r;
}
export function calculatePayroll(s: BusinessState, c: Context, id: string) {
  const r = find(s, c, s.payrollRuns, id, "payroll");
  if (!["Draft", "Calculated", "Needs Review"].includes(r.status))
    throw Error("Payroll snapshot is locked");
  if (r.period > today().slice(0, 7))
    throw Error("Future payroll belongs in planning, not actual payroll");
  const employees = s.employees.filter(
    (e) =>
      e.businessId === c.businessId &&
      !e.archived &&
      e.joined.slice(0, 7) <= r.period,
  );
  const rule = s.payrollRules
    .filter(
      (x) => x.businessId === c.businessId && x.effective <= r.period + "-01",
    )
    .sort((a, b) => b.effective.localeCompare(a.effective))[0];
  if (!rule || !employees.length)
    throw Error("Add employees and an effective-dated rule first");
  const lines = employees.map((e) => {
    const a = s.attendance.find(
      (x) => x.employeeId === e.id && x.period === r.period,
    );
    if (!a) throw Error(`Missing attendance: ${e.name}`);
    const outstanding =
      s.salaryPayments
        .filter(
          (x) => x.employeeId === e.id && x.kind === "advance" && !x.reversed,
        )
        .reduce((a, x) => a + x.amount, 0) -
      s.payrollRuns
        .filter((x) => x.status !== "Reversed" && x.journalId)
        .flatMap((x) => x.lines)
        .filter((x) => x.employeeId === e.id)
        .reduce((a, x) => a + x.attendance.advance, 0);
    if (a.advance > outstanding)
      throw Error("Advance recovery exceeds recorded outstanding advances");
    return calculatePayrollLine(e, a, rule);
  });
  r.lines = lines;
  r.status = lines.every((l) => l.attendance.reviewed)
    ? "Calculated"
    : "Needs Review";
  audit(s, c, "Payroll calculated", r.id, null, { status: r.status, lines });
  return r;
}
export function payrollOutstanding(
  s: BusinessState,
  runId: string,
  employeeId: string,
) {
  const r = s.payrollRuns.find((r) => r.id === runId);
  return (
    (r?.lines.find((l) => l.employeeId === employeeId)?.net || 0) -
    s.salaryPayments
      .filter(
        (p) =>
          p.runId === runId &&
          p.employeeId === employeeId &&
          p.kind === "salary" &&
          !p.reversed,
      )
      .reduce((a, p) => a + p.amount, 0)
  );
}
export function approvePayroll(s: BusinessState, c: Context, id: string) {
  const r = find(s, c, s.payrollRuns, id, "payroll");
  if (r.status !== "Calculated")
    throw Error("Calculate reviewed attendance first");
  if (
    r.lines.some(
      (l) =>
        JSON.stringify(l.attendance) !==
        JSON.stringify(s.attendance.find((a) => a.id === l.attendance.id)),
    )
  )
    throw Error("Attendance changed; recalculate before approval");
  r.status = "Approved";
  audit(s, c, "Payroll approved", id, null, r.status);
}
export function finalizePayroll(
  s: BusinessState,
  c: Context,
  id: string,
  confirmed: boolean,
) {
  const r = find(s, c, s.payrollRuns, id, "payroll");
  if (!confirmed || r.status !== "Approved")
    throw Error("Approve then explicitly confirm finalization");
  const sum = (
    key: "gross" | "reimbursement" | "net" | "employer" | "deduction",
  ) => r.lines.reduce((a, l) => a + l[key], 0);
  const advance = r.lines.reduce((a, l) => a + l.attendance.advance, 0);
  const j = entry(
    s,
    c,
    today(),
    id,
    "payrollFinalized",
    [
      debit("salaryExpense", sum("gross") + sum("reimbursement")),
      debit("employerExpense", sum("employer")),
      credit("salaryPayable", sum("net")),
      credit("employeeAdvance", advance),
      credit("deductionPayable", sum("deduction") - advance),
      credit("employerPayable", sum("employer")),
    ],
    "payroll",
  );
  r.journalId = j.id;
  r.status = sum("net") ? "Finalized" : "Paid";
  audit(s, c, "Payroll finalized", id, null, {
    journalId: j.id,
    formula: r.formula,
  });
}
export function paySalary(
  s: BusinessState,
  c: Context,
  runId: string,
  employeeId: string,
  amount: number,
  date: string,
  reference: string,
  method: "bank" | "cash" = "bank",
) {
  authorize(s, c, "payroll");
  const r = find(s, c, s.payrollRuns, runId);
  money.positive().parse(amount);
  if (
    !["Finalized", "Partially Paid"].includes(r.status) ||
    amount > payrollOutstanding(s, r.id, employeeId) ||
    date < r.period + "-01" ||
    reference.trim().length < 3
  )
    throw Error(
      "Invalid salary payment, reference, or amount exceeds outstanding",
    );
  if (
    s.salaryPayments.some(
      (p) =>
        p.runId === runId &&
        p.employeeId === employeeId &&
        p.reference === reference &&
        !p.reversed,
    )
  )
    throw Error("Payment reference already recorded");
  const id = uid(s, "SALPAY"),
    j = entry(
      s,
      c,
      date,
      id,
      "salaryPayment",
      [debit("salaryPayable", amount), credit(method, amount)],
      "payroll",
    );
  s.salaryPayments.push({
    id,
    businessId: c.businessId,
    runId,
    employeeId,
    amount,
    date,
    reference,
    method,
    journalId: j.id,
    reversed: false,
    kind: "salary",
  });
  r.status = r.lines.every((l) => !payrollOutstanding(s, r.id, l.employeeId))
    ? "Paid"
    : "Partially Paid";
  audit(s, c, "Salary payment locally recorded (not bank transfer)", id, null, {
    runId,
    employeeId,
    amount,
    journalId: j.id,
  });
}
export function reverseSalaryPayment(
  s: BusinessState,
  c: Context,
  id: string,
  reason: string,
) {
  const p = find(s, c, s.salaryPayments, id, "payroll");
  if (p.kind !== "salary")
    throw Error("Only salary payment corrections use this workflow");
  if (p.reversed || reason.trim().length < 4)
    throw Error("Already reversed or missing reason");
  const j = find(s, c, s.journals, p.journalId);
  postJournal(
    s,
    c,
    {
      date: today(),
      sourceId: p.id,
      kind: "salaryPaymentReversal",
      memo: reason,
      reversalOf: j.id,
      lines: j.lines.map((l) => ({
        account: l.account,
        debit: l.credit,
        credit: l.debit,
      })),
    },
    "payroll",
  );
  p.reversed = true;
  const r = s.payrollRuns.find((r) => r.id === p.runId);
  if (r) r.status = "Partially Paid";
  audit(s, c, "Salary payment reversed", id, null, { reason });
}
export function reversePayroll(
  s: BusinessState,
  c: Context,
  id: string,
  reason: string,
) {
  const r = find(s, c, s.payrollRuns, id, "payroll");
  if (
    !r.journalId ||
    r.status === "Reversed" ||
    reason.trim().length < 4 ||
    s.salaryPayments.some((p) => p.runId === id && !p.reversed)
  )
    throw Error("Reverse all payments first and provide a correction reason");
  const j = find(s, c, s.journals, r.journalId);
  postJournal(
    s,
    c,
    {
      date: today(),
      sourceId: id,
      kind: "payrollReversal",
      memo: reason,
      reversalOf: j.id,
      lines: j.lines.map((l) => ({
        account: l.account,
        debit: l.credit,
        credit: l.debit,
      })),
    },
    "payroll",
  );
  r.status = "Reversed";
  audit(s, c, "Payroll reversed; original snapshot retained", id, null, {
    reason,
  });
}
export function payrollCashEvent(
  s: BusinessState,
  c: Context,
  employeeId: string,
  amount: number,
  date: string,
  reference: string,
  kind: "advance" | "remittance",
  employer = false,
) {
  authorize(s, c, "payroll");
  money.positive().parse(amount);
  if (reference.trim().length < 3) throw Error("Record a payment reference");
  if (kind === "advance") find(s, c, s.employees, employeeId, "payroll");
  const account =
    kind === "advance"
      ? "employeeAdvance"
      : employer
        ? "employerPayable"
        : "deductionPayable";
  if (kind === "remittance" && amount > -balances(s, c.businessId)[account])
    throw Error("Remittance exceeds liability");
  if (
    s.salaryPayments.some(
      (p) =>
        p.businessId === c.businessId &&
        p.kind === kind &&
        p.reference === reference &&
        !p.reversed,
    )
  )
    throw Error("Payroll cash reference already recorded");
  const id = uid(s, "PEVT"),
    j = entry(
      s,
      c,
      date,
      id,
      kind,
      [debit(account, amount), credit("bank", amount)],
      "payroll",
    );
  s.salaryPayments.push({
    id,
    businessId: c.businessId,
    runId: "",
    employeeId,
    amount,
    date,
    reference,
    method: "bank",
    journalId: j.id,
    reversed: false,
    kind,
  });
  audit(s, c, `Payroll ${kind} recorded locally`, id, null, {
    amount,
    journalId: j.id,
  });
}
export function operationsMetrics(s: BusinessState, c: Context) {
  const r = s.returns.filter(
    (r) =>
      r.businessId === c.businessId &&
      r.status !== "Reversed" &&
      r.status !== "Rejected",
  );
  const payroll = s.payrollRuns.filter(
    (r) =>
      r.businessId === c.businessId && r.status !== "Reversed" && r.journalId,
  );
  return {
    salaryDue: payroll.reduce(
      (a, r) =>
        a +
        r.lines.reduce(
          (a, l) => a + payrollOutstanding(s, r.id, l.employeeId),
          0,
        ),
      0,
    ),
    salesPending: r.filter(
      (r) =>
        r.kind === "sale" && !["Credit Issued", "Closed"].includes(r.status),
    ).length,
    purchasesPending: r.filter(
      (r) =>
        r.kind === "purchase" &&
        !["Supplier Credit Received", "Settled", "Closed"].includes(r.status),
    ).length,
    customerCredits: r
      .filter((r) => r.kind === "sale")
      .reduce((a, r) => a + r.creditBalance, 0),
    supplierCredits: r
      .filter((r) => r.kind === "purchase")
      .reduce((a, r) => a + r.creditBalance, 0),
  };
}
export function reverseReturn(
  s: BusinessState,
  c: Context,
  id: string,
  reason: string,
) {
  const r = find(s, c, s.returns, id, "post");
  if (
    [
      "Reversed",
      "Rejected",
      "Closed",
      "Draft",
      "Submitted",
      "Needs Review",
    ].includes(r.status) ||
    reason.trim().length < 4 ||
    r.settlementIds.some(
      (id) => !s.returnSettlements.find((p) => p.id === id)?.reversed,
    )
  )
    throw Error(
      "Reverse settlements first and provide reason; this return cannot be reversed",
    );
  const sourceJournals = r.journalIds.map((id) => find(s, c, s.journals, id));
  for (const j of sourceJournals)
    if (s.journals.some((x) => x.reversalOf === j.id))
      throw Error("Journal already reversed");
  const moves = s.movements.filter((m) => m.sourceId === r.id);
  for (const m of moves)
    if (m.quantity > 0 && quantity(s, m.itemId) < m.quantity)
      throw Error(
        "Returned stock was consumed; reversal requires stock review",
      );
  for (const j of [...sourceJournals].reverse())
    postJournal(
      s,
      c,
      {
        date: today(),
        sourceId: r.id,
        kind: "returnReversal",
        memo: reason,
        reversalOf: j.id,
        lines: j.lines.map((l) => ({
          account: l.account,
          debit: l.credit,
          credit: l.debit,
        })),
      },
      "post",
    );
  for (const m of moves)
    s.movements.push({
      ...m,
      id: uid(s, "STK"),
      quantity: -m.quantity,
      date: today(),
      kind: "Return reversal",
      sourceId: "reverse-" + r.id,
    });
  s.credits = s.credits.filter((x) => !r.journalIds.includes(x.journalId));
  r.status = "Reversed";
  r.creditBalance = 0;
  audit(s, c, "Return reversed (source retained)", id, null, {
    reason,
    journalIds: r.journalIds,
  });
}
export function payrollDashboard(
  s: BusinessState,
  c: Context,
  runId: string,
  employeeId = "All",
  department = "All",
  paymentStatus = "All",
) {
  const run = s.payrollRuns.find(
    (r) => r.id === runId && r.businessId === c.businessId,
  );
  const lines =
    run?.lines.filter(
      (l) =>
        (employeeId === "All" || l.employeeId === employeeId) &&
        (department === "All" || l.department === department) &&
        (paymentStatus === "All" ||
          (paymentStatus === "Paid"
            ? payrollOutstanding(s, run.id, l.employeeId) === 0
            : payrollOutstanding(s, run.id, l.employeeId) > 0)),
    ) || [];
  const sum = (key: "gross" | "deduction" | "net" | "cost") =>
    lines.reduce((a, l) => a + l[key], 0);
  const due =
    run?.journalId && run.status !== "Reversed"
      ? lines.reduce(
          (a, l) => a + payrollOutstanding(s, run.id, l.employeeId),
          0,
        )
      : 0;
  const groups = new Map<
    string,
    {
      period: string;
      department: string;
      gross: number;
      cost: number;
      deductions: number;
      net: number;
      employees: number;
    }
  >();
  for (const r of s.payrollRuns.filter(
    (r) =>
      r.businessId === c.businessId && r.journalId && r.status !== "Reversed",
  ))
    for (const l of r.lines) {
      const key = r.period + "|" + l.department;
      const v = groups.get(key) || {
        period: r.period,
        department: l.department,
        gross: 0,
        cost: 0,
        deductions: 0,
        net: 0,
        employees: 0,
      };
      v.gross += l.gross;
      v.cost += l.cost;
      v.deductions += l.deduction;
      v.net += l.net;
      v.employees++;
      groups.set(key, v);
    }
  return {
    lines,
    gross: sum("gross"),
    deductions: sum("deduction"),
    net: sum("net"),
    cost: sum("cost"),
    due,
    paid: run?.journalId && run.status !== "Reversed" ? sum("net") - due : 0,
    employees: s.employees.filter((e) => e.businessId === c.businessId).length,
    active: s.employees.filter(
      (e) => e.businessId === c.businessId && !e.archived,
    ).length,
    trends: [...groups.values()].sort(
      (a, b) =>
        a.period.localeCompare(b.period) ||
        a.department.localeCompare(b.department),
    ),
  };
}
export function returnsDashboard(
  s: BusinessState,
  c: Context,
  kind: "sale" | "purchase",
) {
  const all = s.returns.filter(
      (r) => r.businessId === c.businessId && r.kind === kind,
    ),
    active = all.filter((r) => !["Reversed", "Rejected"].includes(r.status));
  const reasons = new Map<
    string,
    { reason: string; count: number; amount: number }
  >();
  for (const r of active) {
    const v = reasons.get(r.reason) || {
      reason: r.reason,
      count: 0,
      amount: 0,
    };
    v.count++;
    v.amount += r.amount;
    reasons.set(r.reason, v);
  }
  return {
    count: all.length,
    amount: active.reduce((a, r) => a + r.amount, 0),
    refunded: active.reduce((a, r) => a + r.refunded, 0),
    credits: active.reduce((a, r) => a + r.creditBalance, 0),
    pending: active.filter((r) =>
      ["Draft", "Submitted", "Needs Review"].includes(r.status),
    ).length,
    approved: active.filter(
      (r) => !["Draft", "Submitted", "Needs Review"].includes(r.status),
    ).length,
    stockUnits: active
      .filter((r) =>
        kind === "sale"
          ? r.creditReceived > 0
          : r.journalIds.some((id) =>
              s.journals.some(
                (j) => j.id === id && j.kind === "returnDispatch",
              ),
            ),
      )
      .flatMap((r) => r.lines)
      .reduce((a, l) => a + l.quantity, 0),
    reasons: [...reasons.values()],
  };
}
export function visibleBusinessJournals(s: BusinessState, c: Context) {
  authorize(s, c, "read");
  const allowed = [
    "owner",
    "admin",
    "payroll",
    "accountant",
    "auditor",
  ].includes(c.role);
  const privateIds = new Set([
    ...s.payrollRuns
      .filter((r) => r.businessId === c.businessId)
      .map((r) => r.journalId),
    ...s.salaryPayments
      .filter((p) => p.businessId === c.businessId)
      .map((p) => p.journalId),
  ]);
  return s.journals.filter(
    (j) =>
      j.businessId === c.businessId &&
      (allowed || (!privateIds.has(j.id) && !privateIds.has(j.reversalOf))),
  );
}
