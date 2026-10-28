import { describe, it, expect, vi } from "vitest";
import { seedBusiness } from "./fixtures";
import { emptyState, roles } from "./model";
import {
  canPage,
  searchRecords,
  makeBackup,
  parseBackup,
  restoreSeparate,
  saveScenario,
  fingerprint,
  notifications,
  taskSchema,
} from "./workspace4";
import { financials } from "./accounting";
import { validateBusinessState } from "./store";
vi.mock("idb-keyval", () => ({ get: vi.fn(), set: vi.fn(), del: vi.fn() }));
const workspace = {
  version: 1 as const,
  tasks: [],
  scenarios: [],
  drafts: [],
  read: [],
  prefs: {},
};
describe("Saakh 4 workspace financial boundaries", () => {
  it("isolates searches to the active business", () => {
    const s = seedBusiness();
    s.parties.push({
      ...s.parties[0],
      id: "other-party",
      businessId: "OTHER",
      name: "Private other business",
    });
    expect(searchRecords(s, "Private")).toEqual([]);
  });
  it("excludes employees from Staff and manager searches", () => {
    const s = seedBusiness();
    s.role = "staff";
    expect(searchRecords(s, "").every((r) => r.type !== "Employee")).toBe(true);
    expect(canPage("staff", "data")).toBe(false);
    expect(canPage("manager", "passbook")).toBe(false);
  });
  it.each(roles)("has a home and help destination for %s", (r) => {
    expect(canPage(r, "")).toBe(true);
    expect(canPage(r, "help")).toBe(true);
  });
  it("round trips a selected business backup and preserves source", () => {
    const s = seedBusiness(),
      before = structuredClone(s);
    const b = parseBackup(JSON.stringify(makeBackup(s, workspace)));
    expect(b.ledger).toEqual(s);
    expect(s).toEqual(before);
  });
  it("restores as a separate business with balanced independent source records", () => {
    const s = seedBusiness(),
      original = structuredClone(s),
      old = s.activeBusiness,
      b = makeBackup(s, workspace);
    restoreSeparate(s, parseBackup(JSON.stringify(b)));
    expect(s.businesses).toHaveLength(2);
    expect(s.activeBusiness).not.toBe(old);
    expect(financials(s, old)).toEqual(financials(original, old));
    expect(financials(s, s.activeBusiness)).toEqual(financials(original, old));
    expect(() => validateBusinessState(s)).not.toThrow();
    expect(new Set(s.journals.map((r) => r.id)).size).toBe(s.journals.length);
  });
  it("rejects incompatible or cross-business backups", () => {
    const s = seedBusiness(),
      b = makeBackup(s, workspace);
    expect(() => parseBackup(JSON.stringify({ ...b, version: 99 }))).toThrow();
    b.businessId = "OTHER";
    expect(() => parseBackup(JSON.stringify(b))).toThrow();
  });
  it("rejects corrupt journal arithmetic without touching the ledger", () => {
    const s = seedBusiness(),
      b = makeBackup(s, workspace),
      before = JSON.stringify(s);
    b.ledger.journals[0].lines[0].debit++;
    expect(() => parseBackup(JSON.stringify(b))).toThrow();
    expect(JSON.stringify(s)).toBe(before);
  });
  it("blocks backup from restricted roles", () => {
    const s = seedBusiness();
    s.role = "staff";
    expect(() => makeBackup(s, workspace)).toThrow();
  });
  it("saves forecasts separately without ledger mutations and detects staleness", () => {
    const s = seedBusiness(),
      before = JSON.stringify(s);
    const a = saveScenario(s, "Expected", 0, 7),
      b = saveScenario(s, "Stress", -0.3, 30);
    expect(a.result.days).toHaveLength(30);
    expect(a.baseline).toBe(fingerprint(s, s.activeBusiness));
    expect(JSON.stringify(s)).toBe(before);
    expect(b.result.assumptions.salesChange).toBe(-0.3);
    s.journals[0].memo += " updated";
    expect(a.baseline).not.toBe(fingerprint(s, s.activeBusiness));
  });
  it("does not invent notifications for an empty business", () => {
    expect(notifications(emptyState(), [])).toEqual([]);
  });
  it("validates task fields and never accepts a blank title", () => {
    expect(() => taskSchema.parse({ title: "" })).toThrow();
  });
});
import { get, set } from "idb-keyval";
import { useWorkspace4, validateWorkspace4 } from "./workspace4";
it("never persists defaults over a workspace that is still restoring", async () => {
  useWorkspace4.setState({
    data: structuredClone(workspace),
    ready: false,
    error: "",
    busy: false,
  });
  vi.mocked(set).mockReset().mockResolvedValue(undefined);
  expect(
    await useWorkspace4.getState().write((d) => {
      d.prefs.nav = "closed";
    }),
  ).toBe(false);
  expect(set).not.toHaveBeenCalled();
});
it("serializes concurrent workspace saves without lost updates", async () => {
  useWorkspace4.setState({
    data: structuredClone(workspace),
    ready: true,
    error: "",
    busy: false,
  });
  vi.mocked(set).mockReset().mockResolvedValue(undefined);
  const a = useWorkspace4.getState().write((d) => {
    d.prefs.first = "saved";
  });
  const b = useWorkspace4.getState().write((d) => {
    d.prefs.second = "saved";
  });
  expect(await Promise.all([a, b])).toEqual([true, true]);
  expect(useWorkspace4.getState().data.prefs).toEqual({
    first: "saved",
    second: "saved",
  });
});
it("restores workspace before enabling writes and preserves stored preferences", async () => {
  useWorkspace4.setState({
    data: structuredClone(workspace),
    ready: false,
    error: "",
    busy: false,
  });
  vi.mocked(get).mockResolvedValueOnce({
    ...workspace,
    prefs: { density: "Compact" },
  });
  await useWorkspace4.getState().hydrate();
  expect(useWorkspace4.getState().data.prefs.density).toBe("Compact");
  expect(useWorkspace4.getState().ready).toBe(true);
});
it("failed workspace persistence leaves the visible source unchanged and recovers only after validation", async () => {
  useWorkspace4.setState({
    data: structuredClone(workspace),
    ready: true,
    error: "",
    busy: false,
  });
  vi.mocked(set).mockRejectedValueOnce(new Error("Quota exceeded"));
  expect(
    await useWorkspace4.getState().write((d) => {
      d.prefs.unsaved = "x";
    }),
  ).toBe(false);
  expect(useWorkspace4.getState().data.prefs).toEqual({});
  expect(useWorkspace4.getState().error).toContain("Quota");
  vi.mocked(get).mockResolvedValueOnce({
    ...workspace,
    prefs: { density: "Compact" },
  });
  vi.mocked(set).mockResolvedValueOnce(undefined);
  expect(await useWorkspace4.getState().recover()).toBe(true);
  expect(useWorkspace4.getState().error).toBe("");
});
it("rejects invalid workspace snapshots and prototype keys in backups", () => {
  expect(() =>
    validateWorkspace4({
      ...workspace,
      scenarios: [{ id: "x", businessId: "b" }] as never[],
    }),
  ).toThrow();
  expect(() => parseBackup('{"__proto__":{"polluted":true}}')).toThrow(
    "Unsafe backup key",
  );
});
import { seedOperationsExamples } from "./fixtures3";
it("restores payroll, returns and credits with identical financial totals and independent source identifiers", () => {
  const s = seedBusiness();
  const c = { businessId: s.activeBusiness, role: s.role, actor: "Demo owner" };
  seedOperationsExamples(s, c);
  const originalId = s.activeBusiness;
  const original = financials(s, originalId);
  const b = parseBackup(JSON.stringify(makeBackup(s, workspace)));
  restoreSeparate(s, b);
  expect(financials(s, s.activeBusiness)).toEqual(original);
  expect(financials(s, originalId)).toEqual(original);
  expect(() => validateBusinessState(s)).not.toThrow();
  expect(
    s.employees.filter((e) => e.businessId === s.activeBusiness),
  ).toHaveLength(3);
  expect(new Set(s.returns.map((r) => r.id)).size).toBe(s.returns.length);
});
it("employee search grants and confidential queues are based on actual populated records", () => {
  const s = seedBusiness();
  seedOperationsExamples(s, {
    businessId: s.activeBusiness,
    role: s.role,
    actor: "Demo owner",
  });
  expect(searchRecords(s, "Meera").some((r) => r.type === "Employee")).toBe(
    true,
  );
  s.role = "staff";
  expect(searchRecords(s, "Meera")).toEqual([]);
  s.role = "manager";
  expect(searchRecords(s, "Meera")).toEqual([]);
});
it("collection count metadata catches a truncated backup before restoration", () => {
  const s = seedBusiness(),
    b = makeBackup(s, workspace);
  b.ledger.journals.pop();
  expect(() => parseBackup(JSON.stringify(b))).toThrow();
});
import { answerWorkspace4 } from "./workspace4";
it("answers supported stock queries with source records and declines unsupported queries without actions", () => {
  const s = seedBusiness();
  s.items[0].reorderLevel = 999;
  const before = JSON.stringify(s);
  const r = answerWorkspace4(s, "Which stock items are low?");
  expect(r.sources).toContain(s.items[0].id);
  expect(r.text).toContain("configured reorder threshold");
  expect(answerWorkspace4(s, "Predict next election").text).toContain(
    "unsupported",
  );
  expect(JSON.stringify(s)).toBe(before);
});
it("preserves and remaps business-specific view preferences on separate restore", () => {
  const s = seedBusiness(),
    id = s.activeBusiness;
  const b = makeBackup(s, {
    ...workspace,
    prefs: { ["pulse:" + id + ":owner"]: "tasks" },
  });
  const restored = restoreSeparate(s, parseBackup(JSON.stringify(b)));
  expect(
    restored.workspace.preferences?.["pulse:" + restored.businessId + ":owner"],
  ).toBe("tasks");
  expect(
    restored.workspace.preferences?.["pulse:" + id + ":owner"],
  ).toBeUndefined();
});
it("restores maximum-length business names without invalidating their schema", () => {
  const s = seedBusiness();
  s.businesses[0].name = "A".repeat(90);
  const b = makeBackup(s, workspace);
  expect(() =>
    restoreSeparate(s, parseBackup(JSON.stringify(b))),
  ).not.toThrow();
  expect(s.businesses.at(-1)!.name.length).toBeLessThanOrEqual(90);
});
it.each([
  "statement opening",
  "item price",
  "document item",
  "statement journal",
])("rejects malformed %s before restoring any financial records", (kind) => {
  const s = seedBusiness(),
    b = makeBackup(s, workspace),
    before = JSON.stringify(s);
  if (kind === "statement opening")
    b.ledger.statementOpening[b.businessId] = "invalid" as never;
  if (kind === "item price") b.ledger.items[0].price = -1;
  if (kind === "document item")
    b.ledger.documents[0].lines[0].itemId = "missing-stock-source";
  if (kind === "statement journal")
    b.ledger.statements[0].journalIds = ["missing-journal-source"];
  expect(() => parseBackup(JSON.stringify(b))).toThrow();
  expect(JSON.stringify(s)).toBe(before);
});
