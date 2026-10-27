import { useState, useEffect, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  Play,
  Download,
  Check,
  ChevronRight,
  Activity,
  ShieldCheck,
  TrendingUp,
  Wallet,
  GitCompareArrows,
  Plus,
  Info,
  Search,
  RotateCcw,
} from "lucide-react";
import { useStore } from "../state/store";
import {
  schema,
  sectors,
  disclaimer,
  type Borrower,
  type Run,
  type Sources,
} from "../domain/model";
import { simulate, scenario, scenarios, impact, score } from "../engines";
import { MoneyChart, MiniChart } from "../components/Charts";
import { download, csv } from "../utils/export";
const Network = lazy(() => import("../components/Network"));
const money = (n: number) =>
  "₹" +
  (Math.abs(n) >= 1e7
    ? (n / 1e7).toFixed(2) + " Cr"
    : Math.abs(n) >= 1e5
      ? (n / 1e5).toFixed(2) + " L"
      : n.toLocaleString("en-IN", { maximumFractionDigits: 0 }));
function Title({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>
          {title}
          <span className="title-dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
      <div className="actions">{children}</div>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <span className="tag">{children}</span>;
}
function Card({
  title,
  kicker,
  children,
  action,
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="card">
      <div className="card-heading">
        <div>
          {kicker && <div className="eyebrow">{kicker}</div>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function FactorExplorer({ run }: { run: Run }) {
  const [selected, setSelected] = useState(0);
  const f = run.factors[selected];
  const prev = useStore((s) =>
    s.runs.find((x) => x.id !== run.id && x.borrower.id === run.borrower.id),
  );
  return (
    <div>
      <div className="factor-list">
        {run.factors.map((f, i) => (
          <button
            key={f.name}
            className={selected === i ? "factor active" : "factor"}
            onClick={() => setSelected(i)}
          >
            <span>
              {f.name}
              <small>{f.weight * 100}% weight</small>
            </span>
            <div className="bar">
              <i style={{ width: `${f.available ? f.value : 0}%` }} />
            </div>
            <b>{f.available ? Math.round(f.value) : "N/A"}</b>
            <ChevronRight size={14} />
          </button>
        ))}
      </div>
      <div className="xray">
        <div className="eyebrow">CREDIT DECISION X-RAY</div>
        <h3>{f.name}</h3>
        <code>{f.formula}</code>
        <p>{f.inputs}</p>
        <div className="chips">
          <Label>
            Contribution {f.available ? Math.round(f.value * f.weight * 10) : 0}{" "}
            points
          </Label>
          <Label>
            {f.available ? "Available synthetic evidence" : "Missing evidence"}
          </Label>
        </div>
        <p>
          {prev
            ? `Previous factor: ${prev.factors[selected].value.toFixed(1)} → ${f.value.toFixed(1)}. Change follows the formula and current snapshot inputs.`
            : "No previous saved run for this business. Run a modified scenario to compare."}
        </p>
      </div>
    </div>
  );
}
function Overview() {
  const { current: r, borrowers, selected, select, run, status } = useStore();
  const [period, setPeriod] = useState(0);
  const [horizon, setHorizon] = useState(12);
  const [inspect, setInspect] = useState("");
  const b = borrowers.find((x) => x.id === selected) || r.borrower;
  const [factorView, setFactorView] = useState(false);
  const point =
    period < 0
      ? r.borrower.history[12 + period]
      : period === 0
        ? r.borrower.revenue
        : r.forecast[period - 1]?.revenue;
  return (
    <>
      <Title
        eyebrow="YOUR BUSINESS, IN PERSPECTIVE"
        title="Intelligence overview"
        description="A connected view of creditworthiness, resilience, and the road ahead."
      >
        <button
          className="button secondary"
          onClick={() => download(r.id, { ...r, disclaimer })}
        >
          <Download size={15} /> Export report
        </button>
        <Link className="button" to="/app/generate">
          <Plus size={16} /> New simulation
        </Link>
      </Title>
      <div className="context-bar">
        <div className="business-avatar">
          {b.name.slice(0, 1)}
          <span />
        </div>
        <div>
          <select
            className="business-select"
            aria-label="Select business"
            value={selected}
            onChange={(e) => select(e.target.value)}
          >
            {borrowers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <p>
            {b.sector} <span>·</span> {b.city} <span>·</span> {b.age} years in
            business
          </p>
        </div>
        <div className="spacer" />
        <Label>₹{(b.loan / 100000).toFixed(0)}L requested</Label>
        <button
          className="button small secondary"
          disabled={status === "running"}
          onClick={() => void run(b)}
        >
          Run simulation <Play size={13} />
        </button>
      </div>
      {selected !== r.borrower.id && (
        <p className="notice">
          Results below belong to {r.borrower.name}. Run simulation to update
          the snapshot.
        </p>
      )}
      <div className="snapshot-line">
        <span>
          <span className="live-dot" /> {r.id}{" "}
          <span className="muted">
            /{" "}
            {status === "pending"
              ? "Illustrative baseline · not yet saved"
              : status}
          </span>
        </span>
        <span>FORMULA v1 · ALL VALUES SYNTHETIC</span>
      </div>
      <div className="metric-grid">
        <div className="metric card">
          <div className="metric-label">
            <Activity size={16} /> SAAKH SCORE <Info size={13} />
          </div>
          <div className="metric-value">
            {r.score ?? "—"}
            <small>/ 1000</small>
            <svg
              className="mini-dial"
              viewBox="0 0 60 60"
              aria-label={`Score dial: ${r.score ?? "unavailable"}`}
            >
              <circle
                cx="30"
                cy="30"
                r="23"
                fill="none"
                stroke="var(--line)"
                strokeWidth="5"
              />
              <circle
                cx="30"
                cy="30"
                r="23"
                fill="none"
                stroke="#49d9ff"
                strokeWidth="5"
                strokeDasharray={`${((r.score || 0) / 1000) * 144.5} 144.5`}
                transform="rotate(-90 30 30)"
              />
            </svg>
          </div>
          <div className="metric-foot">
            <span className="green">
              {r.score === null
                ? "Insufficient data"
                : r.score >= 750
                  ? "Lower illustrative risk"
                  : r.score >= 550
                    ? "Moderate illustrative risk"
                    : "Higher illustrative risk"}
            </span>
            <button
              className="text-link"
              onClick={() => setFactorView(!factorView)}
            >
              View factors <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
        <div className="metric card">
          <div className="metric-label">
            <Wallet size={16} /> 30-DAY CLOSING CASH
          </div>
          <div className="metric-value">{money(r.days[29].closing)}</div>
          <MiniChart values={r.days.map((x) => x.closing)} />
          <div className="metric-foot">
            Opening balance {money(r.borrower.cash)}
          </div>
        </div>
        <div className="metric card">
          <div className="metric-label">
            <ShieldCheck size={16} /> TRADE NETWORK SIGNALS
          </div>
          <div className="metric-value">
            {r.alerts.length.toString().padStart(2, "0")}
            <small>for review</small>
          </div>
          <div className="metric-foot">
            <span className={r.alerts.length ? "amber" : "green"}>
              ●{" "}
              {r.alerts.length
                ? "Anomalies need context"
                : "No rules triggered"}
            </span>
            <Link to="/app/verify">
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <div className="metric card">
          <div className="metric-label">
            <TrendingUp size={16} /> DATA CONFIDENCE
          </div>
          <div className="metric-value">
            {r.confidence}
            <small>%</small>
          </div>
          <div className="segmented-bar">
            {Array.from({ length: 20 }, (_, i) => (
              <i
                key={i}
                style={{
                  background: i < r.confidence / 5 ? "#8a7cff" : "var(--line)",
                }}
              />
            ))}
          </div>
          <div className="metric-foot">Availability coverage, not accuracy</div>
        </div>
      </div>
      {factorView && (
        <Card title="Every point, explained">
          <FactorExplorer run={r} />
        </Card>
      )}
      <div className="overview-grid">
        <Card
          title="The business behind the score"
          kicker="TRADE-GRAPH SHIELD"
          action={
            <Link className="text-link" to="/app/verify">
              Investigate <ArrowUpRight size={13} />
            </Link>
          }
        >
          <div className="card-subtitle">
            Relationships tell a story. Follow the evidence.
          </div>
          <Suspense fallback={<p>Loading network…</p>}>
            <Network graph={r.graph} period={period} onSelect={setInspect} />
          </Suspense>
          {inspect && (
            <p className="notice">
              Evidence selected: {inspect} · inspect this identifier in Verify &
              Investigate.
            </p>
          )}
        </Card>
        <Card
          title="A score you can unpack"
          kicker="SAAKH SCORE"
          action={<Label>Explainable</Label>}
        >
          <FactorExplorer run={r} />
        </Card>
      </div>
      <div className="overview-grid">
        <Card
          title="Seasonal rhythm. Financial reality."
          kicker="SEASON-OR-SLIDE"
          action={
            <select
              aria-label="Forecast horizon"
              value={horizon}
              onChange={(e) => setHorizon(+e.target.value)}
            >
              <option value="6">6 months</option>
              <option value="12">12 months</option>
            </select>
          }
        >
          <div className="chart-legend">
            <span className="cyan">● Projected cash</span>
            <span className="purple">┄ Illustrative downside</span>
            <Label>{r.classification}</Label>
          </div>
          <MoneyChart
            data={r.forecast.slice(0, horizon).map((f, i) => ({
              ...f,
              selected: period === i + 1 ? f.cash : undefined,
            }))}
          />
          {period !== 0 && (
            <p className="notice">
              Time machine: {period < 0 ? "synthetic observed" : "forecast"}{" "}
              revenue {money(point || 0)}
              {period > 0
                ? ` · projected cash ${money(r.forecast[period - 1].cash)}`
                : ""}
            </p>
          )}
          <p className="footnote">
            Deterministic assumptions · uncertainty band grows 15% of revenue
            per month.{" "}
            {r.sources.history && r.sources.bank
              ? "Available inputs are synthetic."
              : "Missing history or bank evidence: projections remain hypothetical assumptions, not evidence-supported conclusions."}
          </p>
        </Card>
        <Card
          title="Your next 30 days"
          kicker="CASH-FLOW COACH"
          action={<Label>Daily projection</Label>}
        >
          <MoneyChart data={r.days} field="closing" />
          <p className="footnote">
            Receivables ageing assumption:{" "}
            {r.borrower.delay <= 30
              ? "0–30 days"
              : r.borrower.delay <= 60
                ? "31–60 days"
                : "61–180 days"}{" "}
            · estimated receivables{" "}
            {money((r.borrower.revenue * r.borrower.delay) / 30)}. Prioritize
            statutory and essential operating obligations, then review debt due
            dates with a qualified adviser; no payment is executed.
          </p>
          <div className="coach-foot">
            <span>
              Working-capital gap{" "}
              <b>
                {money(Math.max(0, -Math.min(...r.days.map((d) => d.closing))))}
              </b>
            </span>
            <span>
              Debt-service capacity{" "}
              <b>
                {r.borrower.debt
                  ? (
                      (r.borrower.revenue - r.borrower.expenses) /
                      r.borrower.debt
                    ).toFixed(2) + "×"
                  : "No debt"}
              </b>
            </span>
          </div>
        </Card>
      </div>
      <Card
        title="Financial time machine"
        kicker="OBSERVE THE PAST. EXPLORE THE ASSUMPTIONS."
      >
        <div className="time-machine">
          <label htmlFor="time">
            {period < 0
              ? `Synthetic observed history · month ${period + 13}`
              : period === 0
                ? "Current snapshot"
                : `Forecast · month ${period}`}
          </label>
          <b>{money(point || b.revenue)} revenue</b>
          <input
            id="time"
            type="range"
            min="-12"
            max="12"
            value={period}
            onChange={(e) => setPeriod(+e.target.value)}
          />
          <p>
            Scrubbing changes this revenue readout and highlights graph flow
            positions. Network topology is the snapshot; historical transaction
            topology is not modeled.
          </p>
        </div>
      </Card>
      <div className="overview-grid">
        <Card title="Recommended next steps" kicker="ACTION, WITH A REASON">
          {r.recommendations.map((x, i) => (
            <details key={x.title} className="recommendation">
              <summary>
                <span className="step-no">0{i + 1}</span>
                {x.title}
                <ArrowUpRight size={15} />
              </summary>
              <p>
                <b>Trigger:</b> {x.trigger}
              </p>
              <p>{x.action}</p>
              <small>{x.limitation}</small>
            </details>
          ))}
        </Card>
        <Card title="Data confidence radar" kicker="KNOW WHAT YOU KNOW">
          <div className="source-grid">
            {Object.entries(r.sources).map(([k, v]) => (
              <div key={k}>
                <span className={v ? "green" : "muted"}>{v ? "●" : "○"}</span>
                <b>{k.toUpperCase()}</b>
                <small>
                  {v
                    ? k === "invoices" &&
                      r.alerts.some((a) => a.rule === "Evidence mismatch")
                      ? "Inconsistent / review"
                      : "Simulated / available"
                    : "Missing / not assumed"}
                </small>
              </div>
            ))}
          </div>
          <p className="footnote">
            AA and ULI are context toggles, not live integrations. Coverage is
            not evidence authenticity.
          </p>
        </Card>
      </div>
    </>
  );
}
function Generate() {
  const st = useStore();
  const existing =
    st.borrowers.find((b) => b.id === st.selected) || st.current.borrower;
  const [b, setB] = useState<Borrower>(structuredClone(existing));
  const [errors, setErrors] = useState("");
  const [universes, setUniverses] = useState<Run[]>([]);
  const change = (key: keyof Borrower, value: unknown) =>
    setB({ ...b, [key]: value });
  const save = () => {
    const parsed = schema.safeParse(b);
    if (!parsed.success) {
      setErrors(
        parsed.error.issues.map((i) => `${i.path}: ${i.message}`).join("; "),
      );
      return false;
    }
    st.setBorrowers([...st.borrowers.filter((x) => x.id !== b.id), b]);
    st.select(b.id);
    setErrors("");
    return true;
  };
  return (
    <>
      <Title
        eyebrow="FINANCIAL DIGITAL TWIN"
        title="Generate simulation"
        description="Change the assumptions. See how the same four engines respond."
      />
      <div className="context-bar">
        <select
          aria-label="Borrower profile"
          value={st.selected}
          onChange={(e) => {
            st.select(e.target.value);
            setB(
              structuredClone(
                st.borrowers.find((x) => x.id === e.target.value)!,
              ),
            );
          }}
        >
          {st.borrowers.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
        <button
          className="button secondary small"
          onClick={() => {
            const id = `custom-${Date.now()}`;
            const next = { ...b, id, name: "New synthetic business" };
            setB(next);
            st.setBorrowers([...st.borrowers, next]);
            st.select(id);
          }}
        >
          New borrower
        </button>
        <button
          className="button secondary small"
          onClick={() => {
            const next = {
              ...b,
              id: `copy-${Date.now()}`,
              name: b.name + " copy",
            };
            setB(next);
            st.setBorrowers([...st.borrowers, next]);
            st.select(next.id);
          }}
        >
          Duplicate
        </button>
        <button
          className="button secondary small"
          disabled={st.borrowers.length < 2}
          onClick={() => {
            const next = st.borrowers.filter((x) => x.id !== b.id);
            st.setBorrowers(next);
            st.select(next[0].id);
            setB(next[0]);
          }}
        >
          Delete
        </button>
      </div>
      <div className="overview-grid">
        <Card title="Business inputs" kicker="ALL INPUTS ARE SYNTHETIC">
          <div className="form-grid">
            {(["name", "city"] as const).map((k) => (
              <label key={k}>
                {k}
                <input
                  value={b[k]}
                  onChange={(e) => change(k, e.target.value)}
                />
              </label>
            ))}
            <label>
              Sector
              <select
                value={b.sector}
                onChange={(e) => change("sector", e.target.value)}
              >
                {sectors.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            {(
              [
                ["age", "Business age (years)"],
                ["revenue", "Monthly revenue (₹)"],
                ["expenses", "Operating expenses (₹)"],
                ["debt", "Monthly debt obligations (₹)"],
                ["loan", "Requested loan (₹)"],
                ["term", "Loan period (months)"],
                ["cash", "Opening cash (₹)"],
                ["delay", "Receivables delay (days)"],
                ["concentration", "Largest counterparty share (⅓–1)"],
                ["shock", "Revenue shock (−0.9 to 1)"],
                ["inflation", "Annual expense inflation (0–0.5)"],
              ] as const
            ).map(([k, t]) => (
              <label key={k}>
                {t}
                <input
                  type="number"
                  step={
                    ["shock", "inflation", "concentration"].includes(k)
                      ? ".01"
                      : "1"
                  }
                  value={b[k]}
                  onChange={(e) => change(k, +e.target.value)}
                />
              </label>
            ))}
          </div>
          {errors && (
            <p role="alert" className="error">
              {errors}
            </p>
          )}
          <div className="actions">
            <button className="button secondary" onClick={save}>
              Save borrower
            </button>
            <button
              className="button"
              disabled={st.status === "running"}
              onClick={() => {
                if (save()) void st.run(b);
              }}
            >
              <Play size={15} /> Run simulation
            </button>
          </div>
        </Card>
        <div>
          <Card
            title="Source availability"
            kicker="SIMULATED CONNECTION CONTEXT"
          >
            <div className="toggle-list">
              {Object.entries(st.sources).map(([k, v]) => (
                <label key={k}>
                  <span>
                    {
                      (
                        {
                          bank: "Bank data",
                          invoices: "Invoice data",
                          aa: "Account Aggregator",
                          uli: "ULI workflow context",
                          network: "Trade-network data",
                          history: "Revenue history",
                        } as Record<string, string>
                      )[k]
                    }
                    <small>Local simulation toggle</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={v}
                    onChange={(e) =>
                      st.setSources({
                        ...st.sources,
                        [k]: e.target.checked,
                      } as Sources)
                    }
                  />
                </label>
              ))}
            </div>
            <p>No bank access, AA request, or consent exchange takes place.</p>
          </Card>
          <Card
            title="What would improve this score?"
            kicker="LEGITIMATE FINANCIAL SENSITIVITY"
          >
            <div className="big-number">
              {score(b, st.sources).score ?? "Insufficient data"}
              <small>/1000</small>
            </div>
            <p>
              Live score sensitivity uses the same formulas. Try reducing
              collection delays, changing real expenses, or diversifying
              customers. Revenue alone does not guarantee resilience.
            </p>
            <p className="footnote">
              Never alter records or hide risk. Changes are hypothetical
              financial improvements, not advice.
            </p>
            <button
              className="button secondary"
              disabled={universes.length >= 3}
              onClick={() => {
                if (schema.safeParse(b).success)
                  setUniverses([...universes, simulate(b, st.sources)]);
                else setErrors("Correct invalid inputs before comparison.");
              }}
            >
              <GitCompareArrows size={16} /> Add scenario ({universes.length}/3)
            </button>
          </Card>
        </div>
      </div>
      <Card title="Simulation pipeline" kicker={st.status.toUpperCase()}>
        <progress max="8" value={st.progress} />
        <p>
          {st.status === "running"
            ? st.current.audit[Math.max(0, st.progress - 1)]
            : st.status === "pending"
              ? "Ready to calculate and save a reproducible snapshot"
              : st.status}
        </p>
        {st.status === "running" && (
          <button className="button secondary" onClick={st.cancel}>
            Cancel
          </button>
        )}
        {st.error && (
          <p role="alert" className="error">
            {st.error}
          </p>
        )}
        <p className="footnote">
          Calculations are local and synchronous. Progress replays completed
          calculation stages before persistence; it is not live AI processing.
        </p>
        {st.status === "completed" && (
          <Link className="text-link" to="/app">
            Inspect completed snapshot <ArrowRight size={16} />
          </Link>
        )}
      </Card>
      <Card
        title="Parallel universe comparison"
        action={
          <button className="text-link" onClick={() => setUniverses([])}>
            Clear scenarios
          </button>
        }
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Snapshot</th>
                <th>Score</th>
                <th>Closing cash</th>
                <th>Alerts</th>
                <th>Liquidity gap</th>
              </tr>
            </thead>
            <tbody>
              {[st.current, ...universes].map((r, i) => (
                <tr key={i}>
                  <td>
                    {i === 0 ? "Baseline" : `Scenario ${i}`}
                    <small>
                      Shock {r.borrower.shock * 100}% · delay {r.borrower.delay}
                      d
                    </small>
                  </td>
                  <td>{r.score ?? "N/A"}</td>
                  <td>{money(r.days[29].closing)}</td>
                  <td>{r.alerts.length}</td>
                  <td>
                    {money(
                      Math.max(0, -Math.min(...r.days.map((d) => d.closing))),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          className="text-link"
          onClick={() =>
            download("saakh-comparison", {
              baseline: st.current,
              scenarios: universes,
              disclaimer,
            })
          }
        >
          Export comparison <Download size={14} />
        </button>
      </Card>
    </>
  );
}
function Verify() {
  const { current, runs, notes, note } = useStore();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [order, setOrder] = useState("newest");
  const [selected, setSelected] = useState(current);
  const [evidence, setEvidence] = useState("");
  const records = [current, ...runs.filter((r) => r.id !== current.id)]
    .filter((r) =>
      JSON.stringify([r.id, r.borrower.id, r.borrower.name, r.graph])
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .filter(
      (r) =>
        filter === "all" ||
        (filter === "alerts" ? r.alerts.length > 0 : r.confidence < 60),
    )
    .sort((a, b) =>
      order === "score"
        ? (b.score || 0) - (a.score || 0)
        : b.timestamp.localeCompare(a.timestamp),
    );
  const status =
    selected.confidence < 60
      ? "Insufficient Evidence"
      : selected.alerts.length
        ? "Anomaly Detected"
        : "Verified Against Demo Record";
  return (
    <>
      <Title
        eyebrow="EVERY SIGNAL HAS A SOURCE"
        title="Verify & investigate"
        description="Trace synthetic records, inspect rule evidence, and document a human assessment."
      />
      <div className="search-bar">
        <Search size={18} />
        <input
          aria-label="Search records"
          placeholder="Search simulation, business, borrower, transaction or invoice ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          aria-label="Evidence filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All records</option>
          <option value="alerts">Anomalies</option>
          <option value="missing">Insufficient evidence</option>
        </select>
        <select
          aria-label="Sort results"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
        >
          <option value="newest">Newest</option>
          <option value="score">Score</option>
        </select>
      </div>
      <div className="overview-grid">
        <Card title="Matching demo records">
          <div className="record-list">
            {records.length ? (
              records.map((r) => (
                <button
                  className={selected.id === r.id ? "record active" : "record"}
                  key={r.id}
                  onClick={() => setSelected(r)}
                >
                  <span>
                    <b>{r.borrower.name}</b>
                    <small>
                      {r.id} · {new Date(r.timestamp).toLocaleString()}
                    </small>
                  </span>
                  <ChevronRight size={15} />
                </button>
              ))
            ) : (
              <p>Record Not Found</p>
            )}
          </div>
        </Card>
        <Card title="Simulation snapshot" action={<Label>{status}</Label>}>
          <h3>{selected.borrower.name}</h3>
          <p>
            {selected.id} · score {selected.score ?? "unavailable"} · confidence{" "}
            {selected.confidence}%
          </p>
          <p>{selected.version}</p>
          <p className="footnote">
            Verification matches a local demo record. It does not authenticate
            external transactions or establish cryptographic integrity.
          </p>
          <button
            className="text-link"
            onClick={() =>
              download("evidence-" + selected.id, { ...selected, disclaimer })
            }
          >
            Export evidence summary <Download size={14} />
          </button>
        </Card>
      </div>
      <Card
        title="Evidence constellation"
        kicker="ALERT → RULE → TRANSACTION → INVOICE → INPUT"
      >
        <div className="evidence-chain">
          <button
            onClick={() =>
              setEvidence(JSON.stringify(selected.borrower, null, 2))
            }
          >
            {selected.borrower.name}
            <small>Borrower inputs</small>
          </button>
          <ArrowRight />
          <button
            onClick={() =>
              setEvidence(selected.factors.map((f) => f.formula).join("\n"))
            }
          >
            Calculation rules<small>{selected.version}</small>
          </button>
          <ArrowRight />
          <button
            onClick={() =>
              setEvidence(JSON.stringify(selected.graph.edges, null, 2))
            }
          >
            Invoices & transactions
            <small>{selected.graph.edges.length} synthetic records</small>
          </button>
        </div>
        {selected.alerts.length ? (
          selected.alerts.map((a) => (
            <details className="alert-row" key={a.id}>
              <summary>
                <span className="amber">●</span> {a.rule}
                <Label>Review required</Label>
              </summary>
              <p>{a.detail}</p>
              <div className="chips">
                {a.evidence.map((id) => (
                  <button
                    key={id}
                    onClick={() =>
                      setEvidence(
                        JSON.stringify(
                          selected.graph.edges.find((e) => e.id === id),
                          null,
                          2,
                        ),
                      )
                    }
                  >
                    {id}
                  </button>
                ))}
              </div>
            </details>
          ))
        ) : (
          <p className="green">
            No configured rule triggered. This is not proof of absence of risk.
          </p>
        )}
        <Suspense fallback={<p>Loading graph…</p>}>
          <Network
            graph={selected.graph}
            onSelect={(id) =>
              setEvidence(
                JSON.stringify(
                  selected.graph.edges.find((e) => e.id === id) ||
                    selected.graph.nodes.find((n) => n.id === id),
                  null,
                  2,
                ),
              )
            }
          />
        </Suspense>
        {evidence && <pre className="evidence-pre">{evidence}</pre>}
      </Card>
      <div className="overview-grid">
        <Card title="Human review workbench" kicker="DEMO-ONLY ANALYST NOTES">
          <label>
            Evidence status
            <select
              value={notes[selected.id + "-status"] || "Unreviewed"}
              onChange={(e) => note(selected.id + "-status", e.target.value)}
            >
              <option>Unreviewed</option>
              <option>Evidence reviewed</option>
              <option>Unresolved questions</option>
            </select>
          </label>
          <label>
            Notes, unresolved questions & draft assessment
            <textarea
              rows={7}
              value={notes[selected.id] || ""}
              onChange={(e) => note(selected.id, e.target.value)}
              placeholder="Document your reasoning. No automatic approval or rejection."
            />
          </label>
          <p className="footnote">
            Saved in this browser. No multi-user workflow or secure account
            storage.
          </p>
        </Card>
        <Card title="Audit timeline">
          {selected.audit.map((a, i) => (
            <div className="audit-row" key={a}>
              <span className="step-no">{i + 1}</span>
              <div>
                {a}
                <small>{selected.timestamp} · local deterministic stage</small>
              </div>
              <Check size={14} />
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}
function Attack() {
  const r = useStore((s) => s.current);
  const [results, setResults] = useState<Record<string, Run>>({});
  const run = (name: string) => {
    const b = scenario(r.borrower, name);
    const out = simulate(b, r.sources, name);
    setResults((x) => ({ ...x, [name]: out }));
  };
  const passed = (name: string, x: Run) =>
    name === "Circular Invoicing"
      ? x.alerts.some((a) => a.rule === "Circular invoicing")
      : name === "Duplicate Invoices"
        ? x.alerts.some((a) => a.rule === "Duplicate invoices")
        : name === "Revenue Inflation"
          ? x.alerts.some((a) => a.rule === "Evidence mismatch")
          : name === "Buyer Concentration"
            ? x.alerts.some((a) => a.rule === "Counterparty concentration")
            : name === "Seasonal Shock"
              ? x.forecast[0].revenue < r.forecast[0].revenue
              : x.days[29].closing < r.days[29].closing;
  return (
    <>
      <Title
        eyebrow="CONTROLLED STRESS. TRACEABLE RESULTS."
        title="Attack lab"
        description="Challenge the financial twin with repeatable synthetic stress scenarios."
      >
        <button className="button secondary" onClick={() => setResults({})}>
          <RotateCcw size={15} /> Reset all
        </button>
        <button className="button" onClick={() => scenarios.forEach(run)}>
          <Play size={15} /> Run all tests
        </button>
      </Title>
      <p className="notice">
        Scenario regression success does not establish real-world fraud
        detection accuracy. Enable invoice and network evidence to evaluate
        graph rules.
      </p>
      <div className="attack-grid">
        {scenarios.map((name, i) => {
          const out = results[name];
          const expectation = [
            "A three-edge cycle is flagged for review.",
            "A repeated invoice identifier triggers evidence.",
            "Inflated revenue versus settlement creates an evidence mismatch.",
            "90% buyer share exceeds the 65% concentration threshold.",
            "35% revenue shock lowers forecast receipts.",
            "90-day delay reduces near-term available cash.",
          ][i];
          return (
            <Card
              key={name}
              title={name}
              kicker={`STRESS SCENARIO 0${i + 1}`}
              action={
                out ? (
                  <Label>
                    {passed(name, out) ? "PASS" : "FAIL / unavailable evidence"}
                  </Label>
                ) : (
                  <Label>Ready</Label>
                )
              }
            >
              <p>{expectation}</p>
              <div className="actions">
                <button
                  className="button secondary small"
                  onClick={() => run(name)}
                >
                  Run scenario <Play size={13} />
                </button>
                <button
                  className="text-link"
                  onClick={() =>
                    setResults((x) => {
                      const next = { ...x };
                      delete next[name];
                      return next;
                    })
                  }
                >
                  Reset
                </button>
              </div>
              {out && (
                <>
                  <div className="scenario-result">
                    <span>
                      Score{" "}
                      <b>
                        {r.score ?? "N/A"} → {out.score ?? "N/A"}
                      </b>
                    </span>
                    <span>
                      Closing cash <b>{money(out.days[29].closing)}</b>
                    </span>
                    <span>
                      Review signals <b>{out.alerts.length}</b>
                    </span>
                  </div>
                  <details>
                    <summary>Actual outcomes & evidence</summary>
                    <p>{out.classification}</p>
                    {out.alerts.map((a) => (
                      <p key={a.id}>
                        {a.rule}: {a.detail} · {a.evidence.join(", ")}
                      </p>
                    ))}
                    <p>{out.recommendations[0].trigger}</p>
                  </details>
                </>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
function Impact() {
  const [v, setV] = useState({
    book: 5000000000,
    volume: 12000,
    cost: 2500,
    review: 0.6,
    reduction: 0.5,
    loss: 0.001,
    platform: 2000000,
  });
  const r = impact(
    ...(Object.values(v) as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ]),
  );
  return (
    <>
      <Title
        eyebrow="THE ECONOMICS OF BETTER CONTEXT"
        title="Impact dashboard"
        description="An editable lender economics model. Illustrative assumptions, transparent arithmetic."
      />
      <div className="overview-grid">
        <Card title="Model your assumptions" kicker="ANNUAL LENDER ECONOMICS">
          <div className="form-grid">
            {Object.entries(v).map(([k, val]) => (
              <label key={k}>
                {
                  (
                    {
                      book: "Annual loan book (₹)",
                      volume: "Application volume",
                      cost: "Assessment cost / application (₹)",
                      review: "Manual review share (0–1)",
                      reduction:
                        "Cost reduction on reviewed applications (0–1)",
                      loss: "Illustrative avoidable-loss share (0–1)",
                      platform: "Annual platform cost (₹)",
                    } as Record<string, string>
                  )[k]
                }
                <input
                  type="number"
                  min="0"
                  max={
                    ["review", "reduction", "loss"].includes(k) ? 1 : undefined
                  }
                  step={["review", "reduction", "loss"].includes(k) ? 0.001 : 1}
                  value={val}
                  onChange={(e) =>
                    setV({
                      ...v,
                      [k]: Math.max(
                        0,
                        Math.min(
                          ["review", "reduction", "loss"].includes(k)
                            ? 1
                            : 1e12,
                          +e.target.value || 0,
                        ),
                      ),
                    })
                  }
                />
              </label>
            ))}
          </div>
          <button
            className="text-link"
            onClick={() =>
              download("saakh-impact", { inputs: v, results: r, disclaimer })
            }
          >
            Export model <Download size={14} />
          </button>
        </Card>
        <Card
          title="Illustrative annual value"
          kicker="BENEFITS ARE NOT GUARANTEED"
        >
          <div className="impact-hero">
            <span>NET ANNUAL BENEFIT</span>
            <div className="big-number">{money(r.net)}</div>
            <div className="chips">
              <Label>
                {r.ratio === null ? "N/A" : r.ratio.toFixed(2) + "×"}{" "}
                benefit-to-cost
              </Label>
              <Label>
                {r.payback === null ? "N/A" : r.payback.toFixed(1) + " months"}{" "}
                payback
              </Label>
            </div>
          </div>
          {Object.entries(r)
            .filter(([k]) => !["ratio", "payback", "net"].includes(k))
            .map(([k, n]) => (
              <div className="finance-row" key={k}>
                <span>
                  {
                    (
                      {
                        baseline: "Baseline assessment costs",
                        projected: "Projected assessment costs",
                        savings: "Processing savings",
                        avoided: "Illustrative avoided losses",
                        gross: "Gross annual benefits",
                      } as Record<string, string>
                    )[k]
                  }
                </span>
                <b>{money(n!)}</b>
              </div>
            ))}
        </Card>
      </div>
      <Card title="How the economics work">
        <p>
          Baseline = applications × assessment cost. Projected cost = baseline ×
          (1 − manual review share × processing reduction). Savings = baseline −
          projected cost.
        </p>
        <p>
          Illustrative avoided losses = loan book × avoidable-loss share. Gross
          benefit = processing savings + avoided losses. Net benefit = gross
          benefit − platform cost. Benefit-to-cost = gross benefit / platform
          cost. Payback = platform cost / gross benefit × 12 months.
        </p>
        <p>
          Processing and credit-loss benefits represent different costs; no
          further multipliers are applied. Zero denominators return N/A. Payback
          assumes benefits accrue evenly through the year. No evidence of
          realized savings or predictive accuracy is claimed.
        </p>
      </Card>
    </>
  );
}
function Reports() {
  const { current: r, runs, restore } = useStore();
  const [replay, setReplay] = useState(0);
  return (
    <>
      <Title
        eyebrow="REPRODUCIBLE BY DESIGN"
        title="Reports & replay"
        description="Inspect saved inputs, replay calculation stages, and export actual current outputs."
      >
        <button className="button secondary" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </Title>
      <Card title={r.borrower.name + " · " + r.id} kicker={r.version}>
        <div className="actions">
          <button
            className="button"
            onClick={() => download(r.id, { ...r, disclaimer })}
          >
            JSON report
          </button>
          <button
            className="button secondary"
            onClick={() => download(r.id, csv(r), "csv")}
          >
            CSV daily ledger
          </button>
          <button
            className="button secondary"
            onClick={() => download("saakh-history", { runs, disclaimer })}
          >
            Export history ({runs.length})
          </button>
        </div>
        <p>
          {r.timestamp} · score {r.score ?? "Insufficient data"} · confidence{" "}
          {r.confidence}% · {r.classification}
        </p>
        <FactorExplorer run={r} />
        <MoneyChart data={r.forecast} />
        <p>{disclaimer}</p>
      </Card>
      <div className="overview-grid">
        <Card title="Simulation history">
          {runs.length ? (
            runs.map((x) => (
              <button key={x.id} className="record" onClick={() => restore(x)}>
                <span>
                  {x.borrower.name}
                  <small>
                    {x.id} · {x.timestamp}
                  </small>
                </span>
                <span>
                  Restore <ArrowUpRight size={14} />
                </span>
              </button>
            ))
          ) : (
            <p>No saved runs. Run a simulation to persist the result.</p>
          )}
        </Card>
        <Card title="Calculation replay">
          <label>
            Stage {replay + 1} / {r.audit.length}
            <input
              type="range"
              min="0"
              max={r.audit.length - 1}
              value={replay}
              onChange={(e) => setReplay(+e.target.value)}
            />
          </label>
          <h3>{r.audit[replay]}</h3>
          <p>
            This is an inspection of recorded calculation stages, not an AI
            execution animation.
          </p>
          <details>
            <summary>Reproducible input snapshot</summary>
            <pre>
              {JSON.stringify(
                {
                  borrower: r.borrower,
                  sources: r.sources,
                  version: r.version,
                },
                null,
                2,
              )}
            </pre>
          </details>
        </Card>
      </div>
    </>
  );
}
function Responsible() {
  return (
    <>
      <Title
        eyebrow="TRUST THROUGH TRANSPARENCY"
        title="Responsible AI & methodology"
        description="An explainable local prototype, with explicit limits and human oversight."
      />
      <Card title="Know the limits">
        <p>{disclaimer}</p>
        <p>
          Saakh uses deterministic rules, not a trained predictive model.
          Confidence measures factor availability, not probability of
          correctness. Missing factors receive zero contribution without
          redistributing their weight; below 60% coverage, no score is reported.
        </p>
        <p>
          Every alert is a review signal. No automatic credit approval,
          rejection, or fraud determination is performed. Synthetic fixtures
          cannot demonstrate fairness or real-world accuracy. Sector assumptions
          and data availability can introduce bias; deployment would require
          representative validation, monitoring and human appeal pathways.
        </p>
        <p>
          Data is minimized to fictional business inputs and local review notes.
          This browser stores history in IndexedDB without account-level
          protection. Future integrations would need purpose-specific consent,
          retention controls, security review and applicable legal analysis.
        </p>
      </Card>
      <Card title="Research context — reviewed 26 October 2026">
        <p>
          These sources provide context, not a compliance assessment.
          Applicability and phased commencement require professional review
          before real-world deployment.
        </p>
        <ul className="source-links">
          <li>
            <a
              href="https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=12848&Mode=0"
              target="_blank"
              rel="noreferrer"
            >
              RBI Digital Lending Directions, 8 May 2025
            </a>{" "}
            — regulated digital lending context; Saakh is not a lender or
            certified lending service.
          </li>
          <li>
            <a
              href="https://m.rbi.org.in/scripts/bs_viewpublicationreport.aspx"
              target="_blank"
              rel="noreferrer"
            >
              RBI FREE-AI Committee Report, August 2025
            </a>{" "}
            — responsible and ethical AI recommendations; these are not a Saakh
            certification.
          </li>
          <li>
            <a
              href="https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025%3B"
              target="_blank"
              rel="noreferrer"
            >
              MeitY Digital Personal Data Protection Rules, 2025
            </a>{" "}
            — read with the DPDP Act, 2023 and official enforcement timeline.
          </li>
          <li>
            <a
              href="https://financialservices.gov.in/node/4278"
              target="_blank"
              rel="noreferrer"
            >
              Department of Financial Services — Account Aggregator framework
            </a>{" "}
            — consent-based data-sharing context. Saakh performs no AA data
            exchange.
          </li>
        </ul>
      </Card>
      <Card title="Facts, assumptions, and inferences">
        <div className="engine-grid">
          <div>
            <h3>Facts within this demo</h3>
            <p>
              Entered inputs, fixture records, source toggles and saved
              snapshots.
            </p>
          </div>
          <div>
            <h3>Assumptions</h3>
            <p>
              Payment cadence, industry seasonal amplitudes, delay haircuts and
              uncertainty bands.
            </p>
          </div>
          <div>
            <h3>Inferences</h3>
            <p>
              Illustrative risk bands, review signals and cash stress
              categories.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
function Guide() {
  const [step, setStep] = useState(() =>
    Math.max(
      0,
      Math.min(4, Number(window.localStorage.getItem("saakh-story")) || 0),
    ),
  );
  useEffect(() => {
    window.localStorage.setItem("saakh-story", String(step));
  }, [step]);
  const steps = [
    [
      "Select the business",
      "Start with Anjali Foods on Overview. Inspect the six factor contributions.",
      "/app",
    ],
    [
      "Build a financial twin",
      "Change collection delay to 60 days, save, and run the simulation.",
      "/app/generate",
    ],
    [
      "Follow the evidence",
      "Search a simulation ID and click a relationship to inspect its invoice. Add a review note.",
      "/app/verify",
    ],
    [
      "Challenge the assumptions",
      "Run Circular Invoicing and Seasonal Shock. Compare expected and actual outcomes.",
      "/app/attack",
    ],
    [
      "Measure, then report",
      "Edit lender economics and export your completed simulation record.",
      "/app/reports",
    ],
  ];
  return (
    <>
      <Title
        eyebrow="A 3–5 MINUTE GUIDED EXPERIENCE"
        title="The Saakh story"
        description="Use the actual product at each checkpoint. Skip freely and return whenever you like."
      />
      <button
        className="button"
        style={{ marginBottom: 20 }}
        onClick={() => window.dispatchEvent(new Event("saakh-start-tour"))}
      >
        Start interactive story mode <Play size={15} />
      </button>
      <Card title={`0${step + 1} / 05 · ${steps[step][0]}`} kicker="STORY MODE">
        <p>{steps[step][1]}</p>
        <div className="actions">
          <Link className="button" to={steps[step][2]}>
            Open this checkpoint <ArrowUpRight size={16} />
          </Link>
          <button
            className="button secondary"
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
          >
            Back
          </button>
          <button
            className="button secondary"
            onClick={() => setStep(step === 4 ? 0 : step + 1)}
          >
            {step === 4 ? "Restart guide" : "Next / skip"}
          </button>
        </div>
        <progress value={step + 1} max={5} />
      </Card>
      <Card title="Demo checkpoints">
        {steps.map(([t, d], i) => (
          <button className="record" key={t} onClick={() => setStep(i)}>
            <span>
              <b>
                {i + 1}. {t}
              </b>
              <small>{d}</small>
            </span>
            <ChevronRight size={16} />
          </button>
        ))}
      </Card>
    </>
  );
}
function SettingsPage() {
  return (
    <>
      <Title
        eyebrow="YOUR LOCAL WORKSPACE"
        title="Settings"
        description="Understand persistence, theme controls, and simulation storage."
      />
      <Card title="Local-first storage">
        <p>
          Runs, custom borrowers and review notes persist in IndexedDB in this
          browser. Theme preferences use local storage. Use the moon/sun control
          in the header to cycle dark, light, and system theme.
        </p>
        <p>
          No authentication, server database, live bank integrations, telemetry,
          or API keys are configured. Export reports before clearing site data.
        </p>
        <Link className="button secondary" to="/app/reports">
          Manage and export history <ArrowUpRight size={15} />
        </Link>
      </Card>
    </>
  );
}
export default function WorkspacePage({ page }: { page: string }) {
  return page === "overview" ? (
    <Overview />
  ) : page === "generate" ? (
    <Generate />
  ) : page === "verify" ? (
    <Verify />
  ) : page === "attack" ? (
    <Attack />
  ) : page === "impact" ? (
    <Impact />
  ) : page === "reports" ? (
    <Reports />
  ) : page === "responsible" ? (
    <Responsible />
  ) : page === "guide" ? (
    <Guide />
  ) : page === "settings" ? (
    <SettingsPage />
  ) : (
    <div className="card">
      Page not found. <Link to="/app">Return to overview</Link>
    </div>
  );
}
