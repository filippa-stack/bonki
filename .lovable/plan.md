# App Store Screenshots — 7 graphics at 1290×2796

Production-ready PNG assets for iPhone 6.7" App Store Connect uploads. Built as in-app routes using real production components, with one-click PNG export per graphic.

## Architecture

A new isolated route tree at `/export/app-store/*` that does **not** touch any shipped surface. Each route renders one of the 7 graphics at exact pixel dimensions; an export button on each page produces the PNG.

```text
src/pages/export/AppStoreScreenshot.tsx        ← shared frame + export button
src/pages/export/screenshots/
  Screenshot1Recognition.tsx                   ← Vårt Vi marquee close-up
  Screenshot2Journal.tsx                       ← Era samtal demo data
  Screenshot3Audience.tsx                      ← Jag i Mig product home
  Screenshot4Mechanism.tsx                     ← Jag i Mig session card
  Screenshot5AdultSession.tsx                  ← Vårt Vi session card
  Screenshot6Outcome.tsx                       ← Jag i Mig completion takeaway
  Screenshot7Authority.tsx                     ← Ida Welbourn credentialing
src/lib/exportScreenshot/
  composition.tsx                              ← CaptionZone, HairlineDivider, DeviceFrame
  demoJournal.ts                               ← hardcoded reflections (Graphic 2 + 6)
  exportPng.ts                                 ← html-to-image based PNG export
```

Routes added to `src/App.tsx` only — gated to `import.meta.env.DEV || ?key=export` so they are never user-discoverable in production.

## Shared composition system

A single `<AppStoreCanvas>` component enforces the spec exactly (numbers from your brief):

- Canvas: 1290×2796, background per graphic
- Top breathing room: 170px
- Caption zone: Fraunces 500, `opsz` 144, color `#F5E8CC`, letter-spacing -0.005em, line-height 1.1, max-width 85%, baseline at ~26% from top, sizes calibrated 120/130/140 per caption length
- Hairline divider: 1px solid `rgba(245, 232, 204, 0.25)`, ~50% canvas width, 90px below caption baseline
- App screen frame: 84% canvas width, 9:19.5 aspect, 90px corner radius, 10px black bezel, status bar (`9:41`, signal, battery), home indicator, drop shadow `0 8px 32px rgba(0,0,0,0.3)`
- Bottom breathing room: 110px

True em-dashes (`—`) hard-coded in caption strings. Fraunces variable axis used.

## Per-graphic specs (locked)

| # | Caption | Canvas BG | App-screen content | Source component |
|---|---------|-----------|--------------------|------------------|
| 1 | Samtalen som bär. | `#1A1A2E` | Vårt Vi marquee — 40/60 medallion + text, "16 av 18" | `LibraryMarquee` (real) |
| 2 | En tidskapsel av era ord. | `#1A1A2E` | Era samtal with 4 dated reflections | Real `Journal` page + demo data |
| 3 | Att förstå sitt barn — på riktigt. | `#8C4A2D` | Jag i Mig home with 5 saffron checkmarks | Real `JagIMigProductHome` + demo progress |
| 4 | Frågor som faktiskt öppnar samtalet. | `#8C4A2D` | JIM session, "Glad" card, step 2 av 4 | Real `CardView` + frozen state |
| 5 | Tiden ni inte hittar — finns här. | `#1A1A2E` | Vårt Vi session card, real prompt | Real `CardView` + frozen state |
| 6 | Det ni säger till varandra — finns kvar. | `#8C4A2D` | JIM completion + takeaway field | Real `CompletionCeremony` + demo |
| 7 | Utvecklat under 29 år av klinisk praktik. | `#1A1A2E` | Typographic credentialing block (no device frame) | Inline composition |

Real card prompts chosen from shipped manifests (`src/data/products/jag-i-mig.ts`, `src/data/products/still-us-mock.ts` / Vårt Vi data) so prompts are authentic to the deck — no invented copy.

## Demo data (Graphic 2 + 6)

You uploaded two real Vårt Vi journal entries (10 april "Mitt sätt, ditt sätt" / 9 april "Ert minsta vi"). Plan:

1. Hardcode those two entries verbatim under APRIL 2026.
2. Add two plausible kids entries dated MARS 2026 anchored to real shipped card titles (Jag i Mig "Glad", Syskon "Vi blev syskon") — body text written in BONKI voice, parent-perspective, no invented child names beyond a single neutral first name. You can swap or rewrite any of them after preview.
3. Graphic 6 takeaway field uses one real reflection sentence in JIM "Glad" completion context — neutral wording you can replace.

Demo data lives in a single file (`demoJournal.ts`) so all four entries are easy to edit in one place.

## PNG export

`html-to-image` (small, no canvas-tainting issues with our SVGs/PNGs) renders the 1290×2796 node directly at 1× pixel ratio. Each route shows a fixed "Ladda ner PNG" button outside the canvas. Filenames: `app-store-{n}-{name}.png`.

If a font or webfont race causes blurry export on first click, the export helper waits for `document.fonts.ready` before snapshotting.

## Verification per graphic

Before delivery I will:

1. Open each route in the browser at the correct viewport.
2. Screenshot, then `image_tools--zoom_image` into caption + device frame to confirm: exact pixel dims, em-dash characters, caption position, hairline opacity, status bar/home indicator presence, demo state correctness.
3. Export the PNG to `/mnt/documents/app-store-{n}-{name}.png` and re-open it to verify pixel dimensions and rendering fidelity.
4. Deliver all 7 PNGs as `<lov-artifact>` tags.

## What does NOT change

No edits to Library, product homes, sessions, completion, journal, Vårt Vi, or any shipped surface. The export routes consume existing components in read-only demo mode. No schema, no edge functions, no auth.

## Future device classes

`AppStoreCanvas` accepts `{ width, height }` props with proportional internal calc — re-rendering at 1242×2688 (6.5") and 1242×2208 (5.5") is a single prop change per route, no rebuild.

## Open item (non-blocking)

The journal/takeaway demo content in `demoJournal.ts` is my best authentic-feeling fill using your two provided entries plus shipped card titles. After you see the preview, paste any replacement copy and I'll swap it in.
