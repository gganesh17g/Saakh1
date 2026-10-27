# Architecture

React 19 + strict TypeScript + Vite 6. Tailwind 4 is integrated with custom design tokens and responsive accessible native controls. React Router separates the public site and workspace. Workspace code and the WebGL module load separately. Recharts presents calculated ledgers; React Three Fiber/Drei/Three render the actual graph. Lucide supplies icons. Zod validates borrowers. Zustand coordinates state; idb-keyval persists IndexedDB records.

## Data flow

Borrower form → Zod validation → immutable input/source snapshot → score → graph checks → monthly forecast → daily ledger → recommendations → audit stages → IndexedDB save → shared current run. Pages use the shared current run. Draft scenario comparisons are independent immutable runs and do not overwrite it.

The engines calculate synchronously. A short cancellable stage replay communicates pipeline stages before awaiting persistence; it is explicitly described as replay, not fabricated live model activity. Concurrent calls are blocked. Cancellation invalidates the run token. Lifecycle states: pending, running, cancelled, completed, insufficient-data, error. Storage failures surface as errors.

## Reproducibility and persistence

`saakh-1.2.0/formulas-1` versions the formulas. FNV-style deterministic identifier hashes the borrower, source configuration, attack name and version; timestamp is excluded. IDs are identifiers, not cryptographic hashes or integrity guarantees. An identical scenario replaces its existing history entry; maximum 50 distinct snapshots are retained. Exports include all current inputs and outputs, scenario, version and timestamp.

IndexedDB keys: runs, borrowers, notes. Theme uses localStorage. No account, authorization boundary, encryption, server, analytics or live integration. Export before clearing site data. There is no import or migration tool in this baseline.

## Graphics and performance

Graph positions derive from stable fixture node order; edges derive from invoice/transaction records. Edges and nodes support click inspection and equivalent keyboard buttons. Camera orbit/zoom, pause, reset, fullscreen and relationship filters are exposed. DPR is capped at 1.5. Small geometries limit complexity. React Three Fiber disposes owned geometry/material objects on unmount. Motion preferences initialize pause. An SVG alternative is selected when WebGL2 is unavailable or manually requested.

No measured FPS target is claimed. The 3D bundle is relatively large and hardware context loss recovery remains future work. See test report for measured checks.


## Business workspace extension (2026-10-27)

`src/business` adds a separate tested domain, accounting/forecasting services, fixtures, import/export adapters, Zustand snapshot store and lazy React workspace. UI invokes store commits, pure services create journal evidence, then IndexedDB persistence succeeds before state publication. Original credit models/engines remain unchanged. Production security is a documented plan in PRODUCTION-SECURITY-ARCHITECTURE.md, not a deployed backend.
