

## Auth Error Handling

**File: `src/contexts/AuthContext.tsx`**

Add `.catch()` to the `getSession()` promise chain (lines ~79–84):

- Log error with `[AuthContext] getSession failed:`
- Set `initialSessionResolved = true`, session/user to null, loading to false
- Ensures the app never hangs on a failed backend connection

No other changes. The `onAuthStateChange` listener, `savePendingLegalConsent`, and `initialSessionResolved` gate pattern remain untouched.

