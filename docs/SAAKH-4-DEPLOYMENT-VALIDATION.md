# Saakh 4.0 deployment validation

Repository `gganesh17g/Saakh1`; intended site `https://gganesh17g.github.io/Saakh1/`; production Vite base `/Saakh1/`; production HashRouter. The existing static 404 migration, `.nojekyll`, release identity metadata and compiled-only artifact workflow are preserved.

`.github/workflows/deploy.yml` triggers on main pushes or manual dispatch and runs dependency installation, typecheck, lint, unit tests, production build, development browser tests and Pages-subpath browser tests before uploading `dist` and deploying with official pinned actions. Legacy source/Jekyll workflows remain non-deploying manual guidance.

The remote main SHA was verified equal to the clean local baseline before implementation. Publication must use a non-forced compare-and-set update and must not overwrite concurrent remote work. Pages Source was previously set to GitHub Actions by the user. No fresh authenticated admin-settings read is claimed.

Live Saakh 4 publication and verification remain pending until the final release evidence is recorded here. Local validation alone is not proof that the public site has updated.
