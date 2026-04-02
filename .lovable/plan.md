

## Visual Audit: Product Intro Welcome Pages (All 7)

### Audit Setup
Component: `src/components/ProductIntro.tsx`  
All 7 products use the same layout. Background = product `backgroundColor`, accent = `tileLight`.

### Issues Found

**1. "Inte just nu" skip link too faint (line 409, opacity 0.45)**  
At 0.45 opacity, `#FDF6E3` becomes nearly invisible against the medium-toned backgrounds of Vardag (`#48A873`), Sexualitet (`#AF685E`), and Syskon (`#8E459D`). Even on darker products it's unnecessarily hard to find.  
**Fix**: Raise opacity from `0.45` → `0.55`.

**2. Tagline (product accent on product background) — low contrast on 4 products**  
The tagline uses `productAccent` (= `tileLight`) directly on the product `backgroundColor` (= `tileDeep`). For products where these are close in luminance, readability suffers:

| Product | Tagline color | Background | Problem |
|---------|--------------|------------|---------|
| Vardag | `#8BDDB0` | `#48A873` | Green-on-green, low contrast |
| Sexualitet | `#DD958B` | `#AF685E` | Coral-on-coral, low contrast |
| Syskon | `#CF8BDD` | `#8E459D` | Purple-on-purple, borderline |
| Still Us | `#94BCE1` | `#4B759B` | Blue-on-blue, borderline |

**Fix**: Add `opacity: 0.95` to the tagline `<p>` (currently no explicit opacity) — this won't help contrast. Instead, override the tagline color to use `LANTERN_GLOW` at `0.6` opacity for universal readability, matching the signoff line styling. This gives warm white text that reads clearly on every background.

**3. No issues found with:**
- Title (`LANTERN_GLOW` on all backgrounds) — high contrast ✓
- Body text (`LANTERN_GLOW` at 0.88) — readable ✓
- CTA button (accent bg + `MIDNIGHT_INK` text) — strong ✓
- "Ert första samtal" reassurance (`LANTERN_GLOW` at 0.6) — acceptable ✓
- Back arrow (`LANTERN_GLOW` at 0.7) — visible ✓
- Sexualitet safety line (`LANTERN_GLOW` at 0.6) — readable ✓

### Changes

**File: `src/components/ProductIntro.tsx`**

| Line | Element | Current | New |
|------|---------|---------|-----|
| 302–303 | Tagline color | `color: productAccent` | `color: LANTERN_GLOW, opacity: 0.6` |
| 409 | "Inte just nu" opacity | `0.45` | `0.55` |

### Unchanged
All animations, layout, CTA button, body text, reassurance line, safety line, hooks, callbacks, illustration positioning.

