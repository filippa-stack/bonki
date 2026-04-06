

## Portal Page Design Refresh — Portal-Only Inline Changes

### Scope
3 files only. No global components touched.

### File 1: `src/pages/KidsCardPortal.tsx`

**Change 1 — "Starta samtal" button (lines 585–604)**
Replace solid `SAFFRON_FLAME` fill + `borderRadius: 24px` with ghost outline:
- `background: 'transparent'`, `border: '0.5px solid rgba(255,255,255,0.3)'`, `borderRadius: '12px'`
- `padding: '16px 64px'`, `fontSize: '15px'`, `fontWeight: 500`, `color: 'rgba(255,255,255,0.85)'`
- Remove `boxShadow`. Locked variant gets same ghost shape but with `rgba(255,255,255,0.12)` border and `rgba(255,255,255,0.5)` text.

**Change 2 — Pagination arrows (lines 626–679)**
- Width/height from `40px` → `28px`
- Replace `background: ${LANTERN_GLOW}15` with `background: 'transparent'`
- Add `border: '0.5px solid rgba(255,255,255,0.15)'`
- Icon size from `22` → `14`

**Change 3 — "Utforska alla samtal" (lines 683–698)**
- `background: 'transparent'`, `border: '0.5px solid rgba(255,255,255,0.1)'`
- `borderRadius: '12px'`, `fontSize: '12px'`, `fontWeight: 400`
- `color: 'rgba(255,255,255,0.3)'`, remove `opacity: 0.85`
- Remove arrow `↓` from text

**Change 4 — Typography (lines 502–578)**
- Card title (h2): `fontWeight: 400` (from 700), add `letterSpacing: '-0.3px'`, remove `textShadow`
- Description (subtitle p): `color: 'rgba(255,255,255,0.6)'` (replace LANTERN_GLOW + 0.85), `lineHeight: 1.6`
- Metadata (frågor line): `fontSize: '12px'`, `color: 'rgba(255,255,255,0.35)'`, `letterSpacing: '0.3px'`
- Category header (top bar span): `fontSize: '10px'`, `letterSpacing: '2px'`, `opacity: 0.45` (from 0.7)

### File 2: `src/components/FreeCardBadge.tsx`
FreeCardBadge is used on both portal tiles AND Category.tsx (library tiles). Both are on dark backgrounds, so frosted glass works everywhere.

Replace entire style block:
- `background: 'rgba(255,255,255,0.18)'`
- `backdropFilter: 'blur(8px)'`, `WebkitBackdropFilter: 'blur(8px)'`
- `border: '0.5px solid rgba(255,255,255,0.15)'`
- `color: 'rgba(255,255,255,0.9)'`
- `fontSize: '10px'`, `fontWeight: 500`, `padding: '5px 14px'`, `borderRadius: '20px'`
- Remove BONKI_ORANGE and LANTERN_GLOW imports (no longer needed)

### File 3: `src/pages/still-us-routes/SuIntroPortal.tsx`

**CTA "Vi är redo" (lines 183–207)**
Replace solid saffron fill with ghost outline:
- `background: 'transparent'`, `border: '0.5px solid rgba(255,255,255,0.3)'`, `borderRadius: '12px'`
- `padding: '16px 64px'`, `fontSize: '15px'`, `fontWeight: 500`
- `color: 'rgba(255,255,255,0.85)'`, remove `boxShadow`

**Typography**
- Title h1: `fontWeight: 400` (from 700), add `letterSpacing: '-0.3px'`
- Metadata (ca 10–20 min): `fontSize: '12px'`, `color: 'rgba(255,255,255,0.35)'` (replace LANTERN + opacity)

### NOT changed
- BonkiButton.tsx, button.tsx, LoadingCta.tsx
- Background colors on any page
- Paywall, onboarding, session, library buttons
- Portal animation logic

