import {
  type BusinessState,
  type Context,
  type BusinessDocument,
  type DocumentInput,
  type DocLine,
  type Journal,
  type Account,
  documentInput,
  journalSchema,
  moneySchema,
  dateSchema,
  authorize,
  uid,
  audit,
  today,
} from "./model";
export function totals(lines: DocLine[]) {
  let net = 0,
    tax = 0,
    discount = 0;
  for (const l of lines) {
    const gross = Math.round(l.quantity * l.price),
      d = Math.round((gross * l.discount) / 100),
      base = gross - d;
    net += base;
    discount += d;
    tax += Math.round((base * l.tax) / 100);
  }
  return { net, tax, discount, total: net + tax };
}
export function due(s: BusinessState, d: BusinessDocument) {
  if (d.status !== "Posted") return 0;
  return (
    totals(d.lines).total -
    s.payments
      .filter((p) => p.documentId === d.id)
      .reduce((v, p) => v + p.amount, 0) -
    s.credits
      .filter((p) => p.documentId === d.id)
      .reduce((v, p) => v + p.amount - (p.refundAmount || 0), 0)
  );
}
export function docStatus(
  s: BusinessState,
  d: BusinessDocument,
  asOf = today(),
) {
  if (d.status !== "Posted") return d.status;
  if (due(s, d) === 0)
    return s.credits
      .filter((c) => c.documentId === d.id)
      .reduce((a, c) => a + c.amount, 0) === totals(d.lines).total
      ? "Credited"
      : "Paid";
  if (s.payments.some((p) => p.documentId === d.id)) return "Part-paid";
  return d.dueDate < asOf ? "Overdue" : "Posted";
}
export function quantity(s: BusinessState, itemId: string) {
  return s.movements
    .filter((m) => m.itemId === itemId)
    .reduce((v, m) => v + m.quantity, 0);
}
export function balances(s: BusinessState, businessId: string, asOf = today()) {
  const b = Object.fromEntries(
    [
      "salaryExpense",
      "employerExpense",
      "salaryPayable",
      "deductionPayable",
      "employerPayable",
      "employeeAdvance",
      "customerCredit",
      "supplierCredit",
      "returnsPending",
      "quarantineInventory",
      "cash",
      "bank",
      "receivable",
      "inventory",
      "inputGST",
      "equipment",
      "accumulatedDepreciation",
      "payable",
      "outputGST",
      "loan",
      "capital",
      "drawings",
      "revenue",
      "costOfSales",
      "expense",
      "interest",
      "fees",
      "depreciation",
    ].map((a) => [a, 0]),
  ) as Record<Account, number>;
  for (const j of s.journals.filter(
    (j) => j.businessId === businessId && j.date <= asOf,
  ))
    for (const l of j.lines) b[l.account] += l.debit - l.credit;
  return b;
}
export function financials(
  s: BusinessState,
  businessId: string,
  asOf = today(),
) {
  const b = balances(s, businessId, asOf),
    revenue = -b.revenue,
    operatingExpenses =
      b.costOfSales +
      b.expense +
      b.interest +
      b.fees +
      b.depreciation +
      b.salaryExpense +
      b.employerExpense,
    profit = revenue - operatingExpenses;
  return {
    balances: b,
    cash: b.cash + b.bank,
    receivables: b.receivable,
    payables: -b.payable,
    revenue,
    operatingExpenses,
    profit,
    loan: -b.loan,
    taxPayable: -b.outputGST,
    inputTax: b.inputGST,
    assets:
      b.cash +
      b.bank +
      b.receivable +
      b.inventory +
      b.inputGST +
      b.equipment +
      b.accumulatedDepreciation +
      b.employeeAdvance +
      b.supplierCredit +
      b.returnsPending +
      b.quarantineInventory,
    liabilities:
      -b.payable -
      b.outputGST -
      b.loan -
      b.salaryPayable -
      b.deductionPayable -
      b.employerPayable -
      b.customerCredit,
    equity: -b.capital - b.drawings + profit,
  };
}
export function postJournal(
  s: BusinessState,
  c: Context,
  input: Omit<Journal, "id" | "businessId" | "actor" | "createdAt">,
  permission = "journal",
) {
  authorize(s, c, permission);
  if (input.date > today())
    throw new Error(
      "Future transactions belong in forecasts, not actual journals",
    );
  const b = s.businesses.find((b) => b.id === c.businessId)!;
  const year = +b.financialYear.slice(0, 4);
  if (input.date < b.financialYear || input.date > `${year + 1}-03-31`)
    throw new Error(
      "Journal date must be inside the selected April–March financial year",
    );
  if (
    !input.reversalOf &&
    s.journals.some(
      (j) =>
        j.businessId === c.businessId &&
        j.sourceId === input.sourceId &&
        j.kind === input.kind &&
        !j.reversalOf,
    ) &&
    ["payrollFinalized", "returnCredit", "returnDispatch"].includes(input.kind)
  )
    throw new Error("Source event already posted");
  const j = journalSchema.parse({
    ...input,
    id: uid(s, "JRN"),
    businessId: c.businessId,
    actor: c.actor,
    createdAt: new Date().toISOString(),
  });
  s.journals.push(j);
  return j;
}
const debit = (account: Account, amount: number) => ({
    account,
    debit: amount,
    credit: 0,
  }),
  credit = (account: Account, amount: number) => ({
    account,
    debit: 0,
    credit: amount,
  });
