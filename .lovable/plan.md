

## Performance: Apply Fixes 3 + 4

Two surgical changes, no structural risk.

### Fix 3: `src/hooks/useSettingsSync.ts`
In `loadSettings()`, skip the `migrateDeviceData` call when no device_id exists in localStorage. Change:

```
await migrateDeviceData(userId);
```
to:
```
if (getDeviceId()) {
  await migrateDeviceData(userId);
}
```

This avoids a wasted query + potential insert round-trip on every app load for users who never had the old device-based system.

### Fix 4: `src/pages/Index.tsx`
Move the synchronous onboarding short-circuit out of the `useEffect` and into the `useState` initializer. Change:

```typescript
const [dbOnboardingChecked, setDbOnboardingChecked] = useState(false);
```
to:
```typescript
const [dbOnboardingChecked, setDbOnboardingChecked] = useState(hasCompletedOnboarding);
```

This eliminates one render frame where `dbOnboardingChecked` is `false` despite `hasCompletedOnboarding` being `true`, removing a flash of `BonkiLoadingScreen`. The existing `useEffect` still handles the DB fallback for users who cleared localStorage.

### Files changed
- `src/hooks/useSettingsSync.ts` — 3-line guard around `migrateDeviceData`
- `src/pages/Index.tsx` — 1-line change to `useState` initializer

### Not changed
- App.tsx provider nesting (Fix 2 — deferred)
- AuthContext prefetch (Fix 5 — deferred)
- useCoupleSpace RPC consolidation (Fix 1 — deferred)

