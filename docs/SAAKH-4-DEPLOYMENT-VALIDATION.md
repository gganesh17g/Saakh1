# Saakh 4.0 deployment validation

**Verified application commit:** `673a972fedca0359af3a8f94f95c2e59c34ea6c3`.

- Repository: `gganesh17g/Saakh1`, branch `main`.
- Live site: https://gganesh17g.github.io/Saakh1/
- Vite production base: `/Saakh1/`; production HashRouter. No runtime Node server.
- Workflow: `.github/workflows/deploy.yml`, main push or manual dispatch; official pinned actions, full checks, `dist`-only upload.
- Successful workflow: https://github.com/gganesh17g/Saakh1/actions/runs/40677057757
- Build job `122778051468`; deploy job `122779470565`; both completed successfully.
- Non-expired artifact `github-pages`, ID `12811650301`, **839295 bytes**.
- Decoded cloud logs show **156 unit, 33 development-browser and 61 production-browser tests passed**; cloud Vite build **7.13 seconds**.
- Public `release.json` returned HTTP 200 with the exact application commit and `/Saakh1/`; HTML release metadata also matched. Entry JS/CSS and all checked compiled assets returned correct 200/MIME responses.

## Public acceptance

Executed `SAAKH_TEST_URL=https://gganesh17g.github.io/Saakh1/ SAAKH_EXPECTED_SHA=673a972fedca0359af3a8f94f95c2e59c34ea6c3 npm run test:pages`: **61 passed, 0 failed, 0 skipped, 0 flaky**. Raw evidence: `docs/saakh4-evidence/live-tests.json`.

The first full live run passed 60 and failed one harness assertion requiring `.nojekyll` to be publicly served. Direct requests confirmed HTTP 404 for this non-runtime control file and HTTP 200 for the favicon; every compiled JS/CSS check had already passed. The corrected test strictly verifies the emitted empty control file, preserves every runtime asset/MIME check, and annotates public control-file visibility. Targeted live and local tests then passed, followed by the full 61-test live run. This was a test-contract correction, not a hidden runtime asset failure.

| Area | Before upgrade | Verified Saakh 4 application |
| --- | --- | --- |
| Asset loading | Passed in unchanged baseline production suite | Passed locally, cloud and live |
| Router navigation | Passed baseline | Passed, including new routes |
| Direct supported URLs | Passed baseline hash/static-404 migration | Passed live; legacy clean URLs migrate |
| Browser refresh/history | Passed baseline | Passed live; records restored |
| JavaScript errors | No blocking errors in covered baseline flows | None in monitored final live flows |
| Runtime network requests | Passed baseline checks | Compiled JS/CSS/favicon passed; intentional 404 cases/control metadata are separately identified |
| Production build | Passed original source archive build | Passed local and cloud |
| GitHub Pages deployment | Prior Saakh 3 success retained in its dated reports; not freshly re-audited at task entry | Exact Saakh 4 identity and live workflows verified |

## Publication safeguards and final report follow-up

Entry working tree/index were clean at `4d5f438`. Local backup branch `backup/pre-saakh4-20261028` retains that state. Initial source `cb7ec4f` and the operation-permission fix `673a972` were published by non-forced compare-and-set updates only after their uploaded tree matched the staged Git tree. No unrelated remote work or existing documentation was removed.

The final follow-up changes reports/evidence and the hosting-control-file test contract, with **no application source change** from `673a972`. A later release identity therefore does not imply different financial behavior. Its workflow and exact identity are checked again and recorded in the final delivery artifact to avoid a document needing to contain its own future commit SHA.

Pages Source was previously set to **GitHub Actions** by the user. No new manual setting is required for the verified deployment. No fresh authenticated admin-settings API read is claimed. Legacy Jekyll/raw-source workflows remain non-deploying manual guidance. No secret/API key or production backend/authentication claim was introduced.
