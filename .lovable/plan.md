

## Install Page Redesign

Three targeted changes to `src/pages/Install.tsx` — no new files, no structural changes.

### Changes

**1. Larger creature logo (hero)**
- Scale logo from 120×120px to 220×220px, add subtle drop-shadow
- Reduce section padding from `28px 0 20px` to `12px 0 8px`

**2. Clearer trust stats**
- Replace `{ number: '1 gratis', label: 'per produkt' }` with `{ number: '7', label: 'gratis samtal' }`

**3. Compress vertical spacing (CTA above fold)**
- Top padding: `48px` → `24px`
- Value proposition margin: `0 auto` → `-4px auto 0`
- Trust stats padding: `32px` → `20px`
- CTA section padding: `36px` → `24px`

### What stays untouched
BONKI heading, tagline, headline copy, button styling, iOS guide, login link, sub-CTA text, Meta pixel tracking.

