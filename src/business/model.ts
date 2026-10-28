import { emptyOperations, type OperationsData } from "./operationsModel";
import { z } from "zod";
export const moneySchema = z.number().int().safe().min(0).max(1e12);
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (v) =>
      !isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v,
    "Use a valid calendar date",
  );
export const roles = [
  "owner",
  "staff",
  "accountant",
  "admin",
  "payroll",
  "manager",
  "auditor",
] as const;
export type Role = (typeof roles)[number];
export const accounts = [
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
] as const;
export type Account = (typeof accounts)[number];
export const businessSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(90),
  type: z.enum(["Retail", "Wholesale", "Distributor", "Services"]),
  industry: z.string().min(2),
  location: z.string().min(2),
  financialYear: z.string().regex(/^\d{4}-04-01$/),
  language: z.enum(["en", "hi", "mr"]),
  currency: z.literal("INR"),
  openingCash: moneySchema,
  openingSource: z.string().min(3),
  openingDate: dateSchema,
  createdAt: z.string(),
  startWith: z.enum(["manual", "invoices", "bills", "statement"]),
  minimumBuffer: moneySchema,
});
export type Business = z.infer<typeof businessSchema>;
export type Context = { businessId: string; role: Role; actor: string };
export type Party = {
  id: string;
  businessId: string;
  name: string;
  type: "customer" | "supplier" | "both";
  termsDays: number;
  location: string;
  notes: string;
  verification: "Self-reported";
  blocked: boolean;
  email?: string;
  phone?: string;
  billing?: string;
  delivery?: string;
  gstin?: string;
  category?: string;
  creditLimit?: number;
  updatedAt?: string;
  createdAt?: string;
  archived?: boolean;
};
export type Item = {
  id: string;
  businessId: string;
  sku: string;
  name: string;
  unit: string;
  cost: number;
  price: number;
  reorderLevel: number;
};
export const lineSchema = z.object({
  itemId: z.string().optional(),
  classification: z.string().max(20).optional(),
  description: z.string().min(1),
  quantity: z.number().finite().positive().max(1e6),
  price: moneySchema,
  discount: z.number().min(0).max(100),
  tax: z.number().min(0).max(28),
});
export type DocLine = z.infer<typeof lineSchema>;
export const documentInput = z
  .object({
    kind: z.enum(["sale", "purchase", "expense", "equipment"]),
    partyId: z.string().min(1),
    number: z.string().trim().min(1).max(40),
    issueDate: dateSchema,
    dueDate: dateSchema,
    lines: z.array(lineSchema).min(1).max(40),
    cashSale: z.boolean().default(false),
    attachmentId: z.string().optional(),
    notes: z.string().max(1000).optional(),
    terms: z.string().max(400).optional(),
  })
  .refine(
    (d) => d.dueDate >= d.issueDate,
    "Due date must not precede issue date",
  );
export type DocumentInput = z.infer<typeof documentInput>;
export type BusinessDocument = DocumentInput & {
  id: string;
  businessId: string;
  version: number;
  status: "Draft" | "Posted" | "Cancelled";
  source: "Manual synthetic entry" | "Synthetic fixture";
  createdAt: string;
  updatedAt: string;
  enteredBy: string;
  reviewedBy?: string;
  automated?: boolean;
  notes?: string;
  terms?: string;
};
export const journalLine = z
  .object({
    account: z.enum(accounts),
    debit: moneySchema,
    credit: moneySchema,
  })
  .refine(
    (l) => l.debit > 0 !== l.credit > 0,
    "Each line must have a debit or a credit",
  );
export const journalSchema = z
  .object({
    id: z.string(),
    businessId: z.string(),
    date: dateSchema,
    memo: z.string().min(2),
    kind: z.string(),
    sourceId: z.string(),
    actor: z.string(),
    lines: z.array(journalLine).min(2),
    reversalOf: z.string().optional(),
    createdAt: z.string(),
  })
  .refine(
    (j) => j.lines.reduce((s, l) => s + l.debit - l.credit, 0) === 0,
    "Journal does not balance",
  );
