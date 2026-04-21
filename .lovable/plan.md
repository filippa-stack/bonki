

## Add "Konto" sheet to four surfaces (additive only)

Adds a top-right account icon and a bottom-sheet across Library, kids product homes, Still Us product home, and Era samtal. No existing behavior is modified. Logout / Radera konto are visible but inert (wired in later prompts).

### Files to CREATE (2)

**1. `src/components/KontoIcon.tsx`** — pure presentational button.

- Default export `KontoIcon({ color, onClick })`.
- Mirrors `ProductHomeBackButton.tsx` structure (motion.button, same animation defaults) but anchored top-right.
- Renders Lucide `CircleUser` size 22, strokeWidth 1.5.
- Style: `position: 'absolute'`, `top: 'calc(env(safe-area-inset-top, 0px) + 16px)'`, `right: '16px'`, `zIndex: 10`, `opacity: 0.6`, `padding: '8px'`, no background/border.
- `aria-label="Konto"`. `color` defaults to `var(--color-text-primary)`.
- Owns no state. Calls `onClick` prop on tap. No `KontoSheet` import.

**2. `src/components/KontoSheet.tsx`** — bottom sheet modeled exactly on the `{showLogoutSheet && …}` block in `Header.tsx` (lines 222–277). Header.tsx is NOT touched.

- Default export `KontoSheet({ open, onClose })`. Returns `null` when `open` is false.
- Uses `useAuth()` from `@/contexts/AuthContext` for the email and `useNavigate()` for routing.
- Backdrop: `hsla(0, 0%, 0%, 0.25)`, click-outside closes (matches Header pattern with `e.stopPropagation()` on the sheet).
- Sheet container: `var(--surface-raised)`, `borderRadius: '16px 16px 0 0'`, `paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)'`.
- Content order:
  1. Title "Konto" — font-serif, 18px, weight 500, `var(--color-text-primary)`, padding `20px 24px 16px`, left-aligned.
  2. Email row — 13px, `var(--color-text-secondary)`, opacity 0.7, padding `0 24px 20px`. Text: `Inloggad som {user.email}` or `Inloggad` if email missing.
  3. 1px divider, `hsl(var(--divider))`, full width.
  4. "Integritetspolicy" button — 15px, `var(--color-text-primary)`, padding `16px 24px`, left-aligned, full width. Calls `onClose()` then `navigate('/privacy')`.
  5. Divider.
  6. "Logga ut" button — same layout, color `#8B3A3A`. No-op. Inline comment `// TODO: wire in Prompt 2`.
  7. "Radera konto" button — same as Logga ut but `opacity: 0.4`. No-op. Inline comment `// TODO: wire in Prompt 5`.
- No footer; container's `paddingBottom` provides bottom space.

### Files to MODIFY (4) — each page hoists its own state

For all four: add the two imports (`KontoIcon`, `KontoSheet`), add `const [kontoOpen, setKontoOpen] = useState(false);` near existing `useState` calls, mount `<KontoIcon onClick={() => setKontoOpen(true)} />` and `<KontoSheet open={kontoOpen} onClose={() => setKontoOpen(false)} />` per the locations below. Sheet state is intentionally per-page (no context provider).

**3. `src/components/ProductLibrary.tsx`** — `useState` already imported. Insert `<KontoIcon>` + `<KontoSheet>` as the FIRST children of the Content `<div style={{ position: 'relative', zIndex: 1 }}>` at line 688, before the hero `motion.div`. That wrapper is already a positioning context.

**4. `src/components/KidsProductHome.tsx`** — add `useState` to the existing `react` import. Insert `<KontoIcon>` + `<KontoSheet>` immediately after the existing `<ProductHomeBackButton color={LANTERN_GLOW} />` (line 383). Outer wrapper at line 382 already has `relative`.

**5. `src/pages/ProductHome.tsx`** — only the non-kids return block (line 147). Update the outer div's style to `{ backgroundColor: 'var(--surface-base)', position: 'relative' }` (className unchanged — `min-h-screen flex flex-col` stays). Insert `<KontoIcon>` + `<KontoSheet>` as FIRST children before the existing header bar `motion.div`.

**6. `src/pages/Journal.tsx`** — `useState` already imported. Update the outer wrapper style at line 1005 to add `position: 'relative'` (keep `data-sensitive`, `minHeight`, `backgroundColor`, `display`, `flexDirection`). Insert `<KontoIcon>` + `<KontoSheet>` as FIRST children before the `{/* Header */}` comment.

### Technical details

- Spec dictates `var(--color-text-primary)` / `--color-text-secondary` / `--color-text-tertiary` / `--surface-raised` / `--divider` — all already defined in `src/index.css` and used by `Header.tsx`. Will follow the spec exactly.
- KontoIcon's default `var(--color-text-primary)` differs from ProductHomeBackButton's `var(--text-primary)` — that's per spec; both tokens exist.
- The Library hero zone's outer Content `<div style={{ position: 'relative', zIndex: 1 }}>` (line 688) is already a positioning context, so no style change needed there.
- KidsProductHome's outer `<div className="min-h-screen relative overflow-x-hidden">` already has `relative` via Tailwind.
- ProductHome (non-kids) and Journal need `position: 'relative'` added to their style objects so the absolute-positioned KontoIcon anchors to them, not the body.
- iOS PWA: `top: 'calc(env(safe-area-inset-top, 0px) + 16px)'` matches `ProductHomeBackButton`'s safe-area pattern — consistent with `mem://design/layout/ios-pwa-fixed-positioning`.
- No new routes, no BottomNav changes, no analytics, no new context, no edits to Header.tsx / CardView.tsx / useSessionReflections / useNormalizedSessionState / SessionStepReflection.

### Verification

1. App builds, no new TS warnings.
2. Library: top-right `CircleUser` icon next to BONKI wordmark. Tap → sheet opens with title "Konto" and "Inloggad som <email>".
3. "Integritetspolicy" closes the sheet and navigates to `/privacy`.
4. "Logga ut" and "Radera konto" visible but inert.
5. Backdrop tap dismisses.
6. Same icon+sheet on every kids product home (Jag i Mig etc.), Vårt Vi product home, and Era samtal (Journal).
7. All existing navigation, layout, hero zones, and session flows unchanged.

### Rollback

Two new files + four small additive edits. Each modification is independently revertible by deleting the imports, the `kontoOpen` useState, the two JSX nodes, and removing `position: 'relative'` from the two style objects (ProductHome, Journal).

