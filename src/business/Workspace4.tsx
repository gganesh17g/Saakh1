import {
  Search,
  Plus,
  Bell,
  Sparkles,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { QuickPreferences42 } from "./QuickPreferences42";
import { Appearance41 } from "./Appearance41";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useBusiness } from "./store";
import { permissions, roles, today, rupees, authorize } from "./model";
import { financials, due, totals } from "./accounting";
import { answer, forecastBusiness } from "./analytics";
import { download } from "./imports";
import {
  useWorkspace4,
  roleNames,
  canPage,
  createActions4,
  searchRecords,
  notifications,
  makeBackup,
  parseBackup,
  restoreSeparate,
  saveScenario,
  fingerprint,
  answerWorkspace4,
  type Backup4,
} from "./workspace4";
import { transitionReturn, approvePayroll } from "./operations3";
import { Panel3 } from "./UI3";
import { downloadPDF, printDocument } from "./documents3";
import { csvCell } from "./imports";
import "./workspace4.css";
const Network = lazy(() => import("../components/Network"));
export function Tools4() {
  const { data: s, commit } = useBusiness(),
    w = useWorkspace4();
  const [panel, setPanel] = useState(""),
    [q, setQ] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    void w.hydrate();
  }, [w.hydrate]);
  useEffect(() => {
    if (panel) {
      dialog.current?.showModal();
      dialog.current?.querySelector("input")?.focus();
    } else dialog.current?.close();
  }, [panel]);
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPanel("Search");
      }
    };
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  useEffect(() => {
    if (!w.ready || w.error) return;
    const archive = s.workspaceRestores4?.[s.activeBusiness];
    if (archive && !w.data.prefs["restored:" + s.activeBusiness]) {
      void w.write((d) => {
        if (!d.prefs["restored:" + s.activeBusiness]) {
          Object.assign(d.prefs, archive.preferences || {});
          d.prefs["restored:" + s.activeBusiness] = "yes";
        }
        for (const key of ["tasks", "scenarios", "drafts"] as const) {
          const target = d[key] as { id: string }[];
          for (const r of archive[key])
            if (!target.some((x) => x.id === r.id)) target.push(r);
        }
      });
    }
  }, [
    s.activeBusiness,
    s.workspaceRestores4,
    w.ready,
    w.error,
    w.data,
    w.write,
  ]);
  const events = notifications(s, w.data.tasks).filter(
      (e) =>
        !w.data.prefs.notifications ||
        w.data.prefs.notifications === "All" ||
        e.category === w.data.prefs.notifications,
    ),
    unread = events.filter((e) => !w.data.read.includes(e.id));
  const actions = createActions4(s.role);
  const go = (p: string) => {
    setPanel("");
    setQ("");
    navigate(
      "/business" +
        (p ? "/" + p : "") +
        (panel === "Create" ? "?create=" + crypto.randomUUID() : ""),
    );
  };
  return (
    <>
      {w.error && (
        <p role="alert">
          Workspace save/restore failed: {w.error}. Existing data has not been
          replaced. Reload after checking browser storage.
        </p>
      )}
      <div className="w4-tools">
        <button onClick={() => setPanel("Business")}>
          {s.businesses.find((b) => b.id === s.activeBusiness)?.name ||
            "Business"}{" "}
          <ChevronDown size={14} />
        </button>
        <button
          onClick={() => setPanel("Search")}
          aria-label="Universal search"
        >
          <Search size={17} /> <span>Search</span> <kbd>⌘ K</kbd>
        </button>
        <button aria-label="+ Create" onClick={() => setPanel("Create")}>
          <Plus size={17} /> Create
        </button>
        <button onClick={() => setPanel("Notifications")}>
          <Bell size={18} />
          <span>Alerts ({unread.length})</span>
        </button>
        <button
          aria-label="Open contextual Assistant"
          onClick={() => setPanel("Assistant")}
        >
          <Sparkles size={18} />
          <span>Ask Saakh</span>
        </button>

        <details
          className="w4-account"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.currentTarget.open = false;
              event.currentTarget.querySelector("summary")?.focus();
            }
          }}
          onBlur={(event) => {
            if (
              !event.currentTarget.contains(event.relatedTarget as Node | null)
            )
              event.currentTarget.open = false;
          }}
        >
          <summary>
            <UserRound size={18} />
            <span>Account</span>
          </summary>
          <div className="account41-menu">
            <strong>{roleNames[s.role]}</strong>
            <Link to="/demo-login">Switch Demo Role</Link>
            <Link to="/business/preferences">Workspace Preferences</Link>
            <Appearance41 compact />
            <QuickPreferences42 />
            {canPage(s.role, "settings") && (
              <Link to="/business/settings">Business settings</Link>
            )}
            <Link to="/business/help">Help Centre</Link>
            {canPage(s.role, "data") && (
              <Link to="/business/data">Recovery & backups</Link>
            )}
          </div>
        </details>
      </div>
      <dialog
        ref={dialog}
        onCancel={() => setPanel("")}
        onClose={() => setPanel("")}
        aria-label={panel + " workspace panel"}
        className="w4-dialog"
      >
        <div className="w4-dialog-head">
          <h2>{panel}</h2>
          <button
            onClick={() => setPanel("")}
            aria-label="Close workspace panel"
          >
            ×
          </button>
        </div>
        {["Search", "Create", "Business"].includes(panel) && (
          <input
            autoFocus
            placeholder={"Search " + panel.toLowerCase()}
            aria-label={"Search " + panel.toLowerCase()}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        )}
        <div className="w4-results">
          {panel === "Search" && (
            <>
              {searchRecords(s, q).map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setPanel("");
                    navigate(
                      "/business/" +
                        r.page +
                        "?record=" +
                        encodeURIComponent(r.id),
                    );
                  }}
                >
                  <small>
                    {r.type} · {r.id}
                  </small>
                  {r.label}
                </button>
              ))}
              {w.data.tasks
                .filter(
                  (t) =>
                    t.businessId === s.activeBusiness &&
                    (t.assigned === s.role ||
                      ["owner", "admin"].includes(s.role)) &&
                    t.title.toLowerCase().includes(q.toLowerCase()),
                )
                .map((t) => (
                  <button key={t.id} onClick={() => go("tasks")}>
                    {t.title} · Task
                  </button>
                ))}
              <p>
                Read-only local search. Results use the selected business and
                demo role.
              </p>
            </>
          )}
          {panel === "Create" && (
            <>
              {actions
                .filter((a) => a[1].toLowerCase().includes(q.toLowerCase()))
                .map(([p, n]) => (
                  <button key={p} onClick={() => go(p)}>
                    {n} →
                  </button>
                ))}
              {!actions.length && (
                <p>This role is read-only. Creation is unavailable.</p>
              )}
            </>
          )}
          {panel === "Business" && (
            <>
              {s.businesses
                .filter((b) => b.name.toLowerCase().includes(q.toLowerCase()))
                .map((b) => (
                  <button
                    key={b.id}
                    onClick={async () => {
                      if (b.id === s.activeBusiness) {
                        setPanel("");
                        return;
                      }
                      if (
                        !window.confirm(
                          "Switch business? Save unfinished financial forms as drafts before continuing.",
                        )
                      )
                        return;
                      const ok = await commit("Business switched", (d) => {
                        d.activeBusiness = b.id;
                      });
                      if (ok) go("");
                    }}
                  >
                    {b.name}
                    {b.id === s.activeBusiness ? " · Active" : ""}
                  </button>
                ))}
              <button onClick={() => go("onboarding")}>
                Create fictional local business
              </button>
            </>
          )}
          {panel === "Notifications" && (
            <>
              {events.map((e) => (
                <div key={e.id}>
                  <button
                    onClick={() => {
                      void w.write((d) => {
                        if (!d.read.includes(e.id)) d.read.push(e.id);
                      });
                      go(e.page);
                    }}
                  >
                    {e.category} · {e.label}{" "}
                    <small>
                      Calculated as of {today()} from saved local records
                    </small>
                    {w.data.read.includes(e.id) ? " · Read" : " · Unread"}
                  </button>
                  <button
                    onClick={() =>
                      void w.write((d) => {
                        d.read = d.read.includes(e.id)
                          ? d.read.filter((id) => id !== e.id)
                          : [...d.read, e.id];
                      })
                    }
                  >
                    Toggle read
                  </button>
                </div>
              ))}
              {!events.length && (
                <p>No unresolved task or draft events for this role.</p>
              )}
            </>
          )}
          {panel === "Assistant" && <Assistant4 />}
        </div>
      </dialog>
    </>
  );
}
export function Roles4() {
  const { data: s, setRole } = useBusiness();
  const nav = useNavigate();
  return (
    <Panel3 title="Explore seven demo roles">
      <label>
        Demo role
        <select
          aria-label="Demo role"
          value={s.role}
          onChange={async (e) => {
            await setRole(e.target.value as typeof s.role);
          }}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {roleNames[r]}
            </option>
          ))}
        </select>
      </label>
      <p>
        Local permission previews share this business’s records. These are not
        authenticated accounts.
      </p>
      <div className="w4-grid">
        {roles.map((r) => (
          <button
            key={r}
            onClick={async () => {
              await setRole(r);
              nav("/business");
            }}
          >
            <strong>{roleNames[r]}</strong>
            <p>{permissions[r].join(" · ")}</p>
            {s.role === r ? "Current preview" : "Explore role →"}
          </button>
        ))}
      </div>
    </Panel3>
  );
}
export function Tasks4() {
  const { data: s } = useBusiness(),
    w = useWorkspace4();
  const [selected, setSelected] = useState<string[]>([]),
    [q, setQ] = useState(""),
    [msg, setMsg] = useState("");
  const list = w.data.tasks.filter(
    (t) =>
      t.businessId === s.activeBusiness &&
      (t.assigned === s.role || ["owner", "admin"].includes(s.role)) &&
      t.title.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <Panel3 title="My Tasks">
      <p>Task completion never posts or settles financial records.</p>
      {s.role !== "auditor" && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = e.currentTarget,
              v = new FormData(f);
            if (
              await w.write((d) => {
                d.tasks.push({
                  id: crypto.randomUUID(),
                  businessId: s.activeBusiness,
                  title: String(v.get("title")),
                  description: String(v.get("description")),
                  due: String(v.get("due")),
                  priority: String(v.get("priority")) as "Normal",
                  assigned: (["owner", "admin"].includes(s.role)
                    ? String(v.get("assigned"))
                    : s.role) as typeof s.role,
                  recordId: String(v.get("recordId") || ""),
                  status: "Open",
                  createdAt: new Date().toISOString(),
                });
              })
            )
              f.reset();
          }}
        >
          <label>
            Task title
            <input name="title" required minLength={2} />
          </label>
          <label>
            Description
            <input name="description" />
          </label>
          <label>
            Due date
            <input name="due" type="date" defaultValue={today()} required />
          </label>
          <label>
            Priority
            <select name="priority">
              <option>Normal</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </label>
          {["owner", "admin"].includes(s.role) && (
            <label>
              Assign demo role
              <select name="assigned" defaultValue={s.role}>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {roleNames[r]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Linked record (optional)
            <select name="recordId">
              <option value="">No linked record</option>
              {searchRecords(s, "")
                .filter((r) => r.type !== "Page")
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
            </select>
          </label>
          <button>Create Task</button>
        </form>
      )}
      <input
        aria-label="Filter tasks"
        placeholder="Filter tasks"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <button onClick={() => setSelected(list.map((t) => t.id))}>
        Select visible
      </button>
      <button onClick={() => setSelected([])}>Clear selection</button>
      <button
        disabled={s.role === "auditor" || !selected.length}
        onClick={async () => {
          if (
            !window.confirm(
              "Complete selected eligible tasks? No financial action will occur.",
            )
          )
            return;
          let count = 0;
          const ok = await w.write((d) => {
            d.tasks.forEach((t) => {
              if (
                selected.includes(t.id) &&
                t.businessId === s.activeBusiness &&
                t.status === "Open" &&
                (t.assigned === s.role || ["owner", "admin"].includes(s.role))
              ) {
                t.status = "Done";
                t.completedAt = new Date().toISOString();
                count++;
              }
            });
          });
          setMsg(
            ok
              ? `${count} successful; ${selected.length - count} skipped; 0 failed`
              : "Save failed; nothing committed",
          );
        }}
      >
        Complete selected
      </button>
      <p role="status">{msg}</p>
      {list.map((t) => (
        <article className="w4-record" key={t.id}>
          <input
            type="checkbox"
            aria-label={"Select " + t.title}
            checked={selected.includes(t.id)}
            onChange={(e) =>
              setSelected(
                e.target.checked
                  ? [...selected, t.id]
                  : selected.filter((id) => id !== t.id),
              )
            }
          />
          <div>
            <strong>{t.title}</strong>
            <p>
              {t.status} · {t.priority} · Due {t.due} · {roleNames[t.assigned]}
            </p>
            <details>
              <summary>History and description</summary>
              <p>{t.description}</p>
              {t.recordId &&
                searchRecords(s, t.recordId)
                  .filter((r) => r.id === t.recordId)
                  .map((r) => (
                    <Link
                      key={r.id}
                      to={"/business/" + r.page + "?record=" + r.id}
                    >
                      Linked {r.label}
                    </Link>
                  ))}
              <p>
                Created {t.createdAt}; completed{" "}
                {t.completedAt || "not completed"}
              </p>
            </details>
          </div>
        </article>
      ))}
      {!list.length && <p>No matching tasks. Create a task to get started.</p>}
    </Panel3>
  );
}
const assistantContext4 = new Map<
  string,
  { question: string; response: ReturnType<typeof answer> | undefined }
>();
export function Assistant4() {
  const { data: s } = useBusiness();
  const contextKey = s.activeBusiness + ":" + s.role;
  const [q, setQ] = useState(assistantContext4.get(contextKey)?.question || ""),
    [response, setResponse] = useState<ReturnType<typeof answer> | undefined>(
      assistantContext4.get(contextKey)?.response,
    );
  useEffect(() => {
    assistantContext4.set(contextKey, { question: q, response });
  }, [contextKey, q, response]);
  return (
    <section>
      <p>
        Deterministic local query assistant. It reads permitted records and
        cannot execute financial actions.
      </p>
      <button
        onClick={() => {
          setQ("Who owes me money?");
          if (canPage(s.role, "assistant"))
            setResponse(answerWorkspace4(s, "Who owes me money?"));
        }}
      >
        Who owes me money?
      </button>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canPage(s.role, "assistant")) {
            setResponse({
              text: "Financial questions are unavailable for this role.",
              sources: [],
              estimate: false,
            });
            return;
          }
          setResponse(answerWorkspace4(s, q));
        }}
      >
        <label>
          Your question
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Which invoices are overdue?"
          />
        </label>
        <button>Ask Saakh</button>
      </form>
      {response && (
        <article className="m-answer" role="status">
          <p>{response.text}</p>
          <small>
            {response.estimate
              ? "Forecast / illustrative assumptions"
              : "Calculated from local records"}
          </small>
          {response.sources.map((id) => (
            <p key={id}>
              <Link
                to={
                  "/business/" +
                  (searchRecords(s, id).find((r) => r.id === id)?.page ||
                    "passbook") +
                  "?record=" +
                  id
                }
              >
                Source {id}
              </Link>
            </p>
          ))}
        </article>
      )}
    </section>
  );
}
export function Insights4() {
  const { data: s } = useBusiness(),
    w = useWorkspace4();
  const [name, setName] = useState("Expected Case"),
    [change, setChange] = useState(0),
    [delay, setDelay] = useState(7),
    [err, setErr] = useState(""),
    [selected, setSelected] = useState("");
  const insightLocation = useLocation();
  const [insightTab, setInsightTab] = useState(
    insightLocation.pathname.endsWith("scenarios")
      ? "Scenario Lab"
      : "Overview",
  );
  const f = financials(s, s.activeBusiness),
    list = w.data.scenarios.filter((r) => r.businessId === s.activeBusiness);
  return (
    <>
      <nav className="w4-tools" aria-label="Insights sections">
        {["Overview", "Cash Flow", "Business Drivers", "Scenario Lab"].map(
          (t) => (
            <button
              key={t}
              aria-pressed={insightTab === t}
              onClick={() => setInsightTab(t)}
            >
              {t}
            </button>
          ),
        )}
      </nav>
      {insightTab === "Cash Flow" && <CashInsight4 />}
      {insightTab === "Business Drivers" && (
        <Panel3 title="Business Drivers">
          <p>
            Recorded revenue {rupees(f.revenue)} less recorded expenses{" "}
            {rupees(f.operatingExpenses)} gives profit {rupees(f.profit)}. These
            are ledger balances, not inferred causal effects.
          </p>
          <Link to="/business/reports">
            Verify finance report and source journal entries
          </Link>
        </Panel3>
      )}
      {insightTab !== "Scenario Lab" && (
        <Panel3 title="Explain this number">
          <div className="w4-grid">
            {[
              [
                "Cash position",
                f.cash,
                "Cash + bank balances from posted journal entries",
              ],
              [
                "Money to Collect",
                f.receivables,
                "Posted sales less receipts and applied credit notes",
              ],
              [
                "Money to Pay",
                f.payables,
                "Posted purchases less payments and applied supplier credits",
              ],
            ].map(([n, v, formula]) => (
              <details key={String(n)}>
                <summary>
                  {n}: {rupees(Number(v))}
                </summary>
                <h3>Understand</h3>
                <p>Calculated balance for this local business.</p>
                <h3>Calculate</h3>
                <p>{formula}</p>
                <h3>Verify</h3>
                <Link to="/business/passbook">
                  Inspect contributing journal entries
                </Link>
                <p>
                  Ledger engine v3 · Business {s.activeBusiness} · {today()} ·
                  Current relative to saved local data.
                </p>
              </details>
            ))}
          </div>
        </Panel3>
      )}
      {insightTab === "Scenario Lab" && (
        <Panel3 title="Scenario Lab">
          <p>
            Forecasts never post transactions. Named snapshots retain their
            original assumptions and results.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const r = saveScenario(s, name, change / 100, delay);
                await w.write((d) => {
                  d.scenarios.push(r);
                });
                setErr("");
              } catch (e) {
                setErr(String(e));
              }
            }}
          >
            <label>
              Scenario name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>
            <label>
              Sales change (%)
              <input
                type="number"
                min={-90}
                max={100}
                value={change}
                onChange={(e) => setChange(Number(e.target.value))}
              />
            </label>
            <label>
              Collection delay (days)
              <input
                type="number"
                min={0}
                max={180}
                value={delay}
                onChange={(e) => setDelay(Number(e.target.value))}
              />
            </label>
            <button>Save scenario</button>
          </form>
          <p role="alert">{err}</p>
          {list.length > 0 && (
            <>
              <h3>Scenario comparison · saved snapshots</h3>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={list[0].result.days.map((day, index) =>
                      Object.fromEntries([
                        ["date", day.date],
                        ...list.map((r) => [
                          r.id,
                          (r.result.days[index]?.closing || 0) / 100,
                        ]),
                      ]),
                    )}
                  >
                    <XAxis
                      dataKey="date"
                      tickFormatter={(v) => String(v).slice(5)}
                    />
                    <YAxis width={65} />
                    <Tooltip />
                    {w.data.prefs.chartLabels !== "Hidden" && <Legend />}
                    {list.map((r, i) => (
                      <Line
                        key={r.id}
                        name={r.name}
                        dataKey={r.id}
                        stroke={
                          ["#087f8c", "#8a64db", "#d68b19", "#cf5976"][i % 4]
                        }
                        dot={false}
                        isAnimationActive={false}
                        strokeWidth={selected === r.id ? 4 : 2}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="m-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Scenario</th>
                      <th>Closing cash</th>
                      <th>Baseline difference</th>
                      <th>Freshness</th>
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((r) => (
                      <tr key={r.id} aria-selected={selected === r.id}>
                        <td>
                          <button onClick={() => setSelected(r.id)}>
                            {r.name}
                          </button>
                        </td>
                        <td>{rupees(r.result.days.at(-1)!.closing)}</td>
                        <td>
                          {rupees(
                            r.result.days.at(-1)!.closing - r.baseClosing,
                          )}
                        </td>
                        <td>
                          {r.baseline === fingerprint(s, s.activeBusiness)
                            ? "Current"
                            : "Outdated"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="w4-grid">
            {list.map((r) => (
              <article
                className={
                  "w4-scenario " + (selected === r.id ? "selected" : "")
                }
                key={r.id}
              >
                <button onClick={() => setSelected(r.id)}>
                  <strong>{r.name}</strong>
                </button>
                <p>30-day closing {rupees(r.result.days.at(-1)!.closing)}</p>
                <p>
                  Baseline difference{" "}
                  {rupees(r.result.days.at(-1)!.closing - r.baseClosing)}
                </p>
                <p>
                  {r.baseline === fingerprint(s, s.activeBusiness)
                    ? "Current"
                    : "Outdated baseline"}{" "}
                  · {r.createdAt}
                </p>
                <details>
                  <summary>Assumptions and daily values</summary>
                  <pre>{JSON.stringify(r.result.assumptions, null, 2)}</pre>
                  <div className="w4-spark">
                    {r.result.days.map((d) => (
                      <span
                        key={d.date}
                        title={d.date + ": " + rupees(d.closing)}
                        style={{
                          height:
                            Math.max(
                              2,
                              Math.min(
                                100,
                                (Math.abs(d.closing) /
                                  Math.max(
                                    1,
                                    ...r.result.days.map((x) =>
                                      Math.abs(x.closing),
                                    ),
                                  )) *
                                  100,
                              ),
                            ) + "%",
                        }}
                      />
                    ))}
                  </div>
                  {r.result.days.map((d) => (
                    <p key={d.date}>
                      {d.date}: {rupees(d.closing)}
                    </p>
                  ))}
                </details>
                <button
                  onClick={() => {
                    const n = prompt("Scenario name", r.name);
                    if (n?.trim())
                      void w.write((d) => {
                        d.scenarios.find((x) => x.id === r.id)!.name = n.trim();
                      });
                  }}
                >
                  Rename
                </button>
                <button
                  onClick={() =>
                    void w.write((d) => {
                      d.scenarios.push({
                        ...structuredClone(r),
                        id: crypto.randomUUID(),
                        name: r.name + " copy",
                      });
                    })
                  }
                >
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    const next = saveScenario(
                      s,
                      r.name + " recalculated",
                      r.result.assumptions.salesChange,
                      r.result.assumptions.collectionDelay,
                    );
                    void w.write((d) => {
                      d.scenarios.push(next);
                    });
                  }}
                >
                  Recalculate as new snapshot
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this scenario snapshot?"))
                      void w.write((d) => {
                        d.scenarios = d.scenarios.filter((x) => x.id !== r.id);
                      });
                  }}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
          <button
            onClick={() =>
              download("saakh-scenarios.json", JSON.stringify(list, null, 2))
            }
          >
            Export comparison JSON
          </button>
        </Panel3>
      )}
    </>
  );
}
export function Data4() {
  const { data: s, commit, recovery, error } = useBusiness(),
    w = useWorkspace4();
  const [backup, setBackup] = useState<Backup4>(),
    [issue, setIssue] = useState(""),
    [result, setResult] = useState("");
  return (
    <>
      <Panel3 title="Data Management">
        <p>
          Portable unencrypted backups contain sensitive local records. Store
          them carefully. Restore always creates a separate business; it never
          merges financial histories.
        </p>
        <button
          onClick={() =>
            download(
              "saakh-business-backup.json",
              JSON.stringify(makeBackup(s, w.data), null, 2),
            )
          }
        >
          Export full business backup
        </button>
        <label>
          Choose backup
          <input
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              try {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 20_000_000) throw Error("Backup exceeds 20 MB");
                setBackup(parseBackup(await file.text()));
                setIssue("");
              } catch (e) {
                setIssue(String(e));
                setBackup(undefined);
              }
            }}
          />
        </label>
        {backup && (
          <article>
            <h3>Restore preview: {backup.businessName}</h3>
            <p>
              {backup.ledger.documents.length} documents ·{" "}
              {backup.ledger.journals.length} journals ·{" "}
              {backup.workspace.tasks.length} tasks ·{" "}
              {backup.workspace.scenarios.length} scenarios
            </p>
            <p>
              {s.businesses.some((b) => b.id === backup.businessId)
                ? "Matching business exists. Separate copy will receive new identifiers."
                : "New business import."}
            </p>
            <button
              onClick={async () => {
                if (
                  !confirm(
                    "Restore as separate business? Existing records remain untouched.",
                  )
                )
                  return;
                const ok = await commit(
                  "Backup restored as separate business",
                  (d) => {
                    restoreSeparate(d, backup);
                  },
                );
                setResult(
                  ok
                    ? "Ledger restored and validated. Task, scenario and draft snapshots are retained in the restored business and synchronized into its workspace."
                    : "Restore failed; existing ledger unchanged.",
                );
                if (ok) setBackup(undefined);
              }}
            >
              Confirm restore as separate business
            </button>
          </article>
        )}
        <p role="alert">{issue}</p>
        <p role="status">{result}</p>
      </Panel3>
      <Panel3 title="Recovery Centre">
        <p>
          {error ||
            w.error ||
            issue ||
            "No unresolved storage or validation issues detected in this session."}
        </p>
        {recovery && (
          <button onClick={() => download("original-recovery.json", recovery)}>
            Export untouched recovery data
          </button>
        )}
        <p>
          Do not blindly retry a financial posting. Inspect the source record
          and journal first.
        </p>
        <Link to="/business/passbook">Inspect ledger</Link>
      </Panel3>
    </>
  );
}
const help = [
  [
    "Getting Started",
    "Explore sample records or create a fictional empty business. Switching roles does not change records.",
  ],
  [
    "Sales & Customers",
    "Save Draft does not post. Issue Invoice posts once after review. Money to Collect means Accounts Receivable.",
  ],
  [
    "Purchases & Inventory",
    "Money to Pay means Accounts Payable. Confirm quantities and original costs before returning stock.",
  ],
  [
    "Payroll & Employees",
    "Review attendance, salary versions and illustrative deduction settings. Finalization creates liabilities; payment is separate.",
  ],
  [
    "Finance & Reports",
    "General Ledger contains balanced debit and credit entries. Match Transactions reconciles existing entries without creating revenue.",
  ],
  [
    "Account & Privacy",
    "Browser-local role previews are not authentication. Export backups before clearing browser storage.",
  ],
  [
    "Demo Limitations",
    "No live banking, tax filing, credit approval, payroll transfer or cloud synchronization.",
  ],
];
export function Help4() {
  const [q, setQ] = useState("");
  return (
    <Panel3 title="Help Centre">
      <input
        aria-label="Search help"
        placeholder="Search help"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {help
        .filter((h) => h.join(" ").toLowerCase().includes(q.toLowerCase()))
        .map(([h, t]) => (
          <details key={h}>
            <summary>{h}</summary>
            <p>{t}</p>
          </details>
        ))}
      <Link to="/business/data">Data Management & Recovery</Link>
    </Panel3>
  );
}
export function Preferences4() {
  const w = useWorkspace4();
  return (
    <Panel3 title="Workspace Preferences">
      <Appearance41 />
      <div className="w4-grid">
        {[
          ["density", "Display density", ["Comfortable", "Compact"]],
          [
            "notifications",
            "Notification category",
            ["All", "Approvals", "Payments", "Inventory", "Tasks"],
          ],
          ["chartLabels", "Chart labels", ["Visible", "Hidden"]],
          ["motion", "Motion preference", ["System", "Standard", "Reduced"]],
          [
            "quality",
            "Rendering quality",
            ["Automatic", "Performance", "Visual Quality"],
          ],
          ["presentation", "Network presentation", ["2D", "3D"]],
          ["contrast", "Contrast", ["Standard", "Enhanced"]],
        ].map(([key, label, options]) => (
          <label key={String(key)}>
            {label}
            <select
              aria-label={String(label)}
              value={w.data.prefs[String(key)] || options[0]}
              onChange={(e) => {
                const value = e.target.value;
                void w.write((d) => {
                  d.prefs[String(key)] = value;
                });
              }}
            >
              {(options as string[]).map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <p>
        Appearance applies across the whole application. Preferences are stored
        separately from financial records.
      </p>
      <Link to="/business/data">Data Management</Link> ·{" "}
      <Link to="/business/help">Help & Recovery</Link>
    </Panel3>
  );
}
export function Explorer4() {
  const { data: s } = useBusiness(),
    w = useWorkspace4();
  const [preset, setPreset] = useState("Cash Flow"),
    [selected, setSelected] = useState("");
  const docs = s.documents.filter(
    (d) =>
      d.businessId === s.activeBusiness &&
      d.status === "Posted" &&
      (preset === "Customer Network"
        ? d.kind === "sale"
        : preset === "Supplier Network"
          ? d.kind !== "sale"
          : true),
  );
  const parties = s.parties.filter(
    (p) =>
      p.businessId === s.activeBusiness && docs.some((d) => d.partyId === p.id),
  );
  const graph = {
    nodes: [
      {
        id: s.activeBusiness,
        name: s.businesses.find((b) => b.id === s.activeBusiness)!.name,
        kind: "borrower" as const,
      },
      ...parties.map((p) => ({
        id: p.id,
        name: p.name,
        kind:
          p.type === "supplier" ? ("supplier" as const) : ("buyer" as const),
      })),
    ],
    edges: docs.map((d) => ({
      id: d.id,
      from: d.kind === "sale" ? d.partyId : s.activeBusiness,
      to: d.kind === "sale" ? s.activeBusiness : d.partyId,
      amount: totals(d.lines).total / 100,
      paid:
        s.payments
          .filter(
            (p) => p.businessId === s.activeBusiness && p.documentId === d.id,
          )
          .reduce((n, p) => n + p.amount, 0) / 100,
      invoice: d.number,
    })),
  };
  const related = docs.filter(
    (d) =>
      d.id === selected ||
      d.partyId === selected ||
      selected === s.activeBusiness,
  );
  return (
    <Panel3 title="Financial Network Explorer">
      <label>
        Guided preset
        <select
          value={preset}
          onChange={(e) => {
            setPreset(e.target.value);
            setSelected("");
          }}
        >
          {[
            "Cash Flow",
            "Customer Network",
            "Supplier Network",
            "Risk & Scenario",
          ].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      <p>
        Source: posted business documents. Node selection is read-only. Values
        describe local records, not externally verified relationships.
      </p>
      <div className="w4-split">
        {w.data.prefs.presentation === "3D" ? (
          <Suspense
            fallback={<p>Loading network; records remain available below.</p>}
          >
            <Network
              graph={graph}
              onSelect={setSelected}
              quality={w.data.prefs.quality}
              reducedMotion={w.data.prefs.motion === "Reduced"}
            />
          </Suspense>
        ) : (
          <div className="w4-network2">
            <strong>{graph.nodes[0].name}</strong>
            {parties.map((p) => (
              <button key={p.id} onClick={() => setSelected(p.id)}>
                {p.name}
                <small>
                  {rupees(
                    docs
                      .filter((d) => d.partyId === p.id)
                      .reduce((n, d) => n + due(s, d), 0),
                  )}{" "}
                  outstanding
                </small>
              </button>
            ))}
          </div>
        )}
        <section>
          <h3>Supporting records</h3>
          <label>
            Select relationship
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Choose a node or document</option>
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
              {docs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.number}
                </option>
              ))}
            </select>
          </label>
          {related.map((d) => (
            <article key={d.id}>
              <Link
                to={
                  "/business/" +
                  (d.kind === "sale" ? "sales" : "bills") +
                  "?record=" +
                  d.id
                }
              >
                {d.number}
              </Link>
              <p>
                Total {rupees(totals(d.lines).total)} · Due {rupees(due(s, d))}
              </p>
            </article>
          ))}
          {preset === "Risk & Scenario" && (
            <Link to="/business/scenarios">
              Review scenario assumptions and cash stress
            </Link>
          )}
        </section>
      </div>
    </Panel3>
  );
}
export function Approvals4() {
  const { data: s, commit } = useBusiness();
  const id = s.activeBusiness;
  const returns = (canPage(s.role, "sales-returns") ? s.returns : []).filter(
    (r) =>
      r.businessId === id && ["Submitted", "Needs Review"].includes(r.status),
  );
  const payroll = permissions[s.role].some((p) =>
    ["payroll", "payrollRead"].includes(p),
  )
    ? s.payrollRuns.filter(
        (r) =>
          r.businessId === id &&
          ["Calculated", "Needs Review"].includes(r.status),
      )
    : [];
  return (
    <Panel3 title="Approvals Inbox">
      <p>
        Approval changes a review state only. Invoice issue, payroll
        finalization, credit issue and payments remain separate confirmed
        actions.
      </p>
      {returns.map((r) => (
        <article className="w4-record" key={r.id}>
          <div>
            <h3>
              {r.id} · {r.status}
            </h3>
            <p>
              {r.reason} · {rupees(r.amount)}
            </p>
            <Link
              to={
                "/business/" +
                (r.kind === "sale" ? "sales-returns" : "purchase-returns") +
                "?document=" +
                r.documentId
              }
            >
              Inspect supporting return
            </Link>
            {permissions[s.role].includes("post") &&
              [
                "Approve",
                "Reject",
                ...(r.status === "Submitted" ? ["Review"] : []),
              ].map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    if (
                      !confirm(
                        action +
                          " this return? No refund or credit is posted by this review.",
                      )
                    )
                      return;
                    void commit("Return " + action, (d, c) =>
                      transitionReturn(
                        d,
                        c,
                        r.id,
                        action,
                        true,
                        action === "Reject"
                          ? "Rejected in Approvals Inbox"
                          : "",
                      ),
                    );
                  }}
                >
                  {action === "Review" ? "Request Changes" : action}
                </button>
              ))}
          </div>
        </article>
      ))}
      {payroll.map((r) => (
        <article className="w4-record" key={r.id}>
          <div>
            <h3>
              Payroll {r.period} · {r.status}
            </h3>
            <Link to="/business/payroll">
              Review attendance and calculation evidence
            </Link>
            {permissions[s.role].includes("payroll") &&
              r.status === "Calculated" && (
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Approve reviewed payroll? Finalization remains separate.",
                      )
                    )
                      void commit("Payroll approved", (d, c) =>
                        approvePayroll(d, c, r.id),
                      );
                  }}
                >
                  Approve payroll
                </button>
              )}
          </div>
        </article>
      ))}
      {!returns.length && !payroll.length && (
        <p>No pending return or payroll reviews for this role.</p>
      )}
      <details>
        <summary>Recorded approval history</summary>
        {s.audit
          .filter(
            (a) =>
              a.businessId === id &&
              /approv|reject|review/i.test(a.action) &&
              (!/payroll|salary|attendance/i.test(a.action) ||
                permissions[s.role].some((p) =>
                  ["payroll", "payrollRead"].includes(p),
                )),
          )
          .slice(-30)
          .reverse()
          .map((a) => (
            <p key={a.id}>
              {a.at} · {a.actor} · {a.action} · {a.sourceId}
            </p>
          ))}
      </details>
    </Panel3>
  );
}
export function RolePulse4() {
  const { data: s } = useBusiness(),
    w = useWorkspace4();
  const id = s.activeBusiness,
    key = "pulse:" + id + ":" + s.role;
  const sections = (w.data.prefs[key] || "tasks,insights,checklist")
    .split(",")
    .filter(Boolean);
  const tasks = w.data.tasks.filter(
    (t) =>
      t.businessId === id &&
      t.status === "Open" &&
      (t.assigned === s.role || ["owner", "admin"].includes(s.role)),
  );
  const steps = [
    ["Business profile", s.businesses.some((b) => b.id === id), "settings"],
    [
      "Add a customer",
      s.parties.some((p) => p.businessId === id && p.type !== "supplier"),
      "customers",
    ],
    [
      "Add a product or service",
      s.items.some((p) => p.businessId === id),
      "inventory",
    ],
    [
      "Create first invoice",
      s.documents.some((d) => d.businessId === id && d.kind === "sale"),
      "sales",
    ],
    [
      "Document opening balances",
      s.journals.some((j) => j.businessId === id && j.kind === "opening"),
      "passbook",
    ],
  ] as const;
  return (
    <Panel3 title={roleNames[s.role] + " workspace"}>
      <p>
        Current business: {s.businesses.find((b) => b.id === id)?.name}. Local
        role preview · saved records remain shared across permitted roles.
      </p>
      <details>
        <summary>Customize dashboard</summary>
        {["tasks", "insights", "checklist"].map((part) => (
          <label key={part}>
            <input
              type="checkbox"
              checked={sections.includes(part)}
              onChange={(e) => {
                const checked = e.target.checked;
                void w.write((d) => {
                  d.prefs[key] = (
                    checked
                      ? [...sections, part]
                      : sections.filter((x) => x !== part)
                  ).join(",");
                });
              }}
            />
            {part}
            <button
              onClick={() =>
                void w.write((d) => {
                  d.prefs[key] = [
                    part,
                    ...sections.filter((x) => x !== part),
                  ].join(",");
                })
              }
            >
              Move first
            </button>
          </label>
        ))}
        <button
          onClick={() =>
            void w.write((d) => {
              delete d.prefs[key];
            })
          }
        >
          Restore default layout
        </button>
      </details>
      {sections.map((part) =>
        part === "tasks" ? (
          <div key={part}>
            <h3>Tasks & reviews</h3>
            <p>
              {tasks.length} open tasks ·{" "}
              <Link to="/business/tasks">My Tasks</Link> ·{" "}
              <Link to="/business/approvals">Approvals Inbox</Link>
            </p>
          </div>
        ) : part === "insights" ? (
          <div key={part}>
            <h3>Intelligence with evidence</h3>
            {canPage(s.role, "insights") ? (
              <Link to="/business/insights">
                Explain balances and compare saved scenarios →
              </Link>
            ) : (
              <p>
                Use your permitted records and tasks. Financial insights are
                unavailable in this role.
              </p>
            )}
          </div>
        ) : (
          <details key={part}>
            <summary>
              Optional getting started checklist ·{" "}
              {steps.filter((x) => x[1]).length}/{steps.length}
            </summary>
            {steps
              .filter((x) => canPage(s.role, x[2]))
              .map(([name, done, page]) => (
                <p key={name}>
                  {done ? "✓" : "○"}{" "}
                  <Link to={"/business/" + page}>{name}</Link> ·{" "}
                  {done ? "Derived from saved records" : "Not yet recorded"}
                </p>
              ))}
            <p>
              This checklist is optional and does not establish regulatory
              compliance.
            </p>
          </details>
        ),
      )}
    </Panel3>
  );
}
export function ReportsCentre4() {
  const { data: s } = useBusiness();
  const [q, setQ] = useState(""),
    [from, setFrom] = useState(
      s.businesses.find((b) => b.id === s.activeBusiness)!.financialYear,
    ),
    [to, setTo] = useState(today()),
    [error, setError] = useState("");
  const categories = [
    "Finance",
    "Sales",
    "Purchases",
    "Inventory",
    "Payroll",
    "Audit",
  ]
    .filter((c) => s.role !== "payroll" || c === "Payroll")
    .filter(
      (c) =>
        c !== "Payroll" ||
        permissions[s.role].some((p) => p === "payroll" || p === "payrollRead"),
    );
  const [category, setCategory] = useState(
    s.role === "payroll" ? "Payroll" : "Finance",
  );
  const docs = s.documents.filter(
    (d) =>
      d.businessId === s.activeBusiness &&
      d.issueDate >= from &&
      d.issueDate <= to &&
      (category === "Sales" ? d.kind === "sale" : d.kind !== "sale"),
  );
  const journals = s.journals.filter(
    (j) => j.businessId === s.activeBusiness && j.date >= from && j.date <= to,
  );
  const f = financials(s, s.activeBusiness, to);
  const opening = financials(
    s,
    s.activeBusiness,
    new Date(Date.parse(from) - 86400000).toISOString().slice(0, 10),
  );
  const rows: [string, string][] =
    category === "Finance"
      ? [
          ["Revenue in period", rupees(f.revenue - opening.revenue)],
          [
            "Expenses in period",
            rupees(f.operatingExpenses - opening.operatingExpenses),
          ],
          ["Profit in period", rupees(f.profit - opening.profit)],
          ["Cash at period end", rupees(f.cash)],
          ["Receivables at period end", rupees(f.receivables)],
          ["Payables at period end", rupees(f.payables)],
        ]
      : category === "Inventory"
        ? s.items
            .filter((i) => i.businessId === s.activeBusiness)
            .map((i) => [
              i.name,
              `${s.movements.filter((m) => m.businessId === s.activeBusiness && m.itemId === i.id && m.date <= to).reduce((n, m) => n + m.quantity, 0)} ${i.unit} at period end`,
            ])
        : category === "Audit"
          ? s.audit
              .filter(
                (a) =>
                  a.businessId === s.activeBusiness &&
                  a.at.slice(0, 10) >= from &&
                  a.at.slice(0, 10) <= to,
              )
              .map((a) => [a.at, `${a.actor} · ${a.action} · ${a.sourceId}`])
          : category === "Payroll"
            ? s.payrollRuns
                .filter(
                  (r) =>
                    r.businessId === s.activeBusiness &&
                    r.period >= from.slice(0, 7) &&
                    r.period <= to.slice(0, 7),
                )
                .map((r) => [
                  r.period,
                  `${r.status} · snapshot net ${rupees(r.lines.reduce((n, l) => n + l.net, 0))}`,
                ])
            : docs.map((d) => [
                d.number,
                `${d.status} · invoice total ${rupees(totals(d.lines).total)} · current balance ${rupees(due(s, d))}`,
              ]);
  const visible = rows.filter((r) =>
    r.join(" ").toLowerCase().includes(q.toLowerCase()),
  );
  const printable = {
    title: category + " Report",
    subtitle: `${s.businesses.find((b) => b.id === s.activeBusiness)!.name} · ${from} to ${to}`,
    rows: [
      ...visible,
      [
        "Methodology",
        "Ledger / payroll-paise-1; synthetic local data, not statutory accounts. Document balances are current; period filters select invoice issue dates.",
      ],
      ["Generated", new Date().toISOString()],
      ["Source business", s.activeBusiness],
    ] as [string, string][],
  };
  const act = (fn: () => void) => {
    try {
      authorize(
        s,
        { businessId: s.activeBusiness, role: s.role, actor: "Demo" },
        "export",
      );
      if (from > to) throw Error("Start date must not exceed end date");
      fn();
      setError("");
    } catch (e) {
      setError(String(e));
    }
  };
  return (
    <Panel3 title="Reports Centre">
      <div className="w4-grid">
        <label>
          Report category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          From
          <input
            type="date"
            required
            value={from}
            onChange={(e) => {
              if (e.target.value) setFrom(e.target.value);
            }}
          />
        </label>
        <label>
          To
          <input
            type="date"
            required
            value={to}
            onChange={(e) => {
              if (e.target.value) setTo(e.target.value);
            }}
          />
        </label>
        <label>
          Search report rows
          <input value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <p>
        Current relative to saved local data · {s.activeBusiness} ·{" "}
        {journals.length} journal entries in selected period. All exports use
        the exact filtered rows shown.
      </p>
      {from > to ? (
        <p role="alert">Start date must not exceed end date.</p>
      ) : (
        visible.map((r, i) => (
          <p key={i}>
            <strong>{r[0]}</strong>: {r[1]}
          </p>
        ))
      )}
      <button
        onClick={() =>
          act(() => {
            void downloadPDF(printable).catch((e) => setError(String(e)));
          })
        }
      >
        Export selected report PDF
      </button>
      <button
        onClick={() =>
          act(() =>
            download(
              "saakh-" + category.toLowerCase() + ".csv",
              [["Metric / record", "Value"], ...printable.rows]
                .map((r) => r.map(csvCell).join(","))
                .join("\n"),
            ),
          )
        }
      >
        Export selected report CSV
      </button>
      <button onClick={() => act(() => printDocument(printable))}>
        Print selected report
      </button>
      <p role="alert">{error}</p>
      <Link to="/business/passbook">Source journal details</Link>
    </Panel3>
  );
}
export function RecordDetails4() {
  const { data: s } = useBusiness();
  const id = new URLSearchParams(useLocation().search).get("record");
  const [tab, setTab] = useState("Overview");
  if (!id) return null;
  const permitted = searchRecords(s, id).find((r) => r.id === id);
  if (!permitted) return <p>Record unavailable in this business or role.</p>;
  const doc = s.documents.find(
      (d) => d.id === id && d.businessId === s.activeBusiness,
    ),
    party = s.parties.find(
      (p) => p.id === id && p.businessId === s.activeBusiness,
    );
  return (
    <Panel3 title={"Record · " + permitted.label}>
      <div role="tablist" aria-label="Record sections">
        {["Overview", "Payments", "Related Records", "Activity"].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <section role="tabpanel">
        {tab === "Overview" && (
          <>
            <p>
              {permitted.type} · {id} · {s.activeBusiness}
            </p>
            {doc && (
              <p>
                {doc.status} · Issued {doc.issueDate} · Total{" "}
                {rupees(totals(doc.lines).total)} · Current balance{" "}
                {rupees(due(s, doc))}
              </p>
            )}
            {party && (
              <p>
                {party.type} · {party.location} · Terms {party.termsDays} days
              </p>
            )}
          </>
        )}
        {tab === "Payments" &&
          (doc ? (
            <>
              {s.payments
                .filter(
                  (p) =>
                    p.businessId === s.activeBusiness && p.documentId === id,
                )
                .map((p) => (
                  <p key={p.id}>
                    {p.date} · {rupees(p.amount)} · {p.account} · journal{" "}
                    {p.journalId}
                  </p>
                ))}
              <p>Payments reflect locally recorded entries only.</p>
            </>
          ) : (
            <p>Select an invoice to inspect linked payments.</p>
          ))}
        {tab === "Related Records" && (
          <>
            {s.documents
              .filter(
                (d) =>
                  d.businessId === s.activeBusiness &&
                  (d.partyId === id || d.id === id),
              )
              .map((d) => (
                <p key={d.id}>
                  <Link
                    to={
                      "/business/" +
                      (d.kind === "sale" ? "sales" : "bills") +
                      "?record=" +
                      d.id
                    }
                  >
                    {d.number}
                  </Link>
                </p>
              ))}
            {doc && (
              <Link
                to={
                  "/business/" +
                  (doc.kind === "sale" ? "sales-returns" : "purchase-returns") +
                  "?document=" +
                  doc.id
                }
              >
                Inspect return eligibility
              </Link>
            )}
          </>
        )}
        {tab === "Activity" && (
          <>
            {s.audit
              .filter(
                (a) => a.businessId === s.activeBusiness && a.sourceId === id,
              )
              .map((a) => (
                <details key={a.id}>
                  <summary>
                    {a.at} · {a.actor} · {a.action}
                  </summary>
                  <pre>
                    {JSON.stringify(
                      { before: a.before, after: a.after },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              ))}
            <p>
              Recorded local events only. Date-driven overdue status is
              calculated, not an edit. This history is not tamper-proof
              evidence.
            </p>
          </>
        )}
      </section>
    </Panel3>
  );
}
function CashInsight4() {
  const { data: s } = useBusiness();
  const run = forecastBusiness(s, {
    businessId: s.activeBusiness,
    role: s.role,
    actor: "Demo",
  });
  return (
    <Panel3 title="Cash Flow · explicit local forecast">
      <p>
        30-day closing {rupees(run.days.at(-1)!.closing)} · calculated{" "}
        {run.generatedAt}. This is an illustrative forecast, not a guaranteed
        outcome.
      </p>
      <details>
        <summary>Assumptions, method and daily source values</summary>
        <p>{run.method}</p>
        <pre>{JSON.stringify(run.assumptions, null, 2)}</pre>
        {run.days.map((d) => (
          <p key={d.date}>
            {d.date}: opening {rupees(d.opening)} + receipts {rupees(d.inflows)}{" "}
            − payments {rupees(d.outflows)} = closing {rupees(d.closing)}
          </p>
        ))}
        {run.warnings.map((t) => (
          <p key={t}>{t}</p>
        ))}
      </details>
      <Link to="/business/scenarios">Save and compare assumptions</Link> ·{" "}
      <Link to="/business/cashflow">Detailed cash-flow workspace</Link>
    </Panel3>
  );
}
