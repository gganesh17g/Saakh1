import {
  type BusinessState,
  type Context,
  authorize,
  rupees,
  today,
} from "./model";
import { totals, due, docStatus } from "./accounting";
import { payrollOutstanding, customerStatement } from "./operations3";
export type Printable = {
  title: string;
  subtitle: string;
  rows: [string, string][];
};
export function invoiceDocument(
  s: BusinessState,
  c: Context,
  id: string,
): Printable {
  authorize(s, c, "read");
  const d = s.documents.find(
    (d) => d.id === id && d.businessId === c.businessId,
  );
  if (!d) throw Error("Invoice not found");
  const b = s.businesses.find((b) => b.id === c.businessId)!,
    p = s.parties.find((p) => p.id === d.partyId)!;
  return {
    title: `Invoice ${d.number}`,
    subtitle: `${b.name} · ${b.location}`,
    rows: [
      ["Date / due", `${d.issueDate} / ${d.dueDate}`],
      ["Customer", p.name],
      [
        "Billing / delivery",
        `${p.billing || p.location} / ${p.delivery || p.location}`,
      ],
      ["Contact", `${p.email || ""} ${p.phone || ""}`],
      ["GSTIN (self-entered)", p.gstin || "Not supplied"],
      ...d.lines.map(
        (l) =>
          [
            l.description,
            `${l.quantity} × ${rupees(l.price)} · discount ${l.discount}% · entered tax ${l.tax}% · HSN/SAC ${l.classification || "Not supplied"}`,
          ] as [string, string],
      ),
      ["Net", rupees(totals(d.lines).net)],
      ["Tax (entered, unverified)", rupees(totals(d.lines).tax)],
      ["Total", rupees(totals(d.lines).total)],
      [
        "Paid",
        rupees(
          s.payments
            .filter((p) => p.documentId === id)
            .reduce((a, p) => a + p.amount, 0),
        ),
      ],
      ["Balance", rupees(due(s, d))],
      ["Terms", `${p.termsDays} days · ${d.terms || ""}`],
      ["Status", docStatus(s, d)],
      [
        "Notes",
        d.notes || "Synthetic demonstration invoice; not an IRN/e-invoice.",
      ],
    ],
  };
}
export function payslipDocument(
  s: BusinessState,
  c: Context,
  runId: string,
  employeeId: string,
): Printable {
  authorize(s, c, c.role === "payroll" ? "payroll" : "payrollRead");
  const r = s.payrollRuns.find(
    (r) => r.id === runId && r.businessId === c.businessId,
  );
  const l = r?.lines.find((l) => l.employeeId === employeeId);
  if (!r?.journalId || r.status === "Reversed" || !l)
    throw Error("Payslips require finalized payroll");
  return {
    title: `Payslip ${r.period} · ${l.name}`,
    subtitle: s.businesses.find((b) => b.id === c.businessId)!.name,
    rows: [
      ["Employee / designation", `${l.employeeId} · ${l.title}`],
      ["Pay period", r.period],
      ...Object.entries(l.earnings).map(
        ([k, v]) => [k, rupees(v)] as [string, string],
      ),
      ["Gross", rupees(l.gross)],
      ["Reimbursements", rupees(l.reimbursement)],
      ...Object.entries(l.deductions).map(
        ([k, v]) => [k, rupees(v)] as [string, string],
      ),
      ["Net payable", rupees(l.net)],
      ["Outstanding", rupees(payrollOutstanding(s, r.id, l.employeeId))],
      [
        "Payment status",
        payrollOutstanding(s, r.id, l.employeeId)
          ? "Unpaid / partially recorded"
          : "Payment recorded locally; no bank transfer",
      ],
      ["Snapshot rule", `${l.rule.id} · ${l.rule.label} · ${r.formula}`],
      ["Generated", today()],
    ],
  };
}
export function statementDocument(
  s: BusinessState,
  c: Context,
  id: string,
  from: string,
  to: string,
): Printable {
  const p = s.parties.find((p) => p.id === id && p.businessId === c.businessId);
  if (!p) throw Error("Customer not found");
  const v = customerStatement(s, c, id, from, to);
  return {
    title: `Customer statement · ${p.name}`,
    subtitle: `${from} to ${to} · signed balance = receivable less customer credit liability`,
    rows: [
      ["Opening", rupees(v.opening)],
      ...v.rows.map(
        (r) =>
          [
            `${r.date} ${r.event}`,
            `${rupees(r.change)} → ${rupees(r.balance)}`,
          ] as [string, string],
      ),
      ["Closing", rupees(v.closing)],
    ],
  };
}
export function pdfText(value: string) {
  const text = value
    .replace(/₹/g, "INR ")
    .replace(/→/g, " to ")
    .replace(/×/g, "x")
    .replace(/[–—−]/g, "-")
    .replace(/·/g, "|");
  if (/[^\x09\x0a\x0d\x20-\x7e]/.test(text))
    throw Error(
      "This PDF font supports Latin text only. Use Print document and Save as PDF to preserve Indic/other scripts with your browser fonts.",
    );
  return text;
}
export async function downloadPDF(doc: Printable) {
  [doc.title, doc.subtitle, ...doc.rows.flat()].forEach(pdfText);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF();
  let y = 18;
  const text = (s: string, size = 10) => {
    pdf.setFontSize(size);
    for (const line of pdf.splitTextToSize(pdfText(s), 176)) {
      if (y > 278) {
        pdf.addPage();
        y = 18;
      }
      pdf.text(line, 16, y);
      y += 6;
    }
  };
  text(doc.title, 16);
  text(doc.subtitle);
  y += 4;
  for (const [label, value] of doc.rows) text(`${label}: ${value}`);
  y += 5;
  text(
    "Synthetic local demo. Not certified payroll, tax advice, GST filing, registered IRN or confirmation of a bank transfer.",
    9,
  );
  pdf.save(doc.title.replace(/[^a-z0-9-]/gi, "-") + ".pdf");
}
export function printDocument(doc: Printable) {
  const frame = document.createElement("iframe");
  frame.style.cssText =
    "position:fixed;width:0;height:0;right:0;bottom:0;border:0";
  document.body.append(frame);
  const esc = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c]!,
    );
  const target = frame.contentDocument!;
  target.open();
  target.write(
    `<!doctype html><html><head><title>${esc(doc.title)}</title><style>body{font:14px system-ui;margin:35px;color:#142433}table{width:100%;border-collapse:collapse}td{padding:10px;border-bottom:1px solid #ddd;vertical-align:top}h1{font-size:24px}</style></head><body><h1>${esc(doc.title)}</h1><p>${esc(doc.subtitle)}</p><table>${doc.rows.map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("")}</table><p>Synthetic demonstration only; not registered e-invoice, statutory payroll or bank transfer confirmation.</p></body></html>`,
  );
  target.close();
  frame.contentWindow!.focus();
  frame.contentWindow!.print();
  setTimeout(() => frame.remove(), 1000);
}
