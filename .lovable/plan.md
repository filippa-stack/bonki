

## Synchronous Mobile Detection

**File: `src/hooks/use-mobile.tsx`**

Two changes:

1. **Line 6**: Replace `useState<boolean | undefined>(undefined)` with `useState<boolean>(typeof window !== "undefined" ? window.innerWidth < MOBILE_BREAKPOINT : true)`

2. **Line 16**: Replace `return !!isMobile` with `return isMobile`

No other changes. useEffect and event listener untouched.

