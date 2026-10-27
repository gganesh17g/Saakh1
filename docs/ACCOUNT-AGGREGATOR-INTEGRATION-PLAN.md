# Account Aggregator integration plan — disabled

Reviewed 27 October 2026: [DFS overview, updated May 27, 2026](https://financialservices.gov.in/account-aggregator-framework) and [RBI NBFC–AA Directions, displayed update Sept 6, 2024](https://www.rbi.org.in/Scripts/BS_ViewMasDirections.aspx?id=10598). The supplied www DFS host failed TLS hostname verification; non-www succeeded. The supplied systemhealth mirror failed issuer verification; the primary RBI page succeeded. No TLS validation was bypassed. Later amendments/current consolidated applicability still require verification before implementation.

The DFS overview describes AA as consent-based information sharing and FIU as registered with and regulated by a financial-sector regulator. Saakh must not assume eligibility merely by implementing an API. Determine whether the proposed role is partner technology support, permitted FIU arrangement or another structure with legal/regulated-partner advice. No AA licence, FIU eligibility, bank credentials or certificate is claimed.

RBI paragraphs 5–10 cover explicit-consent service, no customer transactions through AA, no FIP credentials, standardized consent, revocation, logged/verified artefacts, purpose-limited transfer, secure interfaces and customer consent history. Paragraph 9 references current ReBIT technical specifications; the full applicable protocol/onboarding package has not been reviewed here.

Implementation gates:

1. Confirm role, accountable regulated participant and partner contract. Verify the latest directions and ReBIT version, certification/onboarding and grievance duties.
2. Build authenticated backend and purpose-specific consent service: scope, permitted recipients, collection period/frequency, expiry, audit, revocation and downstream propagation.
3. Integrate partner sandbox with signed requests/callback verification, authenticated consent artefacts, traceable status, failure handling, data minimization and expiry denial.
4. Independently test denial, partial revocation, expiry, replay/idempotency, cross-tenant access, deletion/retention and incident handling. Establish support and audited deployment approvals.
5. Enable only after written readiness evidence; UI status must reflect actual end-to-end verified connection.

Current code: `src/business/integrations.ts` returns unavailable/consent-required only. Local settings records are not standardized signed AA artefacts and never request information. Unit tests verify the adapter cannot report success even with a consent ID.
