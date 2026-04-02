# Fuel Companion GitHub Pages UI

This folder contains a tiny static frontend for Fuel Companion.

It supports:

- `Quick Fuel`
  current location only
- `Trip Fuel`
  current location plus destination coordinates
- explicit destination search on tap

It is designed to be hosted on GitHub Pages and post directly to your n8n router webhook.

## Repo-ready

This folder is set up as its own small GitHub Pages project.

It includes:

- `.github/workflows/deploy-pages.yml`
- `.nojekyll`
- static assets at repo root

That means it can be published by pushing this folder into its own GitHub repository and letting the Pages workflow deploy it.

## Destination search

The page supports one-click destination search using OpenStreetMap geocoding.

Important:

- it only searches when the user taps `Find`
- it does not use autocomplete
- this keeps usage light for a personal prototype
- GitHub Pages provides the HTTPS and referer needed for a browser-based page

## Files

- `index.html`
- `styles.css`
- `app.js`

## Suggested webhook

Use your router webhook so the frontend does not need separate country endpoints:

```text
https://YOUR_N8N_DOMAIN/webhook/fuel-companion-router-v1
```

Or in test mode while manually executing the workflow:

```text
https://YOUR_N8N_DOMAIN/webhook-test/fuel-companion-router-v1
```

## Security note

The page stores the agent key in browser local storage for convenience.

That is acceptable for a personal prototype, but for a production setup you should avoid exposing the key in browser code or browser storage.
