import {
  useEffect,
  useState,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type FormEvent,
} from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  Menu,
  X,
  Wallet,
  TrendingUp,
  FileText,
  Package,
  Users,
  ShieldCheck,
  ChevronRight,
  Plus,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useBusiness, contextFor } from "./store";
import {
  type DocumentInput,
  type BusinessState,
  type Context,
  type DocLine,
  type BusinessDocument,
  type Role,
  roles,
  today,
  plusDays,
  paise,
  rupees,
  uid,
  authorize,
  audit,
} from "./model";
import {
  financials,
  totals,
  due,
  docStatus,
  quantity,
  health,
  cashDelta,
  type ManualKind,
} from "./accounting";
import * as op from "./operations";
import {
  ageing,
  forecastBusiness,
  defaultAssumptions,
  loanSchedule,
  reconciliation,
  answer,
} from "./analytics";
import {
  download,
  csvCell,
  sampleCSV,
  downloadXLSX,
  readStatement,
  importStatement,
} from "./imports";
import { integrations } from "./integrations";
import "./business.css";
import { creditBridge } from "./creditBridge";
import { useStore as useCreditStore } from "../state/store";
const modules = [
  ["", "Business Pulse"],
  ["sales", "Sales & Invoices"],
  ["bills", "Purchases & Bills"],
  ["passbook", "Passbook & Reconciliation"],
  ["inventory", "Inventory"],
  ["cashflow", "Cash Flow & Forecasts"],
  ["collections", "Collections"],
  ["funding", "Loans & Working Capital"],
  ["network", "Buyers & Suppliers"],
  ["tax", "GST & Tax"],
  ["reports", "Reports & Audit"],
  ["assistant", "AI Assistant"],
  ["settings", "Team & Settings"],
  ["admin", "Demo Admin"],
];
function guardedExport(s: BusinessState, c: Context, action: () => void) {
  try {
    authorize(s, c, "export");
    action();
  } catch (error) {
    void useBusiness.getState().commit("Export", () => {
      throw error;
    });
  }
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="m-field">
      <span>{label}</span>
      {isValidElement(children) && typeof children.type === "string"
        ? cloneElement(children as ReactElement<{ "aria-label"?: string }>, {
            "aria-label": label,
          })
        : children}
    </label>
  );
}
function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
}) {
  return (
    <div className="m-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </div>
  );
}
function Table({ heads, children }: { heads: string[]; children: ReactNode }) {
  return (
    <div className="m-table-scroll">
      <table>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="m-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Confirm({
  text,
  children,
}: {
  text: string;
  children: (confirmed: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {text}
      </button>
      {open && (
        <dialog
          ref={(element) => {
            if (element && !element.open) element.showModal();
          }}
          onCancel={() => setOpen(false)}
          aria-label={text}
          className="m-dialog"
        >
          <h2>{text}</h2>
          <p>
            Review the displayed record and amount. This changes the local demo
            ledger and writes an audit entry.
          </p>
          <button
            autoFocus
            onClick={() => {
              children(true);
              setOpen(false);
            }}
          >
            Confirm {text.toLowerCase()}
          </button>
          <button onClick={() => setOpen(false)}>Back</button>
        </dialog>
      )}
    </>
  );
}
function useData() {
  const store = useBusiness();
  return {
    ...store,
    s: store.data,
    c: contextFor(store.data),
    b: store.data.businesses.find((b) => b.id === store.data.activeBusiness),
  };
}
const val = (e: FormEvent<HTMLFormElement>) => new FormData(e.currentTarget);
const str = (f: FormData, k: string) => String(f.get(k) || "");
const num = (f: FormData, k: string) => Number(f.get(k));
function MoneyInput({ name, value = 0 }: { name: string; value?: number }) {
  return (
    <input
      name={name}
      type="number"
      min="0"
      step="0.01"
      defaultValue={value}
      required
    />
  );
}
export default function BusinessApp({ theme }: { theme: ReactNode }) {
  const { s, b, ready, hydrate, error, notice, clearError, setRole, commit } =
    useData();
  const loc = useLocation();
  const [nav, setNav] = useState(false);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  useEffect(() => setNav(false), [loc.pathname]);
  const page = loc.pathname.split("/")[2] || "";
  if (!ready)
    return (
      <div className="munim">
        <p>Restoring the local business ledger…</p>
      </div>
    );
  return (
    <div className="munim">
      <aside className={"m-sidebar " + (nav ? "is-open" : "")}>
        <Link className="m-brand" to="/">
          <span>
            <Activity size={24} />
          </span>
          saakh <small>साख</small>
        </Link>
        <div className="m-label">YOUR DIGITAL MUNIM</div>
        <nav>
          {modules.map(([path, title], i) => (
            <NavLink key={path} end to={"/business" + (path ? "/" + path : "")}>
              <span className="m-nav-icon">
                {i === 0 ? (
                  <Wallet size={17} />
                ) : i < 4 ? (
                  <FileText size={17} />
                ) : i === 4 ? (
                  <Package size={17} />
                ) : i === 8 ? (
                  <Users size={17} />
                ) : (
                  <ChevronRight size={17} />
                )}
              </span>
              {title}
            </NavLink>
          ))}
        </nav>
        <Link className="m-credit-link" to="/app">
          <ShieldCheck size={17} /> Credit Intelligence{" "}
          <ArrowUpRight size={15} />
        </Link>
        <div className="m-side-foot">
          LOCAL DEMO · NO BANK CONNECTION
          <br />
          Know your money.
          <br />
          Plan your next move.
        </div>
      </aside>
      <div className="m-body">
        <header className="m-top">
          <button
            className="m-mobile"
            aria-label="Open business navigation"
            onClick={() => setNav(!nav)}
          >
            {nav ? <X /> : <Menu />}
          </button>
          <span className="m-breadcrumb">
            Workspace <ChevronRight size={14} />{" "}
            <b>{modules.find((m) => m[0] === page)?.[1] || "Get started"}</b>
          </span>
          <div className="m-top-right">
            <span className="m-demo">● SYNTHETIC DEMO</span>
            {theme}
            <select
              aria-label="Demo role"
              value={s.role}
              onChange={(e) => void setRole(e.target.value as Role)}
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </header>
        <main id="main" tabIndex={-1} className="m-content">
          <div className="m-business-bar">
            <div>
              <span className="m-label">BUSINESS WORKSPACE / INR</span>
              <strong>{b?.name || "Set up your business"}</strong>
              <small>
                {b?.location} · FY {b?.financialYear.slice(0, 4)} ·
                Browser-local demo identities
              </small>
            </div>
            <select
              aria-label="Select business"
              value={s.activeBusiness}
              onChange={(e) =>
                void commit("Business switched", (d) => {
                  d.activeBusiness = e.target.value;
                })
              }
            >
              {s.businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <Link to="/business/onboarding" className="m-secondary">
              + New business
            </Link>
          </div>
          {error && (
            <div role="alert" className="m-error">
              {error}
              <button onClick={clearError}>Dismiss</button>
            </div>
          )}
          {notice && (
            <div role="status" className="m-success">
              {notice}
            </div>
          )}
          {!b || page === "onboarding" ? (
            <Onboarding />
          ) : (
            <>
              <div className="m-page-heading">
                <div>
                  <span className="m-label">SAAKH / BUSINESS CLARITY</span>
                  <h1>
                    {modules.find((m) => m[0] === page)?.[1] ||
                      "Business Pulse"}
                  </h1>
                </div>
                <span className="m-asof">
                  As of {today()} · {s.role} demo view
                </span>
              </div>
              {page === "" ? (
                <Pulse />
              ) : page === "sales" || page === "bills" ? (
                <Documents kind={page === "sales" ? "sale" : "purchase"} />
              ) : page === "passbook" ? (
                <Passbook />
              ) : page === "inventory" ? (
                <Inventory />
              ) : page === "cashflow" ? (
                <Cashflow />
              ) : page === "collections" ? (
                <Collections />
              ) : page === "funding" ? (
                <Funding />
              ) : page === "network" ? (
                <Marketplace />
              ) : page === "tax" ? (
                <Tax />
              ) : page === "reports" ? (
                <Reports />
              ) : page === "assistant" ? (
                <Assistant />
              ) : page === "settings" ? (
                <Settings />
              ) : page === "admin" ? (
                <Admin />
              ) : (
                <Panel title="Page not found">
                  <Link to="/business">Return to Business Pulse</Link>
                </Panel>
              )}
            </>
          )}
          <footer className="m-footer">
            <Info size={16} />
            <p>
              Saakh is a prototype simulation for demonstration and educational
              purposes. Scores, forecasts, alerts, recommendations, and
              financial-impact estimates use synthetic data and illustrative
              assumptions. They are not credit ratings, lending offers, fraud
              determinations, or financial advice. Browser roles are
              demonstration controls, not secure authentication.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
function Onboarding() {
  const { commit } = useData(),
    navigate = useNavigate();
  return (
    <Panel title="Start with a clear opening balance">
      <p>
        Create an independent browser-local business. Use synthetic data only.
        Hindi and Marathi are stored preferences; the current interface uses
        English.
      </p>
      <form
        className="m-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = val(e),
            ok = await commit("Business created", (s) =>
              op.onboard(
                s,
                {
                  id: uid(s, "BIZ"),
                  name: str(f, "name"),
                  type: str(f, "type"),
                  industry: str(f, "industry"),
                  location: str(f, "location"),
                  financialYear: str(f, "fy"),
                  language: str(f, "language"),
                  currency: "INR",
                  openingCash: paise(num(f, "opening")),
                  openingSource: str(f, "source"),
                  openingDate: str(f, "date"),
                  createdAt: new Date().toISOString(),
                  startWith: str(f, "workflow"),
                  minimumBuffer: paise(5000),
                },
                f.has("confirmed"),
              ),
            );
          if (ok) navigate("/business");
        }}
      >
        <Field label="Business name">
          <input name="name" required minLength={2} />
        </Field>
        <Field label="Business type">
          <select name="type">
            {["Retail", "Wholesale", "Distributor", "Services"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </Field>
        <Field label="Industry">
          <input name="industry" required />
        </Field>
        <Field label="Location">
          <input name="location" required />
        </Field>
        <Field label="Financial year starting April 1">
          <input type="date" name="fy" defaultValue="2026-04-01" required />
        </Field>
        <Field label="Preferred language">
          <select name="language">
            <option value="en">English</option>
            <option value="hi">Hindi (preference only)</option>
            <option value="mr">Marathi (preference only)</option>
          </select>
        </Field>
        <Field label="Opening bank balance (₹)">
          <MoneyInput name="opening" />
        </Field>
        <Field label="Opening balance date">
          <input type="date" name="date" defaultValue={today()} required />
        </Field>
        <Field label="Source of opening balance">
          <input
            name="source"
            placeholder="Synthetic opening statement"
            required
            minLength={3}
          />
        </Field>
        <Field label="Starting workflow">
          <select name="workflow">
            <option value="manual">Manual entry</option>
            <option value="invoices">Invoices</option>
            <option value="bills">Bills</option>
            <option value="statement">Statement import</option>
          </select>
        </Field>
        <label className="m-check">
          <input type="checkbox" name="confirmed" required />I reviewed the
          opening amount, source and date. This creates an opening capital
          journal.
        </label>
        <button type="submit">Create local business</button>
      </form>
    </Panel>
  );
}
function CreditBridge() {
  const { s, c, commit } = useData();
  const [details, setDetails] = useState("");
  return (
    <Panel title="From the ledger to explainable credit">
      <p>
        Copy a reviewed trailing-30-day snapshot into the existing credit
        engines. The trade graph remains a separate synthetic illustration; no
        real credit decision occurs.
      </p>
      <form
        className="m-form"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = val(e);
          await commit("Credit snapshot prepared", (s, c) => {
            if (!f.has("confirm"))
              throw new Error("Confirm bridge assumptions");
            const bridge = creditBridge(s, c, {
              age: num(f, "age"),
              monthlyDebt: num(f, "debt"),
              requestedLoan: num(f, "loan"),
              term: num(f, "term"),
            });
            useCreditStore.getState().setSources(bridge.sources);
            void useCreditStore.getState().run(bridge.borrower);
            audit(
              s,
              c,
              "Credit scenario snapshot copied",
              c.businessId,
              null,
              bridge,
            );
            setDetails(bridge.limitations.join(" "));
          });
        }}
      >
        <Field label="Business age (years, assumption)">
          <input
            name="age"
            type="number"
            min="0"
            max="100"
            defaultValue="0"
            required
          />
        </Field>
        <Field label="Monthly debt payments (₹, assumption)">
          <MoneyInput name="debt" />
        </Field>
        <Field label="Requested loan (₹, assumption)">
          <MoneyInput name="loan" />
        </Field>
        <Field label="Loan term months">
          <input
            name="term"
            type="number"
            min="1"
            max="360"
            defaultValue="12"
            required
          />
        </Field>
        <label className="m-check">
          <input name="confirm" type="checkbox" required />I reviewed
          assumptions and source limitations
        </label>
        <button>Run ledger credit scenario</button>
      </form>
      {details && <p>{details}</p>}
      <Link to="/app">Inspect credit calculation & evidence →</Link>
      <small>
        {s.journals.filter((j) => j.businessId === c.businessId).length} local
        journals available; no live source.
      </small>
    </Panel>
  );
}
function Pulse() {
  const { s, b } = useData();
  const f = financials(s, b!.id),
    h = health(s, b!.id),
    r = forecastBusiness(s, contextFor(s)),
    lowest = Math.min(...r.days.map((d) => d.closing));
  const checklist = [
    [
      "Add a customer or supplier",
      s.parties.some((p) => p.businessId === b!.id),
      "/business/network",
    ],
    [
      "Record a sales invoice",
      s.documents.some((d) => d.businessId === b!.id && d.kind === "sale"),
      "/business/sales",
    ],
    [
      "Review a supplier bill",
      s.documents.some(
        (d) =>
          d.businessId === b!.id && d.kind !== "sale" && d.status === "Posted",
      ),
      "/business/bills",
    ],
    [
      "Reconcile a bank row",
      s.statements.some(
        (r) => r.businessId === b!.id && r.status === "Matched",
      ),
      "/business/passbook",
    ],
  ] as const;
  return (
    <>
      <div className="m-pulse-banner">
        <div>
          <span className="m-label">YOUR MONEY, IN FOCUS</span>
          <h2>
            A clearer day starts
            <br />
            with a clearer picture.
          </h2>
          <p>See what you have, what is due, and what comes next.</p>
          <Link to="/business/cashflow">
            Explore your cash outlook <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="m-orbit">
          <Wallet size={52} />
          <span>LEDGER CONNECTED</span>
          <b>
            {s.journals.filter((j) => j.businessId === b!.id).length} entries
          </b>
        </div>
      </div>
      <div className="m-metrics">
        <Metric
          label="Cash & bank"
          value={rupees(f.cash)}
          detail="Posted actual ledger"
        />
        <Metric
          label="Customers owe you"
          value={rupees(f.receivables)}
          detail="Unpaid credit invoices"
        />
        <Metric
          label="You owe suppliers"
          value={rupees(f.payables)}
          detail="Posted unpaid bills"
        />
        <Metric
          label="Accrual profit"
          value={rupees(f.profit)}
          detail="Revenue − recorded expenses, FY to date"
        />
      </div>
      <div className="m-two">
        <Panel title="The next 30 days">
          <p>Base estimate · {r.method} · not a prediction guarantee</p>
          <ForecastChart days={r.days} />
          <div className="m-inline">
            <span>
              Lowest projected cash <b>{rupees(lowest)}</b>
            </span>
            <Link to="/business/cashflow">Inspect assumptions →</Link>
          </div>
        </Panel>
        <Panel title="Your business checklist">
          {checklist.map(([label, done, path]) => (
            <Link className="m-checklist" key={label} to={path}>
              <CheckCircle2 size={19} className={done ? "m-green" : ""} />
              <span>
                {label}
                <small>
                  {done ? "Recorded in this demo" : "Next suggested step"}
                </small>
              </span>
              <ChevronRight size={17} />
            </Link>
          ))}
          <p className="m-note">
            All seeded records are synthetic examples, not verified businesses.
          </p>
        </Panel>
      </div>
      <div className="m-two">
        <Panel title="Attention, with context">
          <div className="m-alert">
            <TrendingUp size={20} />
            <div>
              <b>
                {ageing(s, b!.id).filter((a) => a.days > 0).length} overdue
                invoices
              </b>
              <p>Review promises and disputes before preparing a reminder.</p>
              <Link to="/business/collections">Review collections →</Link>
            </div>
          </div>
          <div className="m-alert">
            <FileText size={20} />
            <div>
              <b>{h.uncategorized} statement rows need review</b>
              <p>Matching a receipt does not record revenue twice.</p>
              <Link to="/business/passbook">Open reconciliation →</Link>
            </div>
          </div>
        </Panel>
        <Panel title="Data health, honestly">
          <div className="m-health">
            {[
              [
                "Reconciled rows",
                h.reconciledRatio === null
                  ? "No statement"
                  : Math.round(h.reconciledRatio * 100) + "%",
              ],
              ["Draft documents", h.incomplete],
              ["Duplicate-number warnings", h.duplicates],
              ["Recorded calendar months", h.historyMonths],
              ["Last ledger date", h.lastDate || "No entries"],
            ].map(([label, value]) => (
              <div key={label}>
                <span>{label}</span>
                <b>{value}</b>
              </div>
            ))}
          </div>
          <p className="m-note">
            Data quantity does not establish completeness. The demo has no bank
            or tax verification.
          </p>
        </Panel>
      </div>
      <CreditBridge />
    </>
  );
}
function ForecastChart({
  days,
}: {
  days: ReturnType<typeof forecastBusiness>["days"];
}) {
  return (
    <div className="m-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={days.map((d) => ({ ...d, cash: d.closing / 100 }))}>
          <defs>
            <linearGradient id="cashFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16b3a5" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#16b3a5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 6"
            vertical={false}
            stroke="var(--m-line)"
          />
          <XAxis
            dataKey="date"
            tickFormatter={(x) => x.slice(5)}
            minTickGap={50}
          />
          <YAxis
            width={66}
            tickFormatter={(x) => "₹" + Math.round(x / 1000) + "k"}
          />
          <Tooltip formatter={(v) => rupees(Number(v) * 100)} />
          <Area
            type="monotone"
            dataKey="cash"
            stroke="#0ca99a"
            fill="url(#cashFill)"
            strokeWidth={2.5}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
function Documents({ kind }: { kind: "sale" | "purchase" }) {
  const { s, c, commit } = useData();
  const [editing, setEditing] = useState<BusinessDocument | null>(null),
    [adding, setAdding] = useState(false),
    [selected, setSelected] = useState("");
  const docs = s.documents.filter(
    (d) =>
      d.businessId === c.businessId &&
      (kind === "sale" ? d.kind === "sale" : d.kind !== "sale"),
  );
  const d = docs.find((d) => d.id === selected);
  return (
    <>
      <div className="m-toolbar">
        <p>
          {kind === "sale"
            ? "Credit invoices increase receivables. Collections increase cash without repeating revenue."
            : "Inventory, expense and equipment bills remain payable until a separate payment."}
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setAdding(true);
          }}
        >
          <Plus size={16} /> {kind === "sale" ? "New invoice" : "New bill"}
        </button>
      </div>
      {adding && (
        <DocumentForm
          key={editing?.id || "new"}
          kind={kind}
          existing={editing}
          close={() => setAdding(false)}
        />
      )}
      <Panel
        title={
          kind === "sale" ? "Sales register" : "Purchases & bills register"
        }
      >
        <Table
          heads={[
            "Document / source",
            "Party",
            "Due date",
            "Total",
            "Outstanding",
            "Status",
            "Inspect",
          ]}
        >
          {docs.map((d) => (
            <tr key={d.id}>
              <td>
                <b>{d.number}</b>
                <small>
                  {d.id} · v{d.version}
                </small>
              </td>
              <td>{s.parties.find((p) => p.id === d.partyId)?.name}</td>
              <td>{d.dueDate}</td>
              <td>{rupees(totals(d.lines).total)}</td>
              <td>{rupees(due(s, d))}</td>
              <td>
                <span className={"m-badge " + (due(s, d) > 0 ? "amber" : "")}>
                  {docStatus(s, d)}
                </span>
              </td>
              <td>
                <button onClick={() => setSelected(d.id)}>Details</button>
              </td>
            </tr>
          ))}
        </Table>
        {!docs.length && <p>No records. Create a draft to start.</p>}
      </Panel>
      {d && (
        <Panel title={`${d.number} · evidence & actions`}>
          <button onClick={() => setSelected("")}>Close details</button>
          <p>
            {d.source} · entered by {d.enteredBy} · reviewed by{" "}
            {d.reviewedBy || "Not yet reviewed"} · status does not mean
            delivered.
          </p>
          <Table
            heads={["Description", "Qty", "Unit price", "Discount", "Tax"]}
          >
            {d.lines.map((l, i) => (
              <tr key={i}>
                <td>{l.description}</td>
                <td>{l.quantity}</td>
                <td>{rupees(l.price)}</td>
                <td>{l.discount}%</td>
                <td>{l.tax}%</td>
              </tr>
            ))}
          </Table>
          <div className="m-toolbar">
            <button
              onClick={() => {
                setEditing(d);
                setAdding(true);
              }}
            >
              Edit / correct version
            </button>
            <Confirm
              text={d.status === "Draft" ? "Post document" : "Cancel document"}
            >
              {(yes) => {
                void commit("Document updated", (s, c) =>
                  d.status === "Draft"
                    ? op.saveDocument(s, c, d, true, yes, d.id, d.version)
                    : op.cancelDocument(s, c, d.id, yes),
                );
              }}
            </Confirm>
            <button
              onClick={() =>
                guardedExport(s, c, () =>
                  download(
                    d.number + ".json",
                    JSON.stringify(
                      {
                        document: d,
                        journals: s.journals.filter((j) => j.sourceId === d.id),
                        payments: s.payments.filter(
                          (p) => p.documentId === d.id,
                        ),
                      },
                      null,
                      2,
                    ),
                  ),
                )
              }
            >
              Export record
            </button>
          </div>
          {d.status === "Posted" && (
            <div className="m-two">
              <form
                className="m-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = val(e);
                  void commit("Payment recorded", (s, c) =>
                    op.settle(
                      s,
                      c,
                      d.id,
                      paise(num(f, "amount")),
                      str(f, "date"),
                      str(f, "account") as "bank" | "cash",
                      f.has("confirm"),
                    ),
                  );
                }}
              >
                <h3>
                  {kind === "sale"
                    ? "Record collection"
                    : "Record supplier payment"}
                </h3>
                <Field label="Amount (₹)">
                  <MoneyInput name="amount" value={due(s, d) / 100} />
                </Field>
                <Field label="Payment date">
                  <input
                    type="date"
                    name="date"
                    defaultValue={today()}
                    required
                  />
                </Field>
                <Field label="Account">
                  <select name="account">
                    <option>bank</option>
                    <option>cash</option>
                  </select>
                </Field>
                <label className="m-check">
                  <input type="checkbox" name="confirm" required />
                  Confirm receipt / payment occurred
                </label>
                <button>Record payment</button>
              </form>
              <form
                className="m-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = val(e);
                  void commit("Proportional credit note posted", (s, c) =>
                    op.creditReturn(
                      s,
                      c,
                      d.id,
                      paise(num(f, "amount")),
                      today(),
                      f.has("confirm"),
                    ),
                  );
                }}
              >
                <h3>Credit note / stock return</h3>
                <p>
                  Proportional line allocation. Unpaid balances reduce
                  receivables/payables; any excess is a confirmed bank refund.
                </p>
                <Field label="Credit amount (₹)">
                  <MoneyInput name="amount" />
                </Field>
                <label className="m-check">
                  <input type="checkbox" name="confirm" required />
                  Confirm goods returned, credit agreed and any bank refund
                  occurred
                </label>
                <button>Post credit note</button>
              </form>
            </div>
          )}
          <details>
            <summary>
              Journal evidence (
              {s.journals.filter((j) => j.sourceId === d.id).length})
            </summary>
            <pre>
              {JSON.stringify(
                s.journals.filter((j) => j.sourceId === d.id),
                null,
                2,
              )}
            </pre>
          </details>
        </Panel>
      )}
    </>
  );
}
function DocumentForm({
  kind,
  existing,
  close,
}: {
  kind: "sale" | "purchase";
  existing: BusinessDocument | null;
  close: () => void;
}) {
  const { s, c, commit } = useData();
  const [lines, setLines] = useState<DocLine[]>(
    existing?.lines || [
      { description: "", quantity: 1, price: 0, discount: 0, tax: 0 },
    ],
  );
  const [attachment, setAttachment] = useState(existing?.attachmentId || "");
  const patch = (i: number, k: string, v: string) =>
    setLines(
      lines.map((l, n) =>
        n === i
          ? {
              ...l,
              [k]:
                k === "description" || k === "itemId"
                  ? v || undefined
                  : Number(v),
            }
          : l,
      ),
    );
  async function attach(file: File) {
    if (
      file.size > 2e6 ||
      !["application/pdf", "image/png", "image/jpeg"].includes(file.type)
    ) {
      await commit("Attachment", () => {
        throw new Error("Use PDF, PNG or JPEG up to 2 MB; no OCR is performed");
      });
      return;
    }
    const bytes = await file.arrayBuffer(),
      hash = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    const reader = new FileReader();
    reader.onload = () => {
      void commit("Source attachment retained", (s, c) => {
        authorize(s, c, "draft");
        const id = uid(s, "ATT");
        s.attachments.push({
          id,
          businessId: c.businessId,
          name: file.name,
          mime: file.type,
          size: file.size,
          content: String(reader.result),
          sha256: hash,
        });
        setAttachment(id);
      });
    };
    reader.readAsDataURL(file);
  }
  return (
    <Panel
      title={
        existing
          ? "Correct document with audit trail"
          : "Create a reviewed document"
      }
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = val(e);
          const input: DocumentInput = {
            kind: str(f, "kind") as DocumentInput["kind"],
            partyId: str(f, "party"),
            number: str(f, "number"),
            issueDate: str(f, "date"),
            dueDate: str(f, "due"),
            lines,
            cashSale: f.has("cashSale"),
            ...(attachment ? { attachmentId: attachment } : {}),
          };
          const ok = await commit("Document saved", (s, c) =>
            op.saveDocument(
              s,
              c,
              input,
              str(f, "mode") === "post",
              f.has("confirm"),
              existing?.id,
              existing?.version,
            ),
          );
          if (ok) close();
        }}
      >
        <div className="m-form">
          <Field label="Document type">
            <select name="kind" defaultValue={existing?.kind || kind}>
              {(kind === "sale"
                ? ["sale"]
                : ["purchase", "expense", "equipment"]
              ).map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
          </Field>
          <Field label="Counterparty">
            <select name="party" defaultValue={existing?.partyId} required>
              <option value="">Select party</option>
              {s.parties
                .filter(
                  (p) =>
                    p.businessId === c.businessId &&
                    (kind === "sale"
                      ? p.type !== "supplier"
                      : p.type !== "customer"),
                )
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Document number">
            <input
              name="number"
              defaultValue={existing?.number || ""}
              required
            />
          </Field>
          <Field label="Issue date">
            <input
              type="date"
              name="date"
              defaultValue={existing?.issueDate || today()}
              required
            />
          </Field>
          <Field label="Due date">
            <input
              type="date"
              name="due"
              defaultValue={existing?.dueDate || plusDays(today(), 30)}
              required
            />
          </Field>
          <Field label="Optional source document (2 MB)">
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              onChange={(e) => {
                if (e.target.files?.[0]) void attach(e.target.files[0]);
              }}
            />
          </Field>
        </div>
        <p>
          Attach and manually review. No OCR, tax validity check, invoice
          delivery, or external verification occurs.
        </p>
        {lines.map((l, i) => (
          <div className="m-line-editor" key={i}>
            <Field label="Product (optional for non-stock)">
              <select
                value={l.itemId || ""}
                onChange={(e) => {
                  const item = s.items.find((i) => i.id === e.target.value);
                  setLines(
                    lines.map((v, n) =>
                      n === i
                        ? {
                            ...v,
                            itemId: item?.id,
                            description: item?.name || v.description,
                            price: item
                              ? kind === "sale"
                                ? item.price
                                : item.cost
                              : v.price,
                          }
                        : v,
                    ),
                  );
                }}
              >
                <option value="">Non-stock service / expense</option>
                {s.items
                  .filter((i) => i.businessId === c.businessId)
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Description">
              <input
                value={l.description}
                onChange={(e) => patch(i, "description", e.target.value)}
                required
              />
            </Field>
            {(["quantity", "price", "discount", "tax"] as const).map((k) => (
              <Field
                key={k}
                label={
                  k === "price"
                    ? "Unit price (₹)"
                    : k === "quantity"
                      ? "Quantity"
                      : k + " %"
                }
              >
                <input
                  type="number"
                  step="0.01"
                  min={k === "quantity" ? ".01" : "0"}
                  max={k === "discount" ? 100 : k === "tax" ? 28 : undefined}
                  value={k === "price" ? l.price / 100 : l[k]}
                  onChange={(e) =>
                    patch(
                      i,
                      k,
                      k === "price"
                        ? String(paise(+e.target.value))
                        : e.target.value,
                    )
                  }
                  required
                />
              </Field>
            ))}
            <button
              type="button"
              disabled={lines.length === 1}
              onClick={() => setLines(lines.filter((_, n) => n !== i))}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setLines([
              ...lines,
              { description: "", quantity: 1, price: 0, discount: 0, tax: 0 },
            ])
          }
        >
          + Add line
        </button>
        <div className="m-totals">
          Net {rupees(totals(lines).net)} · Tax {rupees(totals(lines).tax)} ·{" "}
          <b>Total {rupees(totals(lines).total)}</b>
        </div>
        <div className="m-form">
          <Field label="Save mode">
            <select name="mode">
              <option value="draft">Draft — no ledger effect</option>
              <option value="post">Post to ledger</option>
            </select>
          </Field>
          {kind === "sale" && (
            <label className="m-check">
              <input
                type="checkbox"
                name="cashSale"
                defaultChecked={existing?.cashSale}
              />
              Cash sale received directly into bank
            </label>
          )}
          <label className="m-check">
            <input type="checkbox" name="confirm" />I reviewed party, dates, tax
            and total; confirm posting if selected
          </label>
        </div>
        <div className="m-toolbar">
          <button type="submit">Save document</button>
          <button type="button" onClick={close}>
            Close editor
          </button>
        </div>
      </form>
    </Panel>
  );
}
function Passbook() {
  const { s, c, commit } = useData();
  const rec = reconciliation(s, c.businessId);
  const [row, setRow] = useState(""),
    [ids, setIds] = useState<string[]>([]);
  const selected = s.statements.find((r) => r.id === row);
  const suggestions = selected ? op.suggestMatches(s, c, row) : [];
  return (
    <>
      <div className="m-metrics">
        <Metric label="Book bank balance" value={rupees(rec.book)} />
        <Metric
          label="Imported statement balance"
          value={rupees(rec.statement)}
        />
        <Metric label="Difference" value={rupees(rec.difference)} />
        <Metric label="Rows to review" value={rec.unmatched.length} />
      </div>
      <Panel title="Import & reconciliation">
        <p>
          CSV columns: date,narration,amount. Amounts are signed INR. Imports do
          not post journals. Duplicate exact rows are skipped. CSV and XLSX
          imports require ISO date text (YYYY-MM-DD). The first XLSX worksheet
          must use columns A–C; formulas and Excel serial dates are rejected.
        </p>
        <div className="m-toolbar">
          <button
            onClick={() =>
              download("saakh-sample-statement.csv", sampleCSV, "text/csv")
            }
          >
            Download CSV sample
          </button>
          <button onClick={downloadXLSX}>Download XLSX sample</button>
          <Field label="Import synthetic statement CSV / XLSX">
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  try {
                    const rows = await readStatement(f);
                    await commit("Statement imported", (s, c) => {
                      importStatement(s, c, rows, f.name);
                    });
                  } catch (err) {
                    await commit("Import", () => {
                      throw err;
                    });
                  }
                }
              }}
            />
          </Field>
        </div>
        <form
          className="m-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = val(e);
            void commit("Statement opening balance updated", (s, c) => {
              authorize(s, c, "reconcile");
              if (!f.has("confirm"))
                throw new Error("Confirm statement opening balance");
              const before = s.statementOpening[c.businessId] || 0;
              s.statementOpening[c.businessId] = paise(num(f, "opening"));
              audit(
                s,
                c,
                "Statement opening balance confirmed",
                c.businessId,
                before,
                {
                  amount: s.statementOpening[c.businessId],
                  source: str(f, "source"),
                },
              );
            });
          }}
        >
          <Field label="Statement opening bank balance (₹)">
            <input
              type="number"
              step=".01"
              name="opening"
              defaultValue={(s.statementOpening[c.businessId] || 0) / 100}
              required
            />
          </Field>
          <Field label="Statement source / covered period">
            <input
              name="source"
              required
              placeholder="Synthetic statement period"
            />
          </Field>
          <label className="m-check">
            <input type="checkbox" name="confirm" required />
            Confirm this affects statement comparison only
          </label>
          <button>Set statement opening</button>
        </form>
        <Table
          heads={[
            "Date",
            "Narration / source",
            "Signed movement",
            "Status",
            "Review",
          ]}
        >
          {s.statements
            .filter((r) => r.businessId === c.businessId)
            .map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>
                  {r.narration}
                  <small>
                    {r.id} · {r.source}
                  </small>
                </td>
                <td>{rupees(r.amount)}</td>
                <td>{r.status}</td>
                <td>
                  <button
                    onClick={() => {
                      setRow(r.id);
                      setIds([]);
                    }}
                  >
                    Review match
                  </button>
                </td>
              </tr>
            ))}
        </Table>
        {selected && (
          <section className="m-inset">
            <h3>
              {selected.narration} · {rupees(selected.amount)}
            </h3>
            <p>
              Select one book entry or multiple entries for a split match. The
              sum must exactly equal the statement movement.
            </p>
            {suggestions.map((j) => (
              <label key={j.id} className="m-check">
                <input
                  type="checkbox"
                  checked={ids.includes(j.id)}
                  onChange={(e) =>
                    setIds(
                      e.target.checked
                        ? [...ids, j.id]
                        : ids.filter((id) => id !== j.id),
                    )
                  }
                />
                {j.date} · {j.memo} · {rupees(cashDelta(j, "bank"))} · {j.id}
              </label>
            ))}
            <div className="m-toolbar">
              <button
                onClick={() =>
                  void commit("Match accepted", (s, c) =>
                    op.reconcile(s, c, row, ids),
                  )
                }
              >
                Accept selected match
              </button>
              <button
                onClick={() =>
                  void commit("Match rejected", (s, c) =>
                    op.reconcile(s, c, row, [], true),
                  )
                }
              >
                Reject suggestion
              </button>
            </div>
            <form
              className="m-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = val(e);
                void commit("Statement movement categorized", (s, c) =>
                  op.recordStatementRow(
                    s,
                    c,
                    row,
                    str(f, "kind") as ManualKind,
                    f.has("confirm"),
                  ),
                );
              }}
            >
              <Field label="Record missing movement (never re-record an existing invoice collection)">
                <select name="kind">
                  {[
                    "Owner capital",
                    "Operating expense",
                    "Owner drawings",
                    "Transfer",
                    "Cash sale",
                    "Loan disbursement",
                  ].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <label className="m-check">
                <input name="confirm" type="checkbox" required />
                This is a missing movement; confirm journal and matching
              </label>
              <button>Record & match</button>
            </form>
          </section>
        )}
      </Panel>
      <JournalForm />
      <Ledger />
    </>
  );
}
function JournalForm() {
  const { commit } = useData();
  return (
    <Panel title="Record an actual cash / non-cash event">
      <p>
        Loan principal is a liability movement. Interest and charges are
        expenses. Depreciation changes profit without changing cash.
      </p>
      <form
        className="m-form"
        onSubmit={(e) => {
          e.preventDefault();
          const f = val(e);
          void commit("Journal posted", (s, c) =>
            op.manual(s, c, {
              kind: str(f, "kind") as ManualKind,
              amount: paise(num(f, "amount")),
              date: str(f, "date"),
              memo: str(f, "memo"),
              account: str(f, "account") as "bank" | "cash",
              principal: paise(num(f, "principal")),
              interest: paise(num(f, "interest")),
              fees: paise(num(f, "fees")),
              confirmed: f.has("confirm"),
            }),
          );
        }}
      >
        <Field label="Event">
          <select name="kind">
            {[
              "Cash sale",
              "Operating expense",
              "Owner capital",
              "Owner drawings",
              "Loan disbursement",
              "Loan repayment",
              "Depreciation",
              "Transfer",
            ].map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Amount (₹)">
          <MoneyInput name="amount" />
        </Field>
        <Field label="Date">
          <input type="date" name="date" defaultValue={today()} required />
        </Field>
        <Field label="Memo / source">
          <input name="memo" required minLength={2} />
        </Field>
        <Field label="Cash account (transfer: from account)">
          <select name="account">
            <option>bank</option>
            <option>cash</option>
          </select>
        </Field>
        {["principal", "interest", "fees"].map((k) => (
          <Field key={k} label={k + " (₹, loan repayment only)"}>
            <MoneyInput name={k} />
          </Field>
        ))}
        <label className="m-check">
          <input name="confirm" type="checkbox" required />I reviewed the
          transaction and confirm posting
        </label>
        <button>Post balanced journal</button>
      </form>
    </Panel>
  );
}
function Ledger() {
  const { s, c } = useData();
  return (
    <Panel title="Posted passbook · latest 40 entries">
      <Table
        heads={["Date", "Source / journal", "Cash movement", "Audit actor"]}
      >
        {s.journals
          .filter((j) => j.businessId === c.businessId)
          .slice(-40)
          .reverse()
          .map((j) => (
            <tr key={j.id}>
              <td>{j.date}</td>
              <td>
                <details>
                  <summary>{j.memo}</summary>
                  <pre>{JSON.stringify(j.lines, null, 2)}</pre>
                </details>
                <small>
                  {j.id} · {j.sourceId}
                </small>
              </td>
              <td>{rupees(cashDelta(j))}</td>
              <td>{j.actor}</td>
            </tr>
          ))}
      </Table>
    </Panel>
  );
}
function Inventory() {
  const { s, c, commit } = useData();
  return (
    <>
      <Panel title="Stock register · standard cost">
        <p>
          Posted invoices deduct stock. Purchases and proportional returns
          update quantities. Purchase price differences are expensed; this is
          not weighted-average or tax inventory valuation.
        </p>
        <Table
          heads={[
            "SKU / product",
            "On hand",
            "Standard cost",
            "Selling price",
            "Stock value",
            "Reorder / activity",
          ]}
        >
          {s.items
            .filter((i) => i.businessId === c.businessId)
            .map((i) => (
              <tr key={i.id}>
                <td>
                  {i.sku}
                  <small>{i.name}</small>
                </td>
                <td>
                  {quantity(s, i.id)} {i.unit}
                </td>
                <td>{rupees(i.cost)}</td>
                <td>{rupees(i.price)}</td>
                <td>{rupees(Math.round(quantity(s, i.id) * i.cost))}</td>
                <td>
                  {quantity(s, i.id) <= i.reorderLevel
                    ? "Reorder review"
                    : "Above reorder level"}
                  <small>
                    {s.movements.some(
                      (m) =>
                        m.itemId === i.id &&
                        m.kind === "Sale" &&
                        m.date >= plusDays(today(), -30),
                    )
                      ? "Sold within 30 days"
                      : "No recorded sale in 30 days"}
                  </small>
                </td>
              </tr>
            ))}
        </Table>
      </Panel>
      <div className="m-two">
        <Panel title="Add a product">
          <form
            className="m-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = val(e);
              void commit("Product created", (s, c) =>
                op.addItem(
                  s,
                  c,
                  {
                    sku: str(f, "sku"),
                    name: str(f, "name"),
                    unit: str(f, "unit"),
                    cost: paise(num(f, "cost")),
                    price: paise(num(f, "price")),
                    reorderLevel: num(f, "reorder"),
                  },
                  num(f, "quantity"),
                  f.has("confirm"),
                ),
              );
            }}
          >
            {["sku", "name", "unit"].map((k) => (
              <Field key={k} label={k}>
                <input name={k} required />
              </Field>
            ))}
            {["cost", "price", "reorder", "quantity"].map((k) => (
              <Field
                key={k}
                label={k === "cost" || k === "price" ? k + " (₹)" : k}
              >
                <MoneyInput name={k} />
              </Field>
            ))}
            <label className="m-check">
              <input type="checkbox" name="confirm" />
              Opening stock quantity is confirmed synthetic stock; credit
              opening capital
            </label>
            <button>Add product</button>
          </form>
        </Panel>
        <Panel title="Stock adjustment">
          <form
            className="m-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = val(e);
              void commit("Stock adjusted", (s, c) =>
                op.adjustStock(
                  s,
                  c,
                  str(f, "item"),
                  num(f, "delta"),
                  str(f, "memo"),
                  f.has("confirm"),
                ),
              );
            }}
          >
            <Field label="Product">
              <select name="item">
                {s.items
                  .filter((i) => i.businessId === c.businessId)
                  .map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Signed quantity adjustment">
              <input type="number" name="delta" step=".01" required />
            </Field>
            <Field label="Reason / source">
              <input name="memo" required minLength={4} />
            </Field>
            <label className="m-check">
              <input type="checkbox" name="confirm" required />
              Confirm adjustment and expense variance
            </label>
            <button>Adjust stock</button>
          </form>
          <details>
            <summary>Stock movement evidence</summary>
            <pre>
              {JSON.stringify(
                s.movements.filter((m) => m.businessId === c.businessId),
                null,
                2,
              )}
            </pre>
          </details>
        </Panel>
      </div>
    </>
  );
}
function Cashflow() {
  const { s, c, commit } = useData();
  const [horizon, setHorizon] = useState(30),
    [scenario, setScenario] = useState<"Base" | "Downside">("Base"),
    [a, setA] = useState(defaultAssumptions);
  const r = forecastBusiness(s, c, horizon, scenario, a);
  return (
    <>
      <Panel title="Plan the next move">
        <div className="m-form">
          <Field label="Forecast horizon">
            <select
              value={horizon}
              onChange={(e) => setHorizon(+e.target.value)}
            >
              {[30, 60, 90].map((v) => (
                <option key={v} value={v}>
                  {v} days
                </option>
              ))}
            </select>
          </Field>
          <Field label="Scenario">
            <select
              value={scenario}
              onChange={(e) =>
                setScenario(e.target.value as "Base" | "Downside")
              }
            >
              <option>Base</option>
              <option>Downside</option>
            </select>
          </Field>
          {Object.entries(a).map(([k, v]) => (
            <Field
              key={k}
              label={
                k +
                (k.includes("Change")
                  ? " (fraction, −0.2 = −20%)"
                  : /Debt|Payment|Buffer/.test(k)
                    ? " (₹)"
                    : " (days)")
              }
            >
              <input
                type="number"
                step={k.includes("Change") ? ".05" : "1"}
                min={
                  k.includes("Change") ? (k === "salesChange" ? -0.9 : -0.5) : 0
                }
                max={
                  k === "salesChange"
                    ? 1
                    : k === "costChange"
                      ? 2
                      : k.includes("Delay")
                        ? 180
                        : 1e8
                }
                value={/Debt|Payment|Buffer/.test(k) ? v / 100 : v}
                onChange={(e) =>
                  setA({
                    ...a,
                    [k]: /Debt|Payment|Buffer/.test(k)
                      ? paise(Math.min(1e8, Math.max(0, +e.target.value)))
                      : Math.min(
                          k === "salesChange"
                            ? 1
                            : k === "costChange"
                              ? 2
                              : 180,
                          Math.max(
                            k === "salesChange"
                              ? -0.9
                              : k === "costChange"
                                ? -0.5
                                : 0,
                            +e.target.value,
                          ),
                        ),
                  })
                }
              />
            </Field>
          ))}
        </div>
        <p>
          Downside adds 14 collection days, −20% cash sales, +15% costs and 7
          supplier-delay days. Delayed suppliers are an assumption requiring
          agreement, not a recommendation to breach terms.
        </p>
        <div className="m-metrics">
          <Metric
            label="Closing cash estimate"
            value={rupees(r.days.at(-1)!.closing)}
          />
          <Metric
            label="Peak buffer shortfall"
            value={rupees(Math.max(...r.days.map((d) => d.gap)))}
          />
          <Metric
            label="Days below buffer"
            value={r.days.filter((d) => d.gap > 0).length}
          />
          <Metric label="Selected baseline" value={r.method} />
        </div>
        <ForecastChart days={r.days} />
        <button
          onClick={() =>
            void commit("Forecast snapshot saved", (s, c) =>
              op.saveForecast(s, c, r),
            )
          }
        >
          Save reproducible snapshot
        </button>
        <button
          onClick={() =>
            guardedExport(s, c, () =>
              download("cash-forecast.json", JSON.stringify(r, null, 2)),
            )
          }
        >
          Export forecast
        </button>
        <ul>
          {r.warnings.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </Panel>
      <Panel title="Backtest evidence · rolling origin, cash-sales baseline">
        <Table heads={["Method", "MAE (₹)", "WAPE", "Evaluation"]}>
          {r.metrics.map((m) => (
            <tr key={m.method}>
              <td>{m.method}</td>
              <td>{rupees(m.mae)}</td>
              <td>
                {m.wape === null
                  ? "Undefined: zero actuals"
                  : (m.wape * 100).toFixed(2) + "%"}
              </td>
              <td>
                Up to 14 one-step daily origins; train uses earlier dates only
              </td>
            </tr>
          ))}
        </Table>
        {!r.metrics.length && <p>Insufficient history for method selection.</p>}
        <p>
          One-step baseline level repeats across the horizon; there is no
          multi-step trend or validated seasonal model. Credit invoices are
          scheduled separately to avoid counting them as cash sales.
        </p>
      </Panel>
      <Panel title="Daily projection">
        <Table
          heads={[
            "Date",
            "Opening",
            "Collections + cash sales",
            "Suppliers + expenses + debt + tax",
            "Closing",
            "Buffer gap",
          ]}
        >
          {r.days.map((d) => (
            <tr key={d.date}>
              <td>{d.date}</td>
              <td>{rupees(d.opening)}</td>
              <td>{rupees(d.inflows)}</td>
              <td>{rupees(d.outflows)}</td>
              <td>{rupees(d.closing)}</td>
              <td>{rupees(d.gap)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
      <Panel title="Saved forecasts vs recorded cash">
        <Table
          heads={[
            "Snapshot",
            "As of / scenario",
            "Forecast closing",
            "Actual at forecast end",
            "Coverage",
          ]}
        >
          {s.forecasts
            .filter((f) => f.businessId === c.businessId)
            .map((f) => (
              <tr key={f.id}>
                <td>{f.id}</td>
                <td>
                  {f.asOf} / {f.scenario}
                </td>
                <td>{rupees(f.days.at(-1)!.closing)}</td>
                <td>
                  {f.days.at(-1)!.date <= today()
                    ? rupees(
                        financials(s, c.businessId, f.days.at(-1)!.date).cash,
                      )
                    : "Future — unavailable"}
                </td>
                <td>Actual reflects recorded entries only</td>
              </tr>
            ))}
        </Table>
      </Panel>
    </>
  );
}
function Collections() {
  const { s, c, commit } = useData();
  return (
    <>
      <div className="m-metrics">
        {["Not due", "1–30 days", "31–60 days", "Over 60 days"].map(
          (bucket) => (
            <Metric
              key={bucket}
              label={bucket}
              value={rupees(
                ageing(s, c.businessId)
                  .filter((a) => a.bucket === bucket)
                  .reduce((v, a) => v + a.amount, 0),
              )}
            />
          ),
        )}
      </div>
      {ageing(s, c.businessId).map((a) => {
        const follow = s.followups.find((f) => f.documentId === a.document.id);
        return (
          <Panel
            key={a.document.id}
            title={a.document.number + " · " + rupees(a.amount)}
          >
            <p>
              {s.parties.find((p) => p.id === a.document.partyId)?.name} · due{" "}
              {a.document.dueDate} · {a.bucket} · source {a.document.id}
            </p>
            <form
              className="m-form"
              onSubmit={(e) => {
                e.preventDefault();
                const f = val(e);
                void commit("Follow-up draft saved", (s, c) =>
                  op.addFollowup(s, c, {
                    documentId: a.document.id,
                    promiseDate: str(f, "promise"),
                    disputed: f.has("disputed"),
                    outcome: str(f, "outcome"),
                    draft: str(f, "draft"),
                    scheduled: f.has("scheduled"),
                  }),
                );
              }}
            >
              <Field label="Promise date">
                <input
                  type="date"
                  name="promise"
                  defaultValue={follow?.promiseDate}
                />
              </Field>
              <Field label="Outcome / next step">
                <input
                  name="outcome"
                  defaultValue={follow?.outcome || "Awaiting customer response"}
                />
              </Field>
              <Field label="Reminder draft (never sent)">
                <textarea
                  name="draft"
                  defaultValue={
                    follow?.draft ||
                    `Please review invoice ${a.document.number}, balance ${rupees(a.amount)}, due ${a.document.dueDate}. Let us know if there is a dispute or agreed payment date.`
                  }
                />
              </Field>
              <label className="m-check">
                <input
                  name="disputed"
                  type="checkbox"
                  defaultChecked={follow?.disputed}
                />
                Invoice disputed — review before following up
              </label>
              <label className="m-check">
                <input
                  name="scheduled"
                  type="checkbox"
                  defaultChecked={follow?.scheduled}
                />
                Save local reminder marker (no background sending)
              </label>
              <button>Save follow-up draft</button>
            </form>
          </Panel>
        );
      })}
      <Link to="/business/sales">
        Record confirmed collections in Sales & Invoices →
      </Link>
    </>
  );
}
function Funding() {
  const { s, c } = useData();
  const [principal, setPrincipal] = useState(100000),
    [rate, setRate] = useState(14),
    [months, setMonths] = useState(12),
    [fees, setFees] = useState(1500),
    [type, setType] = useState<"flat" | "reducing">("reducing"),
    [frequency, setFrequency] = useState<"monthly" | "weekly" | "daily">(
      "monthly",
    );
  const schedule = loanSchedule({
    principal: paise(principal),
    annualRate: rate,
    months,
    fees: paise(fees),
    type,
    frequency,
    start: today(),
  });
  const f = forecastBusiness(s, c),
    gap = Math.max(...f.days.map((d) => d.gap));
  return (
    <>
      <Panel title="A financing comparison, not a loan application">
        <p>
          Funding needs depend on recorded cash, buffer assumptions and
          collections. No lender offer, eligibility decision, credit bureau
          check, submission or approval.
        </p>
        <div className="m-metrics">
          <Metric label="30-day buffer shortfall" value={rupees(gap)} />
          <Metric
            label="Collectable invoice balance"
            value={rupees(financials(s, c.businessId).receivables)}
          />
          <Metric
            label="Existing loan principal"
            value={rupees(financials(s, c.businessId).loan)}
          />
        </div>
        <div className="m-form">
          <Field label="Principal (₹)">
            <input
              type="number"
              min="1"
              max="100000000"
              value={principal}
              onChange={(e) =>
                setPrincipal(Math.min(1e8, Math.max(1, +e.target.value)))
              }
            />
          </Field>
          <Field label="Annual stated rate %">
            <input
              type="number"
              min="0"
              max="100"
              value={rate}
              onChange={(e) =>
                setRate(Math.min(100, Math.max(0, +e.target.value)))
              }
            />
          </Field>
          <Field label="Term (months)">
            <input
              type="number"
              min="1"
              max="120"
              value={months}
              onChange={(e) =>
                setMonths(
                  Math.min(120, Math.max(1, Math.round(+e.target.value))),
                )
              }
            />
          </Field>
          <Field label="Upfront fees (₹)">
            <input
              type="number"
              min="0"
              value={fees}
              onChange={(e) =>
                setFees(Math.min(1e8, Math.max(0, +e.target.value)))
              }
            />
          </Field>
          <Field label="Rate method">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "flat" | "reducing")}
            >
              <option value="reducing">Reducing balance</option>
              <option value="flat">Flat</option>
            </select>
          </Field>
          <Field label="Payment frequency">
            <select
              value={frequency}
              onChange={(e) =>
                setFrequency(e.target.value as "monthly" | "weekly" | "daily")
              }
            >
              <option>monthly</option>
              <option>weekly</option>
              <option>daily</option>
            </select>
          </Field>
        </div>
        <div className="m-metrics">
          <Metric
            label="Total interest"
            value={rupees(schedule.totalInterest)}
          />
          <Metric
            label="Total repayment incl fees"
            value={rupees(schedule.totalRepayment)}
          />
          <Metric
            label="First payment"
            value={rupees(schedule.rows[0].payment)}
            detail={schedule.rows[0].date}
          />
        </div>
        <p>{schedule.convention}</p>
        <button
          onClick={() =>
            guardedExport(s, c, () =>
              download(
                "indicative-schedule.json",
                JSON.stringify(schedule, null, 2),
              ),
            )
          }
        >
          Export indicative schedule
        </button>
      </Panel>
      <div className="m-two">
        {(["reducing", "flat"] as const).map((method) => {
          const x = loanSchedule({
            principal: paise(principal),
            annualRate: rate,
            months,
            fees: paise(fees),
            type: method,
            frequency,
            start: today(),
          });
          return (
            <Panel key={method} title={"Sample " + method + " illustration"}>
              <span className="m-badge amber">SAMPLE — NOT A REAL OFFER</span>
              <h3>{rupees(x.totalRepayment)} total</h3>
              <p>
                Same principal, stated rate, fees, frequency and term; {method}{" "}
                method. Compare total cost, not just the rate label.
              </p>
            </Panel>
          );
        })}
      </div>
      <Panel title="Non-loan next steps">
        <p>
          Review overdue invoices and disputes before assuming collections.
          Compare lower discretionary stock purchases and a smaller buffer gap.
          Discuss supplier timing explicitly; forecasts do not imply supplier
          agreement. None of these actions guarantees financing or cash
          availability.
        </p>
        <Link to="/business/collections">Inspect collection evidence →</Link>
      </Panel>
      <Panel title="Payment schedule">
        <Table
          heads={[
            "Period",
            "Date",
            "Principal",
            "Interest",
            "Payment",
            "Principal remaining",
          ]}
        >
          {schedule.rows.map((r) => (
            <tr key={r.period}>
              <td>{r.period}</td>
              <td>{r.date}</td>
              <td>{rupees(r.principal)}</td>
              <td>{rupees(r.interest)}</td>
              <td>{rupees(r.payment)}</td>
              <td>{rupees(r.balance)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </>
  );
}
function Marketplace() {
  const { s, c, commit } = useData();
  const parties = s.parties.filter((p) => p.businessId === c.businessId),
    rfqs = s.rfqs.filter((r) => r.businessId === c.businessId);
  return (
    <>
      <Panel title="Your trade network · self-reported demo profiles">
        <p>
          These are local synthetic listings, not verified participants,
          delivered leads, or an ONDC connection. Quotes, shortlists and
          outcomes stay in this browser.
        </p>
        <Table
          heads={[
            "Party / role",
            "Location",
            "Payment terms",
            "Demo status",
            "Actions",
          ]}
        >
          {parties.map((p) => (
            <tr key={p.id}>
              <td>
                {p.name}
                <small>
                  {p.id} · {p.type}
                </small>
              </td>
              <td>{p.location}</td>
              <td>{p.termsDays} days</td>
              <td>
                {p.verification} · {p.blocked ? "Blocked" : "Active"}
              </td>
              <td>
                <button
                  onClick={() =>
                    void commit("Party block state changed", (s, c) => {
                      authorize(s, c, "market");
                      const x = s.parties.find(
                        (x) => x.id === p.id && x.businessId === c.businessId,
                      )!;
                      const before = { ...x };
                      x.blocked = !x.blocked;
                      audit(s, c, "Party block changed", x.id, before, x);
                    })
                  }
                >
                  {p.blocked ? "Unblock" : "Block"}
                </button>
                <Confirm text="Report demo listing">
                  {(yes) => {
                    if (yes)
                      void commit("Listing reported", (s, c) => {
                        authorize(s, c, "market");
                        s.complaints.push({
                          id: uid(s, "CMP"),
                          businessId: c.businessId,
                          partyId: p.id,
                          reason: "User requested listing review",
                          status: "Needs review",
                        });
                        audit(s, c, "Listing reported", p.id, null, {
                          reason: "User requested review",
                        });
                      });
                  }}
                </Confirm>
              </td>
            </tr>
          ))}
        </Table>
        <details>
          <summary>Add customer / supplier</summary>
          <form
            className="m-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = val(e);
              void commit("Party saved", (s, c) =>
                op.addParty(s, c, {
                  name: str(f, "name"),
                  type: str(f, "type"),
                  termsDays: num(f, "days"),
                  location: str(f, "location"),
                  notes: str(f, "notes"),
                }),
              );
            }}
          >
            <Field label="Name">
              <input name="name" required />
            </Field>
            <Field label="Role">
              <select name="type">
                <option>customer</option>
                <option>supplier</option>
                <option>both</option>
              </select>
            </Field>
            <Field label="Location">
              <input name="location" required />
            </Field>
            <Field label="Payment terms days">
              <input
                name="days"
                type="number"
                min="0"
                max="365"
                defaultValue="30"
                required
              />
            </Field>
            <Field label="Notes / catalogue description">
              <textarea name="notes" />
            </Field>
            <button>Add self-reported party</button>
          </form>
        </details>
      </Panel>
      <div className="m-two">
        <Panel title="Create a synthetic RFQ">
          <form
            className="m-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = val(e);
              void commit("RFQ saved", (s, c) =>
                op.addRFQ(s, c, {
                  product: str(f, "product"),
                  quantity: num(f, "quantity"),
                  location: str(f, "location"),
                  deliveryDate: str(f, "delivery"),
                  specification: str(f, "spec"),
                  budget: paise(num(f, "budget")),
                  terms: str(f, "terms"),
                }),
              );
            }}
          >
            {["product", "location", "spec", "terms"].map((k) => (
              <Field key={k} label={k}>
                <input name={k} required minLength={2} />
              </Field>
            ))}
            <Field label="Quantity">
              <input type="number" name="quantity" min="1" required />
            </Field>
            <Field label="Budget (₹)">
              <MoneyInput name="budget" />
            </Field>
            <Field label="Delivery date">
              <input
                type="date"
                name="delivery"
                defaultValue={plusDays(today(), 14)}
                required
              />
            </Field>
            <button>Create local RFQ</button>
          </form>
        </Panel>
        <Panel title="Record a quotation">
          <form
            className="m-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = val(e);
              void commit("Quote saved", (s, c) =>
                op.addQuote(s, c, {
                  rfqId: str(f, "rfq"),
                  supplierId: str(f, "supplier"),
                  unitPrice: paise(num(f, "unit")),
                  freight: paise(num(f, "freight")),
                  tax: num(f, "tax"),
                  leadDays: num(f, "lead"),
                  validUntil: str(f, "valid"),
                  terms: str(f, "terms"),
                }),
              );
            }}
          >
            <Field label="RFQ">
              <select name="rfq" required>
                <option value="">Select RFQ</option>
                {rfqs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.product} · {r.quantity}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Supplier">
              <select name="supplier">
                {parties
                  .filter((p) => p.type !== "customer" && !p.blocked)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </Field>
            {["unit", "freight", "tax", "lead"].map((k) => (
              <Field
                key={k}
                label={k + (k === "unit" || k === "freight" ? " (₹)" : "")}
              >
                <MoneyInput name={k} />
              </Field>
            ))}
            <Field label="Valid until">
              <input
                name="valid"
                type="date"
                defaultValue={plusDays(today(), 7)}
                required
              />
            </Field>
            <Field label="Terms">
              <input name="terms" required minLength={2} />
            </Field>
            <button>Record demo quote</button>
          </form>
        </Panel>
      </div>
      {rfqs.map((r) => (
        <Panel key={r.id} title={r.product + " · " + r.id}>
          <p>
            {r.quantity} units · {r.location} · delivery {r.deliveryDate} ·
            budget {rupees(r.budget)} · {r.specification} · {r.terms}
          </p>
          <Table
            heads={[
              "Supplier",
              "Delivered quote total",
              "Lead days",
              "Validity",
              "Terms",
              "Shortlist",
            ]}
          >
            {s.quotes
              .filter((q) => q.rfqId === r.id)
              .sort((a, b) => op.quoteTotal(s, a.id) - op.quoteTotal(s, b.id))
              .map((q) => (
                <tr key={q.id}>
                  <td>{parties.find((p) => p.id === q.supplierId)?.name}</td>
                  <td>{rupees(op.quoteTotal(s, q.id))}</td>
                  <td>{q.leadDays}</td>
                  <td>{q.validUntil}</td>
                  <td>{q.terms}</td>
                  <td>
                    <button
                      onClick={() =>
                        void commit("Quote shortlist changed", (s, c) => {
                          authorize(s, c, "market");
                          const x = s.quotes.find(
                            (x) =>
                              x.id === q.id && x.businessId === c.businessId,
                          )!;
                          x.shortlisted = !x.shortlisted;
                          audit(s, c, "Quote shortlist changed", x.id, null, x);
                        })
                      }
                    >
                      {q.shortlisted ? "Shortlisted ✓" : "Shortlist"}
                    </button>
                  </td>
                </tr>
              ))}
          </Table>
          <Field label="Record local RFQ outcome (no order is transmitted)">
            <select
              value={r.outcome}
              onChange={(e) =>
                void commit("RFQ outcome saved", (s, c) => {
                  authorize(s, c, "market");
                  const x = s.rfqs.find(
                    (x) => x.id === r.id && x.businessId === c.businessId,
                  )!;
                  const before = { ...x };
                  x.outcome = e.target.value as typeof x.outcome;
                  audit(s, c, "RFQ outcome changed", x.id, before, x);
                })
              }
            >
              {["Open", "Shortlisted", "Demo order recorded", "Closed"].map(
                (v) => (
                  <option key={v}>{v}</option>
                ),
              )}
            </select>
          </Field>
        </Panel>
      ))}
    </>
  );
}
function Tax() {
  const { s, c, commit } = useData();
  const f = financials(s, c.businessId);
  return (
    <>
      <div className="m-metrics">
        <Metric label="Recorded output GST" value={rupees(f.taxPayable)} />
        <Metric label="Recorded input GST" value={rupees(f.inputTax)} />
        <Metric
          label="Illustrative net GST"
          value={rupees(f.taxPayable - f.inputTax)}
          detail="Not eligibility, return or liability advice"
        />
      </div>
      <Panel title="Internal accountant task list">
        <p>
          Dates below are manually sourced internal review dates, not statutory
          filing deadlines. No GST validation, ITC eligibility check, government
          filing, challan or tax payment integration exists.
        </p>
        {s.taxTasks
          .filter((t) => t.businessId === c.businessId)
          .map((t) => (
            <div className="m-inset" key={t.id}>
              <h3>{t.title}</h3>
              <p>
                Review date {t.dueDate} · source {t.source} · last reviewed{" "}
                {t.reviewedAt}
              </p>
              <select
                aria-label={"Tax task status " + t.id}
                value={t.status}
                onChange={(e) =>
                  void commit("Internal tax task updated", (s, c) => {
                    authorize(s, c, "tax");
                    const x = s.taxTasks.find(
                      (x) => x.id === t.id && x.businessId === c.businessId,
                    )!;
                    const before = { ...x };
                    x.status = e.target.value as typeof x.status;
                    x.reviewedAt = today();
                    audit(s, c, "Internal tax task status", x.id, before, x);
                  })
                }
              >
                {[
                  "Data needed",
                  "Draft ready",
                  "Accountant review",
                  "Awaiting user approval",
                  "Simulated submission",
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
          ))}
        <form
          className="m-form"
          onSubmit={(e) => {
            e.preventDefault();
            const f = val(e);
            void commit("Internal tax task created", (s, c) => {
              authorize(s, c, "tax");
              if (!str(f, "title").trim() || !str(f, "source").trim())
                throw new Error("Enter task and date source");
              s.taxTasks.push({
                id: uid(s, "TAX"),
                businessId: c.businessId,
                title: str(f, "title"),
                dueDate: str(f, "date"),
                source: str(f, "source"),
                reviewedAt: today(),
                status: "Data needed",
              });
              audit(s, c, "Internal task created", c.businessId, null, {
                title: str(f, "title"),
              });
            });
          }}
        >
          <Field label="Internal review task">
            <input name="title" required />
          </Field>
          <Field label="Internal due date">
            <input name="date" type="date" required />
          </Field>
          <Field label="Source / reason for date">
            <input name="source" required />
          </Field>
          <button>Add review task</button>
        </form>
      </Panel>
    </>
  );
}
function Reports() {
  const { s, c } = useData();
  const f = financials(s, c.businessId),
    exportData = () => {
      authorize(s, c, "export");
      return {
        version: "business-ledger-1",
        exportedAt: new Date().toISOString(),
        disclaimer:
          "Synthetic browser-local demonstration; not statutory accounts or verified tax data.",
        business: s.businesses.find((b) => b.id === c.businessId),
        financials: f,
        ...Object.fromEntries(
          Object.entries(s)
            .filter(([, v]) => Array.isArray(v))
            .map(([k, v]) => [
              k,
              (v as { businessId?: string }[]).filter(
                (x) => x.businessId === c.businessId,
              ),
            ]),
        ),
      };
    };
  return (
    <>
      <Panel title="A traceable financial snapshot">
        <div className="m-toolbar">
          <button
            onClick={() => {
              try {
                download(
                  "saakh-business-report.json",
                  JSON.stringify(exportData(), null, 2),
                );
              } catch (e) {
                void useBusiness.getState().commit("Export", () => {
                  throw e;
                });
              }
            }}
          >
            Export business JSON
          </button>
          <button
            onClick={() => {
              try {
                authorize(s, c, "export");
                download(
                  "saakh-journals.csv",
                  [
                    [
                      "id",
                      "date",
                      "source",
                      "account",
                      "debit_paise",
                      "credit_paise",
                    ],
                    ...s.journals
                      .filter((j) => j.businessId === c.businessId)
                      .flatMap((j) =>
                        j.lines.map((l) => [
                          j.id,
                          j.date,
                          j.sourceId,
                          l.account,
                          l.debit,
                          l.credit,
                        ]),
                      ),
                  ]
                    .map((r) => r.map(csvCell).join(","))
                    .join("\n"),
                  "text/csv",
                );
              } catch (e) {
                void useBusiness.getState().commit("Export", () => {
                  throw e;
                });
              }
            }}
          >
            Export journal CSV
          </button>
          <button onClick={() => guardedExport(s, c, () => window.print())}>
            Print / save as PDF
          </button>
        </div>
        <p>
          Formula version business-ledger-1 · currency INR · integer paise ·
          recorded dates only · export includes audit evidence and local
          assumptions. This is not a statutory financial statement.
        </p>
        <div className="m-metrics">
          <Metric label="Revenue" value={rupees(f.revenue)} />
          <Metric
            label="Recorded expenses"
            value={rupees(f.operatingExpenses)}
          />
          <Metric label="Accrual profit" value={rupees(f.profit)} />
          <Metric label="Loan liability" value={rupees(f.loan)} />
        </div>
        <Table heads={["Balance sheet", "Amount"]}>
          <tr>
            <td>Assets</td>
            <td>{rupees(f.assets)}</td>
          </tr>
          <tr>
            <td>Liabilities</td>
            <td>{rupees(f.liabilities)}</td>
          </tr>
          <tr>
            <td>Equity incl retained profit</td>
            <td>{rupees(f.equity)}</td>
          </tr>
          <tr>
            <td>Balance check: assets − liabilities − equity</td>
            <td>{rupees(f.assets - f.liabilities - f.equity)}</td>
          </tr>
        </Table>
      </Panel>
      <Ledger />
      <Panel title="Audit trail · latest 50 events">
        <Table heads={["When / actor", "Action", "Source", "Before / after"]}>
          {s.audit
            .filter((a) => a.businessId === c.businessId)
            .slice(-50)
            .reverse()
            .map((a) => (
              <tr key={a.id}>
                <td>
                  {a.at}
                  <small>{a.actor}</small>
                </td>
                <td>{a.action}</td>
                <td>{a.sourceId}</td>
                <td>
                  <details>
                    <summary>Inspect evidence</summary>
                    <pre>
                      {JSON.stringify(
                        { before: a.before, after: a.after },
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                </td>
              </tr>
            ))}
        </Table>
      </Panel>
    </>
  );
}
function Assistant() {
  const { s, c } = useData();
  const [q, setQ] = useState("Who owes me money?"),
    [response, setResponse] = useState<ReturnType<typeof answer> | null>(null);
  return (
    <Panel title="Ask your digital munim">
      <p>
        AI-inspired, deterministic local queries. No language model, voice
        recognition or external data transfer. Answers cite records and
        distinguish estimates. Natural-language requests never post money
        movements.
      </p>
      <div className="m-toolbar">
        {[
          "Who owes me money?",
          "Which supplier bills are due?",
          "Why is bank balance different?",
          "What does next month cash look like?",
          "Compare financing scenarios",
        ].map((x) => (
          <button
            key={x}
            onClick={() => {
              setQ(x);
              setResponse(answer(s, c, x));
            }}
          >
            {x}
          </button>
        ))}
      </div>
      <form
        className="m-form"
        onSubmit={(e) => {
          e.preventDefault();
          setResponse(answer(s, c, q));
        }}
      >
        <Field label="Your question">
          <input value={q} onChange={(e) => setQ(e.target.value)} required />
        </Field>
        <button>Ask Saakh</button>
      </form>
      {response && (
        <div className="m-answer" role="status">
          <span className="m-badge">
            {response.estimate
              ? "Assumption-based estimate"
              : "Recorded-data answer"}
          </span>
          <p>{response.text}</p>
          <b>Source evidence</b>
          {response.sources.map((id) => (
            <details key={id}>
              <summary>{id}</summary>
              <pre>
                {JSON.stringify(
                  s.documents.find((d) => d.id === id) ||
                    s.journals.find((j) => j.id === id) ||
                    s.statements.find((r) => r.id === id),
                  null,
                  2,
                )}
              </pre>
            </details>
          ))}
        </div>
      )}
    </Panel>
  );
}
function Settings() {
  const { s, c, b, commit, deleteData } = useData();
  const [confirmation, setConfirmation] = useState("");
  return (
    <>
      <Panel title="Demo identity & data boundaries">
        <p>
          Business: {b?.name} · INR · {b?.language} language preference. Owner,
          staff, accountant and admin are selectable demo views. These browser
          checks are bypassable and do not provide secure login or tenant
          isolation. Do not enter real financial or personal data.
        </p>
        <p>
          Production requires authenticated server sessions, database row
          policies, restricted file storage, encryption/key management, backups,
          immutable server audit and independent security review.
        </p>
      </Panel>
      <div className="m-two">
        <Panel title="Accountant / staff access simulation">
          <form
            className="m-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = val(e);
              void commit("Demo invitation saved", (s, c) =>
                op.inviteMember(s, c, {
                  name: str(f, "name"),
                  role: str(f, "role"),
                  permissions: f.getAll("permissions").map(String),
                  expiresAt: str(f, "expiry"),
                }),
              );
            }}
          >
            <Field label="Demo member name">
              <input name="name" required />
            </Field>
            <Field label="Role">
              <select name="role">
                <option>accountant</option>
                <option>staff</option>
              </select>
            </Field>
            <Field label="Expiry">
              <input
                type="date"
                name="expiry"
                defaultValue={plusDays(today(), 30)}
                required
              />
            </Field>
            {["read", "draft", "post", "reconcile", "export", "tax"].map(
              (p) => (
                <label className="m-check" key={p}>
                  <input
                    type="checkbox"
                    name="permissions"
                    value={p}
                    defaultChecked={p === "read"}
                  />{" "}
                  {p}
                </label>
              ),
            )}
            <button>Create demo invitation</button>
          </form>
          {s.memberships
            .filter((m) => m.businessId === c.businessId)
            .map((m) => (
              <div className="m-inset" key={m.id}>
                {m.name} · {m.role} · {m.status} · expires {m.expiresAt}
                <small>
                  {m.permissions.join(", ")} — no message sent and no
                  authenticated account created
                </small>
                <button
                  onClick={() =>
                    void commit("Demo access revoked", (s, c) => {
                      authorize(s, c, "settings");
                      const x = s.memberships.find(
                        (x) => x.id === m.id && x.businessId === c.businessId,
                      )!;
                      x.status = "Revoked";
                      audit(s, c, "Demo membership revoked", x.id, null, x);
                    })
                  }
                >
                  Revoke demo invitation
                </button>
              </div>
            ))}
        </Panel>
        <Panel title="Purpose-specific consent record">
          <form
            className="m-form"
            onSubmit={(e) => {
              e.preventDefault();
              const f = val(e);
              void commit("Demo consent saved", (s, c) =>
                op.saveConsent(s, c, {
                  purpose: str(f, "purpose"),
                  scope: str(f, "scope"),
                  recipient: str(f, "recipient"),
                  expiresAt: str(f, "expiry"),
                }),
              );
            }}
          >
            {["purpose", "scope", "recipient"].map((k) => (
              <Field key={k} label={k}>
                <input name={k} required minLength={k === "purpose" ? 8 : 3} />
              </Field>
            ))}
            <Field label="Expiry">
              <input
                type="date"
                name="expiry"
                defaultValue={plusDays(today(), 30)}
                required
              />
            </Field>
            <button>Save demo consent</button>
          </form>
          <p>
            A local consent record is not an AA consent artefact, legal consent
            determination, or permission to share externally.
          </p>
          {s.consents
            .filter((x) => x.businessId === c.businessId)
            .map((x) => (
              <div className="m-inset" key={x.id}>
                <b>{x.purpose}</b>
                <small>
                  {x.scope} · {x.recipient} · expires {x.expiresAt} ·{" "}
                  {x.revokedAt
                    ? "Revoked"
                    : x.expiresAt < today()
                      ? "Expired"
                      : "Recorded locally"}
                </small>
                {!x.revokedAt && (
                  <button
                    onClick={() =>
                      void commit("Consent revoked", (s, c) =>
                        op.revokeConsent(s, c, x.id),
                      )
                    }
                  >
                    Revoke consent
                  </button>
                )}
              </div>
            ))}
        </Panel>
      </div>
      <Panel title="Integration readiness">
        <p>
          All adapters are disabled. No bank, lender, GST, messaging, AA or ONDC
          request is transmitted.
        </p>
        <Table heads={["Capability", "Readiness", "Meaning"]}>
          {integrations.map((i) => (
            <tr key={i.name}>
              <td>{i.name}</td>
              <td>{i.status}</td>
              <td>{i.prerequisites}</td>
            </tr>
          ))}
        </Table>
        <Link to="/app/responsible">Responsible AI & methodology →</Link>
      </Panel>
      <Panel title="Export or remove browser-local Saakh records">
        <p>
          Export the selected business from Reports first. Deletion removes the
          Saakh ledger and saved credit history keys from this browser. Browser
          preferences and fixed source fixtures are retained. Other
          applications’ storage is untouched.
        </p>
        <Field label="Type DELETE to confirm">
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
          />
        </Field>
        <button
          className="m-danger"
          onClick={() => void deleteData(confirmation)}
        >
          Delete local Saakh records
        </button>
      </Panel>
    </>
  );
}
function Admin() {
  const { s, c, commit } = useData();
  if (c.role !== "admin")
    return (
      <Panel title="Demo admin view restricted">
        <p>
          Select the admin demo role to inspect moderation. This is a
          client-side role demonstration, not a secure administration system.
        </p>
      </Panel>
    );
  const rfqs = s.rfqs.filter((r) => r.businessId === c.businessId);
  return (
    <>
      <div className="m-metrics">
        <Metric label="Local RFQs" value={rfqs.length} />
        <Metric
          label="RFQs with quotations"
          value={
            rfqs.filter((r) => s.quotes.some((q) => q.rfqId === r.id)).length
          }
        />
        <Metric
          label="Demo orders recorded"
          value={rfqs.filter((r) => r.outcome === "Demo order recorded").length}
        />
        <Metric
          label="Unresolved reports"
          value={
            s.complaints.filter(
              (x) =>
                x.businessId === c.businessId && x.status === "Needs review",
            ).length
          }
        />
      </div>
      <Panel title="Synthetic marketplace moderation">
        <p>
          Metrics count records in the selected local demo only. They do not
          establish real marketplace liquidity, GMV or completed deliveries.
        </p>
        {s.complaints
          .filter((x) => x.businessId === c.businessId)
          .map((x) => (
            <div className="m-inset" key={x.id}>
              <p>
                {x.id} · {s.parties.find((p) => p.id === x.partyId)?.name} ·{" "}
                {x.reason}
              </p>
              <select
                aria-label={"Moderation status " + x.id}
                value={x.status}
                onChange={(e) =>
                  void commit("Moderation status saved", (s, c) => {
                    authorize(s, c, "admin");
                    const r = s.complaints.find(
                      (r) => r.id === x.id && r.businessId === c.businessId,
                    )!;
                    const before = { ...r };
                    r.status = e.target.value as typeof r.status;
                    audit(s, c, "Moderation reviewed", r.id, before, r);
                  })
                }
              >
                <option>Needs review</option>
                <option>Reviewed</option>
                <option>Escalated</option>
              </select>
            </div>
          ))}
        {!s.complaints.some((x) => x.businessId === c.businessId) && (
          <p>
            No local listing reports. Reports can be created from Buyers &
            Suppliers.
          </p>
        )}
      </Panel>
    </>
  );
}
