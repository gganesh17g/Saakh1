import { Link, useParams } from "react-router-dom";
const copy: Record<string, [string, string, string]> = {
  accounting: [
    "A ledger that keeps the story straight.",
    "Record invoices, bills, collections, payments and stock against one balanced local ledger. Credit sales stay receivable until cash arrives.",
    "Drafts do not change balances. Corrections reverse and repost with a version history. Standard-cost inventory and illustrative GST need professional review before production.",
  ],
  cashflow: [
    "See the cash ahead.",
    "Compare 30, 60 and 90 day Base and Downside scenarios using your recorded local activity. Inspect daily receipts, payments and a minimum cash buffer.",
    "Three simple baseline methods are compared with time-aware one-step backtests. No validated forecasting accuracy or seasonality claim.",
  ],
  collections: [
    "Follow up with context.",
    "Inspect ageing, promise dates, disputes and invoice evidence before drafting a collection reminder.",
    "Reminder drafts and local schedule markers never send messages. Record a receipt only after an actual synthetic payment is confirmed.",
  ],
  "working-capital": [
    "Understand the cost before the commitment.",
    "Compare flat and reducing-balance illustrations, calendar dates, payment frequency, fees and total repayments.",
    "Every illustration is SAMPLE — NOT A REAL OFFER. No lender integration, application, approval, APR certification or financial advice.",
  ],
  network: [
    "Trade relationships, with a clear source.",
    "Create synthetic customer and supplier profiles, RFQs, delivered-cost quotations, shortlists and local outcomes.",
    "Self-reported profiles are not verified. No actual orders or leads are transmitted. ONDC capabilities are planned and disabled.",
  ],
  pricing: [
    "Illustrative plans. No purchase required.",
    "Demo: ₹0, browser-local synthetic tools. Business concept: ₹499/month. Team concept: ₹1,499/month. These are illustrative planning figures, not available paid subscriptions.",
    "No checkout, contract, trial billing or payment collection. Production service scope and prices remain unannounced.",
  ],
  about: [
    "A clearer picture for small businesses.",
    "Saakh is an educational product prototype exploring everyday bookkeeping, cash visibility and explainable credit intelligence.",
    "No incorporated-company history, customer count, regulatory approval, lending authority or partnership is claimed.",
  ],
  contact: [
    "Contact, without a false promise.",
    "No monitored support address or backend contact service has been configured for this demo.",
    "For project feedback, use the verified repository issue tracker. Do not include personal or financial data.",
  ],
  privacy: [
    "Your browser is the demo boundary.",
    "Saakh stores synthetic business records, attachments, notes and simulation runs locally using IndexedDB. Role selection is a demonstration, not secure authentication. No bank credentials are requested.",
    "Export business data from Reports; remove Saakh-owned records from Team & Settings. Browser storage may be cleared by your device. No production privacy-compliance claim is made. A deployed host may process ordinary access logs independently.",
  ],
  terms: [
    "Demonstration terms & limits.",
    "Use synthetic data only. This prototype is for demonstration and education. It does not offer loans, credit ratings, fraud determinations, financial advice or tax filing.",
    "Forecasts and economics are illustrative assumptions. You retain responsibility for reviewing inputs and outputs. No production availability or suitability warranty is offered.",
  ],
  grievance: [
    "Grievance readiness.",
    "There is no designated regulated-entity grievance officer or monitored complaint service in this prototype. A production workflow must establish accountable contacts, response tracking and applicable escalation paths.",
    "Marketplace reports create local review records only. They are not submitted to a regulator, lender or external dispute-resolution service.",
  ],
};
export default function PublicInfo() {
  const { page = "about" } = useParams();
  const [title, intro, limit] = copy[page] || [
    "Page not found",
    "This product page does not exist.",
    "Return to the workspace or product home.",
  ];
  return (
    <div className="landing">
      <header className="public-nav">
        <Link className="logo" to="/">
          saakh · साख
        </Link>
        <Link className="button" to="/business">
          Launch business workspace →
        </Link>
      </header>
      <main
        id="main"
        className="public-section"
        style={{ maxWidth: 1100, minHeight: "70vh" }}
      >
        <div className="eyebrow">SAAKH / YOUR DIGITAL MUNIM</div>
        <h1
          style={{
            fontSize: "clamp(38px,6vw,76px)",
            maxWidth: 950,
            lineHeight: 1.1,
            margin: "30px 0",
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: 20, maxWidth: 750 }}>{intro}</p>
        <section className="card" style={{ marginTop: 40 }}>
          <h2>Clear expectations.</h2>
          <p>{limit}</p>
          {page === "contact" && (
            <a
              className="text-link"
              href="https://github.com/Ganesh-g18/Saakh/issues"
              target="_blank"
              rel="noreferrer"
            >
              Open repository issues ↗
            </a>
          )}
          <Link className="text-link" to="/business">
            Explore the functional demo →
          </Link>
        </section>
        <div className="actions" style={{ flexWrap: "wrap", marginTop: 30 }}>
          {Object.keys(copy).map((k) => (
            <Link key={k} to={"/product/" + k}>
              {k.replace("-", " ")}
            </Link>
          ))}
        </div>
      </main>
      <footer>
        <Link to="/">Saakh · Know your money. Plan your next move.</Link>
        <p>Synthetic data. Local calculations. Human review.</p>
      </footer>
    </div>
  );
}
