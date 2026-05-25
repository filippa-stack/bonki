## Goal
Change the main library page (`/`) background from the dark Midnight shell (`#0B1026`) to mint-cream `#e9f6f4`.

## Scope
Only `src/components/ProductLibrary.tsx` (the live lobby). The sandbox `ProductLibraryMock.tsx`, kids/adult product homes, and session screens are not touched.

## Changes

1. **`src/components/ProductLibrary.tsx`**
   - Replace the `LIBRARY_BG` constant (currently `#0B1026`) with `#e9f6f4`.
   - That constant feeds `usePageBackground(LIBRARY_BG)` and the root `<div>`'s inline `background` + `--surface-base`, so a single edit repaints the whole shell.

2. **Foreground contrast review (same file only)**
   The lobby currently assumes a dark shell. On a light mint shell several elements would become invisible or low-contrast. I will adjust just enough to remain legible without redesigning:
   - Tab labels ("Vi" / "Barnen"): switch from `LANTERN_GLOW` cream → a dark ink (`#0B1026`) with the same active/inactive opacity ramp.
   - "Åldrarna är en vägledning…" helper line and any other cream/white body copy on the shell → dark ink at reduced opacity.
   - Resume banner / section eyebrows that sit directly on the shell → dark ink.
   - Tiles themselves keep their existing per-product gradients and white-on-color text (they're self-contained colored cards, so they still read fine on a light shell).

3. **Bottom nav / Konto icon**
   If the bottom nav or `KontoIcon` inherits cream-on-dark styling that becomes unreadable on mint, I'll darken those icon/text colors locally in the lobby render path only. No changes to the nav component itself.

## Out of scope
- Product home pages, Diary, session views, paywall, onboarding — all keep their current backgrounds.
- No new design tokens, no theme system changes, no memory updates (this is a one-off visual override, not a brand shift).

## Risks
- Memory rule "Default dark theme (#0B1026/Midnight Ink)" still applies elsewhere; this edit is a deliberate local exception for the lobby only. Confirm you want the lobby to diverge from the dark-shell standard before I implement.
