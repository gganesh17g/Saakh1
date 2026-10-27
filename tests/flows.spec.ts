import { test, expect } from "@playwright/test";
test("full intelligence journey, attack scenarios, evidence, exports and restoration", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /See the business/ }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Explore intelligence workspace" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Intelligence overview." }),
  ).toBeVisible();
  await page.getByLabel("Select business").selectOption("anjali");
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(page.locator(".snapshot-line")).toContainText("completed");
  await page.getByRole("button", { name: /Cash-flow stability/ }).click();
  await expect(page.locator(".xray")).toContainText("CV");
  await page.getByRole("link", { name: "Verify & Investigate" }).click();
  await page.getByLabel("Search records").fill("anjali-inv0");
  await expect(
    page.getByRole("heading", { name: "Simulation snapshot" }),
  ).toBeVisible();
  await page.getByText("Keyboard inspection").click();
  await page.getByRole("button", { name: "anjali-tx0", exact: true }).click();
  await expect(page.locator(".evidence-pre")).toContainText("anjali-inv0");
  await page
    .getByLabel("Notes, unresolved questions & draft assessment")
    .fill("Reviewed synthetic invoice context.");
  await page.getByRole("link", { name: "Attack Lab", exact: false }).click();
  const circular = page.locator(".card").filter({
    has: page.getByRole("heading", {
      name: "Circular Invoicing",
      exact: true,
    }),
  });
  await circular.getByRole("button", { name: "Run scenario" }).click();
  await expect(circular).toContainText("PASS");
  const shock = page.locator(".card").filter({
    has: page.getByRole("heading", { name: "Seasonal Shock", exact: true }),
  });
  await shock.getByRole("button", { name: "Run scenario" }).click();
  await expect(shock).toContainText("PASS");
  await page.getByRole("button", { name: "Run all tests" }).click();
  await expect(page.getByText("PASS", { exact: true })).toHaveCount(6);
  await page.getByRole("link", { name: "Impact Dashboard" }).click();
  await expect(page.getByText("7.00× benefit-to-cost")).toBeVisible();
  await page.getByRole("link", { name: "Reports", exact: true }).click();
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON report" }).click();
  expect((await downloaded).suggestedFilename()).toMatch(/SK-.*json/);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Export history (1)" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
for (const width of [1440, 1280, 1024, 768, 390, 360])
  test(`responsive layouts at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      "/",
      "/app",
      "/app/generate",
      "/app/verify",
      "/app/attack",
      "/app/impact",
    ]) {
      await page.goto(route);
      await expect(page.locator("h1")).toBeVisible();
      await page.waitForTimeout(300);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
    }
    await page.goto("/app");
    await expect(
      page.getByRole("heading", { name: "Intelligence overview." }),
    ).toBeVisible();
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `test-results/overview-${width}.png`,
      fullPage: true,
    });
  });
test("borrower editing, comparison and keyboard", async ({ page }) => {
  await page.goto("/app/generate");
  await page.getByLabel("Monthly revenue (₹)", { exact: true }).fill("1400000");
  await page.getByRole("button", { name: /Add scenario/ }).click();
  await expect(
    page.getByRole("cell", { name: "Scenario 1", exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(page.getByText("completed", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Duplicate", exact: true }).click();
  await expect(page.getByLabel("Borrower profile")).toContainText(
    "Anjali Foods copy",
  );
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe(
    "BODY",
  );
});

test("cancellation, insufficient evidence, validation and persisted review notes", async ({
  page,
}) => {
  await page.goto("/app/generate");
  await page.getByLabel("Monthly revenue (₹)", { exact: true }).fill("-1");
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel("Monthly revenue (₹)", { exact: true }).fill("1200000");
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByText("cancelled", { exact: true })).toBeVisible();
  await page.getByLabel("Bank data", { exact: false }).uncheck();
  await page.getByLabel("Revenue history", { exact: false }).uncheck();
  await page.getByLabel("Trade-network data", { exact: false }).uncheck();
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(
    page.getByText("insufficient-data", { exact: true }),
  ).toBeVisible();
  await page.goto("/app/verify");
  await expect(
    page.getByText("Insufficient Evidence", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Notes, unresolved questions & draft assessment")
    .fill("Missing evidence requires human follow-up.");
  await page.reload();
  await expect(
    page.getByLabel("Notes, unresolved questions & draft assessment"),
  ).toHaveValue("Missing evidence requires human follow-up.");
});
test("theme persistence, reduced-motion and keyboard graph inspection", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: "Intelligence overview." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Resume graph" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Change theme" }).click();
  await page.getByRole("button", { name: "Change theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByText("Keyboard inspection").click();
  await page.getByRole("button", { name: "anjali-tx0", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".evidence")).toContainText("anjali-tx0");
  await page.getByRole("button", { name: "Toggle 2D graph" }).click();
  await expect(
    page.getByRole("img", { name: "Interactive trade graph" }),
  ).toBeVisible();
});

test("interactive story checkpoints use live routes", async ({ page }) => {
  await page.goto("/app/guide");
  await page
    .getByRole("button", { name: "Start interactive story mode" })
    .click();
  await expect(
    page.getByRole("complementary", { name: "Interactive story mode" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/app$/);
  await page.getByRole("button", { name: "Next checkpoint" }).click();
  await expect(page).toHaveURL(/\/app\/generate$/);
  await expect(
    page.getByRole("heading", { name: "Change the financial twin" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Skip tour", exact: true }).click();
  await expect(
    page.getByRole("complementary", { name: "Interactive story mode" }),
  ).toHaveCount(0);
});
