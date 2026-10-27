import { test, expect } from "@playwright/test";
import { writeFileSync } from "node:fs";
test("local render profile and WebGL interaction", async ({ page }) => {
  const metrics: Record<string, unknown>[] = [];
  for (const path of ["/", "/app"]) {
    const started = Date.now();
    await page.goto(path);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".network canvas")).toBeVisible();
    const ready = Date.now() - started;
    metrics.push({
      route: path,
      readyMs: ready,
      ...(await page.evaluate(() => ({
        paint: performance
          .getEntriesByType("paint")
          .map((e) => ({ name: e.name, startTime: e.startTime })),
        resources: performance.getEntriesByType("resource").length,
        viewport: [innerWidth, innerHeight],
      }))),
    });
    const canvas = page.locator(".network canvas");
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 70,
      box.y + box.height / 2 + 20,
      { steps: 6 },
    );
    await page.mouse.up();
    await page.mouse.wheel(0, 100);
    await page.getByRole("button", { name: "Reset camera" }).click();
    await page.getByRole("button", { name: "Pause graph" }).click();
    await expect(
      page.getByRole("button", { name: "Resume graph" }),
    ).toBeVisible();
  }
  writeFileSync(
    "test-results/performance.json",
    JSON.stringify(
      {
        environment:
          "Local Vite development server, Chromium headless, software WebGL; not production or mobile hardware benchmark",
        metrics,
      },
      null,
      2,
    ),
  );
});
test("capture final dark product views", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("saakh-theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const [route, name] of [
    ["/", "landing"],
    ["/app", "workspace"],
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".network canvas")).toBeVisible();
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `test-results/saakh-${name}.png`,
      fullPage: true,
    });
    if (name === "workspace")
      await page.screenshot({ path: "test-results/saakh-preview.png" });
  }
});
