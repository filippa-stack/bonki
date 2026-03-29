

## Changes to `src/pages/CardView.tsx`

Three targeted additions — no existing logic modified.

### 1. Reset `abandonCheckedRef` on `cardId` change
After line 384 (`const abandonCheckedRef = useRef(false);`), add:
```typescript
useEffect(() => {
  abandonCheckedRef.current = false;
}, [cardId]);
```

### 2. Reset `eagerSessionRef` on `cardId` change
After line 409 (`const eagerSessionRef = useRef(false);`), add:
```typescript
useEffect(() => {
  eagerSessionRef.current = false;
}, [cardId]);
```

### 3. Guard `useSessionReflections` with `isActiveSession`
Line 544-546 — change the first argument:
```typescript
const kidsNoteSession = useSessionReflections(
  isKidsProduct && isActiveSession ? (normalizedSession.sessionId ?? null) : null,
  kidsNoteStepIndex
);
```

### Protected patterns — all untouched
- `suppressUntilRef.current = Date.now() + 2000` in useNormalizedSessionState.ts
- `prevServerStepRef.current = serverStepIndex` in CardView.tsx
- `clearTimeout(pendingSave.current)` in useSessionReflections.ts
- `hasSyncedRef.current = true` in SessionStepReflection.tsx

