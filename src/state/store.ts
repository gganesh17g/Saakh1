import { create } from "zustand";
import { get, set } from "idb-keyval";
import { profiles } from "../fixtures/borrowers";
import {
  defaultSources,
  type Borrower,
  type Sources,
  type Run,
} from "../domain/model";
import { simulate } from "../engines";
type State = {
  borrowers: Borrower[];
  selected: string;
  sources: Sources;
  runs: Run[];
  current: Run;
  status: string;
  progress: number;
  error: string;
  hydrated: boolean;
  notes: Record<string, string>;
  setBorrowers: (b: Borrower[]) => void;
  select: (id: string) => void;
  setSources: (s: Sources) => void;
  run: (b: Borrower, attack?: string) => Promise<void>;
  cancel: () => void;
  restore: (r: Run) => void;
  note: (id: string, n: string) => void;
  hydrate: () => Promise<void>;
};
let token = 0;
export const useStore = create<State>((setState, getState) => ({
  borrowers: profiles,
  selected: profiles[0].id,
  sources: defaultSources,
  runs: [],
  current: simulate(
    profiles[0],
    defaultSources,
    "",
    "2026-10-26T00:00:00.000Z",
  ),
  status: "pending",
  progress: 0,
  error: "",
  hydrated: false,
  notes: {},
  setBorrowers: (borrowers) => {
    setState({ borrowers });
    void set("borrowers", borrowers);
  },
  select: (selected) => setState({ selected }),
  setSources: (sources) => setState({ sources }),
  cancel: () => {
    token++;
    setState({ status: "cancelled" });
  },
  run: async (b, attack = "") => {
    if (getState().status === "running") return;
    const mine = ++token;
    setState({ status: "running", progress: 0, error: "" });
    try {
      const output = simulate(b, getState().sources, attack);
      for (let i = 0; i < output.audit.length; i++) {
        await new Promise((r) => setTimeout(r, 45));
        if (token !== mine) return;
        setState({ progress: i + 1 });
      }
      const runs = [
        output,
        ...getState().runs.filter((r) => r.id !== output.id),
      ].slice(0, 50);
      await set("runs", runs);
      if (token !== mine) return;
      setState({
        runs,
        current: output,
        status: output.score === null ? "insufficient-data" : "completed",
      });
    } catch (e) {
      setState({ status: "error", error: String(e) });
    }
  },
  restore: (current) =>
    setState({
      current,
      selected: current.borrower.id,
      sources: current.sources,
      status: "completed",
    }),
  note: (id, n) => {
    const notes = { ...getState().notes, [id]: n };
    setState({ notes });
    void set("notes", notes);
  },
  hydrate: async () => {
    try {
      const [runs, borrowers, notes] = await Promise.all([
        get<Run[]>("runs"),
        get<Borrower[]>("borrowers"),
        get<Record<string, string>>("notes"),
      ]);
      setState({
        runs: runs || [],
        borrowers: borrowers || profiles,
        notes: notes || {},
        ...(runs?.length
          ? {
              current: runs[0],
              selected: runs[0].borrower.id,
              sources: runs[0].sources,
              status: "completed",
            }
          : {}),
        hydrated: true,
      });
    } catch (e) {
      setState({
        hydrated: true,
        error: `Local storage unavailable: ${String(e)}`,
      });
    }
  },
}));
