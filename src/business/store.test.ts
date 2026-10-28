import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { get, set, del } from "idb-keyval";
import { useBusiness } from "./store";
import { seedBusiness } from "./fixtures";
import { emptyState } from "./model";
import { manual, financials } from "./accounting";
vi.mock("idb-keyval", () => ({ get: vi.fn(), set: vi.fn(), del: vi.fn() }));
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-27T12:00:00Z"));
  vi.mocked(get).mockReset();
  vi.mocked(set).mockReset().mockResolvedValue(undefined);
  vi.mocked(del).mockReset().mockResolvedValue(undefined);
  useBusiness.setState({
    data: seedBusiness(),
    ready: true,
    recovery: "",
    busy: false,
    error: "",
    notice: "",
  });
});
afterEach(() => vi.useRealTimers());
it("atomic commit does not expose failed drafts or failed persistence", async () => {
  const before = structuredClone(useBusiness.getState().data);
  expect(
    await useBusiness.getState().commit("bad", (s) => {
      s.businesses[0].name = "mutated";
      throw new Error("rejected");
    }),
  ).toBe(false);
  expect(useBusiness.getState().data).toEqual(before);
  vi.mocked(set).mockRejectedValueOnce(new Error("Quota exceeded"));
  expect(
    await useBusiness.getState().commit("save", (s) => {
      s.businesses[0].name = "unsaved";
    }),
  ).toBe(false);
  expect(useBusiness.getState().data).toEqual(before);
  expect(useBusiness.getState().error).toBe("Quota exceeded");
});
it("commits balanced journal only after successful save, then restores", async () => {
  const before = financials(
    useBusiness.getState().data,
    "BIZ-SYNTHETIC-01",
  ).cash;
  await useBusiness.getState().commit("capital", (s, c) =>
    manual(s, c, {
      kind: "Owner capital",
      amount: 10000,
      date: "2026-10-27",
      memo: "synthetic capital",
      account: "bank",
      confirmed: true,
    }),
  );
  expect(financials(useBusiness.getState().data, "BIZ-SYNTHETIC-01").cash).toBe(
    before + 10000,
  );
  const saved = useBusiness.getState().data;
  expect(set).toHaveBeenCalledWith("saakh-business-v1", saved);
  vi.mocked(get).mockResolvedValue(saved);
  useBusiness.setState({ data: emptyState(), ready: false });
  await useBusiness.getState().hydrate();
  expect(useBusiness.getState().data).toEqual(saved);
});
it("blocks concurrent mutations until the first persistence completes", async () => {
  let finish: () => void = () => {};
  vi.mocked(set).mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  const first = useBusiness.getState().commit("first", (s) => {
    s.businesses[0].name = "First saved";
  });
  expect(
    await useBusiness.getState().commit("second", (s) => {
      s.businesses[0].name = "Overwritten";
    }),
  ).toBe(false);
  finish();
  await first;
  expect(useBusiness.getState().data.businesses[0].name).toBe("First saved");
});
it("deletion touches only owned records and requires typed confirmation", async () => {
  expect(await useBusiness.getState().deleteData("yes")).toBe(false);
  expect(del).not.toHaveBeenCalled();
  expect(await useBusiness.getState().deleteData("DELETE")).toBe(true);
  expect(useBusiness.getState().data.businesses).toHaveLength(0);
  expect(vi.mocked(del).mock.calls.map((c) => c[0])).toEqual([
    "runs",
    "borrowers",
    "notes",
  ]);
  expect(set).toHaveBeenCalledWith("saakh-business-v1", emptyState());
});
it("corrupt persisted data is surfaced without silently seeding", async () => {
  vi.mocked(get).mockResolvedValue({ version: 99 });
  useBusiness.setState({ ready: false, data: emptyState() });
  await useBusiness.getState().hydrate();
  expect(useBusiness.getState().error).toContain(
    "no data was silently replaced",
  );
  expect(set).not.toHaveBeenCalled();
});

it("staff view cannot remove local ledger records", async () => {
  useBusiness.setState({
    data: { ...useBusiness.getState().data, role: "staff" },
  });
  expect(await useBusiness.getState().deleteData("DELETE")).toBe(false);
  expect(useBusiness.getState().error).toContain("does not allow settings");
  expect(del).not.toHaveBeenCalled();
});
it("invalid restore offers recovery and blocks writes without overwriting the original", async () => {
  const invalid = { version: 99, privateDemo: "original synthetic record" };
  vi.mocked(get).mockResolvedValue(invalid);
  useBusiness.setState({ ready: false });
  await useBusiness.getState().hydrate();
  expect(useBusiness.getState().recovery).toContain(
    "original synthetic record",
  );
  expect(
    await useBusiness.getState().commit("unsafe replacement", () => {}),
  ).toBe(false);
  expect(set).not.toHaveBeenCalled();
});
