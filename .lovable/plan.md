## Bonki — Mobile Funnel Walkthrough PDF

A print-ready PDF documenting the complete mobile user journey through the live Bonki app, from first login to paid product access. Captured at iPhone viewport (390×844), one screen per page with Swedish-context annotations describing what the user sees and does.

### Funnel steps to capture

Routes captured against the **live preview** (`id-preview--…lovable.app`), using `?devState=` query params to reach gated states without real auth/payment.

| # | Step | Route | State source |
|---|------|-------|--------------|
| 1 | Login screen | `/login` | logged-out |
| 2 | Onboarding — audience select | `/?devState=solo` | onboarding entry |
| 3 | Onboarding — second step | continued in flow | natural progression |
| 4 | Product Library (Lobby) | `/` after onboarding | post-onboarding |
| 5 | Product Home — Vårt Vi (couples) | `/product/still-us` | direct |
| 6 | Product Intro — welcome flow | first visit | natural |
| 7 | Kids Product Home — e.g. Jag i Mig | `/product/jag-i-mig` | direct |
| 8 | Category / Portal view | `/product/jag-i-mig/portal/<cat>` | direct |
| 9 | Session — first step (free card) | `/card/<freeCardId>` | direct |
| 10 | Session — mid-session step | scroll/advance | natural |
| 11 | Session complete screen | `/session/<id>/complete` (Still Us) or natural | natural |
| 12 | Paywall (locked product) | `/product/<paid-slug>` without access | paywall trigger |
| 13 | Full-screen paywall variant | `/paywall-full` or `/unlock` | direct |
| 14 | Mocked "Paid" state — unlocked product home | `/?devState=browse` → `/product/...` | devState=browse |
| 15 | Journal / Diary (post-session artifact) | `/journal` | direct |

Exact card IDs and product slugs will be read from `src/data/products/*.ts` and `src/lib/freeCardPolicy.ts` to ensure free-card routes are valid.

### PDF structure

- **Cover** — dark Midnight Ink background, BONKI logo, title "Mobile Funnel Walkthrough", date, "Live preview capture".
- **Funnel map page** — one-page ASCII/diagram overview of all 15 steps so a reader can orient.
- **One screen per page** (15 pages):
  - Top: step number + short title (e.g. "04 · Bibliotek (Lobby)")
  - Centered iPhone-style frame containing the screenshot
  - Below frame: 2–3 line caption — what the user sees, what action moves them forward, route path in mono
- **Closing page** — notes on what was mocked vs live (paid state via devState=browse), and which routes are intentionally excluded (legacy routes redirected in `App.tsx`).

### Capture approach

1. Use `browser--navigate_to_sandbox` with `width: 390, height: 844` to set iPhone viewport.
2. Visit each route in sequence; for onboarding/session interactions use `browser--act` to advance steps where needed (tap "Fortsätt", select audience tile, etc.).
3. `browser--screenshot` after each screen settles. Save raw PNGs to `/tmp/funnel/NN-name.png`.
4. If the browser session fails to start, fall back to capturing as many states as possible and clearly annotate any missing pages in the PDF rather than retrying repeatedly.

### PDF generation

Python + `reportlab` (Platypus), reusing the font + style patterns from prior Bonki PDFs (DejaVuSans for Swedish chars, dark cover + light interior). The phone frame is a simple rounded-rectangle wrapper drawn around the screenshot (no chrome bezels — clean editorial look matching the existing catalogue PDF).

### QA

After generation, render every page via `pdftoppm -jpeg -r 150` and inspect each JPEG for: clipped captions, screenshots not centered, low-contrast text, missing Swedish glyphs, blank pages. Iterate until clean. QA images deleted after.

### Deliverable

- `/mnt/documents/bonki-funnel-walkthrough.pdf` (~17 pages, print-ready A4)
- Surfaced via `<lov-artifact>` tag in the final reply.

### Out of scope

- bonkiapp.com marketing site (per your scope choice — app only).
- Desktop viewport screenshots.
- Real Stripe checkout / real paid-account capture (paid state is visually mocked via `devState=browse`).
