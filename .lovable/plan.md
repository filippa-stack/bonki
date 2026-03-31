

## Fix: Status Bar Gap + Background Color Alignment

### What's happening

`App.tsx` line 96 applies a global `paddingTop: 'env(safe-area-inset-top, 0px)'`. This pushes all page content down ~47px, exposing the `#root` background (`#0B1026`) behind the status bar. On pages with different backgrounds (product homes with berry/teal/etc.), this shows as a wrong-color strip at the top.

Most pages already handle safe-area-inset-top internally, so they get **double** padding.

### Bleed-through risk check

The `#root` fallback `#0B1026` matches the library page exactly. Every other page sets its own full-viewport background. The only page that does NOT handle safe-area-inset-top internally is `ProductLibrary.tsx` — it uses `padding: '56px 32px 0'` and relies on App.tsx's global paddingTop.

After removing the global paddingTop, the `#root` color (`#0B1026`) can still show momentarily during route transitions. Since the library is the default landing page and uses the same `#0B1026`, there's no visible bleed. For pages with different backgrounds, they set their own full-screen background immediately on mount — no gap.

### Changes — 3 files

**1. `index.html` line 32**
- `background-color:#1A1A2E` → `background-color:#0B1026`
- Aligns body with `#root` so there's zero color mismatch during pre-hydration

**2. `src/App.tsx` line 96**
- Remove `paddingTop: 'env(safe-area-inset-top, 0px)'` from the wrapper div
- Keep `paddingBottom` unchanged (handles BottomNav clearance)
- Result: each page's own background extends behind the status bar

**3. `src/components/ProductLibrary.tsx` line 584**
- `padding: '56px 32px 0'` → `padding: 'calc(env(safe-area-inset-top, 0px) + 56px) 32px 0'`
- Only page that relied on the global paddingTop — now handles it internally

### Why no wrong-color bleed

| Moment | What shows | Color |
|--------|-----------|-------|
| Pre-hydration (body) | `#0B1026` | Matches library |
| React mounts `#root` | `#0B1026` | Same |
| Page renders | Page's own BG | Correct per page |
| Route transition gap | `#root` shows through | `#0B1026` (library default) |

Product pages (berry, teal, mint) set their background on their outermost div with `min-height: 100vh`, so no `#root` color peeks through edges or margins.

