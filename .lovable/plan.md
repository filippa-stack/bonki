

## Journal Visual Refinements — 4 Changes

**File:** `src/pages/Journal.tsx`

### Change 1: Elevate stats/pulse card (lines 1029-1066)

Replace the pulse card container styling:
- Remove `borderLeft: 3px solid ${DEEP_SAFFRON}`
- Replace `background` with warm saffron gradient: `linear-gradient(135deg, rgba(212,160,58,0.12) 0%, rgba(212,160,58,0.04) 100%)`
- Add `border: 1px solid rgba(212,160,58,0.15)`
- Change `borderRadius` to `20px`, padding to `20px 20px 18px`
- Add `backdropFilter: blur(12px)` and `WebkitBackdropFilter: blur(12px)`
- Bump the `{pulseData.total}` span fontSize from `18px` to `22px`

### Change 2: Remove colored left borders, strengthen background tint

**NoteEntryCard** (line 242-248): Card already has no borderLeft — it uses a top color bar instead. No borderLeft to remove. The `backgroundColor` is `#2E3142` for non-takeaway cards. Keep as-is since this card uses the top accent bar pattern, not left borders.

**SessionGroupCard** (line 433-438): Same — uses top accent bar, no borderLeft. No change needed.

Both card types already use `borderRadius: 16px` and no left borders. The current design already matches the target. No changes needed here.

### Change 3: Truncate question text to 2 lines

**NoteEntryCard** question text (lines 296-306): Add line-clamp styles to the `<p>` containing `— {entry.questionText}`:
```tsx
display: '-webkit-box',
WebkitLineClamp: 2,
WebkitBoxOrient: 'vertical' as const,
overflow: 'hidden',
```

**SessionGroupCard** question text (lines 478-487): Same truncation treatment.

### Change 4: More spacing between cards

Line 1091: Change `gap: '12px'` to `gap: '16px'` in the items container.

### Summary of actual edits
1. Pulse card: new gradient/border styling + larger number (lines 1029-1066)
2. Question truncation in NoteEntryCard (line 296-306)
3. Question truncation in SessionGroupCard (line 478-487)
4. Card gap from 12px → 16px (line 1091)

