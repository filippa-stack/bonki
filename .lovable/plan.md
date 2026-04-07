

## Un-gate console.log calls in CardView.tsx

### What changes

Remove the `if (isDevToolsEnabled())` guard from all 5 gated `console.log` lines in `src/pages/CardView.tsx`, so they always fire — enabling production tracing of session creation and recovery.

### Lines to edit

| Line | Before | After |
|------|--------|-------|
| 434 | `if (isDevToolsEnabled()) console.log('[lazy] abandon...')` | `console.log('[lazy] abandon...')` |
| 470 | `if (isDevToolsEnabled()) console.log('[eager] creating...')` | `console.log('[eager] creating...')` |
| 764 | `if (isDevToolsEnabled()) console.log('[step-complete] no sessionId...')` | `console.log('[step-complete] no sessionId...')` |
| 873 | `if (isDevToolsEnabled()) console.log('[step-complete] session_inactive...')` | `console.log('[step-complete] session_inactive...')` |
| 880 | `if (isDevToolsEnabled()) console.log('[step-complete] recovered...')` | `console.log('[step-complete] recovered...')` |

### File
- `src/pages/CardView.tsx` — 5 single-line edits (remove gate prefix only)

