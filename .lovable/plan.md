

## Lock Down Dev/Demo Mode on Production

### Changes

**File 1: `src/lib/devTools.ts`**
- Add `isPreviewEnvironment()` with explicit production domain blocklist (`bonkiapp.com`, `www.bonkiapp.com`, `bonki.lovable.app`) + allowlist (`localhost`, `preview--`, `.local`)
- Guard `isDevToolsEnabled()` with early `return false` if not preview environment

**File 2: `src/lib/demoMode.ts`**
- Import `isPreviewEnvironment` from devTools
- Guard `isDemoParam()` with early `return false` if not preview environment

**File 3: `src/contexts/DevStateContext.tsx`**
- Import `isPreviewEnvironment` from devTools
- In the `useMemo`, return `null` early if `!isPreviewEnvironment()` before checking URL params

### Not changed
Auth, routes, paywall components, session logic, product access tables.