function record(s: BusinessState, c: Context, id: string) {
  const d = s.documents.find((x) => x.id === id);
  if (!d) throw new Error("Document not found");
  authorize(s, c, "read", d.businessId);
  return d;
}
function movements(
  s: BusinessState,
  c: Context,
  d: BusinessDocument,
  direction: number,
  sourceId: string,
  ratio = 1,
) {
  for (const l of d.lines)
    if (l.itemId) {
      const item = s.items.find(
        (i) => i.id === l.itemId && i.businessId === c.businessId,
      );
      if (!item)
        throw new Error("Item belongs to another business or is missing");
      s.movements.push({
        id: uid(s, "STK"),
        businessId: c.businessId,
        itemId: item.id,
        quantity: l.quantity * direction * ratio,
        cost: item.cost,
        date: d.issueDate,
        kind: direction < 0 ? "Sale" : "Purchase / return",
        sourceId,
      });
    }
}
function postDoc(s: BusinessState, c: Context, d: BusinessDocument) {
  authorize(s, c, "post");
  if (d.status !== "Draft")
    throw new Error("Only draft documents can be posted");
  const same = s.documents.find(
    (x) =>
      x.id !== d.id &&
      x.businessId === c.businessId &&
      x.kind === d.kind &&
      (d.kind === "sale" || x.partyId === d.partyId) &&
      x.number === d.number &&
      (x.status === "Posted" ||
        (d.kind === "sale" && x.status === "Cancelled")),
  );
  if (same)
    throw new Error(
      `Duplicate number conflicts with ${same.id}; resolve the draft before posting`,
    );
  const t = totals(d.lines);
  moneySchema.positive().parse(t.total);
  const lines = [];
  if (d.kind === "sale") {
    lines.push(
      debit(d.cashSale ? "bank" : "receivable", t.total),
      credit("revenue", t.net),
    );
    if (t.tax) lines.push(credit("outputGST", t.tax));
    let cost = 0;
    for (const l of d.lines)
      if (l.itemId) {
        const item = s.items.find(
          (i) => i.id === l.itemId && i.businessId === c.businessId,
        );
        if (!item) throw new Error("Invalid business item");
        if (quantity(s, item.id) + 1e-8 < l.quantity)
          throw new Error(`Insufficient stock for ${item.name}`);
        cost += Math.round(item.cost * l.quantity);
      }
    if (cost) lines.push(debit("costOfSales", cost), credit("inventory", cost));
    movements(s, c, d, -1, `${d.id}:v${d.version}`);
  } else {
    if (d.kind === "purchase" && d.lines.some((l) => !l.itemId))
      throw new Error("Inventory purchases require a product on every line");
    if (d.kind === "purchase") {
      const standard = d.lines.reduce(
        (sum, l) =>
          sum +
          Math.round(
            (s.items.find((i) => i.id === l.itemId)?.cost || 0) * l.quantity,
          ),
        0,
      );
      if (standard) lines.push(debit("inventory", standard));
      const variance = t.net - standard;
      if (variance > 0) lines.push(debit("expense", variance));
      else if (variance < 0) lines.push(credit("expense", -variance));
    } else
      lines.push(
        debit(d.kind === "equipment" ? "equipment" : "expense", t.net),
      );
    if (t.tax) lines.push(debit("inputGST", t.tax));
    lines.push(credit("payable", t.total));
    if (d.kind === "purchase") movements(s, c, d, 1, `${d.id}:v${d.version}`);
  }
  const j = postJournal(
    s,
    c,
    {
      date: d.issueDate,
      memo: `${d.kind} ${d.number}`,
      kind: d.kind === "sale" && d.cashSale ? "cashSale" : d.kind,
      sourceId: d.id,
      lines: lines.filter((l) => l.debit || l.credit),
    },
    "post",
  );
  d.status = "Posted";
  d.reviewedBy = c.actor;
  d.updatedAt = new Date().toISOString();
  if (d.kind === "sale" && d.cashSale)
    s.payments.push({
      id: uid(s, "PAY"),
      businessId: c.businessId,
      documentId: d.id,
      amount: t.total,
      date: d.issueDate,
      account: "bank",
      journalId: j.id,
    });
  return j;
}
export function saveDocument(
  s: BusinessState,
  c: Context,
  input: DocumentInput,
  post: boolean,
  confirm: boolean,
  id?: string,
  expectedVersion?: number,
) {
  authorize(s, c, "draft");
  const data = documentInput.parse(input);
  const party = s.parties.find((p) => p.id === data.partyId);
  if (party?.archived && !id) throw new Error("Customer is archived");
  if (!party || party.businessId !== c.businessId)
    throw new Error("Select a party in this business");
  if (
    data.attachmentId &&
    !s.attachments.some(
      (a) => a.id === data.attachmentId && a.businessId === c.businessId,
    )
  )
    throw new Error("Source attachment is outside this business");
  if (
    new Set(data.lines.filter((l) => l.itemId).map((l) => l.itemId)).size !==
    data.lines.filter((l) => l.itemId).length
  )
    throw new Error("Combine duplicate product lines before posting");
  if (
    (data.kind === "sale" && party.type === "supplier") ||
    (data.kind !== "sale" && party.type === "customer")
  )
    throw new Error("Counterparty type does not match this document");
  let d: BusinessDocument;
  let previous: BusinessDocument | null = null;
  if (id) {
    d = record(s, c, id);
    if (d.version !== expectedVersion)
      throw new Error("The record changed; reload before editing");
    if (d.status === "Cancelled")
      throw new Error("Cancelled records cannot be edited");
    previous = structuredClone(d);
    if (d.status === "Posted" && d.number !== data.number)
      throw new Error("Issued invoice numbers are immutable");
    if (
      s.returns.some(
        (r) =>
          r.documentId === d.id &&
          r.status !== "Rejected" &&
          r.status !== "Reversed",
      )
    )
      throw new Error("Resolve linked returns before correcting this document");
    if (d.status === "Posted") {
      authorize(s, c, "post");
      if (!post || !confirm)
        throw new Error(
          "A posted correction requires confirmed reverse-and-repost",
        );
      if (
        s.payments.some((p) => p.documentId === id) ||
        s.credits.some((p) => p.documentId === id)
      )
        throw new Error(
          "Use a credit note or return after payments; direct correction is blocked",
        );
      reverseDocument(s, c, d, "Correction");
    }
    Object.assign(d, data, {
      version: d.version + 1,
      status: "Draft",
      updatedAt: new Date().toISOString(),
    });
  } else {
    d = {
      ...data,
      id: uid(s, "DOC"),
      businessId: c.businessId,
      version: 1,
      status: "Draft",
      source: "Manual synthetic entry",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      enteredBy: c.actor,
    };
    s.documents.push(d);
  }
  if (post) {
    if (!confirm)
      throw new Error("Review totals and explicitly confirm posting");
    postDoc(s, c, d);
  }
  audit(
    s,
    c,
    id ? "Document corrected" : "Document created",
    d.id,
    previous,
    d,
  );
  return d;
}
function reverseDocument(
  s: BusinessState,
  c: Context,
  d: BusinessDocument,
  reason: string,
) {
  const reversalMoves = s.movements.filter(
    (m) => m.sourceId === `${d.id}:v${d.version}`,
  );
  for (const m of reversalMoves)
    if (m.quantity > 0 && quantity(s, m.itemId) + 1e-8 < m.quantity)
      throw new Error(
        "Cannot reverse a stock purchase after its stock has been consumed; use a reviewed return/adjustment",
      );
  const originals = s.journals.filter(
    (j) =>
      j.sourceId === d.id &&
      !j.reversalOf &&
      !s.journals.some((r) => r.reversalOf === j.id),
  );
  for (const j of originals)
    postJournal(
      s,
      c,
      {
        date: d.issueDate,
        memo: `${reason}: ${j.memo}`,
        kind: "reversal",
        sourceId: d.id,
        reversalOf: j.id,
        lines: j.lines.map((l) => ({
          account: l.account,
          debit: l.credit,
          credit: l.debit,
        })),
      },
      "post",
    );
  const originalMoves = s.movements.filter(
    (m) => m.sourceId === `${d.id}:v${d.version}`,
  );
  for (const m of originalMoves)
    s.movements.push({
      ...m,
      id: uid(s, "STK"),
      sourceId: `reverse-${d.id}-${d.version}`,
      quantity: -m.quantity,
      kind: reason,
    });
}
export function cancelDocument(
  s: BusinessState,
  c: Context,
  id: string,
  confirmed: boolean,
) {
  authorize(s, c, "post");
  if (!confirmed) throw new Error("Confirm cancellation");
  const d = record(s, c, id);
  if (
    s.returns.some(
      (r) =>
        r.documentId === id &&
        r.status !== "Rejected" &&
        r.status !== "Reversed",
    )
  )
    throw new Error("Resolve linked returns before cancelling");
  if (d.status === "Cancelled") throw new Error("Already cancelled");
  if (
    s.payments.some((p) => p.documentId === id) ||
    s.credits.some((p) => p.documentId === id)
  )
    throw new Error(
      "Paid or credited records require a documented credit/refund workflow",
    );
  const before = structuredClone(d);
  if (d.status === "Posted") reverseDocument(s, c, d, "Cancellation");
  d.status = "Cancelled";
  d.version++;
  audit(s, c, "Document cancelled", id, before, d);
}
export function settle(
  s: BusinessState,
  c: Context,
  id: string,
  amount: number,
  date: string,
  account: "cash" | "bank",
  confirmed: boolean,
) {
  authorize(s, c, "pay");
  if (!confirmed) throw new Error("Confirm this receipt/payment");
  moneySchema.positive().parse(amount);
  dateSchema.parse(date);
  const d = record(s, c, id);
  if (d.status !== "Posted" || amount > due(s, d))
    throw new Error("Payment must not exceed the posted outstanding amount");
  if (date < d.issueDate)
    throw new Error("Payment cannot precede the source document");
  const isSale = d.kind === "sale";
  const j = postJournal(
    s,
    c,
    {
      date,
      memo: `${isSale ? "Collection" : "Supplier payment"} ${d.number}`,
      kind: isSale ? "collection" : "supplierPayment",
      sourceId: d.id,
      lines: isSale
        ? [debit(account, amount), credit("receivable", amount)]
        : [debit("payable", amount), credit(account, amount)],
    },
    "pay",
  );
  s.payments.push({
    id: uid(s, "PAY"),
    businessId: c.businessId,
    documentId: id,
    amount,
    date,
    account,
    journalId: j.id,
  });
  audit(
    s,
    c,
    isSale ? "Collection recorded" : "Supplier payment recorded",
    id,
    null,
    { amount, date, journalId: j.id },
  );
  return j;
}
export function creditReturn(
  s: BusinessState,
  c: Context,
  id: string,
  amount: number,
  date: string,
  confirmed: boolean,
) {
  authorize(s, c, "post");
  if (!confirmed) throw new Error("Confirm credit note / return");
  const d = record(s, c, id);
  moneySchema.positive().parse(amount);
  dateSchema.parse(date);
  if (date < d.issueDate) throw new Error("Return cannot precede the document");
  const t = totals(d.lines),
    previous = s.credits
      .filter((x) => x.documentId === id)
      .reduce((v, x) => v + x.amount, 0);
  if (d.status !== "Posted" || amount > t.total - previous)
    throw new Error("Credit exceeds unreturned document value");
  const refundAmount = Math.max(0, amount - due(s, d)),
    unpaid = amount - refundAmount,
    ratio = amount / t.total,
    net =
      Math.round((t.net * (previous + amount)) / t.total) -
      Math.round((t.net * previous) / t.total),
    tax = amount - net;
  const lines =
    d.kind === "sale"
      ? [
          debit("revenue", net),
          ...(tax ? [debit("outputGST", tax)] : []),
          ...(unpaid ? [credit("receivable", unpaid)] : []),
          ...(refundAmount ? [credit("bank", refundAmount)] : []),
        ]
      : [
          ...(unpaid ? [debit("payable", unpaid)] : []),
          ...(refundAmount ? [debit("bank", refundAmount)] : []),
          credit(
            d.kind === "purchase"
              ? "inventory"
              : d.kind === "equipment"
                ? "equipment"
                : "expense",
            net,
          ),
          ...(tax ? [credit("inputGST", tax)] : []),
        ];
  if (d.kind === "sale") {
    const source = s.journals.find(
      (j) =>
        j.sourceId === id &&
        (j.kind === "sale" || j.kind === "cashSale") &&
        !s.journals.some((r) => r.reversalOf === j.id),
    );
    const originalCost =
      source?.lines
        .filter((l) => l.account === "costOfSales")
        .reduce((v, l) => v + l.debit, 0) || 0;
    const cost =
      Math.round((originalCost * (previous + amount)) / t.total) -
      Math.round((originalCost * previous) / t.total);
    if (cost) lines.push(debit("inventory", cost), credit("costOfSales", cost));
    movements(s, c, d, 1, "credit-" + id, ratio);
  } else if (d.kind === "purchase") {
    const standard = Math.round(
      d.lines.reduce(
        (sum, l) =>
          sum +
          Math.round(
            (s.items.find((i) => i.id === l.itemId)?.cost || 0) * l.quantity,
          ),
        0,
      ) * ratio,
    );
    const inv = lines.find((l) => l.account === "inventory");
    if (inv) inv.credit = standard;
    const variance = net - standard;
    if (variance > 0) lines.push(credit("expense", variance));
    else if (variance < 0) lines.push(debit("expense", -variance));
    for (const l of d.lines)
      if (l.itemId && quantity(s, l.itemId) < l.quantity * ratio)
        throw new Error("Return exceeds available stock");
    movements(s, c, d, -1, "credit-" + id, ratio);
  }
  const j = postJournal(
    s,
    c,
    {
      date,
      memo: `Credit/return ${d.number} (${(ratio * 100).toFixed(2)}% proportional allocation)`,
      kind: "creditNote",
      sourceId: id,
      lines: lines.filter((l) => l.debit || l.credit),
    },
    "post",
  );
  s.credits.push({
    id: uid(s, "CRN"),
    businessId: c.businessId,
    documentId: id,
    amount,
    date,
    journalId: j.id,
    refundAmount,
  });
  audit(s, c, "Credit note posted", id, null, {
    amount,
    ratio,
    refundAmount,
    journalId: j.id,
  });
}
export type ManualKind =
  | "Cash sale"
  | "Operating expense"
  | "Owner capital"
  | "Owner drawings"
  | "Loan disbursement"
  | "Loan repayment"
  | "Depreciation"
  | "Transfer";
