import React, { Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  HashRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
} from "react-router-dom";
import {
  Activity,
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  FlaskConical,
  ScanLine,
  ShieldCheck,
  ChartNoAxesCombined,
  Settings,
  BookOpen,
  FileText,
  Sun,
  Moon,
  ChevronRight,
  Play,
  Menu,
  X,
  Info,
} from "lucide-react";
import { useStore } from "./state/store";
import { disclaimer } from "./domain/model";
const MiniChart = lazy(() =>
  import("./components/Charts").then((m) => ({ default: m.MiniChart })),
);
import { score, impact } from "./engines";
import "./styles.css";
import StoryTour from "./components/StoryTour";
import { ErrorBoundary } from "./components/ErrorBoundary";
const AppRouter = import.meta.env.PROD ? HashRouter : BrowserRouter;
function scrollToSection(
  event: React.MouseEvent<HTMLAnchorElement>,
  id: string,
) {
  event.preventDefault();
  const target = document.getElementById(id);
  target?.scrollIntoView();
  if (id === "main") {
    const focusMain = (element: HTMLElement) => {
      element.setAttribute("tabindex", "-1");
      element.focus();
    };
    if (target) focusMain(target);
    // A lazy route can replace the previous page's main just after activation.
    // Transfer this skip intent once to the replacement; never refocus on ordinary child updates.
    const observer = new MutationObserver(() => {
      const next = document.getElementById(id);
      if (next && next !== target) {
        focusMain(next);
        observer.disconnect();
        clearTimeout(timeout);
      }
    });
    observer.observe(document.getElementById("root") || document.body, {
      childList: true,
      subtree: true,
    });
    const timeout = window.setTimeout(() => observer.disconnect(), 10000);
  }
}
const BusinessApp = lazy(() => import("./business/BusinessApp"));
const PublicInfo = lazy(() => import("./business/PublicInfo"));
const WorkspacePage = lazy(() => import("./pages/Workspace"));
const Network = lazy(() => import("./components/Network"));
export const money = (n: number) =>
  "₹" +
  (Math.abs(n) >= 1e7
    ? (n / 1e7).toFixed(2) + " Cr"
    : Math.abs(n) >= 1e5
      ? (n / 1e5).toFixed(2) + " L"
      : n.toLocaleString("en-IN", { maximumFractionDigits: 0 }));
