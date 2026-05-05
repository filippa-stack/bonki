# Restore auto-abandon for same-product, different-card navigation

## Problem
`src/pages/CardView.tsx` lines 508–519 contain only a comment where the auto-abandon effect used to live. The comment claims same-product different-card is handled implicitly via product-scoped `useNormalizedSessionContext`, but in practice, when the user navigates from card A to card B within the same product, the active session for A remains. The eager-creation block bails at line 541 (`normalizedSession.sessionId && normalizedSession.cardId !== cardId`), so no session is created for B and reflections cannot save.

The cross-product fix (don't wipe a Still Us session when opening a JIM card) must remain intact.

## Change

**File:** `src/pages/CardView.tsx`

Replace the comment-only block at lines 508–519 with a guarded `useEffect` that abandons the active session **only when it belongs to a different card within the same product**.

### Logic
1. Bail if dev/archive/completion modes, still loading, no active session, or no space/cardId.
2. Bail if `normalizedSession.cardId === cardId` (already on the right card).
3. Determine whether the active session's card belongs to the current `product` by checking `product?.cards.some(c => c.id === normalizedSession.cardId)`.
4. If it does NOT belong to the current product → leave it alone (cross-product coexistence).
5. If it DOES → call `abandon_active_session` RPC, then `normalizedSession.refetch()`. The existing eager-creation effect (lines 532–574) will then naturally fire for the new card.

### Effect dependencies
`[devState, isFromArchive, showCompletion, normalizedSession.loading, normalizedSession.sessionId, normalizedSession.cardId, space?.id, cardId, product?.id]`

## What stays untouched
- Eager creation block (lines 521–574), including Fix 7's direct `setActiveSessionId` call.
- `kidsNoteInputSessionId` derivation hotfix.
- `handleAbandonAndRestart` manual recovery (lines 478–496).
- All reflection persistence fixes and protected patterns.
- Cross-product session isolation (uniq_active_session_per_space_product).

## Verification
1. Start session on card A in jim-skam → navigate to card B in jim-skam → console logs `[auto-abandon] same-product different-card` → eager creation fires for B → `[kids-note-sync]` shows non-null `sessionId` → typing reflection persists to `step_reflections`.
2. Start Still Us session → open a kids-product card → Still Us session remains `active` in DB (not abandoned).
3. Existing intra-session Q1↔Q2 navigation still preserves text (Fix 7 + hotfix unaffected).
