import { test, expect, type Page } from "@playwright/test";
async function chooseRole4(page: Page, role: string) {
  const prior = page.url();
  await page.getByRole("button", { name: "Demo roles", exact: true }).click();
  await page.getByLabel("Demo role", { exact: true }).selectOption(role);
  await expect(page.locator(".m-asof")).toContainText(role + " demo view");
  await page.goto(prior);
}
const pages = [
  ["", "Business Pulse"],
  ["sales", "Sales & Invoices"],
  ["bills", "Purchases & Bills"],
  ["passbook", "Passbook & Reconciliation"],
  ["inventory", "Inventory"],
  ["cashflow", "Cash Flow & Forecasts"],
  ["collections", "Collections"],
  ["funding", "Loans & Working Capital"],
  ["network", "Buyers & Suppliers"],
  ["tax", "GST & Tax"],
  ["reports", "Reports & Audit"],
  ["assistant", "AI Assistant"],
  ["settings", "Team & Settings"],
  ["admin", "Demo Admin"],
];
function watch(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}
test("public launch reaches Business Pulse and preserves credit workspace", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Explore Business Demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Business Pulse", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Credit Intelligence", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Intelligence overview." }),
  ).toBeVisible();
});
test("all fourteen business modules render without runtime errors", async ({
  page,
}) => {
  const errors = watch(page);
  for (const [route, title] of pages) {
    await page.goto("/business" + (route ? "/" + route : ""));
    if (route === "admin")
      await expect(
        page.getByRole("heading", { name: "Demo admin view restricted" }),
      ).toBeVisible();
    else
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("credit invoice posting and partial collection persist after refresh", async ({
  page,
}) => {
  const errors = watch(page);
  await page.goto("/business/sales");
  await page.getByRole("button", { name: "New invoice", exact: true }).click();
  await page.getByLabel("Counterparty").selectOption("P-C1");
  await page.getByLabel("Document number", { exact: true }).fill("BROWSER-001");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Synthetic test service");
  await page.getByLabel("Unit price (₹)", { exact: true }).fill("1000");
  await page.getByLabel("Save mode").selectOption("post");
  await page.getByLabel("I reviewed party").check();
  await page
    .getByRole("button", { name: "Save document", exact: true })
    .click();
  const row = page.getByRole("row").filter({ hasText: "BROWSER-001" });
  await expect(row).toContainText("₹1,000.00");
  await row.getByRole("button", { name: "Details" }).click();
  const form = page.locator("form").filter({
    has: page.getByRole("heading", {
      name: "Record collection",
      exact: true,
    }),
  });
  await form.getByLabel("Amount (₹)", { exact: true }).fill("250");
  await form.getByLabel("Confirm receipt").check();
  await form
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  await expect(row).toContainText("₹750.00");
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "BROWSER-001" }),
  ).toContainText("Part-paid");
  expect(errors).toEqual([]);
});
test("reconciliation matches existing collection without duplicate ledger", async ({
  page,
}) => {
  await page.goto("/business/passbook");
  await page
    .getByRole("row")
    .filter({ hasText: "BANK-001" })
    .getByRole("button", { name: "Review match" })
    .click();
  await page.getByLabel(/Collection SGT-INV-001/).check();
  await page.getByRole("button", { name: "Accept selected match" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "BANK-001" }),
  ).toContainText("Matched");
  await page.reload();
  await expect(
    page.getByRole("row").filter({ hasText: "BANK-001" }),
  ).toContainText("Matched");
});
test("forecast scenarios recalculate and save reproducible snapshot", async ({
  page,
}) => {
  await page.goto("/business/cashflow");
  const before = await page
    .locator(".m-metric")
    .filter({ hasText: "Closing cash estimate" })
    .innerText();
  await page
    .getByRole("combobox", { name: "Scenario", exact: true })
    .selectOption("Downside");
  await page.getByLabel("Forecast horizon").selectOption("60");
  const after = await page
    .locator(".m-metric")
    .filter({ hasText: "Closing cash estimate" })
    .innerText();
  expect(after).not.toBe(before);
  await page
    .getByRole("button", { name: "Save reproducible snapshot" })
    .click();
  await expect(page.getByRole("status")).toContainText("saved locally");
  await expect(
    page.getByRole("row").filter({ hasText: "/ Downside" }),
  ).toBeVisible();
});
test("business report export contains actual balanced finances and audit evidence", async ({
  page,
}) => {
  await page.goto("/business/reports");
  const [d] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export business JSON" }).click(),
  ]);
  const path = await d.path();
  const { readFile } = await import("node:fs/promises");
  const data = JSON.parse(await readFile(path!, "utf8"));
  expect(
    data.financials.assets -
      data.financials.liabilities -
      data.financials.equity,
  ).toBe(0);
  expect(data.journals.length).toBeGreaterThan(120);
  expect(data.audit.length).toBeGreaterThan(0);
});
test("staff posting is rejected and admin is guarded by demo view", async ({
  page,
}) => {
  await page.goto("/business");
  await chooseRole4(page, "staff");
  await page.goto("/business/passbook");
  await expect(
    page.getByRole("heading", { name: "Role access", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Post balanced journal", exact: true }),
  ).toHaveCount(0);
  await page.goto("/business/admin");
  await expect(
    page.getByRole("heading", { name: "Demo admin view restricted" }),
  ).toBeVisible();
  await chooseRole4(page, "admin");
  await expect(
    page.getByRole("heading", { name: "Synthetic marketplace moderation" }),
  ).toBeVisible();
});
test("assistant returns evidence and refuses natural-language posting", async ({
  page,
}) => {
  await page.goto("/business/assistant");
  await page
    .getByRole("button", { name: "Who owes me money?", exact: true })
    .click();
  await expect(page.locator(".m-answer")).toContainText("outstanding");
  await page.getByLabel("Your question").fill("Post a payment");
  await page.getByRole("button", { name: "Ask Saakh", exact: true }).click();
  await expect(page.locator(".m-answer")).toContainText(
    "No transaction was posted",
  );
});
for (const width of [1440, 1280, 1024, 768, 390, 360])
  test("business responsive layout " + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = watch(page);
    for (const route of ["", "sales", "cashflow", "settings"]) {
      await page.goto("/business" + (route ? "/" + route : ""));
      await expect(page.locator(".m-page-heading h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    if (width < 768) {
      await page
        .getByRole("button", { name: "Open business navigation" })
        .click();
      await expect(
        page.getByRole("link", { name: "Inventory", exact: true }),
      ).toBeVisible();
      await page.getByRole("link", { name: "Inventory", exact: true }).click();
      await expect(
        page.getByRole("heading", { name: "Stock register · standard cost" }),
      ).toBeVisible();
    }
    expect(errors).toEqual([]);
    await page.goto("/business");
    await expect(
      page.getByRole("heading", { name: "Business Pulse", exact: true }),
    ).toBeVisible();
    await page.screenshot({
      path: "test-results/business-" + width + ".png",
      fullPage: true,
    });
  });
test("keyboard confirms posted document in native modal and Escape cancels", async ({
  page,
}) => {
  await page.goto("/business/bills");
  await page
    .getByRole("row")
    .filter({ hasText: "DP-REVIEW-1" })
    .getByRole("button", { name: "Details" })
    .click();
  await page
    .getByRole("button", { name: "Post document", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Post document" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("row").filter({ hasText: "DP-REVIEW-1" }),
  ).toContainText("Draft");
});

test("onboarding creates independent confirmed opening balances and switches business scope", async ({
  page,
}) => {
  await page.goto("/business/onboarding");
  await page
    .getByLabel("Business name", { exact: true })
    .fill("Synthetic New Shop");
  await page.getByLabel("Industry", { exact: true }).fill("Retail demo");
  await page.getByLabel("Location", { exact: true }).fill("Pune");
  await page
    .getByLabel("Opening bank balance (₹)", { exact: true })
    .fill("50000");
  await page
    .getByLabel("Source of opening balance")
    .fill("Confirmed synthetic statement");
  await page.getByLabel("I reviewed the opening amount").check();
  await page.getByRole("button", { name: "Create local business" }).click();
  await expect(
    page.getByRole("heading", { name: "Business Pulse", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator(".m-metric").filter({ hasText: "Cash & bank" }),
  ).toContainText("₹50,000.00");
  await page.goto("/business/sales");
  await expect(
    page.getByText(
      "No matching records. Adjust filters or create a permitted draft.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: /Synthetic New Shop.*▾/ }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("dialog")
    .getByRole("button", { name: /Shree Ganesh Traders/ })
    .click();
  await expect(page).toHaveURL(/\/business\/?$/);
  await page.goto("/business/sales");
  await expect(
    page.getByRole("row").filter({ hasText: "SGT-INV-001" }),
  ).toBeVisible();
});
test("RFQ, quotation, shortlist and local outcome form a complete demo flow", async ({
  page,
}) => {
  await page.goto("/business/network");
  const rfq = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Create local RFQ" }) });
  await rfq.getByLabel("product", { exact: true }).fill("Synthetic grain bags");
  await rfq.getByLabel("location", { exact: true }).fill("Pune");
  await rfq.getByLabel("spec", { exact: true }).fill("25 kg demonstration");
  await rfq.getByLabel("terms", { exact: true }).fill("Payment on receipt");
  await rfq.getByLabel("Quantity", { exact: true }).fill("10");
  await rfq.getByLabel("Budget (₹)", { exact: true }).fill("6000");
  await rfq.getByRole("button", { name: "Create local RFQ" }).click();
  const quote = page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Record demo quote" }) });
  await quote
    .getByLabel("RFQ", { exact: true })
    .selectOption({ label: "Synthetic grain bags · 10" });
  await quote.getByLabel("unit (₹)", { exact: true }).fill("400");
  await quote.getByLabel("freight (₹)", { exact: true }).fill("100");
  await quote.getByLabel("tax", { exact: true }).fill("5");
  await quote.getByLabel("lead", { exact: true }).fill("3");
  await quote.getByLabel("Terms", { exact: true }).fill("Demo terms");
  await quote.getByRole("button", { name: "Record demo quote" }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "₹4,305.00" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Shortlist", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Shortlisted ✓" }),
  ).toBeVisible();
  await page
    .getByLabel("Record local RFQ outcome")
    .selectOption("Demo order recorded");
  await page.reload();
  await expect(page.getByLabel("Record local RFQ outcome")).toHaveValue(
    "Demo order recorded",
  );
});
test("XLSX sample imports without posting and repeated import is deduplicated", async ({
  page,
}) => {
  await page.goto("/business/passbook");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Download XLSX sample" }).click(),
  ]);
  const path = await download.path();
  const { readFile } = await import("node:fs/promises");
  const file = {
    name: download.suggestedFilename(),
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: await readFile(path!),
  };
  await page
    .getByLabel("Import synthetic statement CSV / XLSX")
    .setInputFiles(file);
  await expect(
    page.getByRole("row").filter({ hasText: "Sample customer receipt" }),
  ).toHaveCount(1);
  await page
    .getByLabel("Import synthetic statement CSV / XLSX")
    .setInputFiles([]);
  await page
    .getByLabel("Import synthetic statement CSV / XLSX")
    .setInputFiles(file);
  await expect(
    page.getByRole("row").filter({ hasText: "Sample customer receipt" }),
  ).toHaveCount(1);
});

test("owner deletion clears saved data while staff deletion is rejected", async ({
  page,
}) => {
  await page.goto("/business/settings");
  await chooseRole4(page, "staff");
  await expect(
    page.getByRole("heading", { name: "Role access", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Delete local Saakh records" }),
  ).toHaveCount(0);
  await chooseRole4(page, "owner");
  await page.getByLabel("Type DELETE to confirm").fill("DELETE");
  await page
    .getByRole("button", { name: "Delete local Saakh records" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Start with a clear opening balance" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Start with a clear opening balance" }),
  ).toBeVisible();
});
