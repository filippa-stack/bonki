

## Fix: Badge shows total scope, remove duplicate progress line

### Changes in `src/components/ProductLibrary.tsx`

#### 1. PastelTile — add `completedCount` prop (line 237)
Add `completedCount?: number` to the props interface.

#### 2. PastelTile badge text (lines 437–439)
Change from:
```
hideFreeBadge ? `✦ 1 av ${totalCards} utforskade` : `✦ Samtal 1 gratis · ${ageLabel}`
```
To:
```
hideFreeBadge
  ? `✦ ${completedCount || 1} av ${totalCards ?? '?'} utforskade`
  : `✦ Samtal 1 av ${totalCards ?? '?'} gratis${ageLabel ? ` · ${ageLabel}` : ''}`
```

#### 3. PastelTile — remove progress line (lines 441–454)
Delete the entire `{progressText && (...)}` block that renders the duplicate "X av Y samtal" line below the badge.

#### 4. Vårt Vi tile badge text (line 1062)
Change from:
```
suFreeCompleted ? `✦ 1 av ${totalCards} utforskade` : '✦ Samtal 1 gratis'
```
To:
```
suFreeCompleted ? `✦ ${suCount || 1} av ${totalCards} utforskade` : `✦ Samtal 1 av ${totalCards} gratis`
```

#### 5. Vårt Vi tile — remove progress line (lines 1064–1073)
Delete the `<span>` that shows `{suCount} av ${totalCards} samtal`.

#### 6. Kids tile caller — pass `completedCount` (line 1139 area)
Add `completedCount={count}` to the PastelTile call.

### Verification
- New user → badge: "✦ Samtal 1 av 21 gratis · 3+"
- 1 completed → "✦ 1 av 21 utforskade"
- 16 completed → "✦ 16 av 21 utforskade"
- No duplicate progress line in any state

