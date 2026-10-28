import { useRef, useState } from "react";
import { Palette } from "lucide-react";
export function Appearance41({ compact = false }: { compact?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("saakh-theme") || "system";
    } catch {
      return "system";
    }
  });
  const [error, setError] = useState("");
  function save() {
    try {
      localStorage.setItem("saakh-theme", theme);
      document.documentElement.dataset.theme =
        theme === "system"
          ? matchMedia("(prefers-color-scheme: light)").matches
            ? "light"
            : "dark"
          : theme;
      window.dispatchEvent(new Event("saakh-appearance"));
      dialog.current?.close();
    } catch {
      setError(
        "Appearance could not be saved. Check browser storage permissions.",
      );
    }
  }
  return (
    <section className={compact ? "appearance42-compact" : "appearance41"}>
      {!compact && (
        <>
          <h3>Appearance</h3>
          <p>
            A quieter workspace, made yours. Choose System, Light or Dark for
            every screen.
          </p>
        </>
      )}
      <button
        onClick={() => {
          try {
            setTheme(localStorage.getItem("saakh-theme") || "system");
          } catch {
            setTheme("system");
          }
          setError("");
          dialog.current?.showModal();
        }}
      >
        <Palette size={18} /> {compact ? "Appearance" : "Choose appearance"}
      </button>
      <dialog
        className="appearance41-dialog"
        ref={dialog}
        aria-label="Appearance settings"
      >
        <h2>Choose your appearance</h2>
        <label>
          Theme
          <select
            aria-label="Theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          >
            {["system", "light", "dark"].map((t) => (
              <option key={t} value={t}>
                {t[0].toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </label>
        {error && <p role="alert">{error}</p>}
        <div className="actions">
          <button onClick={save}>Save appearance</button>
          <button onClick={() => dialog.current?.close()}>Cancel</button>
        </div>
      </dialog>
    </section>
  );
}
