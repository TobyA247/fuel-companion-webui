# Fuel Companion GitHub Pages UI

This folder contains a tiny static frontend for Fuel Companion.

It supports:

- `Quick Fuel`
  current location only
- `Trip Fuel`
  current location plus destination coordinates
- explicit destination search on tap

It is designed to be hosted on GitHub Pages and post directly to your n8n router webhook.

Current status: the page expects the current Pi-hosted n8n webhook URL from the tunnel helper. The Cloudflare quick-tunnel hostname changes after some Pi/container restarts, so do not hard-code an old hostname into the page.

## Repo-ready

This folder is set up as its own small GitHub Pages project.

It includes:

- `.github/workflows/deploy-pages.yml`
- `.nojekyll`
- static assets at repo root

That means it can be published by pushing this folder into its own GitHub repository and letting the Pages workflow deploy it.

Current GitHub Pages URL:

```text
https://tobya247.github.io/fuel-companion-webui/
```

Use this URL on iPhone. Avoid opening `index.html` via `file://` for real webhook tests because browsers apply stricter cross-origin rules there.

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

For GitHub Pages or iPhone browser use, get the current Cloudflare front door from the Pi tunnel helper:

```text
http://192.168.1.126:8088/frontdoor.txt
```

Use it with the standard router production path:

```text
https://<current-cloudflare-host>/webhook/fuel-companion-router-v1
```

The UI sends JSON as `text/plain` on purpose. This keeps the browser request simple and avoids an extra CORS preflight through the temporary Cloudflare quick tunnel. The n8n country router parses this format and returns CORS headers.

For LAN testing against the Raspberry Pi n8n instance:

```text
http://192.168.1.126:5678/webhook/fuel-companion-router-v1
```

This works from a local browser context that allows LAN HTTP. It is not enough for the hosted GitHub Pages site.

For the old laptop Docker stack:

```text
http://localhost:5678/webhook/fuel-companion-router-v1
```

For a future named tunnel or custom domain, use your router webhook over HTTPS so the frontend does not need separate country endpoints:

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

Also note:

- GitHub Pages is HTTPS
- browsers will block a call from that page to a plain `http://localhost` or LAN `http://192.168.1.126` webhook
- the Cloudflare quick tunnel works for testing, but the URL can change if the tunnel container is recreated
- use the Pi helper as the source of truth for the current public webhook URL
