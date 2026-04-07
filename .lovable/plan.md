

## Fix Vårt Vi tile illustration positioning

### Problem
The Vårt Vi tile illustration container spans `top: 0%, bottom: -45%` with `objectPosition: 'center 12%'`, pushing the creature down and partially off-tile. PastelTile uses `top: -15%, bottom: -10%` with `objectPosition: 'center bottom'`, keeping the creature centered and visible.

### Fix in `src/components/ProductLibrary.tsx` (lines 984–1005)

Update the Vårt Vi illustration container and image styles to match PastelTile:

**Container (lines 986–989):**
- `top: '0%'` → `top: '-15%'`
- `left: '-15%'` → `left: '-5%'`
- `right: '-15%'` → `right: '-5%'`
- `bottom: '-45%'` → `bottom: '-10%'`

**Image (line 1001):**
- `objectPosition: 'center 12%'` → `objectPosition: 'center bottom'`

No other changes — badges, sparkle, text, scrim all untouched.

