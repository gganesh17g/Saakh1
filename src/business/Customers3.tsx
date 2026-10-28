import { totals, due } from "./accounting";
import { useState } from "react";
import { Link } from "react-router-dom";
import { type Party, paise, rupees, today } from "./model";
import * as ops from "./operations3";
import { statementDocument, type Printable } from "./documents3";
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
export default function Customers3() {
  const { s, c, commit } = useOps();
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("active"),
    [sort, setSort] = useState("name"),
    [edit, setEdit] = useState<Party | null | undefined>(),
    [selected, setSelected] = useState(""),
    [preview, setPreview] = useState<Printable | null>(null),
    [from, setFrom] = useState(
      s.businesses.find((b) => b.id === c.businessId)!.financialYear,
    ),
    [to, setTo] = useState(today());
  const customers = s.parties.filter(
    (p) => p.businessId === c.businessId && p.type !== "supplier",
  );
  const list = customers
    .filter(
      (p) =>
        (filter === "all" ||
          (filter === "archived" ? p.archived : !p.archived)) &&
        `${p.name} ${p.email || ""} ${p.phone || ""} ${p.category || ""}`
          .toLowerCase()
          .includes(search.toLowerCase()),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : ops.customerSummary(s, c, b.id).outstanding -
          ops.customerSummary(s, c, a.id).outstanding,
    );
  const person = customers.find((p) => p.id === selected);
  const summary = person ? ops.customerSummary(s, c, person.id) : null;
  return (
    <>
      <Panel3 title="Customers, context and credit">
        <p>
          Synthetic customer records only. Profiles share the existing buyer
          directory, invoices and ledger.
        </p>
        <div className="m-toolbar">
          <Field3 label="Search customers">
            <input value={search} onChange={(e) => setSearch(e.target.value)} />
          </Field3>
          <Field3 label="Customer status">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </Field3>
          <Field3 label="Sort customers">
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Name</option>
              <option value="due">Outstanding</option>
            </select>
          </Field3>
          <button onClick={() => setEdit(null)}>New customer</button>
        </div>
        <Table3
          heads={[
            "Customer",
            "Terms",
            "Sales / orders",
            "Outstanding / overdue",
            "Credit",
            "Actions",
          ]}
        >
          {list.map((p) => {
            const v = ops.customerSummary(s, c, p.id);
            return (
              <tr key={p.id}>
                <td>
                  {p.name}
                  <small>
                    {p.id} · {p.category || "Customer"}{" "}
                    {p.archived ? "· Archived" : ""}
                  </small>
                </td>
                <td>{p.termsDays} days</td>
                <td>
                  {rupees(v.sales)}
                  <small>
                    {v.orders} orders · average {rupees(v.average)}
                  </small>
                </td>
                <td>
                  {rupees(v.outstanding)}
                  <small>Overdue {rupees(v.overdue)}</small>
                </td>
                <td>{rupees(v.credits)}</td>
                <td>
                  <button onClick={() => setSelected(p.id)}>
                    Customer details
                  </button>
                  <button onClick={() => setEdit(p)}>Edit customer</button>
                  <Confirm3
                    text={p.archived ? "Restore customer" : "Archive customer"}
                    onConfirm={() =>
                      void commit("Customer status updated", (s, c) =>
                        ops.archiveCustomer(s, c, p.id),
                      )
                    }
                  />
                </td>
              </tr>
            );
          })}
        </Table3>
        {!list.length && <p>No matching customers.</p>}
      </Panel3>
      {edit !== undefined && (
        <Panel3 title={edit ? "Edit customer profile" : "Register a customer"}>
          <form
            className="m-form"
            key={edit?.id || "new"}
            onSubmit={async (e) => {
              const f = form3(e);
              if (
                await commit("Customer saved", (s, c) =>
                  ops.saveCustomer(
                    s,
                    c,
                    {
                      name: str3(f, "name"),
                      location: str3(f, "location"),
                      termsDays: num3(f, "terms"),
                      notes: str3(f, "notes"),
                      email: str3(f, "email"),
                      phone: str3(f, "phone"),
                      billing: str3(f, "billing"),
                      delivery: str3(f, "delivery"),
                      gstin: str3(f, "gstin"),
                      category: str3(f, "category"),
                      creditLimit: paise(num3(f, "limit")),
                    },
                    edit?.id,
                    f.has("duplicate"),
                  ),
                )
              )
                setEdit(undefined);
            }}
          >
            <div className="m-two">
              {[
                ["Customer name", "name", edit?.name],
                ["City / state", "location", edit?.location],
                ["Email", "email", edit?.email],
                ["Phone", "phone", edit?.phone],
                ["Billing address", "billing", edit?.billing],
                ["Delivery address", "delivery", edit?.delivery],
                ["GSTIN (optional, unverified)", "gstin", edit?.gstin],
                ["Category", "category", edit?.category || "Retail"],
              ].map(([label, name, value]) => (
                <Field3
                  key={name}
                  label={label!}
                  name={name}
                  value={value || ""}
                  required={
                    ![
                      "email",
                      "phone",
                      "billing",
                      "delivery",
                      "gstin",
                    ].includes(name!)
                  }
                />
              ))}
              <Field3
                label="Payment terms (days)"
                name="terms"
                type="number"
                min={0}
                value={edit?.termsDays || 30}
              />
              <Money3
                label="Credit limit (₹, zero = not enforced)"
                name="limit"
                value={edit?.creditLimit}
              />
            </div>
            <Field3
              label="Customer notes"
              name="notes"
              value={edit?.notes || ""}
              required={false}
            />
            <label className="m-check">
              <input type="checkbox" name="duplicate" />I reviewed potential
              duplicates and intend a separate profile
            </label>
            <button>Save customer</button>
            <button type="button" onClick={() => setEdit(undefined)}>
              Cancel customer edit
            </button>
          </form>
        </Panel3>
      )}
      {person && summary && (
        <Panel3 title={person.name + " · customer history"}>
          <p>
            Last sale {summary.last} ·{" "}
            {summary.orders > 1
              ? "Repeat customer"
              : "First / no recorded purchase"}{" "}
            · {summary.returns} returns. These are observed records, not
            predictions.
          </p>
          <p>
            {person.billing || person.location} ·{" "}
            {person.email || "No email recorded"} · {person.notes}
          </p>
          <Link to="/business/sales">Open invoices and record a sale →</Link>
          <Table3 heads={["Invoice", "Date", "Total", "Outstanding"]}>
            {s.documents
              .filter(
                (d) => d.partyId === person.id && d.businessId === c.businessId,
              )
              .map((d) => (
                <tr key={d.id}>
                  <td>{d.number}</td>
                  <td>{d.issueDate}</td>
                  <td>{rupees(totals(d.lines).total)}</td>
                  <td>{rupees(due(s, d))}</td>
                </tr>
              ))}
          </Table3>
          <div className="m-toolbar">
            <Field3 label="Statement from">
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </Field3>
            <Field3 label="Statement to">
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </Field3>
            <button
              onClick={() =>
                setPreview(statementDocument(s, c, person.id, from, to))
              }
            >
              Preview customer statement
            </button>
            <button
              onClick={() => {
                const v = ops.customerStatement(s, c, person.id, from, to);
                csv3(
                  "customer-statement",
                  ["date", "source", "event", "change_paise", "balance_paise"],
                  [
                    ["Opening", "", "", 0, v.opening],
                    ...v.rows.map((r) => [
                      r.date,
                      r.source,
                      r.event,
                      r.change,
                      r.balance,
                    ]),
                    ["Closing", "", "", 0, v.closing],
                  ],
                );
              }}
            >
              Export statement CSV
            </button>
          </div>
          <details>
            <summary>Linked payments, returns and activity</summary>
            <pre>
              {JSON.stringify(
                {
                  payments: s.payments.filter((p) =>
                    s.documents.some(
                      (d) => d.id === p.documentId && d.partyId === person.id,
                    ),
                  ),
                  returns: s.returns.filter((r) =>
                    s.documents.some(
                      (d) => d.id === r.documentId && d.partyId === person.id,
                    ),
                  ),
                  activity: s.audit.filter(
                    (a) =>
                      a.sourceId === person.id ||
                      s.documents.some(
                        (d) => d.id === a.sourceId && d.partyId === person.id,
                      ),
                  ),
                },
                null,
                2,
              )}
            </pre>
          </details>
        </Panel3>
      )}
      {preview && <Preview3 doc={preview} close={() => setPreview(null)} />}
    </>
  );
}
