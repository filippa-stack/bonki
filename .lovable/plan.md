## Onboarding: 2×2 Grid Pills, Product-Home Style

**File**: `src/components/Onboarding.tsx`

### Changes

**1. Replace vertical pill list with a 2×2 CSS grid**
- Change the pills container from `flexDirection: 'column'` to `display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px'`
- Remove subtitles — each pill shows only the label (e.g. "Barn 3–6", "Oss som par")

**2. Match product-home tile styling (smaller)**
- Use the same visual language as category tiles on ProductHome: rounded corners (`borderRadius: 10px`), layered box-shadow, semi-transparent background
- Unselected: `background: hsla(0,0%,100%,0.04)`, `border: 1px solid hsla(0,0%,100%,0.10)`
- Selected: `background: hsla(40,78%,61%,0.10)`, `border: 1px solid hsla(40,78%,61%,0.35)`, saffron glow shadow
- Compact padding: `12px 14px` — smaller than before since no subtitle
- Text: `fontFamily: 'var(--font-display)'`, `fontSize: '15px'`, `fontWeight: 500`, centered

**3. Remove "Var vill ni börja?" label and reassurance text**
- The grid is self-explanatory; removing these saves ~40px vertical space

### Unchanged
Logo, illustration zone, credential, headline, divider, body text, CTA, all logic/tracking/localStorage.
