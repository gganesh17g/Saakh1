export const integrationNames = [
  "Bank / NBFC",
  "Account Aggregator",
  "Lending workflow",
  "ONDC buyer",
  "ONDC seller",
  "GST / tax services",
  "WhatsApp / SMS",
] as const;
export type IntegrationStatus =
  | "Demo Simulation"
  | "Planned"
  | "Integration Under Development"
  | "Requires Partner Approval"
  | "Requires Regulatory Review"
  | "Connected and Verified";
export const integrations = integrationNames.map((name, i) => ({
  name,
  status: (i === 0 || i === 1
    ? "Requires Partner Approval"
    : i === 2 || i === 5
      ? "Requires Regulatory Review"
      : "Planned") as IntegrationStatus,
  prerequisites:
    i === 1
      ? "Role and licensed partner validation, consent artefacts, purpose limits, security and end-to-end testing."
      : i === 3 || i === 4
        ? "Network role selection, current protocol specifications, onboarding, agreements, certification/testing and support."
        : "Authorized providers/partners, applicable legal review, explicit consent, secure backend and end-to-end testing.",
}));
export type IntegrationRequest = {
  businessId: string;
  purpose: string;
  consentId?: string;
};
export interface FinancialIntegration {
  status: IntegrationStatus;
  request(input: IntegrationRequest): Promise<{
    ok: false;
    code: "UNAVAILABLE" | "CONSENT_REQUIRED";
    message: string;
  }>;
}
export function integrationAdapter(name: string): FinancialIntegration {
  return {
    status: integrations.find((i) => i.name === name)?.status || "Planned",
    async request(input) {
      return {
        ok: false,
        code: input.consentId ? "UNAVAILABLE" : "CONSENT_REQUIRED",
        message: `${name} is unavailable. A browser-local consent record does not enable access or constitute an approved integration. No external request was made.`,
      };
    },
  };
}
