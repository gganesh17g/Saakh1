import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";
import {
  type BusinessState,
  type Context,
  dateSchema,
  authorize,
  uid,
  audit,
} from "./model";
export function csvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (quote && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else quote = !quote;
    } else if (c === "," && !quote) {
      row.push(cell);
      cell = "";
    } else if ((c === "\n" || c === "\r") && !quote) {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (quote) throw new Error("Unclosed quoted CSV field");
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}
export const sampleCSV =
  'date,narration,amount\n2026-10-27,"Sample customer receipt",750.00\n2026-10-27,"Sample supplier payment",-300.00\n';
export function importStatement(
  s: BusinessState,
  c: Context,
  rows: string[][],
  source: string,
) {
  authorize(s, c, "reconcile");
  if (rows.length > 2001) throw new Error("Maximum 2,000 statement rows");
  const headers = rows[0]?.map((x) => x.trim().toLowerCase());
  if (headers?.join(",") !== "date,narration,amount")
    throw new Error(
      "Required columns in order: date,narration,amount; signed INR amount",
    );
  let added = 0,
    duplicates = 0;
  for (const row of rows.slice(1)) {
    if (row.length !== 3)
      throw new Error("Each statement row needs three columns");
    const date = dateSchema.parse(row[0].trim()),
      narration = row[1].trim(),
      value = Number(row[2]);
    if (
      !narration ||
      !row[2].trim() ||
      !Number.isFinite(value) ||
      Math.abs(value) > 1e10 ||
      value === 0
    )
      throw new Error(
        "Statement requires narration and a nonzero finite signed amount",
      );
    const amount = Math.round(value * 100);
    if (
      s.statements.some(
        (r) =>
          r.businessId === c.businessId &&
          r.date === date &&
          r.narration === narration &&
          r.amount === amount,
      )
    ) {
      duplicates++;
      continue;
    }
    s.statements.push({
      id: uid(s, "STM"),
      businessId: c.businessId,
      date,
      narration,
      amount,
      account: "bank",
      source,
      status: "Unmatched",
      journalIds: [],
    });
    added++;
  }
  audit(s, c, "Statement imported; no journal posted", source, null, {
    added,
    duplicates,
  });
  return { added, duplicates };
}
export function xlsxRows(bytes: Uint8Array) {
  let size = 0;
  const files = unzipSync(bytes, {
    filter: (f) => {
      size += f.originalSize;
      if (size > 8e6) throw new Error("Expanded workbook exceeds 8 MB");
      return /^(xl\/worksheets\/sheet1.xml|xl\/sharedStrings.xml)$/.test(
        f.name,
      );
    },
  });
  const parse = (name: string) => {
    const data = files[name];
    if (!data) throw new Error("Missing XLSX worksheet");
    const text = strFromU8(data);
    if (/<!DOCTYPE|<!ENTITY/i.test(text))
      throw new Error("XML entities are not accepted");
    const xml = new DOMParser().parseFromString(text, "application/xml");
    if (xml.querySelector("parsererror")) throw new Error("Invalid XLSX XML");
    return xml;
  };
  const strings = files["xl/sharedStrings.xml"]
    ? Array.from(parse("xl/sharedStrings.xml").getElementsByTagName("si")).map(
        (si) =>
          Array.from(si.getElementsByTagName("t"))
            .map((t) => t.textContent || "")
            .join(""),
      )
    : [];
  const xml = parse("xl/worksheets/sheet1.xml");
  return Array.from(xml.getElementsByTagName("row"))
    .map((row) => {
      const out: string[] = [];
      for (const cell of Array.from(row.getElementsByTagName("c"))) {
        if (cell.getElementsByTagName("f").length)
          throw new Error("Formulas are not imported; paste values first");
        const ref = cell.getAttribute("r") || "",
          col = ref.replace(/[0-9]/g, "");
        let index = 0;
        for (const ch of col) index = index * 26 + ch.charCodeAt(0) - 64;
        index--;
        if (index < 0 || index > 2)
          throw new Error(
            "Worksheet must contain only date,narration,amount columns A–C",
          );
        const value = cell.getElementsByTagName("v")[0]?.textContent || "";
        out[index] =
          cell.getAttribute("t") === "s"
            ? strings[Number(value)] || ""
            : cell.getAttribute("t") === "inlineStr"
              ? cell.getElementsByTagName("t")[0]?.textContent || ""
              : value;
      }
      return [out[0] || "", out[1] || "", out[2] || ""];
    })
    .filter((row) => row.some(Boolean));
}
export async function readStatement(file: File) {
  if (file.size > 2e6) throw new Error("Statement size limit is 2 MB");
  if (file.name.toLowerCase().endsWith(".csv"))
    return csvRows(await file.text());
  if (file.name.toLowerCase().endsWith(".xlsx"))
    return xlsxRows(new Uint8Array(await file.arrayBuffer()));
  throw new Error(
    "Use CSV or XLSX with the sample columns. XLS/XLSM are not supported.",
  );
}
export function sampleXLSX() {
  const esc = (s: string) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;");
  const rows = csvRows(sampleCSV);
  const sheet =
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
    rows
      .map(
        (row, i) =>
          '<row r="' +
          (i + 1) +
          '">' +
          row
            .map(
              (v, j) =>
                '<c r="' +
                String.fromCharCode(65 + j) +
                (i + 1) +
                '" t="inlineStr"><is><t>' +
                esc(v) +
                "</t></is></c>",
            )
            .join("") +
          "</row>",
      )
      .join("") +
    "</sheetData></worksheet>";
  const parts: Record<string, string> = {
    "[Content_Types].xml":
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
    "_rels/.rels":
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
    "xl/workbook.xml":
      '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Statement" sheetId="1" r:id="rId1"/></sheets></workbook>',
    "xl/_rels/workbook.xml.rels":
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
    "xl/worksheets/sheet1.xml": sheet,
  };
  return zipSync(
    Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, strToU8(v)])),
  );
}
export function downloadXLSX() {
  const bytes = sampleXLSX();
  const url = URL.createObjectURL(
    new Blob([bytes.buffer as ArrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "saakh-sample-statement.xlsx";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function download(
  name: string,
  text: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function csvCell(v: unknown) {
  let text = String(v ?? "");
  if (/^[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
