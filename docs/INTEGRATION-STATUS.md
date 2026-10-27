# Integration status — 27 October 2026

No external adapter is connected. No credentials, API keys, real-data requests, message delivery, government filing or lender submission exists.

| Capability | Code/UI status | Working now | Missing before live |
|---|---|---|---|
| Bank / NBFC | Requires Partner Approval | Manual ledger and synthetic statements | Approved provider/role, consent, secure backend, reconciliation and E2E validation |
| Account Aggregator | Requires Partner Approval | Local purpose/scope/expiry/revoke records | Eligible role/regulated partner, current protocol, signed artefacts, conformance/security review |
| Lending workflow | Requires Regulatory Review | Sample rate-method comparison and schedules | Lender agreements, legal role, KFS/APR/disclosures, status integration and human decision ownership |
| ONDC buyer | Planned | Synthetic RFQs and quotes | Network role, current specs/onboarding, support, checkout/order responsibilities |
| ONDC seller | Planned | Self-reported supplier profiles and local outcomes | Seller/catalogue operations, contracts, fulfilment, current conformance tests |
| GST / tax | Requires Regulatory Review | Internal manually dated readiness tasks | Verified scope/authorized partner, correct rules/return processing and confirmed response |
| WhatsApp / SMS | Planned | Draft reminder and local marker | Provider, purpose/consent/template/policy review, delivery/error/cost controls |
| OCR / AI extraction | Not implemented | Bounded original-file attachment and manual review | Approved processing/vendor flow, quality evaluation, privacy/security, retention |
| Assistant | Demo Simulation | Deterministic local queries and source evidence | LLM/provider review if introduced, permissioned tools and evaluation |

Source of UI statuses: `src/business/integrations.ts`. Its typed adapter always returns ok:false. A local consent ID does not enable transmission. See source register and individual readiness plans for reviewed material and gaps. No certification, approval, verified partnership or production security is implied.
