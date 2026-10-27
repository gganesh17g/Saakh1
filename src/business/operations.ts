import { z } from "zod";
import {
  type BusinessState,
  type Context,
  type ForecastRun,
  type Consent,
  businessSchema,
  moneySchema,
  dateSchema,
  authorize,
  uid,
  audit,
  today,
  permissions,
} from "./model";
import {
  saveDocument,
  settle,
  creditReturn,
  cancelDocument,
  manual,
  postJournal,
  cashDelta,
  quantity,
} from "./accounting";
export { saveDocument, settle, creditReturn, cancelDocument, manual };
export function onboard(s: BusinessState, input: unknown, confirmed: boolean) {
  if (!confirmed)
    throw new Error("Explicitly confirm the opening balance, source and date");
  const business = businessSchema.parse(input);
  if (s.businesses.some((b) => b.id === business.id))
    throw new Error("Business ID already exists");
  s.businesses.push(business);
  s.activeBusiness = business.id;
  s.role = "owner";
  const c: Context = {
    businessId: business.id,
    role: "owner",
    actor: "Demo owner",
  };
  if (business.openingCash)
    postJournal(s, c, {
      date: business.openingDate,
      memo: `Opening cash confirmed: ${business.openingSource}`,
      kind: "opening",
      sourceId: business.id,
      lines: [
        { account: "bank", debit: business.openingCash, credit: 0 },
        { account: "capital", debit: 0, credit: business.openingCash },
      ],
    });
  audit(s, c, "Business onboarding confirmed", business.id, null, business);
  return business;
}
export function addParty(s: BusinessState, c: Context, input: unknown) {
  authorize(s, c, "draft");
  const data = z
    .object({
      name: z.string().trim().min(2),
      type: z.enum(["customer", "supplier", "both"]),
      termsDays: z.number().int().min(0).max(365),
      location: z.string().min(2),
      notes: z.string().max(1000),
    })
    .parse(input);
  const party = {
    ...data,
    id: uid(s, "PTY"),
    businessId: c.businessId,
    verification: "Self-reported" as const,
    blocked: false,
  };
  s.parties.push(party);
  audit(s, c, "Party created", party.id, null, party);
  return party;
}
export function addItem(
  s: BusinessState,
  c: Context,
  input: unknown,
  openingQuantity: number,
  confirmed: boolean,
) {
  authorize(s, c, "journal");
  const data = z
    .object({
      sku: z.string().trim().min(1),
      name: z.string().min(2),
      unit: z.string().min(1),
      cost: moneySchema,
      price: moneySchema,
      reorderLevel: z.number().min(0),
    })
    .parse(input);
  if (
    s.items.some(
      (i) =>
        i.businessId === c.businessId &&
        i.sku.toLowerCase() === data.sku.toLowerCase(),
    )
  )
    throw new Error("SKU already exists");
  if (!Number.isFinite(openingQuantity) || openingQuantity < 0)
    throw new Error("Opening quantity must be nonnegative");
  if (openingQuantity && !confirmed)
    throw new Error("Confirm opening stock source and quantity");
  const item = { ...data, id: uid(s, "SKU"), businessId: c.businessId };
  s.items.push(item);
  if (openingQuantity)
    adjustStock(
      s,
      c,
      item.id,
      openingQuantity,
      "Confirmed synthetic opening stock",
      true,
      true,
    );
  audit(s, c, "Product created", item.id, null, item);
  return item;
}
export function adjustStock(
  s: BusinessState,
  c: Context,
  itemId: string,
  delta: number,
  memo: string,
  confirmed: boolean,
  opening = false,
) {
  authorize(s, c, "journal");
  if (
    !confirmed ||
    !Number.isFinite(delta) ||
    delta === 0 ||
    Math.abs(delta) > 1e6 ||
    memo.trim().length < 4
  )
    throw new Error(
      "Confirm a nonzero stock adjustment and explain its source",
    );
  const item = s.items.find(
    (i) => i.id === itemId && i.businessId === c.businessId,
  );
  if (!item) throw new Error("Product not found in selected business");
  if (quantity(s, item.id) + delta < 0)
    throw new Error("Adjustment would create negative stock");
  const amount = Math.round(Math.abs(delta) * item.cost);
  if (amount)
    postJournal(s, c, {
      date: today(),
      memo,
      kind: opening ? "openingStock" : "stockAdjustment",
      sourceId: itemId,
      lines:
        delta > 0
          ? [
              { account: "inventory", debit: amount, credit: 0 },
              {
                account: opening ? "capital" : "expense",
                debit: 0,
                credit: amount,
              },
            ]
          : [
              { account: "expense", debit: amount, credit: 0 },
              { account: "inventory", debit: 0, credit: amount },
            ],
    });
  s.movements.push({
    id: uid(s, "STK"),
    businessId: c.businessId,
    itemId,
    quantity: delta,
    cost: item.cost,
    date: today(),
    kind: opening ? "Opening stock" : "Adjustment",
    sourceId: itemId,
  });
  audit(s, c, "Stock adjustment", itemId, null, { delta, memo });
}
export function suggestMatches(s: BusinessState, c: Context, rowId: string) {
  authorize(s, c, "reconcile");
  const row = s.statements.find(
    (r) => r.id === rowId && r.businessId === c.businessId,
  );
  if (!row) throw new Error("Statement row not found");
  const used = new Set(
    s.statements
      .filter(
        (r) =>
          r.businessId === c.businessId &&
          r.id !== rowId &&
          r.status === "Matched",
      )
      .flatMap((r) => r.journalIds),
  );
  return s.journals
    .filter(
      (j) =>
        j.businessId === c.businessId &&
        !used.has(j.id) &&
        cashDelta(j, "bank") !== 0 &&
        Math.abs(Date.parse(j.date) - Date.parse(row.date)) <= 7 * 86400000,
    )
    .sort(
      (a, b) =>
        Number(cashDelta(b, "bank") === row.amount) -
        Number(cashDelta(a, "bank") === row.amount),
    );
}
export function reconcile(
  s: BusinessState,
  c: Context,
  rowId: string,
  journalIds: string[],
  reject = false,
) {
  authorize(s, c, "reconcile");
  const row = s.statements.find(
    (r) => r.id === rowId && r.businessId === c.businessId,
  );
  if (!row) throw new Error("Statement row not found");
  const before = structuredClone(row);
  if (reject) {
    row.status = "Rejected";
    row.journalIds = [];
  } else {
    if (!journalIds.length || new Set(journalIds).size !== journalIds.length)
      throw new Error("Choose one or more distinct book transactions");
    const selected = journalIds.map((id) =>
      s.journals.find((j) => j.id === id && j.businessId === c.businessId),
    );
    if (
      selected.some((j) => !j) ||
      selected.reduce((v, j) => v + cashDelta(j!, "bank"), 0) !== row.amount
    )
      throw new Error(
        "Selected book movements must equal the statement amount exactly",
      );
    if (
      s.statements.some(
        (r) =>
          r.businessId === c.businessId &&
          r.id !== rowId &&
          r.status === "Matched" &&
          r.journalIds.some((id) => journalIds.includes(id)),
      )
    )
      throw new Error("A journal is already reconciled to another row");
    row.status = "Matched";
    row.journalIds = journalIds;
  }
  audit(
    s,
    c,
    reject
      ? "Match rejected"
      : journalIds.length > 1
        ? "Split match accepted"
        : "Match accepted",
    row.id,
    before,
    row,
  );
}
export function recordStatementRow(
  s: BusinessState,
  c: Context,
  rowId: string,
  kind: Parameters<typeof manual>[2]["kind"],
  confirmed: boolean,
) {
  authorize(s, c, "journal");
  const row = s.statements.find(
    (r) => r.id === rowId && r.businessId === c.businessId,
  );
  if (!row || row.status === "Matched")
    throw new Error("Select an unmatched row");
  const j = manual(s, c, {
    kind,
    amount: Math.abs(row.amount),
    date: row.date,
    memo: `Statement ${row.id}: ${row.narration}`,
    account: kind === "Transfer" && row.amount > 0 ? "cash" : "bank",
    confirmed,
  });
  if (cashDelta(j, "bank") !== row.amount)
    throw new Error("Category and transaction direction do not agree");
  reconcile(s, c, rowId, [j.id]);
}
export function addFollowup(
  s: BusinessState,
  c: Context,
  input: {
    documentId: string;
    promiseDate: string;
    disputed: boolean;
    outcome: string;
    draft: string;
    scheduled: boolean;
  },
) {
  authorize(s, c, "draft");
  const d = s.documents.find(
    (d) =>
      d.id === input.documentId &&
      d.businessId === c.businessId &&
      d.kind === "sale",
  );
  if (!d) throw new Error("Select an authorized sales invoice");
  if (input.promiseDate) dateSchema.parse(input.promiseDate);
  const old = s.followups.find((f) => f.documentId === d.id);
  const value = {
    ...input,
    id: old?.id || uid(s, "FUP"),
    businessId: c.businessId,
  };
  if (old) Object.assign(old, value);
  else s.followups.push(value);
  audit(s, c, "Collection follow-up saved (draft only)", d.id, null, value);
}
export function addRFQ(s: BusinessState, c: Context, input: unknown) {
  authorize(s, c, "market");
  const data = z
    .object({
      product: z.string().min(2),
      quantity: z.number().positive().max(1e6),
      location: z.string().min(2),
      deliveryDate: dateSchema,
      specification: z.string().min(2),
      budget: moneySchema,
      terms: z.string().min(2),
    })
    .parse(input);
  if (data.deliveryDate < today())
    throw new Error("Delivery date is in the past");
  const r = {
    ...data,
    id: uid(s, "RFQ"),
    businessId: c.businessId,
    createdAt: new Date().toISOString(),
    outcome: "Open" as const,
  };
  s.rfqs.push(r);
  audit(s, c, "Synthetic RFQ created", r.id, null, r);
  return r;
}
export function addQuote(s: BusinessState, c: Context, input: unknown) {
  authorize(s, c, "market");
  const data = z
    .object({
      rfqId: z.string(),
      supplierId: z.string(),
      unitPrice: moneySchema,
      freight: moneySchema,
      tax: z.number().min(0).max(28),
      leadDays: z.number().int().min(0).max(365),
      validUntil: dateSchema,
      terms: z.string().min(2),
    })
    .parse(input);
  if (!s.rfqs.some((r) => r.id === data.rfqId && r.businessId === c.businessId))
    throw new Error("RFQ not found in this business");
  const party = s.parties.find(
    (p) =>
      p.id === data.supplierId &&
      p.businessId === c.businessId &&
      p.type !== "customer",
  );
  if (!party || party.blocked)
    throw new Error("Select a non-blocked synthetic supplier");
  if (data.validUntil < today())
    throw new Error("Quote validity is in the past");
  const q = {
    ...data,
    id: uid(s, "QTE"),
    businessId: c.businessId,
    shortlisted: false,
    createdAt: new Date().toISOString(),
  };
  s.quotes.push(q);
  audit(s, c, "Synthetic quotation recorded", q.id, null, q);
  return q;
}
export function quoteTotal(s: BusinessState, id: string) {
  const q = s.quotes.find((q) => q.id === id);
  if (!q) throw new Error("Quote not found");
  const r = s.rfqs.find((r) => r.id === q.rfqId)!;
  const base = Math.round(r.quantity * q.unitPrice) + q.freight;
  return base + Math.round((base * q.tax) / 100);
}
export function saveConsent(s: BusinessState, c: Context, input: unknown) {
  authorize(s, c, "consent");
  const data = z
    .object({
      purpose: z.string().min(8),
      scope: z.string().min(3),
      recipient: z.string().min(3),
      expiresAt: dateSchema,
    })
    .parse(input);
  if (data.expiresAt <= today())
    throw new Error("Choose a future consent expiry");
  const consent: Consent = {
    ...data,
    id: uid(s, "CNS"),
    businessId: c.businessId,
    createdAt: new Date().toISOString(),
  };
  s.consents.push(consent);
  audit(
    s,
    c,
    "Demo consent recorded; no external sharing enabled",
    consent.id,
    null,
    consent,
  );
  return consent;
}
export function revokeConsent(s: BusinessState, c: Context, id: string) {
  authorize(s, c, "consent");
  const consent = s.consents.find(
    (r) => r.id === id && r.businessId === c.businessId,
  );
  if (!consent) throw new Error("Consent not found");
  if (consent.revokedAt) throw new Error("Already revoked");
  const before = { ...consent };
  consent.revokedAt = new Date().toISOString();
  audit(s, c, "Demo consent revoked", id, before, consent);
}
export function inviteMember(s: BusinessState, c: Context, input: unknown) {
  authorize(s, c, "settings");
  const data = z
    .object({
      name: z.string().min(2),
      role: z.enum(["staff", "accountant"]),
      permissions: z
        .array(z.enum(["read", "draft", "post", "reconcile", "export", "tax"]))
        .min(1),
      expiresAt: dateSchema,
    })
    .parse(input);
  if (data.expiresAt <= today())
    throw new Error("Access expiry must be in the future");
  if (data.permissions.some((p) => !permissions[data.role].includes(p)))
    throw new Error("Requested permissions exceed the selected demo role");
  const member = {
    ...data,
    id: uid(s, "MEM"),
    businessId: c.businessId,
    status: "Demo invitation" as const,
  };
  s.memberships.push(member);
  audit(
    s,
    c,
    "Local demo invitation created; no invitation sent",
    member.id,
    null,
    member,
  );
}
export function saveForecast(s: BusinessState, c: Context, run: ForecastRun) {
  authorize(s, c, "read", run.businessId);
  const value = { ...run, id: uid(s, "FCT") };
  s.forecasts.unshift(value);
  s.forecasts = s.forecasts.slice(0, 30);
  audit(s, c, "Forecast snapshot saved", value.id, null, {
    asOf: value.asOf,
    method: value.method,
    horizon: value.horizon,
    assumptions: value.assumptions,
  });
}
