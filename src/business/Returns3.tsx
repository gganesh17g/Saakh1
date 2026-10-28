import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { paise, rupees, today, authorize, audit } from "./model";
import { type ReturnLine } from "./operationsModel";
import * as ops from "./operations3";
import { type Printable } from "./documents3";
import {
  useOps,
  Panel3,
  Field3,
  Money3,
  Table3,
  Confirm3,
  Preview3,
  form3,
  str3,
  num3,
  csv3,
} from "./UI3";
export default function Returns3({ kind }: { kind: "sale" | "purchase" }) {
  const { s, c, commit } = useOps();
  const [params] = useSearchParams();
  const [docId, setDoc] = useState(params.get("document") || ""),
    [adding, setAdding] = useState(!!params.get("document")),
    [selected, setSelected] = useState(""),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("All"),
    [lines, setLines] = useState<
      Record<
        number,
        { quantity: number; disposition: ReturnLine["disposition"] }
      >
    >({}),
    [preview, setPreview] = useState<Printable | null>(null);
  const docs = s.documents.filter(
    (d) =>
      d.businessId === c.businessId &&
      (kind === "sale" ? d.kind === "sale" : d.kind !== "sale") &&
      d.status === "Posted",
  );
  const d = docs.find((d) => d.id === docId);
  const all = s.returns.filter(
    (r) => r.businessId === c.businessId && r.kind === kind,
  );
  const list = all.filter(
    (r) =>
      (status === "All" || r.status === status) &&
      `${r.id} ${r.reason} ${s.documents.find((d) => d.id === r.documentId)?.number}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const r = all.find((r) => r.id === selected);
  const dashboard = ops.returnsDashboard(s, c, kind);
  const { amount, refunded, credits } = dashboard;
  return (
    <>
      <Panel3
        title={
          kind === "sale"
            ? "Customer returns & credits"
            : "Supplier returns & recoveries"
        }
      >
        <p>
          Approval does not move cash.{" "}
          {kind === "purchase"
            ? "Dispatch is a separate physical event; supplier credit requires a supplier-issued reference."
            : "Only inspected sellable returns restore available stock. Quarantine is valued separately; written-off goods do not restore inventory value."}
        </p>
        <div className="m-metrics">
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("returns-register")
                ?.scrollIntoView({ block: "start" })
            }
            className="m-metric"
          >
            <span>Returns / value</span>
            <strong>
              {all.length} / {rupees(amount)}
            </strong>
          </button>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("returns-register")
                ?.scrollIntoView({ block: "start" })
            }
            className="m-metric"
          >
            <span>Recorded refunds</span>
            <strong>{rupees(refunded)}</strong>
          </button>
          <button
            type="button"
            onClick={() =>
              document
                .getElementById("returns-register")
                ?.scrollIntoView({ block: "start" })
            }
            className="m-metric"
          >
            <span>Open credit balance</span>
            <strong>{rupees(credits)}</strong>
          </button>
        </div>
        <details>
          <summary>Approvals, returned stock and reason analysis</summary>
          <p>
            {dashboard.pending} pending · {dashboard.approved} approved or
            committed · {dashboard.stockUnits} physical units{" "}
            {kind === "sale" ? "received / classified" : "dispatched"}.
            Quarantined/written-off sales units are not available stock.
          </p>
          <Table3 heads={["Reason", "Returns", "Value"]}>
            {dashboard.reasons.map((v) => (
              <tr key={v.reason}>
                <td>{v.reason}</td>
                <td>{v.count}</td>
                <td>{rupees(v.amount)}</td>
              </tr>
            ))}
          </Table3>
        </details>
        <div className="m-toolbar">
          <button onClick={() => setAdding(!adding)}>
            Create {kind === "sale" ? "sales" : "purchase"} return
          </button>
          <Field3 label="Search returns">
            <input value={search} onChange={(e) => setSearch(e.target.value)} />
          </Field3>
          <Field3 label="Return status">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {["All", ...new Set(all.map((r) => r.status))].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field3>
          <button
            onClick={() =>
              csv3(
                kind + "-returns",
                [
                  "id",
                  "document",
                  "status",
                  "value_paise",
                  "open_credit_paise",
                  "refund_paise",
                  "reason",
                ],
                list.map((r) => [
                  r.id,
                  r.documentId,
                  r.status,
                  r.amount,
                  r.creditBalance,
                  r.refunded,
                  r.reason,
                ]),
              )
            }
          >
            Export returns CSV
          </button>
        </div>
      </Panel3>
      {adding && (
        <Panel3 title="Return quantities and condition">
          <form
            className="m-form"
            onSubmit={async (e) => {
              const f = form3(e);
              let id = "";
              if (
                await commit("Return draft saved", (s, c) => {
                  id = ops.createReturn(s, c, {
                    documentId: docId,
                    date: str3(f, "date"),
                    reason: str3(f, "reason"),
                    condition: str3(f, "condition"),
                    preference: str3(f, "preference") as "Credit" | "Refund",
                    notes: str3(f, "notes"),
                    evidence: str3(f, "evidence"),
                    lines: Object.entries(lines)
                      .filter(([, l]) => l.quantity > 0)
                      .map(([index, l]) => ({ index: +index, ...l })),
                  }).id;
                })
              ) {
                setSelected(id);
                setAdding(false);
                setLines({});
              }
            }}
          >
            <Field3 label="Original invoice / bill">
              <select
                value={docId}
                onChange={(e) => {
                  setDoc(e.target.value);
                  setLines({});
                }}
                required
              >
                <option value="">Select source document</option>
                {docs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.number} ·{" "}
                    {s.parties.find((p) => p.id === d.partyId)?.name}
                  </option>
                ))}
              </select>
            </Field3>
            {d && (
              <Table3
                heads={[
                  "Original line",
                  "Eligible quantity",
                  "Return quantity",
                  "Stock disposition",
                ]}
              >
                {d.lines.map((l, i) => (
                  <tr key={i}>
                    <td>
                      {l.description}
                      <small>
                        {rupees(l.price)} · discount {l.discount}% · tax {l.tax}
                        %
                      </small>
                    </td>
                    <td>{ops.returnEligible(s, d.id, i)}</td>
                    <td>
                      <input
                        aria-label={`Return quantity ${i + 1}`}
                        type="number"
                        min="0"
                        step="0.001"
                        max={ops.returnEligible(s, d.id, i)}
                        value={lines[i]?.quantity || 0}
                        onChange={(e) =>
                          setLines({
                            ...lines,
                            [i]: {
                              quantity: +e.target.value,
                              disposition: lines[i]?.disposition || "Restock",
                            },
                          })
                        }
                      />
                    </td>
                    <td>
                      <select
                        aria-label={`Disposition ${i + 1}`}
                        value={lines[i]?.disposition || "Restock"}
                        onChange={(e) =>
                          setLines({
                            ...lines,
                            [i]: {
                              quantity: lines[i]?.quantity || 0,
                              disposition: e.target
                                .value as ReturnLine["disposition"],
                            },
                          })
                        }
                      >
                        <option>Restock</option>
                        <option>Quarantine</option>
                        <option>Write off</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </Table3>
            )}
            <div className="m-two">
              <Field3
                label="Return date"
                type="date"
                name="date"
                value={today()}
              />
              <Field3 label="Return reason">
                <select name="reason">
                  {[
                    "Damaged product",
                    "Incorrect product",
                    "Defective product",
                    "Excess quantity",
                    "Customer rejection",
                    "Other",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field3>
              <Field3
                label="Product condition"
                name="condition"
                value="Inspected synthetic goods"
              />
              <Field3 label="Settlement preference">
                <select name="preference">
                  <option>Credit</option>
                  <option>Refund</option>
                </select>
              </Field3>
              <Field3
                label="Supporting evidence reference"
                name="evidence"
                value="Synthetic inspection record"
              />
              <Field3 label="Return notes" name="notes" required={false} />
            </div>
            <button>Save return draft</button>
          </form>
        </Panel3>
      )}
      <div id="returns-register">
        <Panel3 title="Return register">
          <Table3
            heads={[
              "Return / reason",
              "Document",
              "Status",
              "Value",
              "Open credit",
              "Inspect",
            ]}
          >
            {list.map((r) => (
              <tr key={r.id}>
                <td>
                  {r.id}
                  <small>
                    {r.reason} · {r.date}
                  </small>
                </td>
                <td>
                  {s.documents.find((d) => d.id === r.documentId)?.number}
                </td>
                <td>{r.status}</td>
                <td>{rupees(r.amount)}</td>
                <td>{rupees(r.creditBalance)}</td>
                <td>
                  <button onClick={() => setSelected(r.id)}>
                    Inspect return
                  </button>
                </td>
              </tr>
            ))}
          </Table3>
          {!list.length && (
            <p>No returns match. Create a draft from a posted document.</p>
          )}
        </Panel3>
      </div>
      {r && (
        <Panel3 title={r.id + " · decisions & evidence"}>
          <p>
            {r.status} · {r.condition} · {r.reason} · {r.preference} preference
            · {r.evidence}
          </p>
          <p>
            Net {rupees(r.net)} + entered tax {rupees(r.tax)} ={" "}
            {rupees(r.amount)}. Applied {rupees(r.applied)}, refunded{" "}
            {rupees(r.refunded)}, available {rupees(r.creditBalance)}.
          </p>
          <div className="m-toolbar">
            {(r.status === "Draft" || r.status === "Needs Review") && (
              <button
                onClick={() =>
                  void commit("Return submitted", (s, c) =>
                    ops.transitionReturn(s, c, r.id, "Submit"),
                  )
                }
              >
                Submit return
              </button>
            )}
            {["Submitted", "Needs Review"].includes(r.status) && (
              <>
                <Confirm3
                  text="Approve return"
                  onConfirm={() =>
                    void commit("Return approved", (s, c) =>
                      ops.transitionReturn(s, c, r.id, "Approve", true),
                    )
                  }
                />
                <button
                  onClick={() =>
                    void commit("Review required", (s, c) =>
                      ops.transitionReturn(s, c, r.id, "Review"),
                    )
                  }
                >
                  Needs review
                </button>
                <Confirm3
                  text="Reject return"
                  onConfirm={() =>
                    void commit("Return rejected", (s, c) =>
                      ops.transitionReturn(
                        s,
                        c,
                        r.id,
                        "Reject",
                        true,
                        "Analyst rejected; see notes",
                      ),
                    )
                  }
                />
              </>
            )}
            {r.kind === "purchase" && r.status === "Approved" && (
              <Confirm3
                text={
                  s.documents.find((d) => d.id === r.documentId)?.kind ===
                  "purchase"
                    ? "Record goods dispatched"
                    : "Confirm supplier return"
                }
                onConfirm={() =>
                  void commit("Goods dispatched", (s, c) =>
                    ops.transitionReturn(s, c, r.id, "Dispatch", true),
                  )
                }
              />
            )}
            {r.kind === "sale" && r.status === "Approved" && (
              <Confirm3
                text="Issue customer credit"
                onConfirm={() =>
                  void commit("Credit issued", (s, c) =>
                    ops.transitionReturn(s, c, r.id, "Credit", true),
                  )
                }
              />
            )}
            {r.kind === "purchase" && r.status === "Goods Dispatched" && (
              <button
                onClick={() =>
                  void commit("Supplier credit requested", (s, c) =>
                    ops.transitionReturn(s, c, r.id, "Await"),
                  )
                }
              >
                Await supplier credit
              </button>
            )}
            {["Credit Issued", "Supplier Credit Received", "Settled"].includes(
              r.status,
            ) && (
              <Confirm3
                text="Close settled return"
                onConfirm={() =>
                  void commit("Return closed", (s, c) =>
                    ops.transitionReturn(s, c, r.id, "Close", true),
                  )
                }
              />
            )}
            <button
              onClick={() =>
                setPreview({
                  title:
                    r.kind === "sale" && r.journalIds.length
                      ? "Customer credit note " + r.id
                      : "Internal return acknowledgment " + r.id,
                  subtitle: s.businesses.find((b) => b.id === c.businessId)!
                    .name,
                  rows: [
                    [
                      "Original document",
                      s.documents.find((d) => d.id === r.documentId)!.number,
                    ],
                    ["Status", r.status],
                    ["Reason / condition", r.reason + " / " + r.condition],
                    ["Date", r.date],
                    ["Value", rupees(r.amount)],
                    ["Net / tax", rupees(r.net) + " / " + rupees(r.tax)],
                    ["Recorded refunds", rupees(r.refunded)],
                    ["Open credit", rupees(r.creditBalance)],
                    [
                      "Supplier-issued reference",
                      r.supplierReference ||
                        "None; this is an internal document",
                    ],
                    ...r.lines.map(
                      (l) =>
                        [
                          "Source line " + (l.index + 1),
                          `${l.quantity} · ${l.disposition}`,
                        ] as [string, string],
                    ),
                  ],
                })
              }
            >
              Preview return document
            </button>
          </div>
          {r.kind === "purchase" && (
            <form
              className="m-form"
              onSubmit={(e) => {
                const f = form3(e);
                void commit("Supplier communication saved", (s, c) => {
                  authorize(s, c, "post");
                  const row = s.returns.find((x) => x.id === r.id)!;
                  const before = {
                    communication: row.communication,
                    disputed: row.disputed,
                  };
                  row.communication = str3(f, "communication");
                  row.disputed = f.has("disputed");
                  audit(
                    s,
                    c,
                    "Supplier return communication / dispute updated",
                    row.id,
                    before,
                    {
                      communication: row.communication,
                      disputed: row.disputed,
                    },
                  );
                });
              }}
            >
              <Field3
                label="Supplier communication / dispute notes"
                name="communication"
                value={r.communication}
              />
              <label className="m-check">
                <input
                  name="disputed"
                  type="checkbox"
                  defaultChecked={r.disputed}
                />
                Supplier refund disputed; exclude from expected cash receipts
              </label>
              <button>Save supplier communication</button>
            </form>
          )}
          {r.kind === "purchase" &&
            ["Goods Dispatched", "Awaiting Supplier Credit"].includes(
              r.status,
            ) && (
              <form
                className="m-form"
                onSubmit={(e) => {
                  const f = form3(e);
                  void commit("Supplier credit received", (s, c) =>
                    ops.transitionReturn(
                      s,
                      c,
                      r.id,
                      "Credit",
                      f.has("confirm"),
                      str3(f, "reference"),
                      paise(num3(f, "creditAmount")),
                    ),
                  );
                }}
              >
                <Field3
                  label="Supplier-issued credit reference"
                  name="reference"
                />
                <Money3
                  label="Supplier credit received (₹)"
                  name="creditAmount"
                  value={r.amount - r.creditReceived}
                />
                <label className="m-check">
                  <input name="confirm" type="checkbox" required />I reviewed
                  the supplier credit evidence
                </label>
                <button>Record supplier credit</button>
              </form>
            )}
          {[
            "Credit Issued",
            "Supplier Credit Received",
            "Settled",
            "Awaiting Supplier Credit",
          ].includes(r.status) && (
            <form
              className="m-form"
              onSubmit={(e) => {
                const f = form3(e);
                void commit("Return settlement recorded", (s, c) =>
                  ops.settleReturn(
                    s,
                    c,
                    r.id,
                    paise(num3(f, "amount")),
                    str3(f, "date"),
                    str3(f, "kind") as "Refund" | "Allocation",
                    str3(f, "reference"),
                    str3(f, "target"),
                  ),
                );
              }}
            >
              <h3>Allocate credit or record an actual refund</h3>
              <div className="m-two">
                <Money3
                  label="Settlement amount (₹)"
                  name="amount"
                  value={r.creditBalance}
                />
                <Field3
                  label="Settlement date"
                  name="date"
                  type="date"
                  value={today()}
                />
                <Field3 label="Settlement kind">
                  <select name="kind">
                    <option>Refund</option>
                    <option>Allocation</option>
                  </select>
                </Field3>
                <Field3 label="Target invoice / bill (allocation only)">
                  <select name="target">
                    <option value="">Select allocation target</option>
                    {docs
                      .filter(
                        (d) =>
                          d.partyId ===
                          s.documents.find((d) => d.id === r.documentId)
                            ?.partyId,
                      )
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.number}
                        </option>
                      ))}
                  </select>
                </Field3>
                <Field3 label="Settlement reference" name="reference" />
              </div>
              <label className="m-check">
                <input type="checkbox" required />I confirm the local record
                reflects the actual demo refund or credit allocation
              </label>
              <button>Record return settlement</button>
            </form>
          )}
          {r.creditBalance > 0 && (
            <form
              className="m-form"
              onSubmit={(e) => {
                const f = form3(e);
                void commit("Expected refund date saved", (s, c) => {
                  authorize(s, c, "post");
                  const x = s.returns.find((x) => x.id === r.id)!;
                  x.expectedDate = str3(f, "date");
                  audit(s, c, "Documented refund commitment", x.id, null, {
                    expectedDate: x.expectedDate,
                    evidence: str3(f, "evidence"),
                  });
                });
              }}
            >
              <h3>Optional documented refund commitment</h3>
              <p>
                Only Refund preferences with an expected date enter the
                forecast. Credit balances alone are not cash.
              </p>
              <Field3
                label="Expected refund date"
                name="date"
                type="date"
                value={r.expectedDate || today()}
              />
              <Field3 label="Commitment evidence" name="evidence" />
              <button>Save expected refund date</button>
            </form>
          )}
          <form
            className="m-form"
            onSubmit={(e) => {
              const f = form3(e);
              void commit("Return reversed", (s, c) =>
                ops.reverseReturn(s, c, r.id, str3(f, "reason")),
              );
            }}
          >
            <Field3 label="Return reversal reason" name="reason" />
            <label className="m-check">
              <input type="checkbox" required />I reviewed stock and settlements
              before reversing
            </label>
            <button>Reverse return with evidence</button>
          </form>
          <Table3
            heads={["Settlement", "Amount / date", "Reference", "Correction"]}
          >
            {s.returnSettlements
              .filter((p) => p.returnId === r.id)
              .map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.kind} {p.reversed ? "· Reversed" : ""}
                  </td>
                  <td>
                    {rupees(p.amount)} · {p.date}
                  </td>
                  <td>{p.reference}</td>
                  <td>
                    {!p.reversed && (
                      <Confirm3
                        text="Reverse settlement"
                        onConfirm={() =>
                          void commit("Settlement reversed", (s, c) =>
                            ops.reverseSettlement(
                              s,
                              c,
                              p.id,
                              "Confirmed correction of local settlement",
                            ),
                          )
                        }
                      />
                    )}
                  </td>
                </tr>
              ))}
          </Table3>
          <details>
            <summary>Return stock, journals & audit chain</summary>
            <pre>
              {JSON.stringify(
                {
                  return: r,
                  movements: s.movements.filter((m) => m.sourceId === r.id),
                  journals: s.journals.filter((j) =>
                    r.journalIds.includes(j.id),
                  ),
                  audit: s.audit.filter((a) => a.sourceId === r.id),
                },
                null,
                2,
              )}
            </pre>
          </details>
          <Link to="/business/reports">Reconcile in Reports & Audit →</Link>
        </Panel3>
      )}
      {preview && <Preview3 doc={preview} close={() => setPreview(null)} />}
    </>
  );
}