function Logo() {
  return (
    <Link className="logo" to="/">
      <span className="brand-icon">
        <Activity size={25} />
      </span>
      <span>
        saakh<span className="devanagari">साख</span>
      </span>
    </Link>
  );
}
function Theme() {
  const [theme, setTheme] = useState(
    window.localStorage.getItem("saakh-theme") || "system",
  );
  useEffect(() => {
    const m = matchMedia("(prefers-color-scheme: light)");
    const apply = () =>
      (document.documentElement.dataset.theme =
        theme === "system" ? (m.matches ? "light" : "dark") : theme);
    apply();
    m.addEventListener("change", apply);
    window.localStorage.setItem("saakh-theme", theme);
    return () => m.removeEventListener("change", apply);
  }, [theme]);
  return (
    <button
      className="icon-btn"
      aria-label="Change theme"
      title={`Theme: ${theme}`}
      onClick={() =>
        setTheme(
          theme === "dark" ? "light" : theme === "light" ? "system" : "dark",
        )
      }
    >
      {theme === "light" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
function Landing() {
  const r = useStore((s) => s.current);
  const [sensitivity, setSensitivity] = useState(0);
  const [volume, setVolume] = useState(12000);
  const economics = impact(5e9, volume, 2500, 0.6, 0.5, 0.001, 2e6);
  return (
    <div className="landing">
      <header className="public-nav">
        <Logo />
        <nav>
          <a
            href="#intelligence"
            onClick={(e) => scrollToSection(e, "intelligence")}
          >
            Intelligence
          </a>
          <a href="#how" onClick={(e) => scrollToSection(e, "how")}>
            How it works
          </a>
          <Link to="/app/responsible">Our methodology</Link>
        </nav>
        <Theme />
        <Link className="button small" to="/business">
          Launch workspace <ArrowUpRight size={15} />
        </Link>
      </header>
      <main id="main">
        <section className="public-section" style={{ paddingBottom: 20 }}>
          <div className="eyebrow">YOUR AI-INSPIRED DIGITAL MUNIM</div>
          <h2>
            Know your money.
            <br />
            Plan your next move.
          </h2>
          <p>
            From invoices and stock to cash forecasts and trade enquiries. A
            connected, browser-local business workspace with every number
            explained.
          </p>
          <div className="actions">
            <Link className="button" to="/business">
              Open Business Pulse <ArrowUpRight size={18} />
            </Link>
            <Link className="text-link" to="/product/accounting">
              Explore business tools →
            </Link>
          </div>
          <nav className="actions" style={{ marginTop: 24, flexWrap: "wrap" }}>
            {[
              "accounting",
              "cashflow",
              "collections",
              "working-capital",
              "network",
              "pricing",
            ].map((x) => (
              <Link key={x} className="text-link" to={"/product/" + x}>
                {x.replace("-", " ")}
              </Link>
            ))}
          </nav>
        </section>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" /> BUILT FOR THE BUSINESSES BUILDING
              INDIA
            </div>
            <h1>
              See the business.
              <br />
              Beyond the
              <br />
              <span>credit score.</span>
            </h1>
            <p>
              A clearer picture of MSME credit. Connect cash flows, trade
              relationships, and business resilience with intelligence you can
              actually explain.
            </p>
            <div className="actions">
              <Link className="button" to="/app">
                Explore intelligence workspace <ArrowUpRight size={18} />
              </Link>
              <Link className="text-link" to="/app/guide">
                <Play size={15} /> Take the guided tour
              </Link>
            </div>
            <div className="hero-foot">
              <ShieldCheck size={16} /> Explainable by design <span>·</span>{" "}
              Synthetic data. Real calculations.
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-tag">
              <span className="live-dot" /> FINANCIAL DIGITAL TWIN{" "}
              <span className="muted">01 / ACTIVE</span>
            </div>
            <Suspense fallback={<p>Loading network…</p>}>
              <Network graph={r.graph} />
            </Suspense>
            <div className="hero-score">
              <div>
                <span className="eyebrow">ANJALI FOODS · PUNE</span>
                <h3>
                  More than a number.
                  <br />A connected financial story.
                </h3>
              </div>
              <div className="score-mini">
                {r.score}
                <small>/ 1000</small>
              </div>
            </div>
          </div>
        </section>
        <div className="trust-strip">
          <span>DESIGNED FOR THE MISSING MIDDLE</span>
          <b>Small businesses.</b>
          <b>Better context.</b>
          <b>Human decisions.</b>
          <span>HACKATHON 4.0 / FINTECH AI</span>
        </div>
        <section id="intelligence" className="public-section">
          <div className="section-heading">
            <div>
              <div className="eyebrow">ONE BUSINESS. FOUR PERSPECTIVES.</div>
              <h2>
                Credit intelligence,
                <br />
                with the whole picture.
              </h2>
            </div>
            <p>
              Traditional scores miss the rhythm of a business.
              <br />
              Saakh turns synthetic financial signals into a transparent,
              connected assessment.
            </p>
          </div>
          <div className="engine-grid">
            {[
              [
                "01",
                "Saakh Score",
                "Understand the why behind every point.",
                "Six weighted factors. Clear evidence. No black box.",
              ],
              [
                "02",
                "Trade-Graph Shield",
                "Follow the relationships. Find the signals.",
                "Trace invoice patterns across a real interactive network.",
              ],
              [
                "03",
                "Season-or-Slide",
                "A seasonal dip or something deeper?",
                "Explore twelve months of cash-flow assumptions.",
              ],
              [
                "04",
                "Cash-Flow Coach",
                "Turn visibility into a practical next step.",
                "A daily ledger and recommendations tied to metrics.",
              ],
            ].map(([n, t, h, p]) => (
              <Link key={n} to="/app" className="engine-card">
                <div className="engine-number">
                  {n}
                  <ArrowUpRight size={19} />
                </div>
                <h3>{t}</h3>
                <h4>{h}</h4>
                <p>{p}</p>
              </Link>
            ))}
          </div>
        </section>
        <section id="how" className="public-section twin-section">
          <div>
            <div className="eyebrow">A FINANCIAL TWIN, NOT A FIXED LABEL</div>
            <h2>
              What changes when
              <br />
              the business changes?
            </h2>
            <p>
              Move an assumption. Recalculate the future. Follow every result
              back to the inputs that shaped it.
            </p>
            <label>
              Illustrative revenue shock: {sensitivity}%
              <input
                type="range"
                min="-60"
                max="20"
                value={sensitivity}
                onChange={(e) => setSensitivity(+e.target.value)}
              />
            </label>
            <Link className="text-link" to="/app/generate">
              Run the complete scenario <ArrowRight size={17} />
            </Link>
          </div>
          <div className="card">
            <div className="eyebrow">LIVE SYNTHETIC SCORE PREVIEW</div>
            <div className="preview-score">
              {score({ ...r.borrower, shock: sensitivity / 100 }, r.sources)
                .score ?? "N/A"}{" "}
              <small>/ 1000 · same scoring engine</small>
            </div>
            <div className="eyebrow">SYNTHETIC MONTHLY OPERATING SURPLUS</div>
            <div className="big-number">
              {money(
                r.borrower.revenue * (1 + sensitivity / 100) -
                  r.borrower.expenses -
                  r.borrower.debt,
              )}
            </div>
            <Suspense fallback={<div style={{ height: 55 }} />}>
              <MiniChart
                values={r.forecast.map(
                  (f) =>
                    f.revenue * (1 + sensitivity / 100) -
                    f.expenses -
                    r.borrower.debt,
                )}
              />
            </Suspense>
            <p>
              Revenue minus expenses and existing debt obligations. A
              sensitivity illustration, not a credit decision.
            </p>
          </div>
        </section>
        <section className="public-section">
          <div className="eyebrow">FROM EVIDENCE TO UNDERSTANDING</div>
          <h2>Built to be questioned.</h2>
          <div className="engine-grid">
            {[
              "01 · Choose a synthetic business",
              "02 · Set transparent assumptions",
              "03 · Run four deterministic engines",
              "04 · Investigate and review",
            ].map((x) => (
              <div className="card" key={x}>
                <h3>{x}</h3>
                <p>
                  Every insight connects to a versioned formula and an
                  inspectable input snapshot.
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="public-section">
          <h2>Clarity before confidence.</h2>
          <p>
            Missing data lowers confidence. Alerts invite investigation. A human
            always owns the assessment.
          </p>
          <Link className="button" to="/app/responsible">
            Explore responsible intelligence <ArrowUpRight size={17} />
          </Link>
          <div className="faq">
            {[
              [
                "Is this a lending platform?",
                "No. This local prototype does not offer loans or make lending decisions.",
              ],
              [
                "Is my bank account connected?",
                "No. All source toggles describe simulated availability. No credentials or live financial data are requested.",
              ],
              [
                "How are results calculated?",
                "Versioned deterministic formulas combine synthetic cash-flow, continuity, diversity, history, and completeness factors.",
              ],
              [
                "Where is my data stored?",
                "Simulation history and analyst notes are saved in this browser using IndexedDB. There are no secure multi-user accounts.",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="public-section twin-section">
          <div>
            <div className="eyebrow">TRANSPARENT LENDER ECONOMICS</div>
            <h2>
              Explore the potential.
              <br />
              Inspect the assumptions.
            </h2>
            <p>
              Illustrative processing savings with ₹2,500 assessment cost, 60%
              manual review share and 50% reduction on reviewed applications.
            </p>
            <label>
              Annual applications: {volume.toLocaleString("en-IN")}
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={volume}
                onChange={(e) => setVolume(+e.target.value)}
              />
            </label>
            <Link className="text-link" to="/app/impact">
              Edit the full economics model <ArrowRight size={17} />
            </Link>
          </div>
          <div className="card">
            <div className="eyebrow">
              ILLUSTRATIVE ANNUAL PROCESSING SAVINGS
            </div>
            <div className="big-number">{money(economics.savings)}</div>
            <p>
              Applications × unit assessment cost × review share × processing
              reduction. This preview excludes platform cost and avoided losses.
              No realized savings are claimed.
            </p>
          </div>
        </section>
        <section className="cta">
          <div className="eyebrow">MAKE THE INVISIBLE, UNDERSTANDABLE.</div>
          <h2>A business is more than its score.</h2>
          <Link className="button" to="/app">
            Launch intelligence workspace <ArrowUpRight size={19} />
          </Link>
        </section>
      </main>
      <footer>
        <Logo />
        <p>Know your money. Plan your next move.</p>
        <div className="actions" style={{ flexWrap: "wrap" }}>
          {["about", "contact", "privacy", "terms", "grievance"].map((x) => (
            <Link key={x} to={"/product/" + x}>
              {x}
            </Link>
          ))}
        </div>
        <p>{disclaimer}</p>
        <small>
          v1.2.0 · Hackathon 4.0 · Track 3: FinTech AI · IES MCRC Mumbai
        </small>
      </footer>
    </div>
  );
}
const primary = [
  ["", "Overview", LayoutDashboard],
  ["generate", "Generate Simulation", FlaskConical],
  ["verify", "Verify & Investigate", ScanLine],
  ["attack", "Attack Lab", ShieldCheck],
  ["impact", "Impact Dashboard", ChartNoAxesCombined],
] as const;
const secondary = [
  ["reports", "Reports", FileText],
  ["responsible", "Responsible AI", ShieldCheck],
  ["guide", "Demo Guide", BookOpen],
  ["settings", "Settings", Settings],
] as const;
function Workspace() {
  const r = useStore((s) => s.current);
  const loc = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [loc.pathname]);
  const name =
    [...primary, ...secondary].find(
      ([p]) => loc.pathname === "/app" + (p ? "/" + p : ""),
    )?.[1] || "Overview";
  return (
    <div className="workspace">
      <aside className={open ? "sidebar open" : "sidebar"}>
        <Logo />
        <Link className="text-link" to="/business">
          ← Business workspace
        </Link>
        <div className="workspace-label">INTELLIGENCE WORKSPACE</div>
        <nav>
          {primary.map(([p, t, I]) => (
            <NavLink end key={p} to={"/app" + (p ? "/" + p : "")}>
              <I size={18} />
              {t}
              {p === "attack" && <span className="nav-badge">6</span>}
            </NavLink>
          ))}
        </nav>
        <div className="workspace-label secondary-label">RESOURCES</div>
        <nav>
          {secondary.map(([p, t, I]) => (
            <NavLink key={p} to={"/app/" + p}>
              <I size={17} />
              {t}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <span className="live-dot" /> Local simulation environment
          <p>No live financial connections</p>
          <div className="analyst">
            <span>SA</span>
            <div>
              Demo analyst<small>Human review workspace</small>
            </div>
            <span className="green">●</span>
          </div>
        </div>
      </aside>
      <div className="workspace-main">
        <header className="topbar">
          <button
            className="mobile-menu"
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
          <span className="breadcrumb">
            Workspace <ChevronRight size={13} /> <b>{name}</b>
          </span>
          <div className="spacer" />
          <span className="demo-pill">
            <span className="live-dot" /> SYNTHETIC DEMO
          </span>
          <Theme />
          <Link className="icon-btn" aria-label="Demo guide" to="/app/guide">
            <BookOpen size={17} />
          </Link>
          <span className="avatar">SA</span>
        </header>
        <StoryTour />
        <main className="app-content" id="main" tabIndex={-1}>
          <Suspense
            fallback={
              <div className="card">Loading intelligence workspace…</div>
            }
          >
            <WorkspacePage
              page={loc.pathname.split("/")[2] || "overview"}
              key={loc.pathname}
            />
          </Suspense>
          <div className="app-disclaimer">
            <Info size={14} />
            <span>{disclaimer}</span>
          </div>
          <div className="app-footer">
            <span>SAAKH / INTELLIGENCE WITH CONTEXT</span>
            <span>{r.version} · Local-first prototype</span>
          </div>
        </main>
      </div>
    </div>
  );
}
function App() {
  const hydrate = useStore((s) => s.hydrate);
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  return (
    <AppRouter>
      <a
        className="skip"
        href="#main"
        onClick={(e) => scrollToSection(e, "main")}
      >
        Skip to content
      </a>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={<Workspace />} />
        <Route
          path="/business/*"
          element={
            <Suspense fallback={<p>Loading business workspace…</p>}>
              <BusinessApp theme={<Theme />} />
            </Suspense>
          }
        />
        <Route
          path="/product/:page"
          element={
            <Suspense fallback={<p>Loading product information…</p>}>
              <PublicInfo />
            </Suspense>
          }
        />
        <Route
          path="*"
          element={
            <div className="card">
              <h1>Page not found</h1>
              <Link to="/">Return to Saakh</Link>
            </div>
          }
        />
      </Routes>
    </AppRouter>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