export function manual(
  s: BusinessState,
  c: Context,
  v: {
    kind: ManualKind;
    amount: number;
    date: string;
    memo: string;
    account: "bank" | "cash";
    principal?: number;
    interest?: number;
    fees?: number;
    confirmed: boolean;
  },
) {
  authorize(s, c, "journal");
  if (!v.confirmed) throw new Error("Confirm the proposed journal");
  moneySchema.positive().parse(v.amount);
  const b = balances(s, c.businessId),
    { amount, date, memo, account } = v;
  let lines;
  switch (v.kind) {
    case "Cash sale":
      lines = [debit(account, amount), credit("revenue", amount)];
      break;
    case "Operating expense":
      lines = [debit("expense", amount), credit(account, amount)];
      break;
    case "Owner capital":
      lines = [debit(account, amount), credit("capital", amount)];
      break;
    case "Owner drawings":
      lines = [debit("drawings", amount), credit(account, amount)];
      break;
    case "Loan disbursement":
      lines = [debit(account, amount), credit("loan", amount)];
      break;
    case "Loan repayment": {
      const principal = moneySchema.parse(v.principal || 0),
        interest = moneySchema.parse(v.interest || 0),
        fees = moneySchema.parse(v.fees || 0);
      if (principal + interest + fees !== amount)
        throw new Error(
          "Principal + interest + charges must equal the payment",
        );
      if (principal > -b.loan)
        throw new Error("Principal exceeds recorded loan liability");
      lines = [
        debit("loan", principal),
        debit("interest", interest),
        debit("fees", fees),
        credit(account, amount),
      ].filter((l) => l.debit || l.credit);
      break;
    }
    case "Depreciation":
      if (amount > b.equipment + b.accumulatedDepreciation)
        throw new Error("Depreciation exceeds equipment carrying value");
      lines = [
        debit("depreciation", amount),
        credit("accumulatedDepreciation", amount),
      ];
      break;
    case "Transfer":
      lines = [
        debit(account === "bank" ? "cash" : "bank", amount),
        credit(account, amount),
      ];
      break;
  }
  const j = postJournal(
    s,
    c,
    { date, memo, kind: v.kind, sourceId: uid(s, "MAN"), lines },
    "journal",
  );
  audit(s, c, "Manual journal posted", j.id, null, j);
  return j;
}
export function health(s: BusinessState, id: string) {
  const docs = s.documents.filter((d) => d.businessId === id),
    rows = s.statements.filter((r) => r.businessId === id),
    warnings = docs.filter((d) => d.status === "Draft").length,
    duplicates = docs.filter((d) =>
      docs.some(
        (x) =>
          x.id !== d.id &&
          x.number === d.number &&
          x.partyId === d.partyId &&
          x.kind === d.kind,
      ),
    ).length,
    dates = [
      ...new Set(
        s.journals
          .filter((j) => j.businessId === id)
          .map((j) => j.date.slice(0, 7)),
      ),
    ];
  return {
    reconciledRatio: rows.length
      ? rows.filter((r) => r.status === "Matched").length / rows.length
      : null,
    uncategorized: rows.filter((r) => r.status !== "Matched").length,
    incomplete: warnings,
    duplicates,
    historyMonths: dates.length,
    lastDate:
      s.journals
        .filter((j) => j.businessId === id)
        .map((j) => j.date)
        .sort()
        .at(-1) || null,
  };
}
export function cashDelta(j: Journal, account?: "bank" | "cash") {
  return j.lines
    .filter((l) =>
      account ? l.account === account : ["cash", "bank"].includes(l.account),
    )
    .reduce((v, l) => v + l.debit - l.credit, 0);
}
