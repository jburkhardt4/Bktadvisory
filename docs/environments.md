# Environment Map

Use the public `/environments` route in the root app as the canonical visual index for the current BKT Advisory product surfaces.

## Local preview

Start the root app:

```bash
cd /workspaces/Bktadvisory
npm run dev
```

Start the standalone estimator in a second terminal:

```bash
cd /workspaces/Bktadvisory/Bktadvisoryprojectestimator
npm run dev
```

Expected local URLs:

- Root app: `http://localhost:5000`
- Standalone estimator: `http://localhost:5001`
- Environment map: `http://localhost:5000/environments`

## What the page shows

- Product-surface map for marketing, auth, client portal, admin portal, and standalone estimator
- Redirect boundary from `/estimator` to `https://estimator.bktadvisory.com`
- Auth-level badges so protected routes are visible without pretending they are public previews
- “Last 7 Days” timeline covering `2026-03-30` through `2026-04-06`

## Visual QA workflow

1. Open `/environments` in the root app.
2. Confirm each surface shows the correct local URL, live URL, route, and repo ownership.
3. Use the details drawer to verify the selected surface and weekly change notes.
4. Open protected portal paths only after signing in.
5. Run mobile checks in Codespaces preview with the map stacked vertically under `md`.
