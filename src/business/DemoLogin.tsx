import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Users,
  Calculator,
  ShieldCheck,
  Wallet,
  ClipboardList,
  ScanSearch,
  Activity,
} from "lucide-react";
import { useBusiness } from "./store";
import { roles, type Role } from "./model";
import { roleDestination42 } from "./roleEntry42";
import { roleNames } from "./workspace4";
const icons = [
  BriefcaseBusiness,
  Users,
  Calculator,
  ShieldCheck,
  Wallet,
  ClipboardList,
  ScanSearch,
];
const descriptions: Record<Role, string> = {
  owner: "The complete picture. Sales, cash, inventory and business decisions.",
  staff: "Keep daily business moving with invoices, customers and purchases.",
  accountant: "Follow the numbers through ledgers, reconciliation and reports.",
  admin: "Manage this demo business, its settings and operational records.",
  payroll: "Prepare payroll, inspect employees and review salary obligations.",
  manager: "Coordinate attendance, assigned tasks and day-to-day operations.",
  auditor:
    "Inspect financial reports and follow evidence in a read-only preview.",
};
export default function DemoLogin() {
  const { data, hydrate, ready, setRole, error } = useBusiness();
  const [selected, select] = useState<Role>(data.role);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    void hydrate();
  }, [hydrate]);
  async function enter(role: Role) {
    const destination = roleDestination42(role);
    if (!destination || busy || !ready) return;
    select(role);
    setBusy(true);
    await setRole(role);
    setBusy(false);
    if (!useBusiness.getState().error) navigate(destination);
  }
  return (
    <main id="main" className="demo41">
      <Link className="logo" to="/">
        <Activity /> saakh <small>साख</small>
      </Link>
      <div className="eyebrow">A DIFFERENT VIEW. THE SAME BUSINESS.</div>
      <h1>
        Your business.
        <br />
        <em>Your perspective.</em>
      </h1>
      <p>
        One click. Your tools, your view. Choose a demo role to enter its
        workspace.
      </p>
      <div className="role41-grid" role="group" aria-label="Choose demo role">
        {roles.map((role, index) => {
          const Icon = icons[index];
          return (
            <button
              key={role}
              aria-pressed={selected === role}
              disabled={!ready || busy}
              onClick={() => void enter(role)}
            >
              <span className={"role42-icon role42-" + role}>
                <Icon size={22} />
              </span>
              <strong>{roleNames[role]}</strong>
              <span>{descriptions[role]}</span>
              <small>
                {busy && selected === role
                  ? "Opening workspace…"
                  : "Enter workspace →"}
              </small>
            </button>
          );
        })}
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="actions">
        <button
          className="text-link"
          disabled={!ready || busy}
          onClick={() => navigate("/business")}
        >
          Continue Previous Session
        </button>
        <button
          className="text-link"
          disabled={!ready || busy}
          onClick={() => void enter("owner")}
        >
          Start as Business Owner
        </button>
      </div>
      <p className="demo41-notice">
        Browser-local demo identities share the selected business’s existing
        records. This is a permission preview, not authentication or secure
        multi-user access.
      </p>
      <Link to="/">← Back to public website</Link>
    </main>
  );
}
