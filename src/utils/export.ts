import type { Run } from "../domain/model";
import { disclaimer } from "../domain/model";
export function csv(r: Run) {
  const escape = (v: unknown) => '"' + String(v).replaceAll('"', '""') + '"';
  const headers = [
    "simulation",
    "version",
    "timestamp",
    "scenario",
    "day",
    "opening",
    "receipts",
    "payments",
    "closing",
    "inputs",
    "sources",
    "evidence",
    "disclaimer",
  ];
  return (
    headers.join(",") +
    "\n" +
    r.days
      .map((d) =>
        [
          r.id,
          r.version,
          r.timestamp,
          r.scenario || "baseline",
          d.day,
          d.opening,
          d.receipts,
          d.payments,
          d.closing,
          JSON.stringify(r.borrower),
          JSON.stringify(r.sources),
          JSON.stringify(r.alerts),
          disclaimer,
        ]
          .map(escape)
          .join(","),
      )
      .join("\n")
  );
}
export function download(name: string, data: unknown, type = "json") {
  const body = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const url = URL.createObjectURL(
    new Blob([body], {
      type: type === "csv" ? "text/csv" : "application/json",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}.${type}`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
