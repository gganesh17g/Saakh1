import { create } from "zustand";
import { get, set } from "idb-keyval";
import { z } from "zod";
import {
  dateSchema,
  moneySchema,
  audit,
  type BusinessState,
  type Role,
  permissions,
  today,
} from "./model";
import { due, quantity } from "./accounting";
import { answer, forecastBusiness, defaultAssumptions } from "./analytics";
import { migrateBusinessState } from "./migration";
import { validateBusinessState } from "./store";
export const roleNames: Record<Role, string> = {
  owner: "Business Owner",
  staff: "Staff",
  accountant: "Accountant",
  admin: "Administrator",
  payroll: "Payroll Manager",
  manager: "Operations Manager",
  auditor: "Auditor",
};
export function canPage(role: Role, page: string) {
  if (page === "reports" && role === "payroll") return true;
  if (["payroll"].includes(page))
    return [
      "owner",
      "admin",
      "payroll",
      "accountant",
      "auditor",
      "manager",
    ].includes(role);
  if (["settings", "admin", "data"].includes(page))
    return permissions[role].includes(page === "admin" ? "admin" : "settings");
  if (
    [
      "passbook",
      "tax",
      "reports",
      "insights",
      "scenarios",
      "explorer",
    ].includes(page)
  )
    return ["owner", "admin", "accountant", "auditor"].includes(role);
  if (
    [
      "sales",
      "customers",
      "sales-returns",
      "bills",
      "purchase-returns",
      "inventory",
      "collections",
      "network",
      "funding",
      "cashflow",
      "assistant",
    ].includes(page)
  )
    return !["payroll", "manager"].includes(role);
  return true;
}
export const taskSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  title: z.string().trim().min(2).max(120),
  description: z.string().max(1000),
  recordId: z.string().optional(),
  due: dateSchema,
  priority: z.enum(["Low", "Normal", "High"]),
  assigned: z.enum([
    "owner",
    "staff",
    "accountant",
    "admin",
    "payroll",
    "manager",
    "auditor",
  ]),
  status: z.enum(["Open", "Done"]),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});
