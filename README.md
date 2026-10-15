# Jarvis Nexus — Lead / Marketing Site (NSM)

What this is
------------
Jarvis Nexus (branded "NSM") is a marketing and lead-capture website for a 10-bot AI operations product targeted at South African small businesses. It is a primarily static HTML site with a small serverless helper (PayFast subscription redirect) and Vercel configuration for friendly routes and rewrites.

Stack
-----
- Language(s): HTML (primary), small amount of JavaScript (Node) for serverless helper
- Framework / runtime: Static site served on Vercel (serverless functions available under /api)
- Notable libraries / services: PayFast integration (server-side MD5 signature), external workflow/webhook endpoints (n8n), Google Fonts

How it's organized
------------------
Top-level tree (important files/directories only):
```
index.html                 # Main marketing landing page (theme, meta, hero, demo)
api/                       # Serverless endpoint(s) for payment/subscription helpers
  payfast-subscribe.js     # Node handler that builds PayFast redirect for subscriptions
vercel.json                # Vercel routing + headers (rewrites many friendly routes to .html + API rewrites)
*.html                     # Lots of content pages (leads.html, recovery.html, reviews.html, onboarding.html, etc.)
*.png / *.svg              # Open graph and favicon assets (og-cover.png, nsm-favicon*.png, nsm-logo-*.svg)
payfast-subscribe.js       # duplicate/alternate top-level copy (same handler)
```

How it fits together
---------------------
The repository is a static site where each customer-facing page is an HTML file (index.html plus many single-page files for features/packs). Vercel serves these static files and uses vercel.json to expose clean URLs (rewriting `/leads` → `/leads.html`, etc.). There is a small Node serverless function (api/payfast-subscribe.js) used to prepare and redirect a visitor to PayFast with a correctly-signed subscription payload. Several API routes are also proxied to an external n8n workflow (see vercel.json rewrites).

How to run it
--------------
Shortest path to view locally (no build step required):

- Quick preview (simple static server)
  - Python 3:
    - python -m http.server 3000
    - open http://localhost:3000/index.html
  - Node (serve):
    - npx serve -s . -l 3000
    - open http://localhost:3000/index.html

Notes about the serverless handler:
- api/payfast-subscribe.js is written for serverless environments (Vercel exposes files under /api when placed in `api/`).
- The repository currently contains PayFast credentials in the code — DO NOT deploy these credentials publicly. See Security below.

Deployment
----------
- This repo is configured for deployment to Vercel (vercel.json present).
- Vercel rewrites friendly paths (e.g., `/recovery`, `/reviews`, `/airbnb-pack`) to the corresponding HTML files and proxies some `/api/*` paths to external n8n webhook endpoints.
- To deploy: push the repo to a Git provider connected to Vercel and create a Vercel project pointing to the repository root. Vercel will serve the static HTML and optionally handle the `api/` serverless functions.

Important implementation notes and warnings
-------------------------------------------
- Secrets in source: api/payfast-subscribe.js contains plain-text merchant credentials (MERCHANT_ID, MERCHANT_KEY, PASSPHRASE). These are sensitive; remove them from the repository and provide credentials via environment variables or a secrets manager before any public deployment. Rotate the exposed secrets immediately.
- vercel.json rewrites show the site proxies several API endpoints to an external n8n instance (https://n8n-production-71d9.up.railway.app). Confirm those external endpoints and access controls before production use.
- There are two payfast-subscribe.js locations (one under `api/`, one top-level). Keep only the serverless `api/` copy for Vercel-style deployments to avoid confusion.

Suggested next steps
--------------------
- Remove hard-coded secrets from source and add ENV-based configuration for production.
- Add a LICENSE and a brief CONTRIBUTING.md if you plan to accept contributions.
- Consider adding a minimal README usage badge or deploy preview link (Vercel) to the repo top.

Try asking
----------
- Where should I store PayFast credentials and how do I reference them from api/payfast-subscribe.js in Vercel?
- The vercel.json rewrites proxy /api/payfast-subscribe to an external n8n webhook — do you want to use the local api/payfast-subscribe.js function instead or keep the proxy?
- Which HTML pages are the canonical marketing pages to update when we change pricing or plan names (e.g., which files contain pricing text besides index.html)?

Contact / Author
----------------
Founding contact information appears in index.html metadata (author/founder: Seth Mokone) — update as needed.
