import { beforeEach, afterEach, describe, it, expect, vi } from "vitest";
import { get, set } from "idb-keyval";
import { useStore } from "./store";
import { profiles } from "../fixtures/borrowers";
import { defaultSources } from "../domain/model";
import { simulate } from "../engines";
vi.mock("idb-keyval", () => ({
  get: vi.fn(),
  set: vi.fn().mockResolvedValue(undefined),
}));
beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(set).mockReset().mockResolvedValue(undefined);
  vi.mocked(get).mockReset();
  useStore.getState().cancel();
  useStore.setState({
    borrowers: profiles,
    selected: "anjali",
    sources: defaultSources,
    runs: [],
    current: simulate(profiles[0], defaultSources),
    status: "pending",
    progress: 0,
    error: "",
    notes: {},
  });
});
afterEach(() => vi.useRealTimers());
describe("Simulation lifecycle and persistence", () => {
  it("blocks duplicate concurrent runs and persists a completed snapshot", async () => {
    const first = useStore.getState().run(profiles[0]);
    const second = useStore.getState().run(profiles[1]);
    await vi.advanceTimersByTimeAsync(500);
    await Promise.all([first, second]);
    expect(useStore.getState().runs).toHaveLength(1);
    expect(useStore.getState().current.borrower.id).toBe("anjali");
    expect(useStore.getState().status).toBe("completed");
    expect(set).toHaveBeenCalledWith("runs", expect.any(Array));
  });
  it("cancels without recording a run", async () => {
    const pending = useStore.getState().run(profiles[0]);
    useStore.getState().cancel();
    await vi.advanceTimersByTimeAsync(500);
    await pending;
    expect(useStore.getState().status).toBe("cancelled");
    expect(useStore.getState().runs).toHaveLength(0);
    expect(set).not.toHaveBeenCalled();
  });
  it("surfaces invalid input and persistence errors honestly", async () => {
    await useStore.getState().run({ ...profiles[0], revenue: -1 });
    expect(useStore.getState().status).toBe("error");
    vi.mocked(set).mockRejectedValueOnce(new Error("Storage quota exceeded"));
    const pending = useStore.getState().run(profiles[0]);
    await vi.advanceTimersByTimeAsync(500);
    await pending;
    expect(useStore.getState().error).toContain("Storage quota exceeded");
    expect(useStore.getState().runs).toHaveLength(0);
  });
  it("restores history, profiles, notes and source configuration", async () => {
    const run = simulate(profiles[1], { ...defaultSources, aa: true });
    vi.mocked(get).mockImplementation(async (key) =>
      key === "runs"
        ? [run]
        : key === "borrowers"
          ? profiles
          : { [run.id]: "Reviewed" },
    );
    await useStore.getState().hydrate();
    expect(useStore.getState().current.id).toBe(run.id);
    expect(useStore.getState().selected).toBe("ramesh");
    expect(useStore.getState().sources.aa).toBe(true);
    expect(useStore.getState().notes[run.id]).toBe("Reviewed");
  });
});
