import { defineConfig } from "@playwright/test";
const basePath = process.env.SAAKH_BASE_PATH ?? "/Saakh1/";
export default defineConfig({
  testDir: "./tests/pages",
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 2,
  use: {
    baseURL:
      process.env.SAAKH_TEST_URL ||
      `http://127.0.0.1:4175${basePath.endsWith("/") ? basePath : basePath + "/"}`,
    headless: true,
    launchOptions: { args: ["--no-sandbox", "--enable-unsafe-swiftshader"] },
  },
  webServer: process.env.SAAKH_TEST_URL
    ? undefined
    : {
        command: "node scripts/serve-pages.mjs",
        url: `http://127.0.0.1:4175${basePath}`,
        reuseExistingServer: false,
      },
  outputDir: "test-results/pages",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/pages-results.json" }],
  ],
});
