# ONDC integration plan — planned and disabled

Reviewed 27 October 2026: [seller role](https://ondc.org/pages/seller-network-participants.html) and [buyer role](https://ondc.org/pages/buyer-network-participants.html). Pages have no displayed publication dates; record access date rather than inventing one. ONDC homepage HTTP content alone was a shell. These role overviews are network guidance, not evidence of protocol conformance, enrolment or certification.

A seller participant connects sellers/catalogues and carries seller-side responsibilities; MSN and ISN distinguish third-party marketplace inventory from own inventory. Buyer participants carry discovery and buyer-facing responsibilities, including catalogue/cart, delivery, checkout, order confirmation and support. Saakh’s local directory/RFQ forms do not satisfy either role.

Before choosing a role, evaluate customer support, disputes, seller onboarding/verification, settlement responsibilities, fulfilment operations, commercial terms and technical capacity. Obtain the current protocol/domain specifications, version policy, security/signing/registry procedures, sandbox acceptance and participation agreements from authoritative network onboarding channels. These detailed current packages were not fully reviewed in this task.

Proposed modular boundary: authenticated catalogue/search adapter, RFQ/quote domain, order state machine, secure partner callbacks, consent-aware data minimization, support/dispute workflow and observed delivery/payment status. Use idempotency and signed callbacks, reconcile actual orders and prevent local draft/outcome labels being interpreted as external fulfilment. Test timeout, failure, cancellation, out-of-order callbacks and tenant authorization before publishing Connected and Verified.

Current marketplace is explicitly synthetic and self-reported. It supports local RFQ, supplier quotes, delivered-price arithmetic, shortlist, recorded outcome, report/block and demo moderation. No network request, real buyer lead, actual order, checkout, settlement or external message occurs. Partner/network approvals and operational readiness remain prerequisites.
