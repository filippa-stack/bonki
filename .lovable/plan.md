

## Fix ProductIntro Flash — useProductIntroNeeded

**File:** `src/components/ProductIntro.tsx`

**Root cause:** When `user` is briefly `null` during auth settling, the hook sets `checked: true` + `needed: true`, causing a one-frame flash of ProductIntro before the real DB result arrives.

### Change — Split the early return (line 344)

Replace:
```tsx
if (!user || cancelled) { setNeeded(true); setChecked(true); return; }
```

With:
```tsx
if (cancelled) return;
if (!user) {
  // Auth not settled — don't mark checked, keep ProductHome in loading state
  return;
}
```

This keeps `checked` as `false` while auth settles, so ProductHome renders the blank loading div (same background color) instead of flashing ProductIntro.

### Not changed
- ProductIntro component, ProductHome.tsx, any other file
- Rest of `useProductIntroNeeded` logic

