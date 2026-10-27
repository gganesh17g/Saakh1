import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
test("measure local business render and capture light and dark layouts", async ({
  page,
}) => {
  const metrics = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    const start = Date.now();
    await page.goto("/business");
    await expect(
      page.getByRole("heading", { name: "Business Pulse", exact: true }),
    ).toBeVisible();
    await expect(page.locator(".m-chart svg").first()).toBeVisible();
    metrics.push({
      width,
      readyMs: Date.now() - start,
      ...(await page.evaluate(() => ({
        paint: performance
          .getEntriesByType("paint")
          .map((e) => ({ name: e.name, startTime: e.startTime })),
        resources: performance.getEntriesByType("resource").length,
      }))),
    });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem("saakh-theme", "light"));
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Business Pulse", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/business-light.png",
    fullPage: true,
  });
  await page.addInitScript(() => localStorage.setItem("saakh-theme", "dark"));
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Business Pulse", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/business-dark.png",
    fullPage: true,
  });
  writeFileSync(
    "test-results/business-performance.json",
    JSON.stringify(
      {
        environment:
          "Local Vite development server, Chromium headless. One run per viewport; not production/mobile hardware or FPS benchmark.",
        metrics,
      },
      null,
      2,
    ),
  );
});
