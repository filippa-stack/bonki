

## Contextual Hem Tab (BottomNav.tsx rewrite)

### Changes in `src/components/BottomNav.tsx`

1. **Remove** the `StillUsIcon` component (lines ~11–27)
2. **Update imports**: Replace `House` usage for library with `LayoutGrid`; keep `House` for the new Hem tab
   - `import { LayoutGrid, BookOpen } from 'lucide-react'` + keep `House`
3. **Replace items array** with three tabs:
   - `library`: icon → `LayoutGrid`, same path/match
   - `hem`: icon → `House`, dynamic path, match on `/product/*`, `/still-us/*`, `/preview/*`, `/category/*`
   - `journal`: unchanged
4. **Dynamic onClick** for `hem` tab: extract product slug from URL or `localStorage`, navigate to `/product/{slug}` or fallback to `/`
5. No changes to hide/show rules, styling, or Era samtal tab

