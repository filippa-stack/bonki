

## Auth Bootstrap Timeout Safety Net

Two small, tightly-scoped changes to prevent the Lovable preview from hanging on a blank dark screen forever.

---

### 1. Add 8-second timeout to auth bootstrap

**File:** `src/contexts/AuthContext.tsx`

Inside the existing `useEffect`, wrap the current logic with a `setTimeout` safety net:

- **Add** `const authTimeout = setTimeout(...)` that fires after 8 000 ms
- On timeout: set `loading` to `false`, mark `initialSessionResolved = true`, but do **not** touch `user`/`session`
- **Add** `clearTimeout(authTimeout)` in both the `.then()` and `.catch()` blocks of `getSession()`
- **Add** `clearTimeout(authTimeout)` in the cleanup return

Nothing else in AuthContext changes — `signOut`, `onAuthStateChange` event handling, and legal consent logic stay exactly as-is.

### 2. Add "Laddar..." label to loading screen

**File:** `src/components/BonkiLoadingScreen.tsx`

Add a `<p>` element with text "Laddar..." below the existing logo/mark divs, inside the centered column. Styled at 13 px, muted cream color (`rgba(253,246,227,0.3)`), `marginTop: 16px`.

---

### What stays untouched
- `signOut` function
- `onAuthStateChange` callback logic
- `getSession()` then/catch logic (only `clearTimeout` added)
- All other files

### Expected behavior
| Scenario | Result |
|---|---|
| Production (normal auth) | Resolves in < 2 s, timeout cleared, no change |
| Lovable preview (auth hangs) | After 8 s, loading releases → login renders |
| Slow 3G | Auth still resolves within 8 s window |
| Loading screen visible | Shows "Laddar..." text instead of blank dark screen |

