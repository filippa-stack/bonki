

## Real-app App Store gallery — captured from the live preview

You're right. The previous gallery was SVG mockups — gorgeous, but Apple's review guideline 2.3.3 ("Accurate Screenshots") rejects illustrations that don't match the shipping app. Throwing those out and rebuilding from real UI.

### The new approach in one line

Drive the **actual running app** in a browser sized to **1290×2796** (iPhone 16 Pro Max), navigate to each chosen state via your existing `?devState=` parameters, screenshot, then composite each capture into the framed-hero layout you already approved.

### Why this passes review and the previous pass didn't

- **Real DOM, real fonts, real illustrations, real colors** — no reconstruction.
- **Native target resolution** — captured at exactly 1290×2796, not upscaled from a 360px viewport.
- **Real product surfaces** — every pixel inside the device frame is your live UI.
- **Frame and caption are clearly marketing chrome** — Apple permits decorative framing and headline text around a real screenshot; what they reject is fabricated *content*. The app pixels themselves are unmodified.

### How the capture works

The browser tool can hold a 1290×2796 viewport (snaps to closest supported size — I'll verify the exact snap and document it), navigate to your existing dev-state routes, wait for animations to settle, and screenshot. I do this per frame, one at a time, with explicit waits for illustrations to load. This sidesteps the in-app `useCaptureController` (which has known html2canvas color-resolution issues and runs at the user's viewport, not 1290px).

### The 10 frames — mapped to real routes

Same vibrant lineup you approved, now bound to actual URLs in your app:

| # | Surface | Route | Dev state |
|---|---|---|---|
| 1 | Vårt Vi product home | `/product/still-us` | `solo` |
| 2 | Jag i Mig portal | `/product/jag-i-mig` | `browse` |
| 3 | Jag med Andra portal | `/product/jag-med-andra` | `browse` |
| 4 | Vardagskort portal | `/product/vardagskort` | `browse` |
| 5 | Active session — Vårt Vi opening | `/card/<su-card-id>` | `pairedActive` |
| 6 | Active session — Jag i Mig | `/card/<jim-card-id>` | `browse` |
| 7 | Reflection step (couple) | same Vårt Vi card, step 2 via `__sc_dev_step=1` | `pairedActive` |
| 8 | Card complete / takeaway | `/card/<id>` | `completed` |
| 9 | Syskonkort portal | `/product/syskonkort` | `browse` |
| 10 | Jag i Världen portal | `/product/jag-i-varlden` | `browse` |

Before capturing I'll verify each route exists by checking `App.tsx` routes + valid card IDs from the product manifests. If any state can't be reached cleanly, I'll either pick the nearest equivalent and tell you, or ask before deviating.

### Frame composition (unchanged from approved plan)

After capture, each real screenshot is composited via Pillow into:

- Tonal vibrant backdrop matched to the screen's dominant product color
- Realistic iPhone 16 Pro silhouette (Dynamic Island, 60px corner radius, **6° tilt**, 80px ambient shadow at 12% opacity)
- Lantern Glow serif display caption above (**placeholder strings in v2 — you finalize**)
- Output at 1290×2796 (6.9"), 1290×2796 (6.7"), 1242×2688 (6.5")

### What I need to handle carefully

- **Viewport snap**: the browser tool snaps to a supported size (likely 414×896 or similar). I'll capture at the snapped portrait size and then **upscale only the device-frame composition**, not the screenshot itself — the screenshot will be captured at the highest portrait size the tool supports and downscaled if needed (downscaling preserves quality, upscaling doesn't). If the snap forces a quality compromise, I'll tell you in the QA report rather than ship blurry frames.
- **Illustration loading**: I'll wait long enough for WebPs to decode before each capture (your `usePreloadCardImages` hook gives reasonable bounds).
- **No status bar artifacts**: I'll mask out any browser chrome / dev badges if they appear in the capture.
- **Failed frames don't ship**: any frame that doesn't QA at 10/10 either gets re-captured or excluded with a clear note — never silently shipped.

### Deliverable (v2)

`/mnt/documents/app-store-gallery-v2.zip` containing:

- `6.9-inch/01…10.png` (1290×2796) — composites of real app captures
- `6.7-inch/01…10.png`
- `6.5-inch/01…10.png` (1242×2688)
- `_contact-sheet.png`
- `_capture-log.md` — for each frame: route used, dev state, viewport snap, capture timestamp, any caveats. Gives you an audit trail if Apple ever queries authenticity.

### QA gate before delivery

Same 6 checks as before, plus two new ones specific to this approach:

7. **Authenticity**: every pixel inside the device frame originated from a live `bonki.lovable.app` capture — confirmed via the capture log.
8. **No mockup artifacts**: no SVG-rendered text, no fake icons, no fabricated illustrations inside the frame.

### Pass 3 (after you approve v2)

You review and finalize the 10 Swedish captions. I regenerate the ZIP as `v3` with text-only swaps. Same captures, same composites, just real headlines.

### Honest scope note

This is significantly more work than the SVG pass — sequential live captures with stabilization waits, then composition for 30 outputs. The result is gallery assets that survive App Store review, which the previous pass would not.

