# Validation report · 26 October 2026

## Executed checks

| Check                           | Actual result                                                              |
| ------------------------------- | -------------------------------------------------------------------------- |
| Environment                     | Empty target confirmed; Node 26.11.1, npm 11.20.0, Python 3.14.7           |
| Development server              | Vite started successfully on port 5173                                     |
| Strict TypeScript               | `npm run typecheck` passed                                                 |
| ESLint                          | `npm run lint` passed, no errors                                           |
| Production build                | `npm run build` passed; Vite 6.4.5; 2,838 transformed modules              |
| Vitest                          | 3 files, **28 tests passed**; final run 1.97 seconds                       |
| Browser acceptance              | **13 tests passed**, Chromium; approximately 1.1 minutes                   |
| Production preview              | Vite preview started on port 4173                                          |
| Built-production browser checks | **2 tests passed** in 7.1 seconds: full journey and final dark screenshots |

Commands were executed, failures were repaired, and relevant checks were rerun. Earlier discovered failures included missing icon imports, generated-bundle lint exclusions, DOM-label cleanup on WebGL unmount, and Node 26 component-test storage setup. Final runs passed. Browser history persistence is tested with real IndexedDB; lifecycle failure tests mock persistence to exercise quota/error paths.

## Coverage

- Score weights, boundaries, debt/delay sensitivity, missing-data suppression and zero debt.
- Deterministic forecasts, horizon length, category rules and daily ledger balance/totals.
- Graph identifiers, reciprocal/similar-value/volume rules and six Attack Lab scenarios.
- Financial input validation, reproducible IDs/snapshots, CSV metadata and JSON serialization.
- Lender impact arithmetic, no duplicate benefits and zero denominators.
- Duplicate concurrent-run prevention, cancellation, input/storage failures and hydration.
- Public landing → Anjali Foods → simulation → factor X-ray → invoice evidence → notes → circular invoicing and seasonal shock → all six regressions → economics → report download → refresh/history restoration.
- Custom borrower duplication/deletion, draft comparison, validation, insufficient evidence and notes after refresh.
- Theme persistence, reduced motion, keyboard graph inspection, SVG alternative and story-overlay route checkpoints.
- WebGL drag rotation, wheel zoom, camera reset and pause/resume.

## Responsive validation

Rendered content was checked at **1440, 1280, 1024, 768, 390 and 360 pixels**. Each width visited landing, Overview, Generate Simulation, Verify & Investigate, Attack Lab and Impact Dashboard. All six width tests passed document-width checks without horizontal overflow. Overview screenshots were captured, with final dark product views also captured against the built production preview. Desktop light and dark layouts were visually inspected; a mobile landing view was also inspected. This is targeted validation, not exhaustive device certification.

## Measured performance and bundle sizes

Local development-server Chromium headless run, 1280×720 viewport, software WebGL, concurrent test workload:

| Route    | First contentful paint | Heading + graph canvas readiness |
| -------- | ---------------------: | -------------------------------: |
| Landing  |                 592 ms |                         3,322 ms |
| Overview |                 556 ms |                         1,594 ms |

These are one local measurement per route, not mobile hardware benchmarks, production-network measurements, averages or FPS claims. Raw metrics are included with delivered outputs. Lazy loading reduced the initial application chunk from about 771 KB to **353.31 KB** (108.04 KB gzip). Charts load separately: **418.51 KB** (112.82 KB gzip). The WebGL chunk remains **919.76 KB** (248.33 KB gzip), generating a build-size advisory. Total dist directory is approximately 1.8 MB. DPR is capped and reduced on small/low-concurrency devices; paused rendering uses demand mode.

## Acceptance and limits

Source exists directly in `/home/thunder/shared/Saakh`, with all required documentation, lockfile, scripts and source folders. All five primary areas and secondary screens are functional. No known blocking main-flow runtime error remains after the final production journey. Engines, borrower management, scenario comparison, investigation, economics, local history, exports and guided story were exercised.

This remains a synthetic demonstration. Time machine does not reconstruct historical graph topology; confidence is coverage, not accuracy; bands are illustrative; story steps guide live operations; PDF is browser print/save-PDF; no real bank/AA/ULI integration or secure multi-user account exists. Real-world predictive validity, comprehensive accessibility, cross-browser support, dependency security and real-device performance have not been certified. See LIMITATIONS.md and FINANCIAL-METHODOLOGY.md.

A final arithmetic-invariant test additionally verifies that largest-counterparty concentration matches the three-buyer graph and rejects shares below one third. Static checks, all 28 unit/component/state tests, production build, and both production browser checks passed again after this validation change.
