# Live-site validation — Saakh1

Target: https://gganesh17g.github.io/Saakh1/.

Baseline check on 27 October 2026: HTTP 200; compiled JavaScript/CSS under /Saakh1/assets/; public React content visibly rendered in the browser. There was no `/src/main.tsx` entry in that response. This baseline predates the new release and is not evidence that the forthcoming release is live.

After publishing, isolated Playwright contexts will verify the release.json and HTML commit identity, actual JS/CSS/image responses, all public pages, all 14 business modules, deep-link refresh/new tab/Back/Forward, credit routes/graph/scenario/evidence/Attack Lab, one complete invoice/partial-collection/balanced-export flow, and widths 320/375/430/768/1024/1280/1440/1920. Actual pass/fail counts, screenshots and findings will replace this pending status. No existing demo data is reset by isolated test contexts.
