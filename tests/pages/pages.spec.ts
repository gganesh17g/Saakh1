import { test, expect, type Page } from "@playwright/test";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";
function monitor(page: Page) {
  const errors: string[] = [];
  const failures: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("requestfailed", (r) =>
    failures.push(`${r.method()} ${r.url()} ${r.failure()?.errorText}`),
  );
  page.on("response", (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });
  return { errors, failures };
}
const routes = [
  ["/app", "Intelligence overview."],
  ["/app/generate", "Generate simulation."],
  ["/app/verify", "Verify & investigate."],
  ["/app/attack", "Attack lab."],
  ["/app/impact", "Impact dashboard."],
] as const;

test("production entry, favicon and every compiled asset resolve at the configured Pages path", async ({
  page,
  request,
  baseURL,
}) => {
  const seen = monitor(page);
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: /See the business/ }),
  ).toBeVisible();
  await expect(page.locator(".network canvas")).toBeVisible();
  const entry = await request.get("./");
  const html = await entry.text();
  expect(html).not.toContain("/src/main.tsx");
  const pathname = new URL(baseURL!).pathname;
  const scripts = await page
    .locator("script[src]")
    .evaluateAll((es) => es.map((e) => (e as HTMLScriptElement).src));
  expect(scripts.length).toBeGreaterThan(0);
  expect(
    scripts.every((s) => new URL(s).pathname.startsWith(pathname + "assets/")),
  ).toBe(true);
  const links = await page
    .locator('link[rel="stylesheet"],link[rel="icon"]')
    .evaluateAll((es) => es.map((e) => (e as HTMLLinkElement).href));
  for (const url of links) {
    expect(new URL(url).pathname.startsWith(pathname)).toBe(true);
    expect((await request.get(url)).status()).toBe(200);
  }
  for (const file of await readdir(
    resolve(process.env.SAAKH_DIST_DIR || "dist", "assets"),
  )) {
    const response = await request.get("./assets/" + file);
    expect(response.status(), file).toBe(200);
    if (file.endsWith(".js"))
      expect(response.headers()["content-type"]).toContain("javascript");
    if (file.endsWith(".css"))
      expect(response.headers()["content-type"]).toContain("text/css");
  }
  expect((await request.get("./.nojekyll")).status()).toBe(200);
  if (pathname !== "/")
    expect((await request.get("/assets/not-a-real-asset.js")).status()).toBe(
      404,
    );
  expect(seen.errors).toEqual([]);
  expect(seen.failures).toEqual([]);
});

test("all workspace routes support direct hash links, refresh, back and forward", async ({
  page,
}) => {
  const seen = monitor(page);
  for (const [route, title] of routes) {
    await page.goto("./#" + route);
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  await page
    .getByRole("link", { name: "Impact Dashboard", exact: true })
    .click();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Intelligence overview.", exact: true }),
  ).toBeVisible();
  await page.goForward();
  await expect(
    page.getByRole("heading", { name: "Impact dashboard.", exact: true }),
  ).toBeVisible();
  expect(seen.errors).toEqual([]);
  expect(seen.failures).toEqual([]);
});

test("production simulation, evidence, scenarios, impact, export and persisted history", async ({
  page,
}) => {
  const seen = monitor(page);
  await page.goto("./#/app");
  await expect(page.locator(".network canvas")).toBeVisible();
  await page.getByLabel("Select business").selectOption("anjali");
  await page
    .getByRole("button", { name: "Run simulation", exact: true })
    .click();
  await expect(page.locator(".snapshot-line")).toContainText("completed");
  await page.getByRole("button", { name: /Cash-flow stability/ }).click();
  await expect(page.locator(".xray")).toContainText("CV");
  await page.getByRole("link", { name: "Verify & Investigate" }).click();
  await page.getByLabel("Search records").fill("anjali-inv0");
  await page.getByText("Keyboard inspection").click();
  await page.getByRole("button", { name: "anjali-tx0", exact: true }).click();
  await expect(page.locator(".evidence-pre")).toContainText("anjali-inv0");
  await page
    .getByLabel("Notes, unresolved questions & draft assessment")
    .fill("Pages-path persistence verified.");
  // An explicit reload can abort a pending IndexedDB write. Verify durable commit first.
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<boolean>((resolve, reject) => {
            const open = indexedDB.open("keyval-store");
            open.onerror = () => reject(open.error);
            open.onsuccess = () => {
              const db = open.result;
              const tx = db.transaction("keyval", "readonly");
              const read = tx.objectStore("keyval").get("notes");
              read.onsuccess = () =>
                resolve(
                  Object.values(read.result || {}).includes(
                    "Pages-path persistence verified.",
                  ),
                );
              read.onerror = () => reject(read.error);
              tx.oncomplete = () => db.close();
            };
          }),
      ),
    )
    .toBe(true);
  await page.reload();
  await expect(
    page.getByLabel("Notes, unresolved questions & draft assessment"),
  ).toHaveValue("Pages-path persistence verified.");
  await page.getByRole("link", { name: "Attack Lab", exact: false }).click();
  await page.getByRole("button", { name: "Run all tests" }).click();
  await expect(page.getByText("PASS", { exact: true })).toHaveCount(6);
  await page.getByRole("link", { name: "Impact Dashboard" }).click();
  await expect(page.getByText("7.00× benefit-to-cost")).toBeVisible();
  await page.getByRole("link", { name: "Reports", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON report" }).click();
  const file = await (await download).path();
  const record = JSON.parse(await readFile(file!, "utf8"));
  expect(record.borrower.id).toBe("anjali");
  expect(record.score).toBeGreaterThan(0);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Export history (1)" }),
  ).toBeVisible();
  expect(seen.errors).toEqual([]);
  expect(seen.failures).toEqual([]);
});

