import { useState } from "react";
import { Link } from "react-router-dom";
import { permissions, rupees } from "./model";
import {
  operationsMetrics,
  payrollOutstanding,
  customerSummary,
} from "./operations3";
import { seedOperationsExamples } from "./fixtures3";
import { balances, due, totals, quantity } from "./accounting";
import { type Printable } from "./documents3";
import {
  useOps,
  Panel3,
  Field3,
  Table3,
  Confirm3,
  Preview3,
  csv3,
} from "./UI3";
export function OperationsPulse3() {
  const { s, c, commit } = useOps();
  const v = operationsMetrics(s, c);
  return (
    <Panel3 title="Operations at a glance">
      <div className="m-metrics">
        <Link to="/business/payroll" className="m-metric">
          <span>Finalized salaries awaiting payment</span>
          <strong>
            {permissions[c.role].some(
              (p) => p === "payroll" || p === "payrollRead",
            )
              ? rupees(v.salaryDue)
              : "Restricted"}
          </strong>
        </Link>
        <Link to="/business/sales-returns" className="m-metric">
          <span>Sales returns pending</span>
          <strong>{v.salesPending}</strong>
        </Link>
        <Link to="/business/purchase-returns" className="m-metric">
          <span>Purchase returns pending</span>
          <strong>{v.purchasesPending}</strong>
        </Link>
        <Link to="/business/customers" className="m-metric">
          <span>Customer credits</span>
          <strong>{rupees(v.customerCredits)}</strong>
        </Link>
        <Link to="/business/purchase-returns" className="m-metric">
          <span>Supplier credits / refund receivables</span>
          <strong>{rupees(v.supplierCredits)}</strong>
        </Link>
      </div>
      <p>
        Existing local records are preserved. Load a connected synthetic example
        to explore payroll, repeat sales, credits and supplier refund
        commitments.
      </p>
      {permissions[c.role].includes("payroll") && (
        <Confirm3
          text="Load operations examples"
          onConfirm={() =>
            void commit("Operations examples loaded", seedOperationsExamples)
          }
        />
      )}
      <Link to="/business/customers">Review customer balances →</Link>
    </Panel3>
  );
}
export function OperationsReports3() {
  const { s, c } = useOps();
  const [search, setSearch] = useState(""),
    [type, setType] = useState("All"),
    [preview, setPreview] = useState<Printable | null>(null);
  const payrollAllowed = permissions[c.role].some(
    (p) => p === "payroll" || p === "payrollRead",
  );
  const reportAllowed = permissions[c.role].includes("export");
  const payroll = s.payrollRuns.filter(
    (r) =>
      r.businessId === c.businessId && r.journalId && r.status !== "Reversed",
  );
  const b = balances(s, c.businessId);
  const salaries = payroll.flatMap((r) =>
    r.lines.map((l) => ({
      run: r,
      employee: l,
      outstanding: payrollOutstanding(s, r.id, l.employeeId),
    })),
  );
  const rows: [string, string][] = [
    [
      "Salary payable (ledger)",
      payrollAllowed ? rupees(-b.salaryPayable) : "Restricted",
    ],
    [
      "Employee deduction liability",
      payrollAllowed ? rupees(-b.deductionPayable) : "Restricted",
    ],
    [
      "Employer contribution liability",
      payrollAllowed ? rupees(-b.employerPayable) : "Restricted",
    ],
    ["Customer credit liabilities", rupees(-b.customerCredit)],
    ["Supplier credits / refund receivable", rupees(b.supplierCredit)],
    ["Purchase goods dispatched awaiting credit", rupees(b.returnsPending)],
    ["Quarantined inventory value", rupees(b.quarantineInventory)],
  ];
  const activity = s.audit
    .filter(
      (a) =>
        a.businessId === c.businessId &&
        (payrollAllowed ||
          !/employee|salary|payroll|attendance/i.test(a.action)) &&
        (type === "All" || a.action.toLowerCase().includes(type)) &&
        `${a.sourceId} ${a.action} ${a.actor}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .slice()
    .reverse();
  return (
    <>
      <Panel3 title="Operations reconciliation & reports">
        <Table3 heads={["Source-linked account", "Balance"]}>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td>{k}</td>
              <td>{v}</td>
            </tr>
          ))}
        </Table3>
        <div className="m-toolbar">
          {reportAllowed && (
            <>
              <button
                onClick={() =>
                  setPreview({
                    title: "Operations reconciliation",
                    subtitle:
                      "INR · integer-paise posting rules · synthetic local records",
                    rows,
                  })
                }
              >
                Preview operations report
              </button>
              <button
                onClick={() =>
                  csv3(
                    "operations-reconciliation",
                    ["account", "balance"],
                    rows,
                  )
                }
              >
                Export operations CSV
              </button>
              <button
                onClick={() =>
                  csv3(
                    "net-sales-purchases",
                    [
                      "document",
                      "kind",
                      "party",
                      "gross_paise",
                      "return_credits_paise",
                      "net_paise",
                      "due_paise",
                    ],
                    s.documents
                      .filter(
                        (d) =>
                          d.businessId === c.businessId &&
                          d.status === "Posted",
                      )
                      .map((d) => {
                        const returns = s.credits
                          .filter(
                            (x) =>
                              x.documentId === d.id &&
                              s.journals.some(
                                (j) =>
                                  j.id === x.journalId &&
                                  (j.kind === "creditNote" ||
                                    j.kind.startsWith("returnCredit")),
                              ),
                          )
                          .reduce((a, x) => a + x.amount, 0);
                        return [
                          d.number,
                          d.kind,
                          s.parties.find((p) => p.id === d.partyId)?.name || "",
                          totals(d.lines).total,
                          returns,
                          totals(d.lines).total - returns,
                          due(s, d),
                        ];
                      }),
                  )
                }
              >
                Export sales & purchases CSV
              </button>
              <button
                onClick={() =>
                  csv3(
                    "product-movements",
                    [
                      "source",
                      "item",
                      "date",
                      "quantity",
                      "unit_cost_paise",
                      "kind",
                    ],
                    s.movements
                      .filter((m) => m.businessId === c.businessId)
                      .map((m) => [
                        m.sourceId,
                        m.itemId,
                        m.date,
                        m.quantity,
                        m.cost,
                        m.kind,
                      ]),
                  )
                }
              >
                Export inventory CSV
              </button>
              {payrollAllowed && (
                <button
                  onClick={() =>
                    csv3(
                      "payroll-reconciliation",
                      [
                        "run",
                        "period",
                        "employee",
                        "department",
                        "gross_paise",
                        "deductions_paise",
                        "net_paise",
                        "employer_cost_paise",
                        "outstanding_paise",
                      ],
                      salaries.map((x) => [
                        x.run.id,
                        x.run.period,
                        x.employee.name,
                        x.employee.department,
                        x.employee.gross,
                        x.employee.deduction,
                        x.employee.net,
                        x.employee.cost,
                        x.outstanding,
                      ]),
                    )
                  }
                >
                  Export employee payroll report
                </button>
              )}
            </>
          )}
        </div>
        <details>
          <summary>Counterparty and stock reconciliation</summary>
          <Table3 heads={["Record", "Source-derived amount"]}>
            {s.parties
              .filter(
                (p) => p.businessId === c.businessId && p.type !== "supplier",
              )
              .map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    {rupees(customerSummary(s, c, p.id).outstanding)} receivable
                    · {rupees(customerSummary(s, c, p.id).credits)} credit
                  </td>
                </tr>
              ))}
            {s.items
              .filter((i) => i.businessId === c.businessId)
              .map((i) => (
                <tr key={i.id}>
                  <td>{i.name}</td>
                  <td>{quantity(s, i.id)} available units</td>
                </tr>
              ))}
          </Table3>
        </details>
      </Panel3>
      <Panel3 title="Business activity timeline">
        <p>
          Source IDs join invoices, stock, journals, payroll, credits and
          settlements. This editable browser-local trail is not
          server-verifiable or immutable.
        </p>
        <div className="m-toolbar">
          <Field3 label="Search activity">
            <input value={search} onChange={(e) => setSearch(e.target.value)} />
          </Field3>
          <Field3 label="Activity type">
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="All">All</option>
              <option value="customer">Customer</option>
              <option value="sale">Sale</option>
              <option value="return">Return</option>
              {payrollAllowed && <option value="payroll">Payroll</option>}
              <option value="payment">Payment</option>
            </select>
          </Field3>
          {reportAllowed && (
            <button
              onClick={() =>
                csv3(
                  "activity-timeline",
                  ["id", "timestamp", "actor", "event", "source"],
                  activity.map((a) => [
                    a.id,
                    a.at,
                    a.actor,
                    a.action,
                    a.sourceId,
                  ]),
                )
              }
            >
              Export activity CSV
            </button>
          )}
        </div>
        <Table3
          heads={[
            "When / actor",
            "Event",
            "Source / related records",
            "Evidence",
          ]}
        >
          {activity.slice(0, 100).map((a) => (
            <tr key={a.id}>
              <td>
                {a.at}
                <small>{a.actor}</small>
              </td>
              <td>{a.action}</td>
              <td>
                <Link
                  to={
                    /payroll|salary|employee|attendance/i.test(a.action)
                      ? "/business/payroll"
                      : /return/i.test(a.action)
                        ? "/business/" +
                          (s.returns.some(
                            (r) => r.id === a.sourceId && r.kind === "purchase",
                          )
                            ? "purchase-returns"
                            : "sales-returns")
                        : /customer/i.test(a.action)
                          ? "/business/customers"
                          : "/business/sales"
                  }
                >
                  {a.sourceId}
                </Link>
              </td>
              <td>
                <details>
                  <summary>Inspect source event</summary>
                  <pre>
                    {JSON.stringify(
                      {
                        businessId: a.businessId,
                        before: a.before,
                        after: a.after,
                        relatedJournals: s.journals.filter(
                          (j) => j.sourceId === a.sourceId,
                        ),
                        relatedStock: s.movements.filter(
                          (m) => m.sourceId === a.sourceId,
                        ),
                      },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              </td>
            </tr>
          ))}
        </Table3>
      </Panel3>
      {preview && <Preview3 doc={preview} close={() => setPreview(null)} />}
    </>
  );
}
