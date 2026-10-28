import { useRef, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { useWorkspace4 } from "./workspace4";
export function QuickPreferences42() {
  const w = useWorkspace4();
  const dialog = useRef<HTMLDialogElement>(null);
  const [density, setDensity] = useState("Comfortable");
  const [motion, setMotion] = useState("System");
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    const result = await w.write((d) => {
      d.prefs.density = density;
      d.prefs.motion = motion;
    });
    setSaving(false);
    if (result) dialog.current?.close();
  }
  return (
    <section className="appearance42-compact">
      <button
        onClick={() => {
          setDensity(w.data.prefs.density || "Comfortable");
          setMotion(w.data.prefs.motion || "System");
          dialog.current?.showModal();
        }}
      >
        <SlidersHorizontal size={18} /> Quick preferences
      </button>
      <dialog
        ref={dialog}
        className="appearance41-dialog"
        aria-label="Quick workspace preferences"
      >
        <h2>Make room for your work</h2>
        <label>
          Display density
          <select
            aria-label="Quick display density"
            value={density}
            onChange={(e) => setDensity(e.target.value)}
          >
            {["Comfortable", "Compact"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Motion preference
          <select
            aria-label="Quick motion preference"
            value={motion}
            onChange={(e) => setMotion(e.target.value)}
          >
            {["System", "Standard", "Reduced"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <p>Device reduced-motion preferences always take priority.</p>
        {w.error && <p role="alert">{w.error}</p>}
        <div className="actions">
          <button disabled={!w.ready || saving} onClick={() => void save()}>
            Save preferences
          </button>
          <button onClick={() => dialog.current?.close()}>Cancel</button>
        </div>
      </dialog>
    </section>
  );
}
