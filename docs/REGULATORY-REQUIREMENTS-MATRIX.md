# Regulatory requirements matrix

Review date: 27 October 2026. Status values describe technical readiness, not legal compliance. Applicability to Saakh’s future role remains subject to qualified review. Official links and publication/access/commencement details are in REGULATORY-RESEARCH-SOURCES.md. Local educational use is the actual implemented scope; regulated services are disabled.

| Source / clause | Required behavior / applicability | Affected module | Existing implementation / gap | Status | External dependency / validation |
|---|---|---|---|---|---|
| RBI Digital Lending 5 | Future RE/LSP contract/due diligence | Funding | No live arrangement; sample only | Not Implemented | Partner contract, role/legal review |
| RBI Digital Lending 6,8 | Offer comparison/KFS/disclosures | Funding | Only sample flat/reducing calculations; no KFS/APR or real lender | Not Implemented | Lender/legal/product review |
| RBI Digital Lending 9 | Permitted actual fund flows | Ledger/funding | No real funds move | Not Applicable | Reassess if transactions enabled |
| RBI Digital Lending 11 | Accountable grievance handling | Public support | Unavailable service honestly disclosed; no officer | Requires Legal Review | RE/LSP role and accountable operator |
| RBI Digital Lending 12–15 | Consent/minimization/storage/privacy/security | Settings/uploads | Local consent/revoke/limits/audit; no production security | Partially Implemented | Secure backend and role-specific legal review |
| RBI Digital Lending 16–17 | RE reporting and no misleading endorsement | Credit | No reporting or endorsement claims | Requires Legal Review | Regulated partner if launched |
| MeitY Rules 1; G.S.R.843(E) | Phased commencement | All data modules | Rules/notification reviewed; full Act fetch incomplete | Requires Legal Review | Exact publication/current amendment and full Act review |
| MeitY Rule 3 readiness | Notice, purpose, withdrawal links | Privacy/settings | Local purpose/scope/recipient/expiry/revoke | Partially Implemented | Full legal notice and operational rights channel |
| MeitY Rules 6–9 readiness | Security, breach, retention and accountable contact | Storage/support | Demo size validation/export/delete; no incident owner or lawful retention service | Not Implemented | Production architecture and accountable legal/privacy operation |
| RBI AA 5–6,10 | Explicit purpose, artefact, revoke/history | Settings/AA | Local consent history only, not signed artefact | Partially Implemented | Eligible partner/role and current protocol |
| RBI AA 7–9 | Secure signed transfer and technical specifications | AA adapter | Disabled adapter always unavailable | Not Implemented | Partner sandbox, role, security/conformance acceptance |
| ONDC buyer/seller overviews | Role/onboarding/support/catalogue/order obligations | Network | Local synthetic marketplace only | Not Implemented | Network agreement/current specs/certification scope |
| No unsupported integration claims | Accurate availability labels | All modules | Disabled adapters, sample labels, no Filed/Sent/Approved claims | Implemented | Unit/browser checks verify current behavior |

Source links: [RBI Digital Lending](RBI-DIGITAL-LENDING-REVIEW.md), [MeitY DPDP](DPDP-PRIVACY-READINESS.md), [RBI/DFS AA](ACCOUNT-AGGREGATOR-INTEGRATION-PLAN.md), [ONDC](ONDC-INTEGRATION-PLAN.md). Technical evidence: business unit tests (consent/revoke/unavailable adapters), store tests (rollback/deletion), browser staff/admin guard tests and export/restore tests. These do not test statutory applicability, production security or partner conformance.

Required implementation before live: authenticated backend with tenant policies, immutable audit, governed retention/rights and incident operation, partner-role/legal decisions, approved data flow, verified disclosures and independent E2E/security evidence. No browser test is a compliance test.
