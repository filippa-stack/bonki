

## Make All Month Headers Use Lantern Glow Color

**File:** `src/pages/Journal.tsx` — 2 changes on lines 1176 and 1183

### Change 1: Month dot color (line 1176)
Remove the conditional and use Lantern Glow for all months:
```
// FROM:
backgroundColor: isCurrentMonth ? '#E9C890' : 'rgba(245, 240, 232, 0.25)',
// TO:
backgroundColor: 'rgba(253, 246, 227, 0.6)',
```

### Change 2: Month label color (line 1183)
```
// FROM:
color: isCurrentMonth ? '#E9C890' : 'rgba(245, 240, 232, 0.4)',
// TO:
color: 'rgba(253, 246, 227, 0.6)',
```

Uses `#FDF6E3` (Lantern Glow) at 0.6 opacity — consistent with the typography standard for subtitles and date labels. The `isCurrentMonth` variable and gold distinction are removed so all months look identical.

### Nothing else changes
- Spine, cards, counts, layout all untouched

