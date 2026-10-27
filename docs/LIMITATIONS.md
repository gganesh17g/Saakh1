# Limits and deployment considerations

This is a functional demonstration prototype, not a production lending platform, real credit rating, validated forecaster or fraud determination service. No RBI compliance, approval or certification is claimed. No financial advice or lending decisions are made.

- Synthetic sample size is three base businesses, with deterministic six-counterparty graphs. Rules, scoring weights, seasonal amplitudes and risk bands are illustrative and uncalibrated.
- Forecast bands are assumption envelopes, not statistical confidence intervals. Delay uses a liquidity haircut instead of invoice-level collection timing. Cash dates are an invented cadence. No taxes, interest calculation, loan disbursement, amortization, or loan pricing is modeled.
- AA and ULI toggles supply context only. Enabling them does not create a consent artefact or verify data. Forecasts with missing evidence remain hypothetical and are labeled.
- Time machine updates period readings and flow highlights, not historical graph topology. Source confidence is a coverage grid, not validated confidence.
- Reports offer print/save-PDF via browser, not a bundled PDF generation library. Stage replay is an inspection aid. JSON export supports reproducibility but no import UI exists.
- Storage has no authentication, encryption, multi-user permissions, synchronization, tamper protection, or formal migration. Keep only synthetic data. Browser clearing removes history. IDs are deterministic non-cryptographic hashes.
- WebGL2 detection and SVG fallback cover common unsupported devices. Hardware-specific WebGL context loss may still require reloading. WebGL bundle size remains substantial. No FPS promise is made.
- Guided demo has a checkpoint guide and an interactive overlay linked to live routes. Unsaved comparison cards and economics assumptions reset when their route remounts.
- General accessibility and keyboard flows have targeted tests; this is not a WCAG certification or exhaustive assistive-technology audit. Chromium is the tested browser.

## Research sources reviewed 26 October 2026

- Navadhan positioning: https://www.navadhan.com/ — small-business inclusion and technology inspiration only; no content/assets copied.
- RBI Digital Lending Directions, 8 May 2025: https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12848&Mode=0
- RBI reports index, FREE-AI Committee Report, August 2025: https://m.rbi.org.in/scripts/bs_viewpublicationreport.aspx
- MeitY DPDP Rules 2025 and enforcement timeline: https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025%3B
- Government DFS Account Aggregator framework: https://financialservices.gov.in/node/4278

These sources provide context only. Saakh makes no specific legal applicability assertion. A future real-data service requires current legal review, applicable phased commencement checks, security design, purpose-limited consent, representative model evaluation, fairness analysis, incident handling and governance.

## Recommended improvements

Invoice-level dated payment/collection models; stronger availability semantics and external evidence validation; schema migrations/import; WebGL context recovery and broader hardware profiling; browser/a11y audits; persistent scenario bookmarks; decomposed route bundles; validated financial methodology before any real-world evaluation.
