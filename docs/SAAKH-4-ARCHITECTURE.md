# Saakh 4.0 architecture

React 19, strict TypeScript, Vite, React Router (production HashRouter), Zustand, IndexedDB/idb-keyval, Zod, Recharts, R3F/Three/Drei, Lucide, jsPDF, existing Vitest/RTL/Playwright tooling. No new runtime dependency was introduced.

## Source boundaries

- Existing `accounting.ts`, `operations3.ts`, `analytics.ts` and credit engines retain all posting and calculation authority.
- `workspace4.ts`: permissions for destinations, task validation, read-only search/notification selectors, forecast snapshot generation, validated workspace persistence, backup/restore functions. Business financial writes still use the original atomic clone → validation → IndexedDB save → visible-state pipeline.
- `Workspace4.tsx`: connected shell tools and screens; no alternate journal or lender-scoring implementation.
- `view4.ts`: URL-authoritative filters with preferences scoped by business, role, module and key.
- `Drawer4.tsx`: native modal customer panel. Existing components and financial forms are reused.
- `workspace4.css`: scoped visual tokens, touch navigation, mobile record cards, density and comfort rules.

## Persistence

`saakh-business-v1` remains the original compatible v2 ledger key. `saakh-workspace-v4` contains version-1 tasks, scenario snapshots, eligible unfinished drafts, read markers and preferences. Writes wait for hydration and run through one promise queue. A failed save preserves the last committed visible snapshot and blocks further writes until explicit verified recovery.

Restoration stores its workspace archive inside the same committed ledger snapshot (`workspaceRestores4`) before synchronizing into the separate workspace key. This prevents a second-store failure from silently losing imported tasks/scenarios/drafts. All imported records receive new identifiers, with source references remapped. Financial and workspace stores remain local to the same browser origin; there is no cross-tab/distributed transaction protocol.
