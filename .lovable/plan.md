

## Center CTA Buttons on Session + Completion Pages

Apply the same layout pattern to 6 CTA rows across 2 files: back arrow becomes `position: absolute; left: 0` so the CTA button centers naturally.

### File 1: `src/pages/CardView.tsx`

**Pattern for each CTA row:** Change parent `div` to `position: 'relative', justifyContent: 'center'`. Change back button to `position: 'absolute', left: 0`. Change CTA button: remove `flex: 1`, add `width: 'auto', minWidth: '200px', maxWidth: '280px', paddingLeft: '32px', paddingRight: '32px'`.

**Location A — Kids completion (line ~1372):**
Parent div → add `position: 'relative'`, change `justifyContent` to `'center'`.
Back button (line 1373–1398) → add `position: 'absolute', left: 0`.
CTA button (line 1399–1425) → remove `flex: 1`, add constrained width.

**Location B — Still Us su-mock-0 completion (line ~1656):**
Parent div → same treatment.
Back button (line 1657–1682) → absolute left.
CTA button (line 1683–1702) → remove `flex: 1`, add constrained width.

**Location C — Still Us all_complete (line ~1723):**
Parent div → same treatment.
Back button (line 1724–1749) → absolute left.
CTA button (line 1750–1769) → remove `flex: 1`, constrained width. This one uses filled saffron style — keep that, just change sizing.

**Location D — Still Us default next (line ~1774):**
Parent div → same treatment.
Back button (line 1775–1800) → absolute left.
CTA button (line 1801–1820) → remove `flex: 1`, constrained width.

**Location E — Kids live session (line ~3241):**
Parent div → same treatment.
Back button (line 3242–3259) → absolute left.
CTA `motion.button` (line 3260–3280) → remove `flex: 1`, add constrained width.

### File 2: `src/components/SessionStepReflection.tsx`

**Location F — Still Us live session CTA (line ~305):**
Parent div (line 305–311) → add `position: 'relative'`, change to `justifyContent: 'center'`.
Back button (line 312–329) → add `position: 'absolute', left: 0`.
CTA `motion.button` (line 330–356) → remove `flex: 1`, add `width: 'auto', minWidth: '200px', maxWidth: '280px', paddingLeft: '32px', paddingRight: '32px'`.

### Not changed
- onClick handlers, button text, ghost/filled styling, icon size/opacity
- Any logic, state, or data fetching
- Any other file