export type Task4 = z.infer<typeof taskSchema>;
export type Scenario4 = {
  id: string;
  businessId: string;
  name: string;
  baseline: string;
  createdAt: string;
  result: ReturnType<typeof forecastBusiness>;
  baseClosing: number;
  calculationVersion?: "business-forecast-1";
  baselineDays?: ReturnType<typeof forecastBusiness>["days"];
};
export type Draft4 = {
  id: string;
  businessId: string;
  workflow: string;
  values: Record<string, string>;
  at: string;
};
type Local4 = {
  version: 1;
  tasks: Task4[];
  scenarios: Scenario4[];
  drafts: Draft4[];
  read: string[];
  prefs: Record<string, string>;
};
const empty = (): Local4 => ({
  version: 1,
  tasks: [],
  scenarios: [],
  drafts: [],
  read: [],
  prefs: {},
});
export function validateWorkspace4(d: Local4) {
  if (
    !d ||
    d.version !== 1 ||
    !d.prefs ||
    typeof d.prefs !== "object" ||
    !Array.isArray(d.read) ||
    d.read.some((x) => typeof x !== "string")
  )
    throw Error("Unsupported workspace record");
  if (Object.values(d.prefs).some((x) => typeof x !== "string"))
    throw Error("Invalid preferences");
  for (const key of ["tasks", "scenarios", "drafts"] as const) {
    if (!Array.isArray(d[key])) throw Error("Missing workspace collection");
    const seen = new Set<string>();
    for (const r of d[key]) {
      if (
        !r ||
        typeof r.id !== "string" ||
        typeof r.businessId !== "string" ||
        seen.has(r.id)
      )
        throw Error("Invalid or duplicate workspace identity");
      seen.add(r.id);
    }
  }
  d.tasks.forEach((t) => taskSchema.parse(t));
  for (const r of d.scenarios) {
    if (
      typeof r.name !== "string" ||
      !r.name.trim() ||
      typeof r.baseline !== "string" ||
      !Number.isSafeInteger(r.baseClosing) ||
      !r.result ||
      r.result.businessId !== r.businessId ||
      !Array.isArray(r.result.days) ||
      r.result.days.length !== r.result.horizon
    )
      throw Error("Invalid scenario snapshot");
    if (
      !r.result.assumptions ||
      Object.values(r.result.assumptions).some((v) => !Number.isFinite(v))
    )
      throw Error("Invalid scenario assumptions");
    for (const day of r.result.days) {
      dateSchema.parse(day.date);
      if (
        [day.opening, day.inflows, day.outflows, day.closing].some(
          (x) => !Number.isSafeInteger(x),
        ) ||
        day.opening + day.inflows - day.outflows !== day.closing
      )
        throw Error("Scenario cash arithmetic mismatch");
    }
  }
  for (const r of d.drafts) {
    if (!r.values || Object.values(r.values).some((x) => typeof x !== "string"))
      throw Error("Invalid draft values");
    if (r.values.lines) {
      const lines = JSON.parse(r.values.lines);
      if (
        !Array.isArray(lines) ||
        !lines.length ||
        lines.length > 40 ||
        lines.some(
          (x) =>
            !x ||
            typeof x.description !== "string" ||
            ![x.quantity, x.price, x.discount, x.tax].every(Number.isFinite),
        )
      )
        throw Error("Invalid recovered document lines");
    }
  }
  return d;
}
let writeQueue4: Promise<unknown> = Promise.resolve();
let workspaceFrozen4 = false;
export async function freezeWorkspace4() {
  workspaceFrozen4 = true;
  await writeQueue4;
  return () => {
    workspaceFrozen4 = false;
  };
}
export const useWorkspace4 = create<{
  data: Local4;
  ready: boolean;
  error: string;
  busy: boolean;
  hydrate: () => Promise<void>;
  recover: () => Promise<boolean>;
  write: (fn: (d: Local4) => void) => Promise<boolean>;
}>((update, state) => ({
  data: empty(),
  ready: false,
  error: "",
  busy: false,
  hydrate: async () => {
    if (state().ready) return;
    try {
      const raw = await get<Local4>("saakh-workspace-v4");
      update({ data: raw ? validateWorkspace4(raw) : empty(), ready: true });
    } catch (e) {
      update({ ready: true, error: String(e) });
    }
  },
  recover: async () => {
    if (state().busy) return false;
    try {
      const raw = await get<Local4>("saakh-workspace-v4");
      const verified = raw ? validateWorkspace4(raw) : empty();
      await set("saakh-workspace-v4", verified);
      update({ data: verified, error: "", ready: true });
      return true;
    } catch (e) {
      update({ error: String(e) });
      return false;
    }
  },
  write: (fn) => {
    const operation = writeQueue4.then(async () => {
      if (!state().ready || state().error || workspaceFrozen4) return false;
      update({ busy: true });
      try {
        const d = structuredClone(state().data);
        fn(d);
        validateWorkspace4(d);
        await set("saakh-workspace-v4", d);
        update({ data: d, busy: false });
        return true;
      } catch (e) {
        update({ busy: false, error: String(e) });
        return false;
      }
    });
    writeQueue4 = operation.catch(() => undefined);
    return operation;
  },
}));
export function fingerprint(s: BusinessState, id: string) {
  return JSON.stringify([
    s.journals.filter((r) => r.businessId === id),
    s.documents.filter((r) => r.businessId === id),
    s.payrollRuns.filter((r) => r.businessId === id),
    s.returns.filter((r) => r.businessId === id),
    s.payments.filter((r) => r.businessId === id),
    s.salaryPayments.filter((r) => r.businessId === id),
    s.returnSettlements.filter((r) => r.businessId === id),
  ]);
}
export function saveScenario(
  s: BusinessState,
  name: string,
  salesChange: number,
  collectionDelay: number,
): Scenario4 {
  if (!name.trim()) throw Error("Name the scenario");
  const c = {
    businessId: s.activeBusiness,
    role: s.role,
    actor: "Demo " + s.role,
  };
  if (!canPage(s.role, "scenarios")) throw Error("Scenario access unavailable");
  const base = forecastBusiness(s, c);
  return {
    id: crypto.randomUUID(),
    businessId: c.businessId,
    name: name.trim(),
    baseline: fingerprint(s, c.businessId),
    createdAt: new Date().toISOString(),
    baseClosing: base.days.at(-1)!.closing,
    calculationVersion: "business-forecast-1",
    baselineDays: base.days,
    result: forecastBusiness(s, c, 30, "Base", {
      ...defaultAssumptions,
      salesChange,
      collectionDelay,
    }),
  };
}
export function searchRecords(s: BusinessState, q: string) {
  const id = s.activeBusiness;
  const result: { id: string; label: string; page: string; type: string }[] =
    [];
  for (const [page, label] of [
    ["reports", "Reports Centre"],
    ["tasks", "My Tasks"],
    ["help", "Help Centre"],
    ["insights", "Insights Centre"],
    ["approvals", "Approvals Inbox"],
  ])
    if (canPage(s.role, page))
      result.push({ id: "page:" + page, label, page, type: "Page" });
  if (canPage(s.role, "passbook"))
    s.journals
      .filter((r) => r.businessId === id)
      .forEach((r) =>
        result.push({
          id: r.id,
          label: r.memo,
          page: "passbook",
          type: "Transaction",
        }),
      );
  if (canPage(s.role, "passbook"))
    s.statements
      .filter((r) => r.businessId === id)
      .forEach((r) =>
        result.push({
          id: r.id,
          label: r.narration,
          page: "passbook",
          type: "Statement row",
        }),
      );
  if (canPage(s.role, "sales")) {
    s.documents
      .filter((r) => r.businessId === id)
      .forEach((r) =>
        result.push({
          id: r.id,
          label: r.number,
          page: r.kind === "sale" ? "sales" : "bills",
          type: "Document",
        }),
      );
    s.parties
      .filter((r) => r.businessId === id)
      .forEach((r) =>
        result.push({
          id: r.id,
          label: r.name,
          page: r.type === "customer" ? "customers" : "network",
          type: "Party",
        }),
      );
    s.items
      .filter((r) => r.businessId === id)
      .forEach((r) =>
        result.push({
          id: r.id,
          label: r.name,
          page: "inventory",
          type: "Product",
        }),
      );
  }
  if (["owner", "admin", "payroll", "accountant", "auditor"].includes(s.role))
    s.employees
      .filter((r) => r.businessId === id)
      .forEach((r) =>
        result.push({
          id: r.id,
          label: r.name,
          page: "payroll",
          type: "Employee",
        }),
      );
  return result
    .filter((r) =>
      (r.label + " " + r.id).toLowerCase().includes(q.toLowerCase()),
    )
    .slice(0, 40);
}
export function notifications(s: BusinessState, tasks: Task4[]) {
  const id = s.activeBusiness;
  const out: { id: string; label: string; page: string; category: string }[] =
    [];
  if (canPage(s.role, "sales"))
    s.documents
      .filter((r) => r.businessId === id && r.status === "Draft")
      .forEach((r) =>
        out.push({
          id: "draft:" + r.id,
          label: "Review draft " + r.number,
          page: r.kind === "sale" ? "sales" : "bills",
          category: "Approvals",
        }),
      );
  if (canPage(s.role, "sales")) {
    s.documents
      .filter(
        (r) =>
          r.businessId === id &&
          r.status === "Posted" &&
          r.dueDate < today() &&
          due(s, r) > 0,
      )
      .forEach((r) =>
        out.push({
          id: "due:" + r.id,
          label: "Overdue " + r.number,
          page: r.kind === "sale" ? "sales" : "bills",
          category: "Payments",
        }),
      );
    s.items
      .filter((i) => i.businessId === id && quantity(s, i.id) < i.reorderLevel)
      .forEach((i) =>
        out.push({
          id: "stock:" + i.id,
          label: "Stock below configured threshold: " + i.name,
          page: "inventory",
          category: "Inventory",
        }),
      );
  }
  tasks
    .filter(
      (t) =>
        t.businessId === id &&
        t.status === "Open" &&
        (t.assigned === s.role || ["owner", "admin"].includes(s.role)),
    )
    .forEach((t) =>
      out.push({
        id: "task:" + t.id,
        label: t.title + (t.due < today() ? " · overdue" : ""),
        page: "tasks",
        category: "Tasks",
      }),
    );
  return out;
}
export type Backup4 = {
  format: "saakh-business-backup";
  version: 1;
  exportedAt: string;
  businessId: string;
  businessName: string;
  integrity: { method: "collection-counts-v1"; counts: Record<string, number> };
  ledger: BusinessState;
  workspace: {
    tasks: Task4[];
    scenarios: Scenario4[];
    drafts: Draft4[];
    preferences?: Record<string, string>;
  };
};
export function makeBackup(s: BusinessState, w: Local4): Backup4 {
  if (!permissions[s.role].includes("settings"))
    throw Error("Backup requires Owner or Administrator");
  const id = s.activeBusiness,
    b = s.businesses.find((b) => b.id === id)!;
  const ledger = structuredClone(s);
  for (const [key, value] of Object.entries(ledger))
    if (Array.isArray(value))
      (ledger as unknown as Record<string, unknown>)[key] =
        key === "businesses"
          ? (value as { id: string }[]).filter((r) => r.id === id)
          : (value as { businessId: string }[]).filter(
              (r) => r.businessId === id,
            );
  delete ledger.workspaceRestores4;
  ledger.statementOpening = { [id]: s.statementOpening[id] || 0 };
  return {
    format: "saakh-business-backup",
    version: 1,
    exportedAt: new Date().toISOString(),
    businessId: id,
    businessName: b.name,
    integrity: {
      method: "collection-counts-v1",
      counts: Object.fromEntries(
        Object.entries(ledger)
          .filter(([, v]) => Array.isArray(v))
          .map(([k, v]) => [k, (v as unknown[]).length]),
      ),
    },
    ledger,
    workspace: {
      preferences: Object.fromEntries(
        Object.entries(w.prefs).filter(([key]) => key.includes(":" + id + ":")),
      ),
      tasks: w.tasks.filter((r) => r.businessId === id),
      scenarios: w.scenarios.filter((r) => r.businessId === id),
      drafts: w.drafts.filter((r) => r.businessId === id),
    },
  };
}
export function parseBackup(text: string): Backup4 {
  if (text.length > 20_000_000) throw Error("Backup exceeds 20 MB");
  const b = JSON.parse(text, (key, value) => {
    if (["__proto__", "constructor", "prototype"].includes(key))
      throw Error("Unsafe backup key");
    return value;
  }) as Backup4;
  if (b.format !== "saakh-business-backup" || b.version !== 1)
    throw Error("Unsupported backup format");
  b.ledger = validateBusinessState(migrateBusinessState(b.ledger));
  if (b.integrity?.method !== "collection-counts-v1")
    throw Error("Missing backup integrity metadata");
  for (const [key, value] of Object.entries(b.ledger))
    if (Array.isArray(value) && b.integrity.counts[key] !== value.length)
      throw Error("Backup collection count mismatch: " + key);
  if (
    b.ledger.businesses.length !== 1 ||
    b.businessId !== b.ledger.activeBusiness ||
    b.ledger.businesses[0].id !== b.businessId
  )
    throw Error("Backup must contain exactly its declared business");
  if (
    !b.workspace ||
    !Array.isArray(b.workspace.tasks) ||
    !Array.isArray(b.workspace.scenarios) ||
    !Array.isArray(b.workspace.drafts)
  )
    throw Error("Invalid workspace collections");
  b.workspace.tasks.forEach((t) => {
    taskSchema.parse(t);
    if (t.businessId !== b.businessId)
      throw Error("Task outside backup business");
  });
  for (const r of [...b.workspace.scenarios, ...b.workspace.drafts])
    if (r.businessId !== b.businessId)
      throw Error("Workspace outside business");
  validateWorkspace4({
    version: 1,
    ...b.workspace,
    read: [],
    prefs: b.workspace.preferences || {},
  });
  for (const [key, rows] of Object.entries(b.ledger))
    if (Array.isArray(rows)) {
      const ids = rows.map((r) => (r as { id?: string }).id).filter(Boolean);
      if (new Set(ids).size !== ids.length)
        throw Error("Duplicate backup identities in " + key);
    }
  for (const m of b.ledger.movements)
    if (
      !b.ledger.items.some(
        (i) => i.id === m.itemId && i.businessId === m.businessId,
      ) ||
      !Number.isFinite(m.quantity) ||
      !Number.isSafeInteger(m.cost)
    )
      throw Error("Invalid inventory movement reference");
  const ledger = b.ledger;
  z.record(z.string(), z.number().int().safe().min(-1e12).max(1e12)).parse(
    ledger.statementOpening,
  );
  if (Object.keys(ledger.statementOpening).some((id) => id !== b.businessId))
    throw Error("Statement opening outside backup business");
  for (const p of ledger.parties)
    z.object({
      name: z.string().min(2),
      type: z.enum(["customer", "supplier", "both"]),
      termsDays: z.number().int().min(0).max(365),
      location: z.string(),
      notes: z.string(),
      blocked: z.boolean(),
      archived: z.boolean().optional(),
    }).parse(p);
  for (const i of ledger.items)
    z.object({
      name: z.string().min(1),
      sku: z.string().min(1),
      unit: z.string().min(1),
      cost: moneySchema,
      price: moneySchema,
      reorderLevel: z.number().finite().min(0),
    }).parse(i);
  for (const d of ledger.documents)
    for (const line of d.lines)
      if (
        line.itemId &&
        !ledger.items.some(
          (i) => i.id === line.itemId && i.businessId === d.businessId,
        )
      )
        throw Error("Document item outside backup business");
  for (const p of ledger.payments)
    if (!["cash", "bank"].includes(p.account))
      throw Error("Invalid payment account");
  for (const row of ledger.statements) {
    dateSchema.parse(row.date);
    z.number().int().safe().min(-1e12).max(1e12).parse(row.amount);
    if (
      !Array.isArray(row.journalIds) ||
      row.journalIds.some(
        (id) =>
          !ledger.journals.some(
            (j) => j.id === id && j.businessId === row.businessId,
          ),
      )
    )
      throw Error("Invalid statement journal reference");
  }
  for (const f of ledger.followups) {
    dateSchema.parse(f.promiseDate);
    if (
      !ledger.documents.some(
        (d) => d.id === f.documentId && d.businessId === f.businessId,
      )
    )
      throw Error("Invalid follow-up document reference");
  }
  return b;
}
export function restoreSeparate(s: BusinessState, b: Backup4) {
  if (!permissions[s.role].includes("settings"))
    throw Error("Restore requires Owner or Administrator");
  const map = new Map<string, string>();
  for (const v of Object.values(b.ledger))
    if (Array.isArray(v))
      for (const r of v as { id?: string }[])
        if (r.id) map.set(r.id, crypto.randomUUID());
  const remap = (v: unknown): unknown =>
    typeof v === "string"
      ? map.get(v) || v
      : Array.isArray(v)
        ? v.map(remap)
        : v && typeof v === "object"
          ? Object.fromEntries(
              Object.entries(v).map(([k, x]) => [map.get(k) || k, remap(x)]),
            )
          : v;
  for (const rows of Object.values(b.workspace))
    if (Array.isArray(rows))
      for (const r of rows) if (r.id) map.set(r.id, crypto.randomUUID());
  const imported = remap(b.ledger) as BusinessState;
  for (const [key, value] of Object.entries(imported))
    if (Array.isArray(value))
      (s as unknown as Record<string, unknown[]>)[key].push(...value);
  Object.assign(s.statementOpening, imported.statementOpening);
  s.sequence = Math.max(s.sequence, imported.sequence);
  s.activeBusiness = imported.activeBusiness;
  const restoredBusiness = s.businesses.find((r) => r.id === s.activeBusiness)!;
  restoredBusiness.name = restoredBusiness.name.slice(0, 79) + " (restored)";
  const importedWorkspace = remap(b.workspace) as Backup4["workspace"];
  importedWorkspace.preferences = Object.fromEntries(
    Object.entries(b.workspace.preferences || {}).map(([key, value]) => [
      key.replace(":" + b.businessId + ":", ":" + s.activeBusiness + ":"),
      value,
    ]),
  );
  s.workspaceRestores4 = {
    ...s.workspaceRestores4,
    [s.activeBusiness]: importedWorkspace,
  };
  audit(
    s,
    { businessId: s.activeBusiness, role: s.role, actor: "Demo " + s.role },
    "Business backup restored as separate copy",
    s.activeBusiness,
    null,
    { originalBusinessId: b.businessId, exportedAt: b.exportedAt },
  );
  validateBusinessState(s);
  return {
    businessId: s.activeBusiness,
    workspace: importedWorkspace,
  };
}
export function answerWorkspace4(s: BusinessState, q: string) {
  const c = {
    businessId: s.activeBusiness,
    role: s.role,
    actor: "Demo " + s.role,
  };
  if (!canPage(s.role, "assistant"))
    return {
      text: "Financial questions are unavailable for this demo role.",
      sources: [],
      estimate: false,
    };
  const lower = q.toLowerCase();
  if (/stock|reorder|inventory/.test(lower)) {
    const low = s.items.filter(
      (i) =>
        i.businessId === c.businessId && quantity(s, i.id) < i.reorderLevel,
    );
    return {
      text: `As of ${today()}, ${low.length} items are below their configured reorder threshold. ${low.map((i) => `${i.name}: ${quantity(s, i.id)} ${i.unit}, threshold ${i.reorderLevel}`).join("; ") || "No low-stock items recorded."} Quantities come from saved stock movements, not a live warehouse feed.`,
      sources: low.map((i) => i.id),
      estimate: false,
    };
  }
  if (/outstanding|receivable/.test(lower))
    return answer(s, c, "Who owes me money?");
  if (
    /owe|overdue|dues|collection|supplier|bill|bank|balance|reconcil|forecast|next month|cash|financ|loan|scenario|post|pay|record|delete|send|cancel/.test(
      lower,
    )
  )
    return answer(s, c, q);
  return {
    text: "This deterministic Assistant supports overdue invoices, outstanding balances, supplier bills, bank reconciliation, low stock and cash forecasts. This question is unsupported. Use Help for application instructions; no action was performed.",
    sources: [],
    estimate: false,
  };
}
