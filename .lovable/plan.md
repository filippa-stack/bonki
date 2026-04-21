

## Apply lantern design to the existing library resume banner

Skip the test page. Apply the lantern treatment directly to the current `ResumeBanner` so you can see it in context and revert if it's wrong.

### File touched
`src/components/ResumeBanner.tsx` (only file)

### What changes

**1. Accept a product accent color**
- Add optional `accentColor?: string` prop (hex). Defaults to `#FDF6E3` (Lantern Glow cream) when no active product context is available.
- Caller (`ProductLibrary.tsx`) will pass the active product's `tileLight` value. If the caller passes nothing, the cream fallback applies.

**2. Replace the flat muted background with a radial bloom**
- Remove the current `linear-gradient` background using `--muted`.
- New background: `radial-gradient(ellipse 320px 140px at 30% 50%, {accentColor}33 0%, {accentColor}10 60%, transparent 100%)` layered over the page's `#0B1026` shell (transparent container, the shell shows through).
- No border. No left bar. The bloom *is* the container.

**3. Keep restraint in the foreground**
- Typography unchanged (same sizes, same `--color-text-secondary`).
- Replace the text-only "Fortsätt" button with a Bonki Orange (`#E85D2C`) pill matching `mem://ux/banner/cta-pills-and-labels` — same height (32px), same `borderRadius: 20px`, white text.
- Add a 4px solid accent-color dot before the "Ert samtal väntar." line — single point of product identity, replacing any need for a left bar.
- Keep the existing dismiss "×" exactly as-is.

**4. Add the breathing animation**
- 6s `ease-in-out infinite` keyframe on the bloom layer's opacity: `0.85 → 1 → 0.85`.
- Implemented as an inline `<style>` block scoped via a unique class, or via Framer Motion `animate` on a separate absolutely-positioned bloom div behind the content.
- Wrapped in a `prefers-reduced-motion` guard so it stops for users who request reduced motion.

**5. Update the caller**
- `src/components/ProductLibrary.tsx`: where `<ResumeBanner cardId={...} />` is rendered, look up the active card's product via `getProductForCard(cardId)` and pass `accentColor={product?.tileLight}`. If lookup fails, omit the prop and the cream fallback kicks in.

### What is NOT touched
- `UnifiedResumeBanner.tsx`, `ContinueModule.tsx`, `NextActionBanner.tsx` — other resume affordances stay as-is. If the lantern works here, we apply it elsewhere in a follow-up.
- `palette.ts` — read-only import.
- No memory updates yet — wait until the design is confirmed in context.
- No new component, no new route, no test page.

### How to judge it
Open the library home (`/` after login). The resume banner now glows softly in the active product's color. Specifically:
- Jag i Mig active → teal bloom
- Syskonkort active → lilac bloom
- Vårt Vi active → cobalt bloom
- No active product context → cream Lantern Glow bloom (neutral fallback)

If it's right, we extend the same treatment to `UnifiedResumeBanner` on product home screens. If it's wrong, you revert this single file and nothing else is affected.

### Revert cost
One file. One revert click on the message below the change.

