## Boost contrast on `/analytics`

Replace muted/beige tokens (`text-muted-foreground`, `border-border/50`, `bg-card`, `bg-muted/30`, `bg-foreground/70`) with high-contrast slate/sky tones in `src/pages/AnalyticsDashboard.tsx` only. No driftwood, no beige, no warm neutrals.

### Palette (cool, high-contrast)
- Page bg: stays dark (existing `page-bg`)
- Card bg: `bg-slate-900/80` with `border-sky-400/30`
- Primary text: `text-white`
- Secondary text: `text-slate-300` (instead of muted-foreground)
- Accents / labels: `text-sky-300`
- Bars / fills: `bg-gradient-to-r from-sky-400 to-cyan-300`
- Bar track: `bg-slate-800` ring `ring-slate-700/60`

### Component changes (same file)
- **StatCard**: bigger value (`text-3xl font-bold text-white`), bold sky-300 uppercase label, slate-900 card with sky border.
- **SectionTitle**: sky-300, bolder tracking, left sky border accent.
- **BreakdownRow**: white bold values, slate-700 dividers, slate-300 sub text.
- **FunnelBar**: white bold labels, sky→cyan gradient fill, taller (`h-2.5`) ringed track, sky-300 conversion %.
- **Header subtitle row**: swap `text-muted-foreground` → `text-slate-300`; LIVE/TEST pills already vivid (kept).
- **Filter bar**: `text-muted-foreground` → `text-slate-300` for "Allt sedan:" / window labels; selected window button uses `default` variant (already), unselected uses `outline` with `border-slate-600 text-slate-200`.
- **Sparkline wrapper text**: trend captions to `text-slate-300`.

### Out of scope
- No global token changes (won't touch `index.css` / Tailwind config — only this page).
- No layout/structure changes. Same sections, same data, just readable.
