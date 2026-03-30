

## Switch SessionStepReflection sessionId to use `activeSessionId`

Two identical prop replacements in `src/pages/CardView.tsx`. No other changes.

### Changes

**Line 2509** (Still Us Focus Mode path):
```
sessionId={isActiveSession ? normalizedSession.sessionId : null}
→
sessionId={activeSessionId ?? null}
```

**Line 3338** (Standard/kids path):
```
sessionId={isActiveSession ? normalizedSession.sessionId : null}
→
sessionId={activeSessionId ?? null}
```

### What stays untouched
- `activeSessionId` state + useEffect, `isActiveSession`, `kidsNoteSession` hook
- All four protected patterns (`suppressUntilRef`, `prevServerStepRef`, `clearTimeout(pendingSave.current)` ×2, `hasSyncedRef`)
- No other files modified

