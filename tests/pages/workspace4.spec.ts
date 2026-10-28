import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
const go = (p: Page, r = "") => p.goto("./#/business" + (r ? "/" + r : ""));
function watch(p: Page) {
  const errors: string[] = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  p.on("requestfailed", (r) => errors.push(r.url()));
  return errors;
}
async function role(p: Page, r: string) {
  await go(p, "roles");
  await p.getByLabel("Demo role", { exact: true }).selectOption(r);
  await expect(p.locator(".m-asof")).toContainText(r + " demo view");
}
async function backup(p: Page) {
  await go(p, "data");
  const wait = p.waitForEvent("download");
  await p
    .getByRole("button", { name: "Export full business backup", exact: true })
    .click();
  const d = await wait;
  return JSON.parse(await readFile((await d.path())!, "utf8"));
}
test("4.0 tasks, notification state, safe bulk completion and persistence", async ({
  page,
}) => {
  const errors = watch(page);
  await go(page, "tasks");
  await page
    .getByLabel("Task title", { exact: true })
    .fill("Review synthetic receipt");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Check invoice evidence without paying");
  await page.getByRole("button", { name: "Create Task", exact: true }).click();
  await expect(
    page.getByText("Review synthetic receipt", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Alerts \(/ }).click();
  await expect(
    page.getByRole("dialog").getByText(/Review synthetic receipt/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close workspace panel" }).click();
  await page
    .getByRole("button", { name: "Select visible", exact: true })
    .click();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Complete selected", exact: true })
    .click();
  await expect(
    page.getByText("1 successful; 0 skipped; 0 failed"),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator(".w4-record")).toContainText("Done");
  expect(errors).toEqual([]);
});
test("4.0 universal create opens actual invoice workflow and keyboard search follows source", async ({
  page,
}) => {
  const errors = watch(page);
  await go(page);
  await page.getByRole("button", { name: "+ Create", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create Invoice", exact: false })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Create a reviewed document",
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Search search", { exact: true }).fill("Asha");
  await page.getByRole("dialog").getByRole("button", { name: /Asha/ }).click();
  await expect(page).toHaveURL(/customers\?record=/);
  await expect(
    page.getByRole("heading", { name: /Asha/ }).first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("4.0 invoice autosave recovers without posting", async ({ page }) => {
  const before = await backup(page);
  await go(page, "sales?create=1");
  await page.getByLabel("Counterparty", { exact: true }).selectOption("P-C1");
  await page
    .getByLabel("Description", { exact: true })
    .fill("Recovery-only service");
  await page.getByLabel("Unit price (₹)", { exact: true }).fill("123");
  await expect(page.getByText(/Local form recovery · Saved\./)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Resume Draft", exact: true }).click();
  await expect(page.getByLabel("Description", { exact: true })).toHaveValue(
    "Recovery-only service",
  );
  await expect(page.getByLabel("Unit price (₹)", { exact: true })).toHaveValue(
    "123",
  );
  const after = await backup(page);
  expect(after.ledger.journals).toEqual(before.ledger.journals);
  expect(after.ledger.documents).toEqual(before.ledger.documents);
  expect(after.workspace.drafts).toHaveLength(1);
});
test("4.0 saved scenario names, comparison, duplication and explicit recalculation", async ({
  page,
}) => {
  const errors = watch(page);
  await go(page, "scenarios");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await expect(page.getByLabel("Scenario name", { exact: true })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Scenario Lab", exact: true }).click();
  await page.getByLabel("Scenario name", { exact: true }).fill("Stress Case");
  await page.getByLabel("Sales change (%)", { exact: true }).fill("-30");
  await page.getByLabel("Collection delay (days)", { exact: true }).fill("30");
  await page
    .getByRole("button", { name: "Save scenario", exact: true })
    .click();
  await expect(page.locator(".w4-scenario")).toContainText("Stress Case");
  await page
    .locator(".w4-scenario")
    .getByRole("button", { name: "Duplicate", exact: true })
    .click();
  await expect(page.locator(".w4-scenario")).toHaveCount(2);
  await page
    .locator(".w4-scenario")
    .first()
    .getByRole("button", { name: "Recalculate as new snapshot" })
    .click();
  await expect(page.locator(".w4-scenario")).toHaveCount(3);
  await page.reload();
  await expect(page.locator(".w4-scenario")).toHaveCount(3);
  const b = await backup(page);
  expect(b.workspace.scenarios).toHaveLength(3);
  expect(b.workspace.scenarios[0].result.assumptions.salesChange).toBe(-0.3);
  expect(errors).toEqual([]);
});
test("4.0 backup validation, separate restore, task restoration and business isolation", async ({
  page,
}) => {
  const errors = watch(page);
  await go(page, "tasks");
  await page.getByLabel("Task title", { exact: true }).fill("Backup task");
  await page.getByRole("button", { name: "Create Task", exact: true }).click();
  await expect(page.getByText("Backup task", { exact: true })).toBeVisible();
  await go(page, "scenarios");
  await page
    .getByLabel("Scenario name", { exact: true })
    .fill("Portable scenario");
  await page
    .getByRole("button", { name: "Save scenario", exact: true })
    .click();
  await expect(page.locator(".w4-scenario")).toHaveCount(1);
  const original = await backup(page);
  await page.getByLabel("Choose backup").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":99}'),
  });
  await expect(page.getByRole("alert")).toContainText("Unsupported backup");
  await page.getByLabel("Choose backup").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(original)),
  });
  await expect(
    page.getByRole("heading", { name: /Restore preview/ }),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Confirm restore as separate business" })
    .click();
  await expect(page.locator(".m-business-bar strong")).toContainText(
    "(restored)",
  );
  await go(page, "tasks");
  await expect(page.getByText("Backup task", { exact: true })).toBeVisible();
  await go(page, "scenarios");
  await expect(page.locator(".w4-scenario")).toHaveCount(1);
  page.once("dialog", (d) => d.accept());
  await page
    .locator(".w4-scenario")
    .getByRole("button", { name: "Delete", exact: true })
    .click();
  await expect(page.locator(".w4-scenario")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".w4-scenario")).toHaveCount(0);
  const restored = await backup(page);
  expect(restored.businessId).not.toBe(original.businessId);
  expect(restored.ledger.journals.length).toBe(original.ledger.journals.length);
  expect(restored.workspace.tasks[0].businessId).toBe(restored.businessId);
  await page.getByRole("button", { name: /\(restored\)/ }).click();
  await page
    .getByRole("dialog")
    .getByLabel("Search business")
    .fill(original.businessName);
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("dialog")
    .getByRole("button", { name: original.businessName, exact: true })
    .click();
  await expect(page).toHaveURL(/#\/business\/?$/);
  await expect(page.locator(".m-business-bar strong")).toHaveText(
    original.businessName,
  );
  const again = await backup(page);
  expect(again.ledger.journals).toEqual(original.ledger.journals);
  expect(again.businessId).toBe(original.businessId);
  expect(errors).toEqual([]);
});
test("4.0 role permissions hide confidential search, data management and creation", async ({
  page,
}) => {
  await role(page, "staff");
  await page.getByRole("button", { name: "+ Create", exact: true }).click();
  await expect(
    page.getByRole("dialog").getByRole("button", { name: "Add Product" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("dialog").getByRole("button", { name: "Create Invoice" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await go(page, "data");
  await expect(
    page.getByRole("heading", { name: "Role access", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Universal search" }).click();
  await page.getByLabel("Search search").fill("Meera");
  await expect(
    page.getByRole("dialog").getByRole("button", { name: /Employee/ }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await role(page, "auditor");
  await page.getByRole("button", { name: "+ Create", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("read-only");
});
test("4.0 network preset selection synchronizes supporting documents without ledger changes", async ({
  page,
}) => {
  const errors = watch(page),
    before = await backup(page);
  await go(page, "explorer");
  await page.getByLabel("Guided preset").selectOption("Customer Network");
  await page.getByLabel("Select relationship").selectOption("P-C1");
  await expect(page.locator(".w4-split section")).toContainText("Total");
  await page.getByLabel("Guided preset").selectOption("Supplier Network");
  await expect(
    page.getByLabel("Select relationship").locator("option"),
  ).not.toContainText(["Asha Retail"]);
  const after = await backup(page);
  expect(after.ledger.journals).toEqual(before.ledger.journals);
  expect(errors).toEqual([]);
});
test("4.0 reports scoped CSV contains displayed values and period metadata", async ({
  page,
}) => {
  await go(page, "reports");
  await page.getByLabel("Report category").selectOption("Sales");
  await page.getByLabel("Search report rows").fill("SALE");
  const wait = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export selected report CSV", exact: true })
    .click();
  const d = await wait;
  const text = await readFile((await d.path())!, "utf8");
  expect(text).toContain("Source business");
  expect(text).toContain("Methodology");
  expect(text).toContain("Generated");
});
for (const width of [320, 360, 390, 430, 768, 1024, 1280, 1440, 1920])
  test("4.0 responsive workspace " + width, async ({ page }) => {
    const errors = watch(page);
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "tasks",
      "preferences",
      "insights",
      "explorer",
      "help",
      "roles",
    ]) {
      await go(page, route);
      await expect(page.locator("h1")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
    }
    if (width <= 768)
      await expect(
        page.getByRole("navigation", { name: "Mobile workspace" }),
      ).toBeVisible();
    await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
    await go(page, "preferences");
    await page
      .getByLabel("Display density", { exact: true })
      .selectOption("Compact");
    await expect(page.locator("html")).toHaveAttribute(
      "data-density",
      "Compact",
    );
    await page.reload();
    await expect(
      page.getByLabel("Display density", { exact: true }),
    ).toHaveValue("Compact");
    await page.getByLabel("Contrast", { exact: true }).selectOption("Enhanced");
    await expect(page.locator("html")).toHaveAttribute(
      "data-contrast",
      "Enhanced",
    );
    expect(
      await page
        .locator(".munim")
        .evaluate((el) =>
          getComputedStyle(el).getPropertyValue("--w4-line").trim(),
        ),
    ).toBe("#8194a7");
    expect(errors).toEqual([]);
  });
test("4.0 business 3D explorer remains source-driven, selectable and motion-safe", async ({
  page,
}) => {
  const errors = watch(page);
  await go(page, "preferences");
  await page
    .getByLabel("Network presentation", { exact: true })
    .selectOption("3D");
  await expect(
    page.getByLabel("Network presentation", { exact: true }),
  ).toHaveValue("3D");
  await page
    .getByLabel("Motion preference", { exact: true })
    .selectOption("Reduced");
  await expect(page.locator("html")).toHaveAttribute("data-motion", "Reduced");
  await go(page, "explorer");
  await expect(page.locator(".network canvas")).toBeVisible();
  await page.getByLabel("Select relationship").selectOption("P-C1");
  await expect(page.locator(".w4-split section")).toContainText("Total");
  await page.getByRole("button", { name: "Reset camera", exact: true }).click();
  await page
    .getByRole("button", { name: "Toggle 2D graph", exact: true })
    .click();
  await expect(
    page.getByRole("img", { name: "Interactive trade graph" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("4.0 invoice filters survive module navigation and create can reopen safely", async ({
  page,
}) => {
  await go(page, "sales");
  await page
    .getByLabel("Search documents", { exact: true })
    .fill("no-such-invoice");
  await expect(
    page.getByText(
      "No matching records. Adjust filters or create a permitted draft.",
    ),
  ).toBeVisible();
  await page.locator(".w4-account summary").click();
  await page
    .getByRole("link", { name: "Switch Demo Role", exact: true })
    .click();
  await go(page, "sales");
  await expect(
    page.getByLabel("Search documents", { exact: true }),
  ).toHaveValue("no-such-invoice");
  await page.getByLabel("Search documents", { exact: true }).fill("");
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "+ Create", exact: true }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Create Invoice" })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "Create a reviewed document",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Close editor", exact: true })
      .click();
  }
});
