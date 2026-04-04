

## Install Page Refinements

Single file edit: `src/pages/Install.tsx`

### Changes

1. **Replace logo+wordmark section** (lines 90-134) — Remove the `<img>` logo. Replace with "BONKI" as a 40px serif heading in Ghost Glow (`#D4F5C0`) + "På riktigt." italic tagline below, also Ghost Glow at 0.6 opacity. Use `safe-area-inset-top + 48px` padding.

2. **Replace hero illustration** (lines 136-179) — Remove the large Still Us illustration and its 40vh container. Replace with centered `bonkiLogo` (`@/assets/bonki-logo-transparent.png`) at 120×120px with `objectFit: contain`, `opacity: 0.9`, padding `28px 0 20px`.

3. **Update copy** (lines 181-217) — Keep headline "Samtal som förändrar er vardag." but reduce to `24px`, `fontWeight: 600`. Change supporting text to "Verktyg för samtalen som inte blir av — för familjer och par." at `rgba(253, 246, 227, 0.6)`. Remove "psykologer" reference from here.

4. **Add psychologist trust line** (after line 272, inside trust stats section) — Add `<p>Utvecklat med legitimerad psykolog</p>` below the stats row at `12px`, `rgba(253, 246, 227, 0.45)`.

5. **Color audit** — No Driftwood references found in current file (already using Lantern Glow opacity variants). Confirm all text colors use `rgba(253, 246, 227, ...)` or `rgba(245, 237, 210, ...)` patterns — no changes needed here.

6. **Remove unused import** — Remove `illustrationStillUs` import (line 5). Keep `bonkiLogo` import.

### What stays untouched
- Platform detection, `handleCTA`, Meta Pixel tracking
- CTA button styling (Orange gradient + shadow)
- iOS install guide section
- "Redan medlem?" login link
- All other files

