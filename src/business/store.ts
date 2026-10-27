import { create } from "zustand";
import { get, set, del } from "idb-keyval";
import {
  type BusinessState,
  type Context,
  type Role,
  emptyState,
  businessSchema,
  journalSchema,
  documentInput,
  moneySchema,
  dateSchema,
  authorize,
} from "./model";
import { seedBusiness } from "./fixtures";
import { due } from "./accounting";
import { useStore as useCreditStore } from "../state/store";
import { profiles } from "../fixtures/borrowers";
import { defaultSources } from "../domain/model";
import { simulate } from "../engines";
const KEY = "saakh-business-v1";
export function validateBusinessState(s: BusinessState) {
  if (
    s.version !== 1 ||
    !Array.isArray(s.businesses) ||
    !Array.isArray(s.journals) ||
    !Number.isSafeInteger(s.sequence)
  )
    throw new Error("Unsupported local ledger format");
  for (const [key, value] of Object.entries(emptyState()))
    if (Array.isArray(value) && !Array.isArray(s[key as keyof BusinessState]))
      throw new Error("Missing local ledger collection: " + key);
  const ids = new Set(s.businesses.map((b) => b.id));
  if (s.activeBusiness && !ids.has(s.activeBusiness))
    throw new Error("Selected business does not exist");
  for (const [key, value] of Object.entries(s))
    if (Array.isArray(value) && key !== "businesses")
      for (const row of value as { businessId: string }[])
        if (!ids.has(row.businessId))
          throw new Error("Stored record is outside a known business");
  s.businesses.forEach((b) => businessSchema.parse(b));
  s.journals.forEach((j) => journalSchema.parse(j));
  s.documents.forEach((d) => {
    documentInput.parse(d);
    if (
      !s.parties.some(
        (p) => p.id === d.partyId && p.businessId === d.businessId,
      )
    )
      throw new Error("Document party belongs to another business");
    if (due(s, d) < 0)
      throw new Error("Stored document has a negative outstanding balance");
  });
  for (const payment of [...s.payments, ...s.credits]) {
    moneySchema.positive().parse(payment.amount);
    dateSchema.parse(payment.date);
    if (
      !s.documents.some(
        (d) =>
          d.id === payment.documentId && d.businessId === payment.businessId,
      ) ||
      !s.journals.some(
        (j) =>
          j.id === payment.journalId && j.businessId === payment.businessId,
      )
    )
      throw new Error("Payment source is outside its business");
  }
  for (const credit of s.credits) {
    moneySchema.parse(credit.refundAmount || 0);
    if ((credit.refundAmount || 0) > credit.amount)
      throw new Error("Refund exceeds credit");
  }
  return s;
}
type Store = {
  data: BusinessState;
  ready: boolean;
  busy: boolean;
  error: string;
  notice: string;
  hydrate: () => Promise<void>;
  commit: (
    label: string,
    fn: (draft: BusinessState, context: Context) => void,
  ) => Promise<boolean>;
  setRole: (role: Role) => Promise<void>;
  clearError: () => void;
  deleteData: (confirmation: string) => Promise<boolean>;
};
export const useBusiness = create<Store>((update, state) => ({
  data: emptyState(),
  ready: false,
  busy: false,
  error: "",
  notice: "",
  hydrate: async () => {
    if (state().ready) return;
    try {
      const stored = await get<BusinessState>(KEY);
      const data = stored ? validateBusinessState(stored) : seedBusiness();
      if (!stored) await set(KEY, data);
      update({ data, ready: true });
    } catch (e) {
      update({
        ready: true,
        error: `Could not restore the local ledger: ${String(e)}. Export what is available or use the explicit reset control; no data was silently replaced.`,
      });
    }
  },
  commit: async (label, fn) => {
    if (state().busy) {
      update({ error: "Another local save is running. Wait before retrying." });
      return false;
    }
    update({ busy: true, error: "", notice: "" });
    try {
      const draft = structuredClone(state().data),
        c = {
          businessId: draft.activeBusiness,
          role: draft.role,
          actor: `Demo ${draft.role}`,
        };
      fn(draft, c);
      validateBusinessState(draft);
      await set(KEY, draft);
      update({ data: draft, busy: false, notice: label + " · saved locally" });
      return true;
    } catch (e) {
      update({
        busy: false,
        error: e instanceof Error ? e.message : String(e),
      });
      return false;
    }
  },
  setRole: async (role) => {
    await state().commit("Demo identity view changed", (s) => {
      s.role = role;
    });
  },
  clearError: () => update({ error: "", notice: "" }),
  deleteData: async (confirmation) => {
    if (confirmation !== "DELETE") {
      update({
        error: "Type DELETE to confirm deletion of saved Saakh demo records.",
      });
      return false;
    }
    try {
      const current = state().data;
      if (current.businesses.length)
        authorize(current, contextFor(current), "settings");
      if (state().busy)
        throw new Error("Wait for the current save before deleting records");
      await set(KEY, emptyState());
      await Promise.all(["runs", "borrowers", "notes"].map((k) => del(k)));
      useCreditStore.getState().cancel();
      useCreditStore.setState({
        runs: [],
        notes: {},
        borrowers: profiles,
        selected: profiles[0].id,
        sources: defaultSources,
        current: simulate(profiles[0], defaultSources),
        status: "pending",
        progress: 0,
        error: "",
        hydrated: true,
      });
      update({
        data: emptyState(),
        ready: true,
        error: "",
        notice:
          "Saved Saakh records removed. Fixed synthetic examples remain available in Credit Intelligence.",
      });
      return true;
    } catch (e) {
      update({ error: String(e) });
      return false;
    }
  },
}));
export function contextFor(s: BusinessState): Context {
  return {
    businessId: s.activeBusiness,
    role: s.role,
    actor: `Demo ${s.role}`,
  };
}
