## Restyle KontoSheet to dark editorial

Single-file visual restyle of `src/components/KontoSheet.tsx`. No logic, imports, handlers, or behavior changes.

### Scope
Touch only `src/components/KontoSheet.tsx`. All `useState`, `useNavigate`, `useAuth`, supabase, `restorePurchases`, toast, navigation, the `RADERA` typed-confirm pattern, `isNative` gating, sheet sizing (`calc(100vh - 32px)`), `paddingBottom` safe-area math, scroll properties, the early-return guard, backdrop click-to-close, and `e.stopPropagation()` are preserved verbatim.

### Token map
- Surface: `#1A1A2E` (MIDNIGHT_INK)
- Text primary: `#F5E8CC` (LANTERN_GLOW)
- Text secondary: `rgba(245, 232, 204, 0.65)` / `0.55` / `0.45` per spec
- Hairlines: `rgba(245, 232, 204, 0.10)`
- Top border: `rgba(245, 232, 204, 0.08)`
- Destructive (Radera only): `#C56B6B`
- Backdrop: `hsla(230, 25%, 5%, 0.55)`

### Edits

**Backdrop & sheet shell**
- Backdrop color → `hsla(230, 25%, 5%, 0.55)`
- Sheet `backgroundColor` → `#1A1A2E`, `borderRadius` → `20px 20px 0 0`, add `borderTop: 1px solid rgba(245,232,204,0.08)`. Sizing/scroll/safe-area untouched.

**Title "Konto"**
- Drop `font-serif` class; inline `fontFamily: var(--font-display)`, `fontSize 22`, `fontWeight 500`, `color #F5E8CC`, `padding 24px 24px 8px`, `letterSpacing -0.005em`, `lineHeight 1.1`.

**Email row**
- Inline `fontFamily: var(--font-display)`, `fontStyle: italic`, color `rgba(245,232,204,0.65)`, padding `0 24px 24px`.

**All dividers** → `background: rgba(245,232,204,0.10)`.

**Integritetspolicy** → color `#F5E8CC`.

**Mina köp section (native only, untouched conditional)**
- Label: color `rgba(245,232,204,0.55)`, add `fontFamily: var(--font-display)`, `fontStyle: italic`.
- Återställ köp button: color `#F5E8CC` (Loader2 inherits via currentColor — already does).
- Caption: color `rgba(245,232,204,0.55)`.

**Logga ut** → color `rgba(245,232,204,0.85)` (demoted, no longer red).

**Radera konto** — restructure inner content of the same `<button>` (handler unchanged):
- Replace text node with a flex column (`display:flex; flexDirection:column; alignItems:flex-start`).
- Line 1 span: "Radera konto", `fontSize 13`, `fontWeight 500`, color `#C56B6B`.
- Line 2 span: "Permanent. Kan inte ångras.", `fontFamily var(--font-display)`, italic, `fontSize 11`, color `rgba(245,232,204,0.45)`, `lineHeight 1.3`, `marginTop 2`.
- Outer button keeps padding/width/cursor; remove the old inline `color`/`fontSize`/`fontWeight` since spans own them.

**Confirmation dialog**
- DialogContent: bg `#1A1A2E`, color `#F5E8CC`, border `1px solid rgba(245,232,204,0.10)`.
- DialogTitle: drop `font-serif`; inline `fontFamily var(--font-display)`, `fontWeight 500`, color `#F5E8CC`, `letterSpacing -0.005em`.
- DialogDescription: color `rgba(245,232,204,0.75)`.
- Label: color `rgba(245,232,204,0.65)`; the inner `<strong>` color `#F5E8CC`.
- Input: border `1px solid rgba(245,232,204,0.20)`, bg `rgba(245,232,204,0.06)`, color `#F5E8CC`.
- Avbryt button: color `#F5E8CC`, border `1px solid rgba(245,232,204,0.20)`.
- Radera permanent button: bg `#C56B6B`, color `#1A1A2E`. Disabled/opacity/Loader2 untouched.

### Files
- `src/components/KontoSheet.tsx` — edited (only file)

### Verification
Open the Konto sheet: dark surface, cream serif title, italic dimmed email, cream hairlines, cream Integritetspolicy/Logga ut/Återställ köp, only Radera konto in muted red with italic subtitle. Confirm dialog dark with `#C56B6B` confirm button (dark text). Typed `RADERA` still gates confirm; logout/privacy/restore/delete flows unchanged.
