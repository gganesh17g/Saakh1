import { test, expect, type Page } from "@playwright/test";
async function chooseRole4(page: Page, role: string) {
  const prior = page.url();
  await page.locator(".w4-account summary").click();
  await page
    .getByRole("link", { name: "Switch Demo Role", exact: true })
    .click();
  const names: Record<string, string> = {
    owner: "Business Owner",
    staff: "Staff",
    accountant: "Accountant",
    admin: "Administrator",
    payroll: "Payroll Manager",
    manager: "Operations Manager",
    auditor: "Auditor",
  };
  await page
    .getByRole("group", { name: "Choose demo role" })
    .getByRole("button")
    .filter({ hasText: names[role] })
    .click();
  await expect(page.locator(".m-asof")).toContainText(role + " demo view");
  await page.goto(prior);
}
import { readFile } from "node:fs/promises";
function watch(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("requestfailed", (r) => errors.push(r.url()));
  return errors;
}
const go = (page: Page, route = "") =>
  page.goto("./#/business" + (route ? "/" + route : ""));
async function confirm(page: Page, text: string) {
  await page.getByRole("button", { name: text, exact: true }).click();
  await page
    .getByRole("dialog", { name: text, exact: true })
    .getByRole("button", { name: "Confirm " + text.toLowerCase(), exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
async function exportBusiness(page: Page) {
  await go(page, "reports");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export business JSON", exact: true })
    .click();
  const dl = await pending;
  return JSON.parse(await readFile((await dl.path())!, "utf8"));
}
async function pdf(page: Page, contains: string) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download PDF", exact: true }).click();
  const dl = await pending;
  const bytes = await readFile((await dl.path())!);
  expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
  expect(bytes.toString("latin1")).toContain(contains);
  expect(bytes.length).toBeGreaterThan(3000);
}
async function createCustomer(page: Page) {
  await go(page, "customers");
  await page.getByRole("button", { name: "New customer", exact: true }).click();
  await page
    .getByLabel("Customer name", { exact: true })
    .fill("Browser Synthetic Buyer");
  await page.getByLabel("City / state", { exact: true }).fill("Pune");
  await page
    .getByRole("button", { name: "Save customer", exact: true })
    .click();
  await expect(
    page.getByText("Customer saved · saved locally", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Search customers").fill("Browser Synthetic Buyer");
  const row = page
    .getByRole("row")
    .filter({ hasText: "Browser Synthetic Buyer" });
  await expect(row).toHaveCount(1);
  return row;
}
async function createSale(page: Page, customer: string, stock = false) {
  await go(page, "sales");
  await page.getByRole("button", { name: "New invoice", exact: true }).click();
  await page
    .getByLabel("Counterparty", { exact: true })
    .selectOption({ label: customer });
  if (stock) {
    await page
      .getByLabel("Product (optional for non-stock)")
      .selectOption("SKU-001");
    await page.getByLabel("Quantity", { exact: true }).fill("4");
  } else
    await page
      .getByLabel("Description", { exact: true })
      .fill("Synthetic service");
  await page.getByLabel("Unit price (₹)", { exact: true }).fill("10");
  await page.getByLabel("Save mode").selectOption("post");
  await page.getByLabel("I reviewed party").check();
  await page
    .getByRole("button", { name: "Save document", exact: true })
    .click();
  await expect(
    page.getByText("Document saved · saved locally", { exact: true }),
  ).toBeVisible();
  const row = page
    .getByRole("row")
    .filter({ hasText: /SA\/2026-27/ })
    .last();
  const number = (await row.locator("b").textContent())!;
  await row.getByRole("button", { name: "Details", exact: true }).click();
  return number;
}
async function sourceReturn(
  page: Page,
  kind: "sale" | "purchase",
  qty: string,
) {
  await page
    .getByRole("link", { name: "Create quantity return →", exact: true })
    .click();
  await page.getByLabel("Return quantity 1", { exact: true }).fill(qty);
  await page
    .getByRole("button", { name: "Save return draft", exact: true })
    .click();
  await expect(
    page.getByText("Return draft saved · saved locally", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Submit return", exact: true })
    .click();
  await expect(
    page.getByText("Return submitted · saved locally", { exact: true }),
  ).toBeVisible();
  await confirm(page, "Approve return");
  if (kind === "purchase") {
    await confirm(page, "Record goods dispatched");
    await page
      .getByLabel("Supplier-issued credit reference")
      .fill("SUPPLIER-BROWSER-CN");
    await page.getByLabel("I reviewed the supplier credit evidence").check();
    await page
      .getByRole("button", { name: "Record supplier credit", exact: true })
      .click();
  } else await confirm(page, "Issue customer credit");
}
test("Saakh 3 A: employee salary, attendance, approved payroll, PDF, payment and balanced report", async ({
  page,
}) => {
  const errors = watch(page);
  await go(page, "payroll");
  await page.getByRole("button", { name: "New employee", exact: true }).click();
  await page
    .getByLabel("Employee name", { exact: true })
    .fill("Fictional Browser Employee");
  await page.getByLabel("Basic salary (₹)", { exact: true }).fill("20000");
  await page
    .getByLabel("Professional tax (entered) (₹)", { exact: true })
    .fill("200");
  await page
    .getByRole("button", {
      name: "Save employee and salary version",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Employee saved · saved locally", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Manager reviewed attendance and leave").check();
  await page
    .getByRole("button", { name: "Save reviewed attendance", exact: true })
    .click();
  await expect(
    page.getByText("Attendance saved · saved locally", { exact: true }),
  ).toBeVisible();
  await page
    .getByText("Configure a new illustrative rule", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Save new rule version", exact: true })
    .click();
  await expect(
    page.getByText("Payroll assumption saved · saved locally", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Create payroll draft", exact: true })
    .click();
  await expect(
    page.getByText("Payroll draft created · saved locally", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Calculate payroll", exact: true })
    .click();
  await expect(
    page.getByText("Payroll calculated · saved locally", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Approve payroll", exact: true })
    .click();
  await expect(
    page.getByText("Payroll approved · saved locally", { exact: true }),
  ).toBeVisible();
  await confirm(page, "Finalize payroll");
  await expect(
    page.getByText("Payroll finalized · saved locally", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Preview payslip", exact: true })
    .click();
  await pdf(page, "Gross:");
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .click();
  await page
    .getByLabel("Salary payment amount (₹)", { exact: true })
    .fill("1000");
  await page
    .getByLabel("Salary payment reference", { exact: true })
    .fill("PAYROLL-BROWSER-001");
  await page
    .getByLabel("I confirm payment occurred in this synthetic example")
    .check();
  await page
    .getByRole("button", { name: "Record salary payment", exact: true })
    .click();
  await expect(
    page.getByText("Salary payment recorded locally · saved locally", {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: /Partially Paid/ }),
  ).toBeVisible();
  const data = await exportBusiness(page);
  expect(data.payrollRuns[0].lines[0].net).toBe(1980000);
  expect(data.financials.balances.salaryPayable).toBe(-1880000);
  expect(data.financials.balances.salaryExpense).toBe(2000000);
  expect(
    data.journals.filter(
      (j: { kind: string }) => j.kind === "payrollFinalized",
    ),
  ).toHaveLength(1);
  expect(
    data.financials.assets -
      data.financials.liabilities -
      data.financials.equity,
  ).toBe(0);
  await go(page, "passbook");
  await expect(page.getByText(/salaryPayment/).first()).toBeVisible();
  expect(errors).toEqual([]);
});
test("Saakh 3 B and D: customer, automatic invoice PDF, partial payment, quantity return, refund, repeat purchase and statement", async ({
  page,
}) => {
  const errors = watch(page);
  await createCustomer(page);
  const number = await createSale(page, "Browser Synthetic Buyer", true);
  await page
    .getByRole("button", { name: "Preview invoice / PDF", exact: true })
    .click();
  await pdf(page, "Total:");
  await page
    .getByRole("button", { name: "Close preview", exact: true })
    .click();
  const receipt = page.locator("form").filter({
    has: page.getByRole("heading", {
      name: "Record collection",
      exact: true,
    }),
  });
  await receipt.getByLabel("Amount (₹)", { exact: true }).fill("30");
  await receipt.getByLabel("Confirm receipt").check();
  await receipt
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  await expect(
    page.getByText("Payment recorded · saved locally", { exact: true }),
  ).toBeVisible();
  await sourceReturn(page, "sale", "2");
  await page.getByLabel("Settlement amount (₹)", { exact: true }).fill("5");
  await page
    .getByLabel("Settlement reference", { exact: true })
    .fill("REFUND-BROWSER-001");
  await page.getByLabel("I confirm the local record reflects").check();
  await page
    .getByRole("button", { name: "Record return settlement", exact: true })
    .click();
  await expect(
    page.getByText("Return settlement recorded · saved locally", {
      exact: true,
    }),
  ).toBeVisible();
  const data = await exportBusiness(page);
  const d = data.documents.find((d: { number: string }) => d.number === number);
  expect(data.returns[0].creditBalance).toBe(500);
  expect(data.returns[0].refunded).toBe(500);
  expect(
    data.movements.filter(
      (m: { sourceId: string }) => m.sourceId === data.returns[0].id,
    )[0].quantity,
  ).toBe(2);
  expect(
    data.financials.assets -
      data.financials.liabilities -
      data.financials.equity,
  ).toBe(0);
  expect(d.automated).toBe(true);
  const repeat = await createSale(page, "Browser Synthetic Buyer");
  expect(repeat).not.toBe(number);
  await go(page, "customers");
  await page.getByLabel("Search customers").fill("Browser Synthetic Buyer");
  await page
    .getByRole("button", { name: "Customer details", exact: true })
    .click();
  await expect(page.getByText(/Repeat customer/)).toBeVisible();
  await page
    .getByRole("button", { name: "Preview customer statement", exact: true })
    .click();
  await pdf(page, "Closing:");
  await page.reload();
  await expect(
    page
      .getByRole("row")
      .filter({ hasText: "Browser Synthetic Buyer" })
      .first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("Saakh 3 C and E: supplier stock receipt, dispatch, supplier credit, bill settlement and reports reconcile", async ({
  page,
}) => {
  const errors = watch(page);
  await go(page, "bills");
  await page.getByRole("button", { name: "New bill", exact: true }).click();
  await page.getByLabel("Counterparty", { exact: true }).selectOption("P-S1");
  await page
    .getByLabel("Document number", { exact: true })
    .fill("BROWSER-RETURN-BILL");
  await page
    .getByLabel("Product (optional for non-stock)")
    .selectOption("SKU-001");
  await page.getByLabel("Quantity", { exact: true }).fill("4");
  await page.getByLabel("Unit price (₹)", { exact: true }).fill("400");
  await page.getByLabel("Save mode").selectOption("post");
  await page.getByLabel("I reviewed party").check();
  await page
    .getByRole("button", { name: "Save document", exact: true })
    .click();
  await expect(
    page.getByText("Document saved · saved locally", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("row")
    .filter({ hasText: "BROWSER-RETURN-BILL" })
    .getByRole("button", { name: "Details", exact: true })
    .click();
  await sourceReturn(page, "purchase", "2");
  const data = await exportBusiness(page);
  const r = data.returns[0];
  expect(r.status).toBe("Supplier Credit Received");
  expect(r.creditBalance).toBe(0);
  expect(data.financials.balances.returnsPending).toBe(0);
  expect(
    data.financials.assets -
      data.financials.liabilities -
      data.financials.equity,
  ).toBe(0);
  await go(page, "bills");
  await page
    .getByRole("row")
    .filter({ hasText: "BROWSER-RETURN-BILL" })
    .getByRole("button", { name: "Details", exact: true })
    .click();
  const payment = page.locator("form").filter({
    has: page.getByRole("heading", {
      name: "Record supplier payment",
      exact: true,
    }),
  });
  await payment.getByLabel("Confirm receipt").check();
  await payment
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  await expect(
    page.getByRole("row").filter({ hasText: "BROWSER-RETURN-BILL" }),
  ).toContainText("Paid");
  expect(errors).toEqual([]);
});
test("Saakh 3 migration, demo fixtures, role privacy, activity search and refresh", async ({
  page,
}) => {
  const errors = watch(page);
  await go(page);
  await confirm(page, "Load operations examples");
  await expect(
    page.getByText("Operations examples loaded · saved locally", {
      exact: true,
    }),
  ).toBeVisible();
  await go(page, "payroll");
  await expect(
    page.getByRole("row").filter({ hasText: "Meera Demo" }).first(),
  ).toBeVisible();
  await chooseRole4(page, "staff");
  await expect(
    page.getByRole("heading", { name: "Payroll access restricted" }),
  ).toBeVisible();
  await go(page, "passbook");
  await expect(
    page
      .locator("summary")
      .filter({ hasText: /salaryPayment|payrollFinalized/ }),
  ).toHaveCount(0);
  await go(page, "payroll");
  await chooseRole4(page, "manager");
  await expect(
    page.getByRole("heading", { name: "Attendance and manager review" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Preview payslip" }),
  ).toHaveCount(0);
  await chooseRole4(page, "owner");
  await expect(page.locator(".m-asof")).toContainText("owner demo view");
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "Meera Demo" }).first(),
  ).toBeVisible();
  await page
    .getByRole("row")
    .filter({ hasText: "Meera Demo" })
    .first()
    .getByRole("button", {
      name: "Edit employee / salary version",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Employee name", { exact: true })
    .fill("Meera Demo Updated");
  await page
    .getByRole("button", {
      name: "Save employee and salary version",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Employee saved · saved locally", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("row").filter({ hasText: "Meera Demo Updated" }).first(),
  ).toBeVisible();
  await go(page, "reports");
  await page.getByLabel("Search activity").fill("Payroll finalized");
  await expect(
    page.getByRole("cell", { name: "Payroll finalized", exact: true }).first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1920])
  test("Saakh 3 responsive and keyboard " + width, async ({ page }) => {
    const errors = watch(page);
    await page.setViewportSize({ width, height: 1000 });
    await go(page);
    await confirm(page, "Load operations examples");
    for (const route of [
      "customers",
      "sales-returns",
      "purchase-returns",
      "payroll",
      "reports",
    ]) {
      await go(page, route);
      await expect(page.locator("h1")).toBeVisible();
      await page.reload();
      await expect(page.locator("h1")).toBeVisible();
      if (route === "payroll" && [375, 1440].includes(width))
        await page.screenshot({
          path: `test-results/pages/saakh3-payroll-${width}.png`,
          fullPage: true,
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
    }
    await go(page, "customers");
    await page
      .getByRole("button", { name: "New customer", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByLabel("Customer name", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/pages/saakh3-${width}.png`,
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
