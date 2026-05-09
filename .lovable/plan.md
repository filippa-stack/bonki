## Problem

Graphic 1 shows the production app library inside an iframe. The italic taglines ("Samtalen som dagen inte gav plats för", "Åldrarna är en vägledning. Ni känner ert barn bäst.") and the "Vårt Vi" / "Biblioteket" headers render in a fallback serif (Georgia / Courier-italic-looking) instead of an elegant display serif.

## Root cause

`src/index.css` declares the display token as:

```
--font-display: 'Cormorant', Georgia, serif;
```

…but **Cormorant is never loaded** anywhere in the project. `index.html` only loads **Fraunces**. So every element using `var(--font-display)` (the library header "Biblioteket", "Vårt Vi", and italic taglines) falls all the way through to Georgia / generic serif. The export caption "Samtalen som bär." looks correct because `composition.tsx` hard-codes Fraunces explicitly, bypassing the token.

The iframe (`RealAppFrame`) loads `/` which uses the broken token, so the captured Graphic 1 inherits the fallback fonts.

## Fix scope

Limited to the export path. Do **not** touch the live production token (separate concern, not requested). Inside the iframe used for export, force the display token to Fraunces and ensure Fraunces is fully loaded before capture.

## Steps

1. **Add an `?exportFonts=1` query flag** that the export route appends when it builds iframe `src` URLs (e.g. `/?demo=1&devState=browse&exportFonts=1`).

2. **In `index.html`** (or a tiny early-running module), when `exportFonts=1` is present in the URL:
   - Inject a `<link rel="stylesheet" href="…Fraunces…&display=block">` (same family Fraunces, italic + roman, opsz 9..144, weights 400/500/600).
   - Inject a `<style>` block that overrides the token:
     ```
     :root { --font-display: 'Fraunces', Georgia, serif; }
     ```
   - This is the same display:block stylesheet pattern already used in `AppStoreScreenshot.tsx`, applied inside the iframe document instead of the parent.

3. **In `RealAppFrame.tsx`**: after the iframe `load` event, await `iframe.contentDocument.fonts.ready` (best-effort, same-origin) before flipping `__realAppFrameLoaded = true`. This blocks `exportNodeToPng` until italic Fraunces has rendered.

4. **In `Screen1Marquee.tsx`** (and any other RealAppFrame consumers — Screens 2/3/4/6): ensure the `src` includes `&exportFonts=1`.

5. **Re-render Graphic 1 only** via the existing puppeteer/raw flow, save to `/mnt/documents/app-store-1-recognition_v3.png`, QA-inspect, and emit the artifact.

## Out of scope

- Production-wide token fix (Cormorant not loaded). Separate task.
- Re-rendering Graphics 2–7 unless inspection of v3 reveals the same regression visible there. (Graphic 2 uses a static cropped PNG, so it's unaffected. Graphics 3/4/5/6 may benefit but were already accepted in the previous pass.)

## Risk

Low. The query flag isolates the override to export captures; production users will never load `?exportFonts=1`. If the iframe injection runs too late (after first paint), step 3's `fonts.ready` await is the safety net before capture.
