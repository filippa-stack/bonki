

## v3 — Real session captures + finalized 10-frame gallery

Locking in the gallery with **4 new live-app session captures** plus the 6 vibrant product portals you already approved. Total: 10 frames × 3 device sizes = 30 PNGs.

### Final 10-frame lineup

| # | Surface | Source | Why it sells |
|---|---|---|---|
| 1 | Vårt Vi product home | `/product/still-us?demo=1` (already captured) | Flagship product hero |
| 2 | Jag i Mig portal | already captured | Vibrant emotion grid |
| 3 | Jag med Andra portal | already captured | Pink palette, harder topics |
| 4 | Vardagskort portal | already captured | Mint everyday warmth |
| 5 | Syskonkort portal | already captured | Lavender, niche differentiator |
| 6 | Jag i Världen portal | already captured | Lime, teen-facing |
| 7 | **Vårt Vi opening prompt (couple session)** | `/card/su-card-1?demo=1` | Sells the monumental, calm flagship moment |
| 8 | **Reflection step with "✓ Sparat"** | same card, step=1 | Proves writing depth — not a quiz |
| 9 | **Jag i Mig session — "Hur känns det i kroppen att vara trygg?"** | `/card/jim-trygg?demo=1` | Strongest kids hook: Teal full-bleed + body-aware question lands instantly with parents |
| 10 | **Era samtal / Journal archive** | `/journal?demo=1` with seeded mock entries | Retention story: "your relationship has a record" |

### Why these 4 new frames work

- **Frames 7+8** (Vårt Vi session + reflection): Buyers see the actual session UX they're paying 249 kr for.
- **Frame 9** (Jim-trygg): Picked because "Hur känns det i kroppen att vara trygg?" is the single most universally moving prompt across the kids manifests — body-aware, non-clinical, instantly recognizable to any parent. Teal full-bleed is also the most vibrant possible frame in the gallery.
- **Frame 10** (Era samtal): Without this, no one understands they're building something lasting. With it, the 249 kr feels like an investment, not a fee.

### Technical approach

**1. Extend demo-mode bypass to 3 more route gates**

The product-home capture worked because v2 added a demo-mode short-circuit in `useProductIntroNeeded`. Same pattern needs to extend to:

- `CardView.tsx` — currently requires authenticated session. Add demo-mode branch that mounts the card with seeded prompt data + a fake "active session" state, no Supabase calls.
- `Journal.tsx` — currently requires authenticated user to query reflections. Add demo-mode branch that renders the editorial timeline with 4-5 hardcoded mock entries (Vårt Vi + Jag i Mig + Vardag samples).
- Reflection step: existing `?__sc_dev_step=1` URL param already works inside CardView once the card mounts.

All bypasses gated on `isDemoMode()` which only activates with `?demo=1` — zero impact on real users, no security surface.

**2. Capture pass**

Drive the browser tool to each of the 4 new routes in sequence at the largest portrait viewport the tool supports (likely 414×896, snap-confirmed during run). Wait for illustration WebPs to decode before each screenshot. Mask any browser chrome / dev badges.

**3. Composite**

Each capture flows through the same Pillow pipeline used for v2:
- Tonal vibrant backdrop matched to product palette (Cobalt for Vårt Vi shots, Teal for jim-trygg, Saffron-on-Cobalt for journal)
- Headline space above (placeholder Swedish strings — you finalize captions in next pass)
- Output at 1290×2796 (6.9"), 1290×2796 (6.7"), 1242×2688 (6.5")

**4. Re-bundle**

Replace the 6-frame v2 with the full 10-frame `app-store-gallery-v3.zip`:
- `6.9-inch/01…10.png`
- `6.7-inch/01…10.png`
- `6.5-inch/01…10.png`
- `_contact-sheet.png`
- `_capture-log.md` documenting route + dev state per frame

### QA gate

Same 8-point checklist used for v2:
1–6: Vibrance, frame geometry, illustration sharpness, type quality, backdrop balance, consistency
7. Authenticity: every frame inside the device area is a real bonki.lovable.app capture (logged)
8. No mockup artifacts inside the frame

Plus one new check specific to this pass:
9. Mock journal entries read as plausible real reflections — not lorem, not too on-the-nose marketing copy. Drafted in your editorial voice.

### Honest scope notes

- The journal mock entries are *fabricated content*, but they live inside the real Journal UI. Apple permits placeholder user-generated content in screenshots provided the UI itself is authentic — same standard Notion, Things, Bear use for their gallery shots. I'll keep the entries short, neutral, and clearly written in Bonki's voice.
- The kids session frame uses a card you do ship (`jim-trygg`) — no fabrication in the prompt itself.
- Demo-mode bypass code is gated behind `?demo=1` and `isDemoMode()` — invisible to all real users, safe to keep in the codebase or remove after capture (your call after v3 ships).

### Pass after v3

You review the contact sheet, send me the 10 final Swedish captions (or approve drafts), I regenerate as `v4` with text-only swaps. No re-capture, no re-layout.

