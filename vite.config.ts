import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";

// Verified public repository: Ganesh-g18/Saakh. Actions supplies authoritative Pages metadata.
export function normalizeBase(value: string): string {
  const base = value === "" ? "/" : value.endsWith("/") ? value : value + "/";
  if (!/^\/(?:[A-Za-z0-9._~-]+\/)*$/.test(base)) {
    throw new Error(
      "SAAKH_BASE_PATH must be an absolute directory path, such as /Saakh/ or /.",
    );
  }
  return base;
}
export default defineConfig(({ command, isPreview }) => {
  const base =
    command === "serve" && !isPreview
      ? "/"
      : normalizeBase(process.env.SAAKH_BASE_PATH ?? "/Saakh/");
  return {
    base,
    plugins: [
      react(),
      tailwind(),
      {
        name: "saakh-pages-fallback",
        generateBundle() {
          // GitHub serves this document with HTTP 404. Only legacy app links are migrated.
          const baseLiteral = JSON.stringify(base);
          this.emitFile({
            type: "asset",
            fileName: "404.html",
            source: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Saakh — page not found</title></head><body style="background:#080d18;color:#f3f6fc;font:16px system-ui;padding:40px"><main><h1>Page not found</h1><p>This address is not a published Saakh page.</p><a id="home" style="color:#49d9ff">Return to Saakh</a></main><script>const base=${baseLiteral};document.getElementById('home').href=base;const path=location.pathname.startsWith(base)?'/'+location.pathname.slice(base.length):'';if(path==='/app'||path.startsWith('/app/')||path==='/business'||path.startsWith('/business/')||path.startsWith('/product/'))location.replace(base+'#'+path+location.search);</script></body></html>`,
          });
          this.emitFile({ type: "asset", fileName: ".nojekyll", source: "" });
        },
      },
    ],
    test: { environment: "jsdom", include: ["src/**/*.test.{ts,tsx}"] },
  };
});
