import { type ReactNode, type FormEvent, useState } from "react";
import { useBusiness, contextFor } from "./store";
import { authorize, permissions, rupees } from "./model";
import { download, csvCell } from "./imports";
import { type Printable, downloadPDF, printDocument } from "./documents3";
export const useOps = () => {
  const v = useBusiness();
  return { ...v, s: v.data, c: contextFor(v.data) };
};
export function Panel3({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="m-panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
export function Field3({
  label,
  name,
  type = "text",
  value = "",
  required = true,
  children,
  min,
  step,
}: {
  label: string;
  name?: string;
  type?: string;
  value?: string | number;
  required?: boolean;
  children?: ReactNode;
  min?: number;
  step?: string;
}) {
  return (
    <label className="m-field">
      <span>{label}</span>
      {children || (
        <input
          aria-label={label}
          name={name}
          type={type}
          defaultValue={value}
          required={required}
          min={min}
          step={step}
        />
      )}
    </label>
  );
}
export function Money3({
  label,
  name,
  value = 0,
}: {
  label: string;
  name: string;
  value?: number;
}) {
  return (
    <Field3
      label={label}
      name={name}
      type="number"
      value={value / 100}
      min={0}
      step="0.01"
    />
  );
}
export function Table3({
  heads,
  children,
}: {
  heads: string[];
  children: ReactNode;
}) {
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
export const form3 = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  return new FormData(e.currentTarget);
};
export const str3 = (f: FormData, k: string) => String(f.get(k) || "");
export const num3 = (f: FormData, k: string) => Number(f.get(k) || 0);
export function Confirm3({
  text,
  onConfirm,
}: {
  text: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {text}
      </button>
      {open && (
        <dialog
          className="m-dialog"
          aria-label={text}
          ref={(el) => {
            if (el && !el.open) el.showModal();
          }}
          onCancel={() => setOpen(false)}
        >
          <h2>{text}</h2>
          <p>
            Review this local financial event. Original evidence remains in the
            audit trail. No bank transfer occurs.
          </p>
          <button
            autoFocus
            onClick={() => {
              onConfirm();
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
export function Preview3({
  doc,
  close,
}: {
  doc: Printable;
  close: () => void;
}) {
  const [error, setError] = useState("");
  const { c } = useOps();
  const allowed = permissions[c.role].includes("export");
  return (
    <Panel3 title={doc.title}>
      <p>{doc.subtitle}</p>
      <div className="m-toolbar">
        {allowed && (
          <>
            <button
              onClick={() =>
                void downloadPDF(doc).catch((e) => setError(String(e)))
              }
            >
              Download PDF
            </button>
            <button onClick={() => printDocument(doc)}>Print document</button>
          </>
        )}
        <button onClick={close}>Close preview</button>
      </div>
      {error && <p role="alert">{error}</p>}
      <Table3 heads={["Detail", "Value"]}>
        {doc.rows.map(([k, v], i) => (
          <tr key={i}>
            <td>{k}</td>
            <td>{v}</td>
          </tr>
        ))}
      </Table3>
      <p>
        Synthetic local demonstration. Not a statutory filing or bank
        confirmation.
      </p>
    </Panel3>
  );
}
export function csv3(
  name: string,
  heads: string[],
  rows: (string | number)[][],
) {
  try {
    const s = useBusiness.getState().data;
    authorize(s, contextFor(s), "export");
    download(
      name + ".csv",
      [heads, ...rows].map((r) => r.map(csvCell).join(",")).join("\n"),
      "text/csv",
    );
  } catch (e) {
    void useBusiness.getState().commit("Export", () => {
      throw e;
    });
  }
}
export const metric3 = (label: string, value: number) => (
  <div className="m-metric">
    <span>{label}</span>
    <strong>{rupees(value)}</strong>
  </div>
);
