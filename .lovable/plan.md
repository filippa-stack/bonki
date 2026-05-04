# Phase A.1.5 — Bottom Nav Recalibration

## Audit findings

**File:** `src/components/BottomNav.tsx` (single source — `Navigation.tsx` does not exist)

Current relevant values (lines ~76–95, 117–141):
- **Background:** `rgba(0, 0, 0, 0.85)` with `backdropFilter: blur(12px)` — near-black, heavier than tiles
- **Border:** already `none` (no top border to remove)
- **Inactive icon + label color:** `'#FDF6E3'` (full LANTERN_GLOW, full opacity)
- **Active icon + label color:** `BONKI_ORANGE` (`#E85D2C`) — stays
- **Active label fontWeight:** 600; inactive: 400 — stays

## Changes

In `src/components/BottomNav.tsx`:

1. **Nav background** — replace `background: 'rgba(0, 0, 0, 0.85)'` with `background: DEEP_DUSK` (`#2A2D3A`), imported from `@/lib/palette`. Drop `backdropFilter` / `WebkitBackdropFilter` (no longer needed against an opaque surface — keeps the nav reading as a flat sister-surface to the tiles rather than a translucent overlay).

2. **Inactive color** — change the `color` assignment from:
   ```ts
   const color = active ? BONKI_ORANGE : '#FDF6E3';
   ```
   to:
   ```ts
   const color = active ? BONKI_ORANGE : 'rgba(253, 246, 227, 0.55)';
   ```
   This dims both icon stroke and label text in one place (they already inherit from the same `color` prop on the button).

3. **Border** — no change needed. Border is already `none`; value-contrast against MIDNIGHT_INK page background does the boundary work.

## Out of scope (untouched)

- Active tab color (Bonki orange stays — brand decision deferred)
- Icon set, labels, uppercase, letter-spacing, font weight
- Nav height (56px), safe-area padding, layout, tap targets
- Routing / tap behavior
- Hide-on-route logic (sessions, ceremony, etc.)

## Verification

- Nav background matches tile DEEP_DUSK (`#2A2D3A`)
- Active tab on `/` (BIBLIOTEKET) still full-saturation Bonki orange
- HEM and ERA SAMTAL recede at 55% lantern-glow
- No visible heavy line between nav and midnight-ink page
- Spot-check `/`, `/product/jag-med-andra`, `/journal`, `/card/:id?from=archive` — colors hold