test("unsupported WebGL falls back to the selectable 2D financial graph", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      type: string,
      ...args: unknown[]
    ) {
      if (
        type === "webgl" ||
        type === "webgl2" ||
        type === "experimental-webgl"
      )
        return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  const seen = monitor(page);
  await page.goto("./#/app");
  await expect(
    page.getByRole("img", { name: "Interactive trade graph" }),
  ).toBeVisible();
  await page.getByText("Keyboard inspection").click();
  await page.getByRole("button", { name: "anjali-tx0", exact: true }).click();
  await expect(page.locator(".evidence")).toContainText("anjali-inv0");
  expect(seen.errors).toEqual([]);
  expect(seen.failures).toEqual([]);
});

test("landing section links and skip link preserve the hash router", async ({
  page,
}) => {
  const seen = monitor(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("./");
  await page.getByRole("link", { name: "Intelligence", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /Credit intelligence,/ }),
  ).toBeInViewport();
  expect(new URL(page.url()).hash).not.toBe("#intelligence");
  await page.getByRole("link", { name: "How it works", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: /What changes when/ }),
  ).toBeInViewport();
  await page
    .getByRole("link", { name: "Explore intelligence workspace" })
    .click();
  await page.getByRole("link", { name: "Skip to content" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main")).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Intelligence overview.", exact: true }),
  ).toBeVisible();
  expect(seen.errors).toEqual([]);
  expect(seen.failures).toEqual([]);
});

test("unknown client routes recover and legacy clean app links use the emitted 404 migration", async ({
  page,
  request,
}) => {
  await page.goto("./#/does-not-exist");
  await expect(
    page.getByRole("heading", { name: "Page not found", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Return to Saakh", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /See the business/ }),
  ).toBeVisible();
  const legacy = await request.get("./app/verify");
  expect(legacy.status()).toBe(404);
  expect(await legacy.text()).toContain("location.replace");
  await page.goto("./app/verify");
  await expect(
    page.getByRole("heading", { name: "Verify & investigate.", exact: true }),
  ).toBeVisible();
  expect(new URL(page.url()).hash).toBe("#/app/verify");
});

for (const width of [1440, 1280, 1024, 768, 390, 360])
  test(`Pages production responsive views at ${width}px`, async ({ page }) => {
    const seen = monitor(page);
    await page.setViewportSize({ width, height: 900 });
    await page.goto("./");
    await expect(
      page.getByRole("heading", { name: /See the business/ }),
    ).toBeVisible();
    await page
      .locator(
        '.network canvas, .network svg[aria-label="Interactive trade graph"]',
      )
      .waitFor({ state: "visible" });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    for (const [route, title] of routes) {
      await page.goto("./#" + route);
      await expect(
        page.getByRole("heading", { name: title, exact: true }),
      ).toBeVisible();
      if (route === "/app" || route === "/app/verify")
        await page
          .locator(
            '.network canvas, .network svg[aria-label="Interactive trade graph"]',
          )
          .waitFor({ state: "visible" });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
        route,
      ).toBe(true);
    }
    expect(seen.errors).toEqual([]);
    expect(seen.failures).toEqual([]);
  });

test("mobile menu reaches all primary areas", async ({ page }) => {
  const seen = monitor(page);
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("./#/app");
  for (const [name, title] of [
    ["Generate Simulation", "Generate simulation."],
    ["Verify & Investigate", "Verify & investigate."],
    ["Attack Lab", "Attack lab."],
    ["Impact Dashboard", "Impact dashboard."],
    ["Overview", "Intelligence overview."],
  ]) {
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await page
      .getByRole("link", { name, exact: name !== "Attack Lab" })
      .click();
    await expect(
      page.getByRole("heading", { name: title, exact: true }),
    ).toBeVisible();
  }
  expect(seen.errors).toEqual([]);
  expect(seen.failures).toEqual([]);
});

test("capture repaired production workspace", async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem("saakh-theme", "dark"));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("./#/app");
  await expect(
    page.getByRole("heading", { name: "Intelligence overview.", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".network canvas")).toBeVisible();
  await page.screenshot({ path: info.outputPath("pages-workspace.png") });
});
