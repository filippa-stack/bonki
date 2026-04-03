

## NextActionBanner CTA Pill

**File:** `src/components/NextActionBanner.tsx`

### Changes

**1. Remove arrows from ctaText assignments (3 lines)**
- Line 63: `'Öppna →'` → `'Öppna'`
- Line 72: `'Utforska →'` → `'Utforska'`
- Line 81: `'Öppna →'` → `'Öppna'`

**2. Replace the CTA `<span>` (lines ~126-136) with a solid pill**

Replace the current white text span with a pill-styled span using `backgroundColor: accentColor`, dark text (`#1A1A2E`), `padding: '8px 16px'`, `borderRadius: '24px'`, inner highlight shadow, no textShadow.

### Not changed
- Banner background, size, position, border-radius
- Label/subtitle text, onClick handlers, four-state logic, accentColor derivation
- Any other file

