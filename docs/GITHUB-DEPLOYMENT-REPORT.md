# GitHub deployment report — Saakh1

Repository: `gganesh17g/Saakh1`; branch: main. Expected URL: https://gganesh17g.github.io/Saakh1/. Production base: `/Saakh1/`. Development base `/`; production HashRouter; existing 404 migration and root/graph error boundaries retained.

## Evidence-based diagnosis

The original local revision still defaulted to `/Saakh/`; remote correction `4cd6e8c16a2c71695f3fe6cbbfac645b531a6c64` had already changed it to `/Saakh1/`. That correction was fetched and preserved, not recreated or claimed as new work. Earlier custom workflow run 40454270331 failed specifically at configure-pages with “Get Pages site failed … Not Found”; subsequent build/test/deploy steps were skipped. The log confirms an unavailable/misconfigured Pages site at that earlier time, not an engine or WebGL failure.

At this task’s baseline, the current site returned HTTP 200 with compiled `/Saakh1/assets/...` scripts and rendered the public website in a real browser. Therefore a current blank screen was not reproduced. The later custom workflow 40455522689 succeeded, including browser tests and deployment. A separate branch/Jekyll workflow 40455522861 ran on the same commit. That confirms competing publication mechanisms were active in the history, but does not establish the current authenticated Source setting. Source must be GitHub Actions to avoid publishing unbuilt source in later branch builds.

## Release controls

Vite’s corrected base is preserved; static preview/test defaults are aligned. The build now emits release.json plus HTML release metadata; workflow supplies github.sha so live identity can be compared with the deployment commit. No `/src/main.tsx` is published by the artifact workflow; only dist is uploaded. Official pinned checkout/setup-node/configure-pages/upload-pages-artifact/deploy-pages steps and least-privilege job permissions remain. No administrator token is embedded in the workflow or client.

GitHub’s Pages settings-update API requires both Pages-write and Administration-write permissions. The Actions token cannot provide Administration permissions. The connector can publish source but has no Pages-setting mutation tool, and the browser is signed out. A manual Source confirmation/change has been requested while independent release work continues. Exact action: Repository Settings → Pages → Build and deployment → Source → GitHub Actions. This is a tool capability boundary, not a request for additional code-push authorization.

## Current result

Local release validation and publishing are in progress. Commit SHA, associated workflow URL/status, artifact, deployment result and live exact-SHA checks will be updated after actual execution. Do not interpret this initial report as successful publication.

References: [GitHub Pages REST update requirements](https://docs.github.com/en/rest/pages/pages#update-information-about-a-github-pages-site), [custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
