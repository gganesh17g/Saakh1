import { test, expect } from "@playwright/test";
test("seven role entry choices preserve the shared business", async ({
  page,
}) => {
  await page.goto("./#/demo-login");
  const choices = page
    .getByRole("group", { name: "Choose demo role" })
    .getByRole("button");
  await expect(choices).toHaveCount(7);
  for (let i = 0; i < 7; i++) {
    await page.goto("./#/demo-login");
    await choices.nth(i).click();
    await expect(page.locator(".m-sidebar")).toBeVisible();
    await expect(page.locator(".m-business-bar")).toContainText("Shree Ganesh");
  }
});
test("public hero and business header fit all requested widths in both themes", async ({
  page,
}) => {
  for (const theme of ["light", "dark"]) {
    await page.goto("./");
    await page.evaluate((t) => localStorage.setItem("saakh-theme", t), theme);
    for (const width of [
      320, 360, 390, 430, 768, 1024, 1280, 1440, 1600, 1920,
    ]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("./");
      await expect(page.locator(".hero-score")).toBeVisible();
      const network = await page.locator(".hero-visual .network").boundingBox();
      const score = await page.locator(".hero-score").boundingBox();
      expect(score!.y).toBeGreaterThanOrEqual(network!.y + network!.height);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: `test-results/premium41-${theme}-${width}-public.png`,
          fullPage: true,
        });
      await page.goto("./#/business");
      await expect(page.locator(".w4-tools")).toBeVisible();
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: `test-results/premium41-${theme}-${width}-workspace.png`,
          fullPage: true,
        });
      await page.goto("./#/demo-login");
      await expect(
        page
          .getByRole("group", { name: "Choose demo role" })
          .getByRole("button"),
      ).toHaveCount(7);
      if ([390, 1440].includes(width))
        await page.screenshot({
          path: `test-results/premium41-${theme}-${width}-roles.png`,
          fullPage: true,
        });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});
test("appearance dialog saves globally and dismisses with Escape", async ({
  page,
}) => {
  await page.goto("./#/business/preferences");
  await page.getByRole("button", { name: "Choose appearance" }).click();
  await page
    .getByRole("combobox", { name: "Theme", exact: true })
    .selectOption("light");
  await page.getByRole("button", { name: "Save appearance" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Choose appearance" }).click();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Appearance settings" }),
  ).not.toBeVisible();
});
