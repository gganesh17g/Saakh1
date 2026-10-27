import { test, expect } from "@playwright/test";
test("business workspace direct hash routing, refresh, assets and report export at Pages subpath", async ({
  page,
}) => {
  const errors: string[] = [];
  const bad: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) bad.push(r.url());
  });
  for (const route of ["", "sales", "cashflow", "network", "settings"]) {
    await page.goto("./#/business" + (route ? "/" + route : ""));
    await expect(page.locator(".m-page-heading h1")).toBeVisible();
    await page.reload();
    await expect(page.locator(".m-page-heading h1")).toBeVisible();
  }
  await page.goto("./#/business/reports");
  const [d] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Export business JSON" }).click(),
  ]);
  expect(d.suggestedFilename()).toBe("saakh-business-report.json");
  expect(errors).toEqual([]);
  expect(bad).toEqual([]);
});
test("business legacy clean path migrates through static 404 document", async ({
  page,
}) => {
  await page.goto("./business/cashflow");
  await expect(page).toHaveURL(/#\/business\/cashflow$/);
  await expect(
    page.getByRole("heading", { name: "Cash Flow & Forecasts", exact: true }),
  ).toBeVisible();
});

test("measure production business render at desktop and mobile widths", async ({
  page,
}) => {
  const metrics = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const started = Date.now();
    if (width === 1440) await page.goto("./#/business");
    else await page.reload();
    await expect(
      page.getByRole("heading", { name: "Business Pulse", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".m-chart svg").first()).toBeVisible();
    metrics.push({
      width,
      readyMs: Date.now() - started,
      ...(await page.evaluate(() => ({
        paint: performance
          .getEntriesByType("paint")
          .map((e) => ({ name: e.name, startTime: e.startTime })),
        resources: performance.getEntriesByType("resource").length,
      }))),
    });
  }
  const { mkdirSync, writeFileSync } = await import("node:fs");
  mkdirSync("test-results/pages", { recursive: true });
  writeFileSync(
    "test-results/pages/business-performance.json",
    JSON.stringify(
      {
        environment:
          "Local production static Pages emulation, Chromium headless; one cold desktop and one warm mobile reload. Not physical mobile hardware, network throttling, FPS or statistical benchmark.",
        metrics,
      },
      null,
      2,
    ),
  );
});