export type Journal = z.infer<typeof journalSchema>;
export type Payment = {
  id: string;
  businessId: string;
  documentId: string;
  amount: number;
  date: string;
  account: "cash" | "bank";
  journalId: string;
};
export type Credit = {
  id: string;
  businessId: string;
  documentId: string;
  amount: number;
  date: string;
  journalId: string;
  refundAmount?: number;
  liabilityAmount?: number;
  returnId?: string;
};
export type Movement = {
  id: string;
  businessId: string;
  itemId: string;
  quantity: number;
  cost: number;
  date: string;
  kind: string;
  sourceId: string;
};
export type StatementRow = {
  id: string;
  businessId: string;
  date: string;
  narration: string;
  amount: number;
  account: "bank";
  source: string;
  status: "Unmatched" | "Matched" | "Rejected" | "Needs review";
  journalIds: string[];
};
export type Attachment = {
  id: string;
  businessId: string;
  name: string;
  mime: string;
  size: number;
  content: string;
  sha256: string;
};
export type Audit = {
  id: string;
  businessId: string;
  at: string;
  actor: string;
  action: string;
  sourceId: string;
  before: unknown;
  after: unknown;
};
export type Followup = {
  id: string;
  businessId: string;
  documentId: string;
  promiseDate: string;
  disputed: boolean;
  outcome: string;
  draft: string;
  scheduled: boolean;
};
export type TaxTask = {
  id: string;
  businessId: string;
  title: string;
  dueDate: string;
  source: string;
  reviewedAt: string;
  status:
    | "Data needed"
    | "Draft ready"
    | "Accountant review"
    | "Awaiting user approval"
    | "Simulated submission";
};
export type RFQ = {
  id: string;
  businessId: string;
  product: string;
  quantity: number;
  location: string;
  deliveryDate: string;
  specification: string;
  budget: number;
  terms: string;
  createdAt: string;
  outcome: "Open" | "Shortlisted" | "Demo order recorded" | "Closed";
};
export type Quote = {
  id: string;
  businessId: string;
  rfqId: string;
  supplierId: string;
  unitPrice: number;
  freight: number;
  tax: number;
  leadDays: number;
  validUntil: string;
  terms: string;
  shortlisted: boolean;
  createdAt: string;
};
export type Consent = {
  id: string;
  businessId: string;
  purpose: string;
  scope: string;
  recipient: string;
  expiresAt: string;
  createdAt: string;
  revokedAt?: string;
};
export type Membership = {
  id: string;
  businessId: string;
  name: string;
  role: Role;
  permissions: string[];
  expiresAt: string;
  status: "Demo invitation" | "Revoked";
};
export type ForecastAssumptions = {
  collectionDelay: number;
  salesChange: number;
  costChange: number;
  deliveryDelay: number;
  monthlyDebt: number;
  taxPayment: number;
  minimumBuffer: number;
};
export type ForecastDay = {
  date: string;
  opening: number;
  collections: number;
  cashSales: number;
  suppliers: number;
  expenses: number;
  debt: number;
  tax: number;
  inflows: number;
  outflows: number;
  closing: number;
  gap: number;
};
export type ForecastRun = {
  id: string;
  businessId: string;
  asOf: string;
  generatedAt: string;
  horizon: number;
  scenario: "Base" | "Downside";
  method: string;
  assumptions: ForecastAssumptions;
  days: ForecastDay[];
  warnings: string[];
  metrics: { method: string; mae: number; wape: number | null }[];
  inputJournalIds: string[];
};
export type BusinessState = OperationsData & {
  workspaceRestores4?: Record<
    string,
    {
      tasks: import("./workspace4").Task4[];
      scenarios: import("./workspace4").Scenario4[];
      drafts: import("./workspace4").Draft4[];
      preferences?: Record<string, string>;
    }
  >;
  version: 2;
  operationsRevision: 2;
  sequence: number;
  activeBusiness: string;
  role: Role;
  businesses: Business[];
  parties: Party[];
  items: Item[];
  documents: BusinessDocument[];
  journals: Journal[];
  payments: Payment[];
  credits: Credit[];
  movements: Movement[];
  statements: StatementRow[];
  statementOpening: Record<string, number>;
  attachments: Attachment[];
  audit: Audit[];
  followups: Followup[];
  taxTasks: TaxTask[];
  rfqs: RFQ[];
  quotes: Quote[];
  consents: Consent[];
  memberships: Membership[];
  complaints: {
    id: string;
    businessId: string;
    partyId: string;
    reason: string;
    status: "Needs review" | "Reviewed" | "Escalated";
  }[];
  forecasts: ForecastRun[];
};
export const emptyState = (): BusinessState => ({
  ...emptyOperations(),
  version: 2,
  operationsRevision: 2,
  sequence: 0,
  activeBusiness: "",
  role: "owner",
  businesses: [],
  parties: [],
  items: [],
  documents: [],
  journals: [],
  payments: [],
  credits: [],
  movements: [],
  statements: [],
  statementOpening: {},
  attachments: [],
  audit: [],
  followups: [],
  taxTasks: [],
  rfqs: [],
  quotes: [],
  consents: [],
  memberships: [],
  complaints: [],
  forecasts: [],
});
export const today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const plusDays = (date: string, days: number) =>
  new Date(Date.parse(date) + days * 86400000).toISOString().slice(0, 10);
export const rupees = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
export const paise = (rupees: number) => {
  if (!Number.isFinite(rupees) || Math.abs(rupees) > 1e10)
    throw new Error("Enter a finite INR amount");
  return Math.round(rupees * 100);
};
export const displayDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
export function uid(s: BusinessState, prefix: string) {
  return `${prefix}-${String(++s.sequence).padStart(6, "0")}`;
}
export const permissions: Record<Role, string[]> = {
  payroll: ["read", "payroll", "pay", "export"],
  manager: ["read", "attendance"],
  auditor: ["read", "export", "payrollRead"],
  owner: [
    "read",
    "draft",
    "post",
    "pay",
    "journal",
    "reconcile",
    "export",
    "settings",
    "market",
    "tax",
    "consent",
    "payroll",
    "payrollRead",
    "attendance",
  ],
  staff: ["read", "draft", "market"],
  accountant: [
    "payrollRead",
    "read",
    "draft",
    "post",
    "journal",
    "reconcile",
    "export",
    "tax",
  ],
  admin: [
    "read",
    "draft",
    "post",
    "pay",
    "journal",
    "reconcile",
    "export",
    "settings",
    "market",
    "tax",
    "consent",
    "admin",
    "payroll",
    "payrollRead",
    "attendance",
  ],
};
export function authorize(
  s: BusinessState,
  c: Context,
  permission: string,
  recordBusiness = c.businessId,
) {
  if (
    !s.businesses.some((b) => b.id === c.businessId) ||
    recordBusiness !== c.businessId
  )
    throw new Error("Record is outside the selected demo business");
  if (!permissions[c.role]?.includes(permission))
    throw new Error(`The ${c.role} demo view does not allow ${permission}`);
}
export function audit(
  s: BusinessState,
  c: Context,
  action: string,
  sourceId: string,
  before: unknown,
  after: unknown,
) {
  s.audit.push({
    id: uid(s, "AUD"),
    businessId: c.businessId,
    actor: c.actor,
    at: new Date().toISOString(),
    action,
    sourceId,
    before: structuredClone(before),
    after: structuredClone(after),
  });
}
