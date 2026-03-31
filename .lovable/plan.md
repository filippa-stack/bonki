

## Step 1: Inline Still Us Live Session Layout (replace SessionFocusShell)

Only the live session block (~line 2449–2615). Archive is a separate step later.

### What changes

**`src/pages/CardView.tsx`** — Replace `<SessionFocusShell>` with inline layout matching the kids pattern:

The current Still Us block passes `topSlot`, `ctaSlot`, and `children` into `SessionFocusShell`. We flatten this into the same structure as the kids block (line 2698):

```text
<div fixed inset-0>              ← same as kids line 2700
  {topSlot content}              ← existing nav bar JSX, moved out of prop
  {progress bar}                 ← already exists
  <div flex-1 relative>          ← content area with overflow: visible (not hidden)
    <img illustration />         ← absolute, inset: -32%, same as kids line 2795
    <div white-card>             ← FAF7F2, borderRadius 28px
      <AnimatePresence>          ← existing SectionView crossfade
        <SectionView ... />
      </AnimatePresence>
    </div>
  </div>
  <div cta-zone>                 ← existing SessionStepReflection, moved out of prop
    {ctaSlot content}
  </div>
  <AlertDialog ... />            ← exit dialog, copied from SessionFocusShell
</div>
```

**Heartbeat**: Add a `useEffect` in the Still Us live block that calls `sessionHeartbeat` every 60s — same logic as `SessionFocusShell` lines 63–87. The effect depends on `couple_id`, `card_id`, `device_id` which are already available in `CardView.tsx`. The cleanup (`clearInterval`) is straightforward.

**Status overlay**: The `statusMessage` state + overlay from SessionFocusShell (taken_over / migration_in_progress) gets added as local state in the Still Us block.

### What stays unchanged
- All Still Us nav logic (back/X buttons, progress bar, handleFocusBack/Advance)
- `SectionView` props and crossfade animation
- `SessionStepReflection` CTA
- Kids layout (untouched)
- Archive block (untouched — still uses SessionFocusShell for now)
- `SessionFocusShell.tsx` file (kept, still used by archive)

### Key layout differences from SessionFocusShell → kids pattern
| Property | SessionFocusShell | Kids (target) |
|---|---|---|
| Content area overflow | `overflowY: 'auto', overflowX: 'hidden'` | `overflow: 'visible'` |
| White card overflow | `overflow: 'auto'` | `overflow: 'hidden'` |
| Content area padding | `12px 16px` | `12px 16px` (same) |
| White card padding | `24px 24px 24px` | `28px 24px 20px` |

### Risk: low
Single block change. Heartbeat is a simple interval+cleanup. All inner content (SectionView, nav, CTA) is copy-pasted from the existing props — no logic changes.

