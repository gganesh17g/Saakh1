import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testIgnore: ["**/pages/**"],
  timeout: 60000,
  use: {
    baseURL: process.env.SAAKH_TEST_URL || "http://127.0.0.1:5173",
    headless: true,
    launchOptions: { args: ["--no-sandbox", "--enable-unsafe-swiftshader"] },
  },
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
  reporter: [["list"], ["html", { open: "never" }]],
});
