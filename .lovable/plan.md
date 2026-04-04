

## Install Page — Copy, Readability, Logo Fix

Single file edit: `src/pages/Install.tsx`

### Changes

1. **Fix copy repetition** (lines 176, 184-188)
   - Headline → "Ni pratar varje dag. Men när pratade ni senast — på riktigt?"
   - Supporting line → "För familjer och par — skapat med legitimerad psykolog." at `rgba(253, 246, 227, 0.7)`

2. **Remove redundant psykolog line** (lines 246-259) — Delete the standalone "Utvecklat med legitimerad psykolog" `<motion.p>` below trust stats

3. **Fix readability — increase text opacity**
   - Trust stat numbers (line 225): `color: LANTERN_GLOW` → `color: '#E9B44C'`
   - Trust stat labels (line 235): `0.45` → `0.55`
   - CTA subtext (line 301): `0.4` → `0.5`
   - "Redan medlem?" text (line 407): `0.45` → `0.5`
   - Login link (line 409): `color: BONKI_ORANGE` → `color: 'rgba(253, 246, 227, 0.7)'`

4. **Fix pixelated logo** (line 142) — Replace `src={bonkiLogo}` with `src="/pwa-512x512.png"` for a crisp 512px source rendered at 120px. Remove unused `bonkiLogo` import (line 4).

### What stays untouched
- BONKI + "På riktigt." header, trust stats structure, CTA button styling/handler, platform detection, Meta Pixel, iOS guide, all other files

