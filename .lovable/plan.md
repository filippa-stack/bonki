

## Fix: Audience routing in Index.tsx — ref capture + block reorder

Two surgical changes in one file, no other files touched.

### Change 1: Add `audienceRef`
Add `const audienceRef = useRef(localStorage.getItem('bonki-onboarding-audience'));` at the top of the component body, next to the existing `migrationRan` ref.

### Change 2: Move audience routing block before the onboarding gate
Cut the existing audience routing block (lines ~130–141) and paste it after `const demoActive = isDemoMode();` but **before** the `if (!hasCompletedOnboarding ...)` gate. Update it to read from `audienceRef.current` instead of `localStorage.getItem`, and null the ref after consuming.

### Resulting order in the component:

```text
1. hooks (useApp, useCoupleSpaceContext, useAuth, etc.)
2. migrationRan ref + audienceRef (new)
3. migration useEffect
4. usePartnerNotifications
5. devState checks (onboarding, productIntro, library, diary)
6. devBypassGates, demoActive
7. ★ audience routing block (moved here, uses audienceRef.current)
8. onboarding gate
9. post-purchase redirect
10. still-us legacy redirect
11. skip-to-product
12. par first visit
13. return <ProductLibrary />
```

### File edited
- `src/pages/Index.tsx`

