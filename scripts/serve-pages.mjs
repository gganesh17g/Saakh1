// Strict static server for deployment validation. No implicit SPA fallback.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
const root = resolve(process.env.SAAKH_DIST_DIR || "dist");
const inputBase = process.env.SAAKH_BASE_PATH ?? "/Saakh/";
const base = inputBase === "/" ? "/" : inputBase.replace(/\/$/, "") + "/";
const port = Number(process.env.SAAKH_PORT || 4175);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".png": "image/png",
  ".woff2": "font/woff2",
};
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    if (base !== "/" && pathname === base.slice(0, -1)) {
      res.writeHead(308, { Location: base });
      return res.end();
    }
    if (!pathname.startsWith(base)) {
      res.writeHead(404);
      return res.end("Outside configured deployment path");
    }
    const relative = pathname.slice(base.length) || "index.html";
    const file = resolve(root, relative);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403);
      return res.end();
    }
    let data;
    try {
      if (!(await stat(file)).isFile()) throw new Error("Not a file");
      data = await readFile(file);
    } catch {
      res.statusCode = 404;
      if (!extname(relative)) {
        try {
          data = await readFile(resolve(root, "404.html"));
          res.setHeader("Content-Type", types[".html"]);
        } catch {
          data = "Record not found";
        }
      } else data = "Asset not found";
      res.setHeader("Cache-Control", "no-store");
      return res.end(data);
    }
    res.setHeader(
      "Content-Type",
      types[extname(file)] || "application/octet-stream",
    );
    res.setHeader("Cache-Control", "no-store");
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(
    `Strict Pages fixture: http://127.0.0.1:${port}${base} -> ${root}`,
  ),
);
