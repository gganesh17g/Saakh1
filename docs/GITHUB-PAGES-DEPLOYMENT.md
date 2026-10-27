# GitHub Pages deployment and troubleshooting

## Verified target

Repository: **Ganesh-g18/Saakh** (public API confirmed). Default/trigger branch: **main**. Existing published URL: **https://ganesh-g18.github.io/Saakh/**. This is the target URL, not a claim that the repaired code is already live.

## Publish the repair

1. Apply the changed files listed in FILE-CHANGES-REPORT.md to the repository, preserving any newer/unrelated changes. The provided local folder has no .git metadata; do not initialize/reset it merely to overwrite an existing remote history. Use your authenticated checkout or upload the reviewed changed files.
2. In repository **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**. Do not choose source-root or docs-folder publishing for this Vite source tree.
3. Commit/push the reviewed repair to **main**. The **Deploy Saakh to GitHub Pages** workflow runs automatically. Alternatively use Actions → that workflow → Run workflow on main.
4. Ensure Actions is permitted and the `github-pages` environment allows deployment from main. Approve its deployment if the repository has a protection rule. Workflow uses the provided scoped GITHUB_TOKEN and OIDC; no personal access token/API key is required.
5. Confirm both build and deploy jobs succeed. Open the URL emitted by `steps.deployment.outputs.page_url` and validate the checks below.

The build job installs with npm ci, runs TypeScript/lint/unit tests, reads Pages metadata, builds, installs Chromium and tests the actual dist at the metadata prefix, then uploads **dist**. The deploy job uses the official deploy-pages action. Full action commit SHAs are pinned. Build token has contents/pages read; deploy token has pages/id-token write. Concurrency group pages serializes deployments without cancelling an active deployment.

## Local commands

```sh
cd /home/thunder/shared/Saakh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:pages
npm run preview:pages
```

Strict static preview: **http://127.0.0.1:4175/Saakh/**. Use `npm run preview` for Vite preview, normally **http://localhost:4173/Saakh/**. Vite preview is a local tool, not a production hosting service. Development uses `npm run dev` at root and retains clean URLs, so the existing 13-test development suite remains `npm run test:e2e`.

Do not publish index.html from the source root. The source `/src/main.tsx` entry is intentionally a Vite input; only the built dist/index.html points at compiled browser JS. The favicon token is likewise replaced during build.

## URLs and routes

- Landing: `https://ganesh-g18.github.io/Saakh/`
- Overview: `https://ganesh-g18.github.io/Saakh/#/app`
- Generate: `https://ganesh-g18.github.io/Saakh/#/app/generate`
- Investigate: `https://ganesh-g18.github.io/Saakh/#/app/verify`
- Attack Lab: `https://ganesh-g18.github.io/Saakh/#/app/attack`
- Impact: `https://ganesh-g18.github.io/Saakh/#/app/impact`

HashRouter has no /Saakh basename: the prefix is the document location, while /app is inside the fragment. Do not add it again inside the hash. All five direct hash links and reload/back/forward are tested. Generated 404.html migrates legacy `/Saakh/app/...` requests to hash URLs after an HTTP 404 response. Unknown non-app server paths remain a custom 404 with a homepage recovery link; unknown client hash routes show the existing app fallback.

## Other deployment bases

Default production base **/Saakh/** was verified from the user-provided live URL and public repository metadata, not guessed from the local folder. A root/custom-domain build can use:

```sh
SAAKH_BASE_PATH=/ npm run build
SAAKH_BASE_PATH=/ npm run test:pages
SAAKH_BASE_PATH=/ npm run preview:pages
```

Use the same value for the build and preview/tests. In Actions the base is `${{ steps.pages.outputs.base_path }}/`, supporting repository sites and root sites based on actual Pages configuration. Metadata/configuration must be correct for custom-domain deployments; DNS is not validated by local tests. Invalid bases fail the build with a useful error.

## Verify the live release

- View page source: it must contain `/Saakh/assets/...js` and CSS, not `/src/main.tsx`.
- Browser Network: JS/CSS/favicon and lazy modules return 200 with proper types. Console has no unexpected errors.
- Launch workspace, visit all five areas, open a direct hash link and refresh it. Use back/forward and mobile navigation.
- Run Anjali Foods, inspect a factor and trade evidence, run Attack Lab, view economics, export JSON, and refresh saved history.
- Confirm WebGL rotates/zooms or the data-driven 2D inspector works if unsupported.
- Check that a known legacy clean app link migrates; expect its initial HTTP 404 document.

## Troubleshooting

| Symptom                                         | Check / remedy                                                                                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Blank body, `/src/main.tsx` 404                 | Source tree is being published. Select GitHub Actions and deploy the built dist artifact.                                                |
| `/assets/...` 404 on project site               | Wrong/stale base build. Rebuild with /Saakh/ or metadata base and upload all dist files together.                                        |
| Route works by click but fails on reload        | Use `#/app/...` direct links; confirm production build and emitted 404.html.                                                             |
| `%BASE_URL%` visible in published HTML          | Source entry was published without a Vite build.                                                                                         |
| Dynamic module fetch failure after update       | Verify the new artifact includes every lazy chunk; reload after completed deploy. A React boundary shows failures after bootstrap.       |
| configure-pages fails                           | Confirm Pages is enabled with GitHub Actions source and token/repository policy permits metadata access.                                 |
| Deploy job blocked                              | Check github-pages environment protection/approval and pages/id-token write permissions.                                                 |
| No 3D                                           | Capability fallback should offer SVG; a runtime graphics error is displayed with 2D recovery. Check browser WebGL support.               |
| Last note missing immediately after hard reload | Notes persist asynchronously; allow the write to commit before navigating away or closing. No storage was cleared by the deployment fix. |

## Verified status

Local production validation passed, including exact /Saakh/ prefix and a root-base override smoke suite. **Live repaired deployment is pending** because no authenticated GitHub publication occurred. See DEPLOYMENT-VALIDATION.md and GITHUB-PAGES-FIX-REPORT.md for captured evidence and intermediate failures.

## References

- [Vite static deployment guidance](https://vite.dev/guide/static-deploy): project-repository base and publishing built dist.
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages): official build/upload/deploy flow and permissions.
- [GitHub publishing-source settings](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site): select GitHub Actions.
- [React Router HashRouter](https://reactrouter.com/api/declarative-routers/HashRouter): route fragment is not sent to the server.
- [configure-pages metadata outputs](https://github.com/actions/configure-pages/blob/45bfe0192ca1faeb007ade9deae92b16b8254a0d/action.yml): authoritative base_path output.

Reviewed 26 October 2026. Action SHAs were taken from the official Vite workflow example and the workflow was checked with actionlint. These references describe platform behavior, not successful deployment of this repair.
