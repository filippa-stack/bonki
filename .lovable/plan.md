

## Fix: Move unified loading gate inside providers

### Problem
`ProtectedRoutes` calls `useCoupleSpaceContext()` and `useNormalizedSessionContext()` at lines 69-70, but `CoupleSpaceProvider` and `NormalizedSessionProvider` don't wrap until lines 89-90 inside the return JSX. The hooks execute before their providers exist → crash.

### Solution
Extract the loading gate + routes into a new inner component (`ProtectedContent`) that renders inside the providers. `ProtectedRoutes` handles only auth check and wraps providers. `ProtectedContent` consumes the contexts safely.

### Change (single file: `src/App.tsx`)

**`ProtectedRoutes`** — remove lines 69-70 and 76-78 (the context hooks and unified gate). Keep only auth loading check and the provider wrapping.

**New `ProtectedContent` component** — placed inside the provider tree, contains:
```typescript
function ProtectedContent() {
  const { loading: spaceLoading } = useCoupleSpaceContext();
  const { loading: sessionLoading } = useNormalizedSessionContext();
  const hasContentRendered = useRef(false);

  if (!hasContentRendered.current && (spaceLoading || sessionLoading)) {
    return <BonkiLoadingScreen />;
  }
  hasContentRendered.current = true;

  return (
    <>
      <InstallGuideBanner />
      <ActiveSessionGuard>
        <div style={{ minHeight: '100vh', background: 'var(--page-bg, #0B1026)' }}>
          <Routes>
            {/* all existing routes */}
          </Routes>
        </div>
        <BottomNav />
      </ActiveSessionGuard>
    </>
  );
}
```

**`ProtectedRoutes` return** becomes:
```typescript
return (
  <CoupleSpaceProvider>
    <NormalizedSessionProvider>
      <OptimisticCompletionsProvider>
        <AppProvider>
          <ProtectedContent />
        </AppProvider>
      </OptimisticCompletionsProvider>
    </NormalizedSessionProvider>
  </CoupleSpaceProvider>
);
```

```text
ProtectedRoutes (auth check only)
  └── CoupleSpaceProvider
       └── NormalizedSessionProvider
            └── AppProvider
                 └── ProtectedContent  ← contexts available here
                      ├── unified gate (spaceLoading || sessionLoading)
                      └── ActiveSessionGuard → Routes
```

### Files modified
| File | Action |
|---|---|
| `src/App.tsx` | Edit (~20 lines restructured) |

### Not changed
All DO NOT CHANGE items. `useRouteTheme` stays in `AppRoutes`. `index.html` change already applied.

