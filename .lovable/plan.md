

## Visual Audit: Library Page

### Issues Found

**1. Subtitle text barely visible** (line 615)
The subtitle "Verktyg för samtalen som inte blir av" uses `hsla(100, 40%, 80%, 0.45)` — that's only 45% opacity on an already muted color against a dark background. Needs to be at least `0.60` for comfortable readability.

**2. Section headers "FÖRÄLDRAR" and "BARN & FAMILJ" use Ghost Glow** (lines 667, 805)
Color `#D4F5C0` at 13px/700 weight is legible but the green tint doesn't carry enough contrast against midnight blue. Per the project's own color hierarchy memory, Ghost Glow is reserved for the library header ("BONKI") and deprecated for other uses. These section labels should use Lantern Glow `#FDF6E3` at reduced opacity (e.g. `0.55`) for consistency.

**3. Ghost glow divider nearly invisible** (line 632)
The thin line between header and content uses `hsla(100, 50%, 75%, 0.30)` at 1.5px height. At this opacity it's essentially invisible. Bump to `0.45` so it reads as a deliberate design element rather than a rendering artifact.

**4. "Era samtal" subtitle too dim** (line 894)
"Varje samtal sparas" uses `hsla(100, 40%, 80%, 0.45)` — same issue as the main subtitle. Bump to `0.55`.

**5. "Era samtal" arrow too dim** (line 906)
The `→` arrow uses `opacity: 0.4` on `#D4F5C0`. Bump to `0.55` for visibility.

### Fix Summary

**File**: `src/components/ProductLibrary.tsx`

| Line | Element | Current | Fix |
|------|---------|---------|-----|
| 615 | Subtitle color opacity | `0.45` | `0.60` |
| 632 | Divider opacity | `0.30` | `0.45` |
| 667 | "FÖRÄLDRAR" color | `#D4F5C0` | `#FDF6E3` with `opacity: 0.55` |
| 805 | "BARN & FAMILJ" color | `#D4F5C0` | `#FDF6E3` with `opacity: 0.55` |
| 894 | "Varje samtal sparas" opacity | `0.45` | `0.55` |
| 906 | Arrow opacity | `0.4` | `0.55` |

### Unchanged
All tile colors, illustrations, layouts, badges, shadows, border treatments, Still Us tile, resume card, bottom nav, safe-area spacing.

