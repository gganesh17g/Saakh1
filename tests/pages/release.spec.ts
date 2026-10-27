import { test, expect, type Page } from "@playwright/test";
function monitor(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("requestfailed", (r) =>
    errors.push(r.url() + ": " + r.failure()?.errorText),
  );
  return errors;
}
test("release identity, compiled entry, JS/CSS/image MIME and no doubled prefix", async ({
  page,
  request,
}) => {
  const errors = monitor(page);
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: /See the business/ }),
  ).toBeVisible();
  const r = await request.get("./release.json");
  expect(r.status()).toBe(200);
  const identity = await r.json();
  expect(identity.base).toBe("/Saakh1/");
  if (process.env.SAAKH_EXPECTED_SHA)
    expect(identity.sourceCommit).toBe(process.env.SAAKH_EXPECTED_SHA);
  expect(
    await page.locator('meta[name="saakh-release"]').getAttribute("content"),
  ).toBe(identity.sourceCommit);
  const entry = await (await request.get("./")).text();
  expect(entry).not.toContain("/src/main.tsx");
  expect(entry).not.toContain("/Saakh1/Saakh1/");
  for (const url of await page
    .locator('script[src],link[rel="stylesheet"],link[rel="icon"]')
    .evaluateAll((es) =>
      es.map((e) => e.getAttribute("src") || e.getAttribute("href") || ""),
    )) {
    const response = await request.get(url);
    expect(response.status(), url).toBe(200);
    if (url.endsWith(".js"))
      expect(response.headers()["content-type"]).toContain("javascript");
    if (url.endsWith(".css"))
      expect(response.headers()["content-type"]).toContain("text/css");
  }
  expect(errors).toEqual([]);
});
test("all public feature, pricing, company, privacy, terms and support pages load and refresh", async ({
  page,
}) => {
  const errors = monitor(page);
  for (const route of [
    "accounting",
    "cashflow",
    "collections",
    "working-capital",
    "network",
    "pricing",
    "about",
    "contact",
    "privacy",
    "terms",
    "grievance",
  ]) {
    await page.goto("./#/product/" + route);
    await expect(page.locator("h1")).toBeVisible();
    await page.reload();
    await expect(page.locator("h1")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
test("all fourteen business modules, copied links, back and forward work", async ({
  page,
  context,
}) => {
  const errors = monitor(page);
  for (const route of [
    "",
    "sales",
    "bills",
    "passbook",
    "inventory",
    "cashflow",
    "collections",
    "funding",
    "network",
    "tax",
    "reports",
    "assistant",
    "settings",
    "admin",
  ]) {
    await page.goto("./#/business" + (route ? "/" + route : ""));
    await expect(page.locator(".m-page-heading h1")).toBeVisible();
    await page.reload();
    await expect(page.locator(".m-page-heading h1")).toBeVisible();
  }
  await page.goto("./#/business");
  await page
    .getByRole("link", { name: "Sales & Invoices", exact: true })
    .click();
  const copied = page.url();
  await page.getByRole("link", { name: "Inventory", exact: true }).click();
  await page.goBack();
  await expect(page).toHaveURL(copied);
  await page.goForward();
  await expect(page).toHaveURL(/#\/business\/inventory$/);
  const second = await context.newPage();
  await second.goto(copied);
  await expect(
    second.getByRole("heading", { name: "Sales & Invoices", exact: true }),
  ).toBeVisible();
  await second.close();
  expect(errors).toEqual([]);
});
test("credit engines, graph interaction, scenario comparison, evidence, replay and guided demo remain reachable", async ({
  page,
}) => {
  const errors = monitor(page);
  for (const route of [
    "",
    "generate",
    "verify",
    "attack",
    "impact",
    "reports",
    "responsible",
    "guide",
    "settings",
  ]) {
    await page.goto("./#/app" + (route ? "/" + route : ""));
    await expect(page.locator("h1")).toBeVisible();
    await page.reload();
    await expect(page.locator("h1")).toBeVisible();
  }
  await page.goto("./#/app");
  await expect(page.locator(".network canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause graph", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume graph" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset camera" }).click();
  await page.getByRole("button", { name: /Cash-flow stability/ }).click();
  await expect(page.locator(".xray")).toContainText("CV");
  await page.locator("#time").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator('label[for="time"]')).toContainText("Forecast");
  await page
    .getByRole("link", { name: "Generate Simulation", exact: true })
    .click();
  await page.getByLabel("Monthly revenue (₹)", { exact: true }).fill("1400000");
  await page.getByRole("button", { name: /Add scenario/ }).click();
  await expect(page.getByRole("cell", { name: /Scenario 1/ })).toBeVisible();
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(page.getByText("completed", { exact: true })).toBeVisible();
  await page
    .getByRole("link", { name: "Verify & Investigate", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Simulation snapshot" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Invoices & transactions/ }).click();
  await expect(page.locator(".evidence-pre")).toContainText("anjali-tx");
  await page.getByRole("link", { name: "Attack Lab" }).click();
  await page.getByRole("button", { name: "Run all tests" }).click();
  await expect(page.getByText("PASS", { exact: true })).toHaveCount(6);
  await page.goto("./#/app/reports");
  const replay = page.getByRole("slider", { name: /Stage/ });
  await replay.focus();
  await page.keyboard.press("ArrowRight");
  await expect(replay).toHaveValue("1");
  await page.getByText("Reproducible input snapshot", { exact: true }).click();
  await expect(page.locator("details pre")).toContainText('"sources"');
  await page.goto("./#/app/guide");
  await page
    .getByRole("button", { name: "Start interactive story mode" })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Interactive story mode" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next checkpoint" }).click();
  await expect(
    page.getByRole("heading", { name: "Change the financial twin" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip tour", exact: true }).click();
  await expect(
    page.getByRole("complementary", { name: "Interactive story mode" }),
  ).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("live-compatible confirmed credit invoice, partial receipt, balanced export and reload", async ({
  page,
}) => {
  const errors = monitor(page);
  await page.goto("./#/business/sales");
  await page.getByRole("button", { name: "New invoice", exact: true }).click();
  await page.getByLabel("Counterparty").selectOption("P-C1");
  await page
    .getByLabel("Document number", { exact: true })
    .fill("RELEASE-CHECK-001");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Synthetic release validation service");
  await page.getByLabel("Unit price (₹)", { exact: true }).fill("1000");
  await page.getByLabel("Save mode").selectOption("post");
  await page.getByLabel("I reviewed party").check();
  await page
    .getByRole("button", { name: "Save document", exact: true })
    .click();
  const row = page.getByRole("row").filter({ hasText: "RELEASE-CHECK-001" });
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
    page.getByRole("row").filter({ hasText: "RELEASE-CHECK-001" }),
  ).toContainText("Part-paid");
  await page.goto("./#/business/reports");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export business JSON" }).click(),
  ]);
  const { readFile } = await import("node:fs/promises");
  const data = JSON.parse(await readFile((await download.path())!, "utf8"));
  expect(
    data.financials.assets -
      data.financials.liabilities -
      data.financials.equity,
  ).toBe(0);
  expect(
    data.documents.some(
      (d: { number: string }) => d.number === "RELEASE-CHECK-001",
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
for (const width of [320, 375, 430, 768, 1024, 1280, 1440, 1920])
  test("release responsive " + width, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors = monitor(page);
    for (const route of [
      "/",
      "/business",
      "/business/sales",
      "/business/bills",
      "/business/cashflow",
      "/business/funding",
      "/business/network",
      "/business/reports",
      "/app",
    ]) {
      await page.goto("./#" + route);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
    }
    await page.goto("./#/business/sales");
    await page
      .getByRole("button", { name: "New invoice", exact: true })
      .click();
    await expect(
      page.getByLabel("Document number", { exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.screenshot({
      path: "test-results/pages/release-" + width + ".png",
      fullPage: true,
    });
    expect(errors).toEqual([]);
  });
