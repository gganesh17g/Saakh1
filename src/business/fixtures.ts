import {
  emptyState,
  businessSchema,
  uid,
  audit,
  plusDays,
  type BusinessState,
  type Context,
} from "./model";
import { postJournal, saveDocument, settle, manual } from "./accounting";
export function seedBusiness(): BusinessState {
  const s = emptyState(),
    asOf = "2026-10-27",
    year = +asOf.slice(0, 4) - (asOf.slice(5, 7) < "04" ? 1 : 0),
    opening = plusDays(asOf, -60);
  const id = "BIZ-SYNTHETIC-01";
  s.activeBusiness = id;
  s.businesses.push(
    businessSchema.parse({
      id,
      name: "Shree Ganesh Traders · Demo",
      type: "Wholesale",
      industry: "Staples and packing services",
      location: "Pune, Maharashtra",
      financialYear: `${year}-04-01`,
      language: "en",
      currency: "INR",
      openingCash: 25000000,
      openingSource: "Explicit synthetic fixture opening balance",
      openingDate: opening,
      createdAt: new Date(opening).toISOString(),
      startWith: "invoices",
      minimumBuffer: 500000,
    }),
  );
  const c: Context = { businessId: id, role: "owner", actor: "Demo owner" };
  s.parties.push(
    ...[
      ["P-C1", "Asha Retail", "customer"],
      ["P-C2", "Nirman Stores", "customer"],
      ["P-S1", "Kaveri Wholesale", "supplier"],
      ["P-S2", "Deccan Packaging", "supplier"],
    ].map(([pid, name, type]) => ({
      id: pid,
      businessId: id,
      name,
      type: type as "customer" | "supplier",
      termsDays: 30,
      location: "Maharashtra (synthetic)",
      notes: "Synthetic participant; no real contact details",
      verification: "Self-reported" as const,
      blocked: false,
    })),
  );
  s.items.push({
    id: "SKU-001",
    businessId: id,
    sku: "GRAIN-25",
    name: "Staple grain bag 25 kg",
    unit: "bag",
    cost: 40000,
    price: 65000,
    reorderLevel: 10,
  });
  postJournal(s, c, {
    date: opening,
    memo: "Confirmed synthetic opening bank balance",
    kind: "opening",
    sourceId: id,
    lines: [
      { account: "bank", debit: 25000000, credit: 0 },
      { account: "capital", debit: 0, credit: 25000000 },
    ],
  });
  postJournal(s, c, {
    date: opening,
    memo: "Synthetic opening stock contribution: 30 bags at standard cost",
    kind: "openingStock",
    sourceId: "SKU-001",
    lines: [
      { account: "inventory", debit: 1200000, credit: 0 },
      { account: "capital", debit: 0, credit: 1200000 },
    ],
  });
  s.movements.push({
    id: uid(s, "STK"),
    businessId: id,
    itemId: "SKU-001",
    quantity: 30,
    cost: 40000,
    date: opening,
    kind: "Opening stock",
    sourceId: "SKU-001",
  });
  for (let i = 0; i < 60; i++) {
    const date = plusDays(opening, i + 1);
    manual(s, c, {
      kind: "Cash sale",
      amount: Math.round((3000 + Math.sin(i / 5) * 400 + i * 4) * 100),
      date,
      memo: "Synthetic historical packing-service cash sales (not SKU tracked)",
      account: "bank",
      confirmed: true,
    });
    manual(s, c, {
      kind: "Operating expense",
      amount: Math.round((1700 + Math.cos(i / 4) * 150) * 100),
      date,
      memo: "Synthetic historical operating costs",
      account: "bank",
      confirmed: true,
    });
  }
  const invoice = saveDocument(
    s,
    c,
    {
      kind: "sale",
      partyId: "P-C1",
      number: "SGT-INV-001",
      issueDate: plusDays(asOf, -35),
      dueDate: plusDays(asOf, -5),
      lines: [
        {
          itemId: "SKU-001",
          description: "Staple grain bags",
          quantity: 5,
          price: 65000,
          discount: 0,
          tax: 5,
        },
      ],
      cashSale: false,
    },
    true,
    true,
  );
  saveDocument(
    s,
    c,
    {
      kind: "sale",
      partyId: "P-C2",
      number: "SGT-INV-002",
      issueDate: plusDays(asOf, -10),
      dueDate: plusDays(asOf, 15),
      lines: [
        {
          itemId: "SKU-001",
          description: "Staple grain bags",
          quantity: 8,
          price: 65000,
          discount: 0,
          tax: 5,
        },
      ],
      cashSale: false,
    },
    true,
    true,
  );
  const collection = settle(
    s,
    c,
    invoice.id,
    100000,
    plusDays(asOf, -2),
    "bank",
    true,
  );
  saveDocument(
    s,
    c,
    {
      kind: "purchase",
      partyId: "P-S1",
      number: "KW-BILL-101",
      issueDate: plusDays(asOf, -7),
      dueDate: plusDays(asOf, 8),
      lines: [
        {
          itemId: "SKU-001",
          description: "Staple stock replenishment",
          quantity: 10,
          price: 40000,
          discount: 0,
          tax: 5,
        },
      ],
      cashSale: false,
    },
    true,
    true,
  );
  saveDocument(
    s,
    c,
    {
      kind: "expense",
      partyId: "P-S2",
      number: "DP-BILL-014",
      issueDate: asOf,
      dueDate: plusDays(asOf, 12),
      lines: [
        {
          description: "Packaging materials",
          quantity: 1,
          price: 250000,
          discount: 0,
          tax: 18,
        },
      ],
      cashSale: false,
    },
    true,
    true,
  );
  saveDocument(
    s,
    c,
    {
      kind: "expense",
      partyId: "P-S2",
      number: "DP-REVIEW-1",
      issueDate: asOf,
      dueDate: plusDays(asOf, 20),
      lines: [
        {
          description: "Manual review needed; no OCR claimed",
          quantity: 1,
          price: 125000,
          discount: 0,
          tax: 0,
        },
      ],
      cashSale: false,
    },
    false,
    false,
  );
  s.statements.push(
    {
      id: "BANK-001",
      businessId: id,
      date: collection.date,
      narration: "Synthetic receipt SGT-INV-001",
      amount: 100000,
      account: "bank",
      source: "Seeded synthetic statement",
      status: "Unmatched",
      journalIds: [],
    },
    {
      id: "BANK-002",
      businessId: id,
      date: asOf,
      narration: "Unidentified synthetic deposit — needs review",
      amount: 75000,
      account: "bank",
      source: "Seeded synthetic statement",
      status: "Needs review",
      journalIds: [],
    },
  );
  const book = s.journals
    .flatMap((j) => j.lines)
    .filter((l) => l.account === "bank")
    .reduce((v, l) => v + l.debit - l.credit, 0);
  s.statementOpening[id] = book - 100000;
  s.taxTasks.push({
    id: "TAX-001",
    businessId: id,
    title: "Internal accountant document readiness review",
    dueDate: plusDays(asOf, 7),
    source:
      "Manually configured demo internal target; not a statutory deadline",
    reviewedAt: asOf,
    status: "Data needed",
  });
  audit(s, c, "Synthetic business fixture initialized", id, null, {
    openingSource: "Explicit synthetic fixture",
    asOf,
  });
  return s;
}
