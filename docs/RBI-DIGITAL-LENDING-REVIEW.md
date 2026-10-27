# RBI digital lending readiness review

Review date: 27 October 2026. Source: [RBI Digital Lending Directions, May 8, 2025](https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12848&Mode=0). Binding directions apply to the regulated entities described in paragraph 3 and their relevant arrangements; this local educational demo is not represented as an RE or contracted LSP. Whether proposed future activities constitute LSP functions requires role-specific legal review. No later-amendment completeness claim is made.

| Source paragraph | Engineering implication for a future service | Current demo / gap |
|---|---|---|
| 2, 3, 4 | Confirm commencement, eligible entity, DLA/LSP definitions and actual functions | No real lending; sample calculations only. Role determination pending. |
| 5 | RE due diligence, documented agreement and accountable oversight before LSP work | No RE contract, partner due diligence or live service. Blocked pending partner/legal work. |
| 6 | Multi-lender views need consistent matching, objective comparison and required disclosures | Compares synthetic rate methods only; no lender matching, commissions or ranked live offers. Not a compliant offer marketplace. |
| 7, 8 | Credit assessment records, borrower disclosures and KFS workflow must be designed with lender | Explicit assumptions and local audit help demo explainability; no KFS/APR, sanction or automated approval. |
| 9 | Design permitted borrower/RE flows; do not turn app ledger entries into custody or third-party payment routing | No actual funds move. Recorded synthetic loans do not disburse anything. |
| 10, 11 | Partner-owned cooling-off and accountable grievance workflows | No loan contract or regulated grievance officer. Public copy explicitly discloses unavailable support service. |
| 12–15 | Purpose-limited data collection/sharing, consent choices, storage/privacy/security obligations | Local purpose/scope/recipient/expiry/revoke, minimization and audit are demo controls. No verified production storage, India-location controls, incident response or server security. |
| 16, 17 | RE reporting responsibilities and DLA reporting/marketing restrictions | No CIC reporting or claim of RBI listing/endorsement. |

The source states paragraph 6 operates from Nov 1, 2025 and paragraph 17 from Jun 15, 2025, with other provisions initially immediate. That statement does not substitute for checking subsequent directions and the proposed business model before launch.

Production gate: identify actual role and lender(s), obtain contractual/legal review, implement authenticated backend and data controls, verify disclosures and complaint routes, then independently test consent, data sharing, callbacks, status integrity and prohibited fund flows. Browser scenario-test passes do not establish regulatory compliance or underwriting accuracy.
