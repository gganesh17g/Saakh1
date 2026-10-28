import { useState } from "react";
import { Link } from "react-router-dom";
import { paise, rupees, today, authorize, audit, permissions } from "./model";
import { type Employee, type Salary } from "./operationsModel";
import * as ops from "./operations3";
import { payslipDocument, type Printable } from "./documents3";
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
const salaryKeys = [
  "basic",
  "hra",
  "allowance",
  "incentive",
  "performance",
  "bonus",
  "arrears",
  "reimbursement",
  "overtimeRate",
  "withholding",
  "professionalTax",
  "miscellaneous",
] as const;
const labels: Record<string, string> = {
  basic: "Basic salary",
  hra: "House rent allowance",
  allowance: "Other allowances",
  incentive: "Fixed incentive",
  performance: "Performance incentive",
  bonus: "Fixed bonus",
  arrears: "Arrears",
  reimbursement: "Reimbursements (separate)",
  overtimeRate: "Overtime per hour",
  withholding: "Income-tax withholding (entered)",
  professionalTax: "Professional tax (entered)",
  miscellaneous: "Authorized deductions",
};
export default function Payroll3() {
  const { s, c, commit } = useOps();
  const [period, setPeriod] = useState(today().slice(0, 7)),
    [employeeId, setEmployee] = useState("All"),
    [department, setDepartment] = useState("All"),
    [paymentStatus, setPaymentStatus] = useState("All"),
    [query, setQuery] = useState(""),
    [editing, setEditing] = useState<Employee | null | undefined>(),
    [runId, setRun] = useState(""),
    [preview, setPreview] = useState<Printable | null>(null);
  if (
    !permissions[c.role].some(
      (p) => p === "payroll" || p === "payrollRead" || p === "attendance",
    )
  )
    return (
      <Panel3 title="Payroll access restricted">
        <p>
          This demo identity cannot inspect employee pay. Owner, payroll
          administrator, accountant or authorized auditor views are required.
          Browser role controls are simulated, not secure authorization.
        </p>
      </Panel3>
    );
  const canPay = permissions[c.role].includes("payroll"),
    manager = c.role === "manager";
  const employees = s.employees.filter((e) => e.businessId === c.businessId);
  const runs = s.payrollRuns.filter(
    (r) => r.businessId === c.businessId && r.period === period,
  );
  const r = runs.find((r) => r.id === runId) || runs.at(-1);
  const dashboard = ops.payrollDashboard(
    s,
    c,
    r?.id || "",
    employeeId,
    department,
    paymentStatus,
  );
  const filtered = dashboard.lines;
  const due = dashboard.due;
  return (
    <>
      <Panel3 title="Payroll · people, obligations and payments">
        <p>
          Monthly, synthetic payroll only. Rates and withholding are entered
          assumptions, not a statutory eligibility or tax determination. Payment
          records never initiate bank transfers.
        </p>
        <div className="m-toolbar">
          <Field3 label="Payroll period">
            <input
              type="month"
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setRun("");
              }}
            />
          </Field3>
          <Field3 label="Employee filter">
            <select
              value={employeeId}
              onChange={(e) => setEmployee(e.target.value)}
            >
              <option>All</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field3>
          <Field3 label="Department filter">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              {["All", ...new Set(employees.map((e) => e.department))].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </Field3>
          <Field3 label="Payroll payment status">
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option>All</option>
              <option>Paid</option>
              <option>Outstanding</option>
            </select>
          </Field3>
        </div>
        {!manager && (
          <div className="m-metrics">
            {[
              ["Employees", dashboard.employees],
              ["Active employees", dashboard.active],
              ["Gross payroll", rupees(dashboard.gross)],
              ["Deductions", rupees(dashboard.deductions)],
              ["Net salary", rupees(dashboard.net)],
              ["Employer cost", rupees(dashboard.cost)],
              ["Recorded paid", rupees(dashboard.paid)],
              ["Salary payable", rupees(due)],
            ].map(([label, v]) => (
              <button
                className="m-metric"
                type="button"
                onClick={() =>
                  document
                    .getElementById("payroll-register")
                    ?.scrollIntoView({ block: "start" })
                }
                key={label}
              >
                <span>{label}</span>
                <strong>{v}</strong>
              </button>
            ))}
          </div>
        )}
        <p>
          Upcoming selected payment date:{" "}
          {r?.paymentDate || "Create a payroll run"}. Incomplete attendance:{" "}
          {
            employees.filter(
              (e) =>
                !e.archived &&
                !s.attendance.some(
                  (a) =>
                    a.employeeId === e.id && a.period === period && a.reviewed,
                ),
            ).length
          }{" "}
          records require review.
        </p>
      </Panel3>
      <Panel3 title="Employee directory">
        <div className="m-toolbar">
          <Field3 label="Search employees">
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </Field3>
          {canPay && (
            <button onClick={() => setEditing(null)}>New employee</button>
          )}
        </div>
        <Table3
          heads={[
            "Employee",
            "Department / designation",
            "Status",
            "Joining",
            "Actions",
          ]}
        >
          {employees
            .filter((e) =>
              `${e.name} ${e.id} ${e.department}`
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((e) => (
              <tr key={e.id}>
                <td>
                  {e.name}
                  <small>{e.id}</small>
                </td>
                <td>
                  {e.department} / {e.title}
                </td>
                <td>{e.archived ? "Archived" : "Active"}</td>
                <td>{e.joined}</td>
                <td>
                  {canPay && (
                    <>
                      <button onClick={() => setEditing(e)}>
                        Edit employee / salary version
                      </button>
                      <Confirm3
                        text={
                          e.archived ? "Restore employee" : "Archive employee"
                        }
                        onConfirm={() =>
                          void commit("Employee archive updated", (s, c) => {
                            authorize(s, c, "payroll");
                            const x = s.employees.find((x) => x.id === e.id)!;
                            x.archived = !x.archived;
                            audit(
                              s,
                              c,
                              "Employee archive status changed",
                              x.id,
                              null,
                              { archived: x.archived },
                            );
                          })
                        }
                      />
                    </>
                  )}
                </td>
              </tr>
            ))}
        </Table3>
        {!employees.length && (
          <p>
            No employees. Register a fictional employee or load the operations
            examples from Business Pulse.
          </p>
        )}
      </Panel3>
      {canPay && editing !== undefined && (
        <Panel3 title="Employee and effective salary structure">
          <form
            className="m-form"
            key={editing?.id || "new"}
            onSubmit={async (e) => {
              const f = form3(e);
              const salary = {
                effective: str3(f, "effective"),
                ...Object.fromEntries(
                  salaryKeys.map((k) => [k, paise(num3(f, k))]),
                ),
              } as Salary;
              if (
                await commit("Employee saved", (s, c) =>
                  ops.saveEmployee(
                    s,
                    c,
                    {
                      name: str3(f, "name"),
                      department: str3(f, "department"),
                      title: str3(f, "title"),
                      employment: str3(f, "employment"),
                      joined: str3(f, "joined"),
                      location: str3(f, "location"),
                      method: str3(f, "method"),
                      reference: str3(f, "reference"),
                      leaveEntitlement: num3(f, "leave"),
                      notes: str3(f, "notes"),
                      pf: f.has("pf"),
                      esi: f.has("esi"),
                    },
                    salary,
                    editing?.id,
                  ),
                )
              )
                setEditing(undefined);
            }}
          >
            <p>
              History is never replaced. For a salary change choose a new
              effective date; mid-month changes require a reviewed split-period
              process and are blocked here.
            </p>
            <div className="m-two">
              {[
                ["Employee name", "name", editing?.name || ""],
                [
                  "Department",
                  "department",
                  editing?.department || "Operations",
                ],
                ["Designation", "title", editing?.title || "Associate"],
                [
                  "Employment type",
                  "employment",
                  editing?.employment || "Full-time",
                ],
                ["Work location", "location", editing?.location || "Pune"],
                [
                  "Payment method",
                  "method",
                  editing?.method || "Bank (local record)",
                ],
                [
                  "Optional payment reference",
                  "reference",
                  editing?.reference || "",
                ],
                ["Internal notes", "notes", editing?.notes || ""],
              ].map(([l, n, v]) => (
                <Field3
                  key={n}
                  label={l}
                  name={n}
                  value={v}
                  required={!["reference", "notes"].includes(n)}
                />
              ))}
              <Field3
                label="Joining date"
                name="joined"
                type="date"
                value={editing?.joined || period + "-01"}
              />
              <Field3
                label="Leave entitlement (days)"
                name="leave"
                type="number"
                min={0}
                value={editing?.leaveEntitlement || 18}
              />
              <Field3
                label="Salary effective date"
                name="effective"
                type="date"
                value={editing?.salaries.at(-1)?.effective || period + "-01"}
              />
              {salaryKeys.map((k) => (
                <Money3
                  key={k}
                  label={labels[k] + " (₹)"}
                  name={k}
                  value={editing?.salaries.at(-1)?.[k] || 0}
                />
              ))}
            </div>
            <label className="m-check">
              <input type="checkbox" name="pf" defaultChecked={editing?.pf} />
              Apply configured EPF assumption
            </label>
            <label className="m-check">
              <input type="checkbox" name="esi" defaultChecked={editing?.esi} />
              Apply configured ESI assumption
            </label>
            <button>Save employee and salary version</button>
            <button type="button" onClick={() => setEditing(undefined)}>
              Cancel employee edit
            </button>
          </form>
        </Panel3>
      )}
      {(canPay || manager) && (
        <Panel3 title="Attendance and manager review">
          <form
            className="m-form"
            onSubmit={(e) => {
              const f = form3(e);
              void commit("Attendance saved", (s, c) =>
                ops.saveAttendance(s, c, {
                  employeeId: str3(f, "employee"),
                  period,
                  working: num3(f, "working"),
                  present: num3(f, "present"),
                  paidLeave: num3(f, "paidLeave"),
                  unpaid: num3(f, "unpaid"),
                  overtime: num3(f, "overtime"),
                  bonus: canPay
                    ? paise(num3(f, "bonus"))
                    : s.attendance.find(
                        (a) =>
                          a.employeeId === str3(f, "employee") &&
                          a.period === period,
                      )?.bonus || 0,
                  advance: canPay
                    ? paise(num3(f, "advance"))
                    : s.attendance.find(
                        (a) =>
                          a.employeeId === str3(f, "employee") &&
                          a.period === period,
                      )?.advance || 0,
                  reviewed: f.has("reviewed"),
                  notes: str3(f, "notes"),
                }),
              );
            }}
          >
            <Field3 label="Attendance employee">
              <select name="employee" required>
                {employees
                  .filter((e) => !e.archived)
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
              </select>
            </Field3>
            <div className="m-two">
              {[
                ["Working days", "working", 26],
                ["Present days", "present", 26],
                ["Paid leave", "paidLeave", 0],
                ["Unpaid leave", "unpaid", 0],
                ["Overtime hours", "overtime", 0],
              ].map(([l, n, v]) => (
                <Field3
                  key={String(n)}
                  label={String(l)}
                  name={String(n)}
                  type="number"
                  min={0}
                  value={Number(v)}
                />
              ))}
              {canPay && (
                <>
                  <Money3 label="Period bonus (₹)" name="bonus" />
                  <Money3
                    label="Recorded advance recovery (₹)"
                    name="advance"
                  />
                </>
              )}
              <Field3
                label="Attendance adjustment notes"
                name="notes"
                required={false}
              />
            </div>
            <label className="m-check">
              <input type="checkbox" name="reviewed" />
              Manager reviewed attendance and leave
            </label>
            <button>Save reviewed attendance</button>
          </form>
          <Table3
            heads={["Employee", "Month", "Present / paid / unpaid", "Reviewed"]}
          >
            {s.attendance
              .filter(
                (a) => a.businessId === c.businessId && a.period === period,
              )
              .map((a) => (
                <tr key={a.id}>
                  <td>{employees.find((e) => e.id === a.employeeId)?.name}</td>
                  <td>{a.period}</td>
                  <td>
                    {a.present} / {a.paidLeave} / {a.unpaid}
                  </td>
                  <td>{a.reviewed ? "Yes" : "No"}</td>
                </tr>
              ))}
          </Table3>
        </Panel3>
      )}
      {canPay && (
        <Panel3 title="Effective-dated contribution assumptions">
          <details>
            <summary>Configure a new illustrative rule</summary>
            <p>
              Basis: EPF on prorated basic capped if configured; ESI on gross
              below the configured ceiling. No automatic legal eligibility, EPS
              split, cess or tax slab calculation. Keep source/date with each
              version. Zero defaults do not assert exemption.
            </p>
            <form
              className="m-form"
              onSubmit={(e) => {
                const f = form3(e);
                void commit("Payroll assumption saved", (s, c) =>
                  ops.savePayrollRule(s, c, {
                    effective: str3(f, "effective"),
                    label: str3(f, "label"),
                    source: str3(f, "source"),
                    pfEmployeeBps: Math.round(num3(f, "pfEmployeeBps") * 100),
                    pfEmployerBps: Math.round(num3(f, "pfEmployerBps") * 100),
                    pfCap: paise(num3(f, "pfCap")),
                    esiEmployeeBps: Math.round(num3(f, "esiEmployeeBps") * 100),
                    esiEmployerBps: Math.round(num3(f, "esiEmployerBps") * 100),
                    esiCeiling: paise(num3(f, "esiCeiling")),
                  }),
                );
              }}
            >
              <div className="m-two">
                <Field3
                  label="Rule effective date"
                  type="date"
                  name="effective"
                  value={period + "-01"}
                />
                <Field3
                  label="Rule label"
                  name="label"
                  value="Reviewed demo assumptions"
                />
                <Field3
                  label="Rule source / applicability note"
                  name="source"
                  value="Administrator-entered illustrative assumptions; not verified statutory applicability"
                />
                {[
                  "pfEmployeeBps",
                  "pfEmployerBps",
                  "esiEmployeeBps",
                  "esiEmployerBps",
                ].map((k) => (
                  <Field3
                    key={k}
                    label={k + " (%)"}
                    name={k}
                    type="number"
                    min={0}
                    step="0.01"
                    value={0}
                  />
                ))}
                <Money3
                  label="EPF wage cap (₹, zero = uncapped)"
                  name="pfCap"
                />
                <Money3
                  label="ESI eligibility ceiling (₹, zero = no ceiling)"
                  name="esiCeiling"
                />
              </div>
              <button>Save new rule version</button>
            </form>
          </details>
          <Table3 heads={["Rule", "Effective", "Source"]}>
            {s.payrollRules
              .filter((r) => r.businessId === c.businessId)
              .map((r) => (
                <tr key={r.id}>
                  <td>{r.label}</td>
                  <td>{r.effective}</td>
                  <td>{r.source}</td>
                </tr>
              ))}
          </Table3>
        </Panel3>
      )}
      {!manager && (
        <>
          <Panel3 title="Monthly payroll processing">
            <p>
              Draft → reviewed calculation → approval → confirmed finalization →
              separately recorded payments. Finalization records
              expense/liability; salary payments only settle liability.
            </p>
            {canPay && (
              <form
                className="m-form"
                onSubmit={(e) => {
                  const f = form3(e);
                  void commit("Payroll draft created", (s, c) => {
                    setRun(ops.createPayroll(s, c, period, str3(f, "date")).id);
                  });
                }}
              >
                <Field3
                  label="Scheduled salary payment date"
                  name="date"
                  type="date"
                  value={today()}
                />
                <button>Create payroll draft</button>
              </form>
            )}
            <Field3 label="Select payroll run">
              <select
                value={r?.id || ""}
                onChange={(e) => setRun(e.target.value)}
              >
                <option value="">Select run</option>
                {runs.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} · {r.status}
                  </option>
                ))}
              </select>
            </Field3>
            {r && (
              <>
                <h3>
                  {r.id} · {r.status}
                </h3>
                <div className="m-toolbar">
                  {canPay && (
                    <>
                      <button
                        onClick={() =>
                          void commit("Payroll calculated", (s, c) =>
                            ops.calculatePayroll(s, c, r.id),
                          )
                        }
                      >
                        Calculate payroll
                      </button>
                      <button
                        onClick={() =>
                          void commit("Payroll approved", (s, c) =>
                            ops.approvePayroll(s, c, r.id),
                          )
                        }
                      >
                        Approve payroll
                      </button>
                      <Confirm3
                        text="Finalize payroll"
                        onConfirm={() =>
                          void commit("Payroll finalized", (s, c) =>
                            ops.finalizePayroll(s, c, r.id, true),
                          )
                        }
                      />
                      {["Finalized", "Partially Paid"].includes(r.status) && (
                        <Confirm3
                          text="Record all outstanding salaries"
                          onConfirm={() =>
                            void commit(
                              "Batch salary payments recorded",
                              (s, c) => {
                                const run = s.payrollRuns.find(
                                  (x) => x.id === r.id,
                                )!;
                                for (const l of run.lines) {
                                  const v = ops.payrollOutstanding(
                                    s,
                                    r.id,
                                    l.employeeId,
                                  );
                                  if (v)
                                    ops.paySalary(
                                      s,
                                      c,
                                      r.id,
                                      l.employeeId,
                                      v,
                                      today(),
                                      "BATCH-" + r.id,
                                    );
                                }
                              },
                            )
                          }
                        />
                      )}
                    </>
                  )}
                  <button
                    onClick={() =>
                      csv3(
                        "payroll-register",
                        [
                          "run",
                          "employee",
                          "department",
                          "gross_paise",
                          "deductions_paise",
                          "net_paise",
                          "employer_cost_paise",
                          "outstanding_paise",
                        ],
                        filtered.map((l) => [
                          r.id,
                          l.name,
                          l.department,
                          l.gross,
                          l.deduction,
                          l.net,
                          l.cost,
                          ops.payrollOutstanding(s, r.id, l.employeeId),
                        ]),
                      )
                    }
                  >
                    Export payroll CSV
                  </button>
                </div>
                <div id="payroll-register">
                  <Table3
                    heads={[
                      "Employee",
                      "Gross",
                      "Deductions",
                      "Net / employer cost",
                      "Outstanding",
                      "Payslip",
                    ]}
                  >
                    {filtered.map((l) => (
                      <tr key={l.employeeId}>
                        <td>
                          {l.name}
                          <small>{l.department}</small>
                        </td>
                        <td>{rupees(l.gross)}</td>
                        <td>{rupees(l.deduction)}</td>
                        <td>
                          {rupees(l.net)} / {rupees(l.cost)}
                        </td>
                        <td>
                          {rupees(
                            ops.payrollOutstanding(s, r.id, l.employeeId),
                          )}
                        </td>
                        <td>
                          {r.journalId && r.status !== "Reversed" && (
                            <button
                              onClick={() =>
                                setPreview(
                                  payslipDocument(s, c, r.id, l.employeeId),
                                )
                              }
                            >
                              Preview payslip
                            </button>
                          )}
                          <details>
                            <summary>Calculation breakdown</summary>
                            <pre>{JSON.stringify(l, null, 2)}</pre>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </Table3>
                </div>
                {canPay && (
                  <>
                    <form
                      className="m-form"
                      onSubmit={(e) => {
                        const f = form3(e);
                        void commit("Salary payment recorded locally", (s, c) =>
                          ops.paySalary(
                            s,
                            c,
                            r.id,
                            str3(f, "employee"),
                            paise(num3(f, "amount")),
                            str3(f, "date"),
                            str3(f, "reference"),
                            str3(f, "method") as "cash" | "bank",
                          ),
                        );
                      }}
                    >
                      <h3>Record individual / partial salary payment</h3>
                      <Field3 label="Salary payment employee">
                        <select name="employee">
                          {r.lines.map((l) => (
                            <option key={l.employeeId} value={l.employeeId}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                      </Field3>
                      <Money3 label="Salary payment amount (₹)" name="amount" />
                      <Field3
                        label="Salary payment date"
                        type="date"
                        name="date"
                        value={today()}
                      />
                      <Field3
                        label="Salary payment reference"
                        name="reference"
                      />
                      <Field3 label="Salary payment method">
                        <select name="method">
                          <option>bank</option>
                          <option>cash</option>
                        </select>
                      </Field3>
                      <label className="m-check">
                        <input type="checkbox" required />I confirm payment
                        occurred in this synthetic example; no bank transfer
                        will be sent
                      </label>
                      <button>Record salary payment</button>
                    </form>
                    <form
                      className="m-form"
                      onSubmit={(e) => {
                        const f = form3(e);
                        void commit("Payroll reversed", (s, c) =>
                          ops.reversePayroll(s, c, r.id, str3(f, "reason")),
                        );
                      }}
                    >
                      <Field3 label="Payroll reversal reason" name="reason" />
                      <label className="m-check">
                        <input type="checkbox" required />
                        Reverse finalized payroll only after reversing its
                        payments
                      </label>
                      <button>Reverse payroll with reason</button>
                    </form>
                  </>
                )}
                <details>
                  <summary>Payroll journal and audit evidence</summary>
                  <pre>
                    {JSON.stringify(
                      {
                        journal: s.journals.find((j) => j.id === r.journalId),
                        audit: s.audit.filter((a) => a.sourceId === r.id),
                      },
                      null,
                      2,
                    )}
                  </pre>
                </details>
              </>
            )}
          </Panel3>
          <Panel3 title="Payroll payments, advances and remittances">
            <Table3
              heads={[
                "Date / event",
                "Employee / source",
                "Amount",
                "Reference / method",
                "Correction",
              ]}
            >
              {s.salaryPayments
                .filter((p) => p.businessId === c.businessId)
                .map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.date} · {p.kind}
                      {p.reversed ? " · Reversed" : ""}
                    </td>
                    <td>
                      {employees.find((e) => e.id === p.employeeId)?.name ||
                        p.kind}
                      <small>
                        {p.id} / {p.runId}
                      </small>
                    </td>
                    <td>{rupees(p.amount)}</td>
                    <td>
                      {p.reference} · {p.method}
                    </td>
                    <td>
                      {canPay && !p.reversed && p.kind === "salary" && (
                        <Confirm3
                          text="Reverse salary payment"
                          onConfirm={() =>
                            void commit("Salary payment reversed", (s, c) =>
                              ops.reverseSalaryPayment(
                                s,
                                c,
                                p.id,
                                "Reviewed failed or incorrect payment record",
                              ),
                            )
                          }
                        />
                      )}
                    </td>
                  </tr>
                ))}
            </Table3>
            {canPay && (
              <form
                className="m-form"
                onSubmit={(e) => {
                  const f = form3(e);
                  void commit("Payroll cash event recorded", (s, c) =>
                    ops.payrollCashEvent(
                      s,
                      c,
                      str3(f, "employee"),
                      paise(num3(f, "amount")),
                      str3(f, "date"),
                      str3(f, "reference"),
                      str3(f, "kind") === "advance" ? "advance" : "remittance",
                      str3(f, "kind") === "employer",
                    ),
                  );
                }}
              >
                <h3>Record an advance or liability remittance</h3>
                <Field3 label="Payroll cash event">
                  <select name="kind">
                    <option value="advance">Employee advance</option>
                    <option value="deduction">
                      Employee deductions remittance
                    </option>
                    <option value="employer">
                      Employer contributions remittance
                    </option>
                  </select>
                </Field3>
                <Field3 label="Advance employee">
                  <select name="employee">
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                </Field3>
                <Money3 label="Payroll cash event amount (₹)" name="amount" />
                <Field3
                  label="Payroll cash event date"
                  name="date"
                  type="date"
                  value={today()}
                />
                <Field3 label="Payroll cash event reference" name="reference" />
                <label className="m-check">
                  <input type="checkbox" required />I confirm the actual
                  synthetic payment; no statutory remittance is initiated
                </label>
                <button>Record payroll cash event</button>
              </form>
            )}
          </Panel3>
          <Panel3 title="Payroll expense trends & department costs">
            <Table3
              heads={[
                "Period",
                "Department",
                "Gross / employer cost",
                "Deductions / net",
              ]}
            >
              {dashboard.trends.map((v) => (
                <tr key={v.period + v.department}>
                  <td>{v.period}</td>
                  <td>
                    {v.department} · {v.employees} employees
                  </td>
                  <td>
                    {rupees(v.gross)} / {rupees(v.cost)}
                  </td>
                  <td>
                    {rupees(v.deductions)} / {rupees(v.net)}
                  </td>
                </tr>
              ))}
            </Table3>
            <Link to="/business/passbook">Inspect cash movements →</Link> ·{" "}
            <Link to="/business/reports">Reconcile general ledger →</Link>
          </Panel3>
        </>
      )}
      {preview && <Preview3 doc={preview} close={() => setPreview(null)} />}
    </>
  );
}
