

## Redesign Audience Pills → Premium Stacked Cards

**File**: `src/components/Onboarding.tsx`

### Current
Generic horizontal pill buttons with wrap — feel like a form, not a brand moment.

### Proposed Design
Full-width stacked selection cards inspired by the screenshot, but elevated to match Bonki's premium standard:

- **Layout**: Vertical stack, full-width, `gap: 8px`
- **Each card**: `border-radius: 16px`, `padding: 16px 20px`, flex row with text left + chevron `›` right
- **Two-line text**: Title in `var(--font-display)` 17px (e.g. "Barn 3–6"), subtitle in `var(--font-sans)` 13px at 0.5 opacity (e.g. "Känslor och inre värld")
- **Unselected**: `background: hsla(0,0%,100%,0.04)`, `border: 1px solid hsla(0,0%,100%,0.10)`, Lantern Glow text at 0.85
- **Selected**: `background: hsla(40,78%,61%,0.10)`, `border: 1px solid hsla(40,78%,61%,0.35)`, title in saffron `#DA9D1D`, chevron in saffron
- **Subtitles per audience**:
  - Barn 3–6 → "Känslor och inre värld"
  - Barn 7–11 → "Relationer och tillit"
  - Barn 12+ → "Identitet och omvärld"
  - Oss som par → "Samtalen ni saknar"

### Unchanged
All logic, values, localStorage writes, CTA, illustration, text above pills, "Ni kan utforska alla produkter efteråt" hint.

