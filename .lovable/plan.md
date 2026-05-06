
## Page 3 — editorial register redesign

Page 3 lives only in the mock at `/onboarding-mock` (per the prior plan, page 3 is not in the live flow until the free-session backend ships). Component: `src/components/OnboardingMock.tsx`, `ScreenGift` function.

### Change

Replace the bordered "promise card" block (lines ~447–479) — currently a translucent ghost-glow container with three checkmarked bullets — with three standalone italic serif statements, no border, no background, no markers.

### Implementation

In `ScreenGift`:

1. **Remove** the bordered card wrapper (`background: 'rgba(212,245,192,0.06)'`, `border`, `borderRadius: 18`, `padding`, `marginBottom: 22`) and its three flex-row children with the `✓` spans.

2. **Insert** in its place a plain flex column:
   - `marginTop: 32` (gap from subtitle)
   - `marginBottom: 48` (gap to CTA)
   - `gap: 12`, `alignItems: 'center'`
   - Three `<p>` elements, each:
     - `fontFamily: '"Cormorant Garamond", Georgia, serif'`
     - `fontStyle: 'italic'`
     - `fontSize: 16`, `lineHeight: 1.45`
     - `color: 'rgba(253,246,227,0.85)'`
     - `textAlign: 'center'`, `maxWidth: 300`, `margin: 0`

3. **Copy** (tightened editorial cadence, matches pages 1 & 2 voice):
   - "Det första samtalet — vår gåva till er."
   - "Engångsköp. Aldrig prenumeration."
   - "Tillgång för alltid."

4. **No marker** (Option B) — pages 1 & 2 use no list markers; keep page 3 unified.

### Unchanged

Illustration block, "EN GÅVA TILL ER" eyebrow, title, subtitle, "Visa biblioteket" ghost-glow CTA, three-dot pagination, Midnight Ink background, all routing/auth.

Pages 1 & 2 (live flow) — entirely untouched.

### Files affected

- `src/components/OnboardingMock.tsx` — replace promise-card block in `ScreenGift` only.
