

## Wire Logga ut in KontoSheet — mirror Header.tsx exactly

Single-file change to `src/components/KontoSheet.tsx`. Header's existing handler is the source of truth.

### Header.tsx's pattern (verified in current file)

```ts
const handleSignOut = async () => {
  setShowLogoutSheet(false);  // close sheet (sync)
  await signOut();             // sign out (async)
  navigate('/login');          // navigate
};
```

No try/catch. No error handling. Just three lines in order.

### Changes — `src/components/KontoSheet.tsx` only

1. **Destructure `signOut`** from the existing `useAuth()` call:
   ```
   const { user, signOut } = useAuth();
   ```

2. **Add handler** alongside the other hooks at the top of the component body — mirroring Header exactly:
   ```
   const handleSignOut = async () => {
     onClose();
     await signOut();
     navigate('/login');
   };
   ```

3. **Wire the Logga ut button**: replace the stub `onClick` (and remove the `// TODO: wire in Prompt 2` comment) with `onClick={handleSignOut}`.

### Decisions on the two concerns

- **Ordering**: matches Header. The redundant `navigate('/login')` after auth-state clear is the same belt-and-braces Header already ships with. Keep it.
- **Error handling**: Header has none. Don't add any. Consistency with the proven live pattern wins over speculative defense.

### Untouched

- Header.tsx (its dead logout sheet stays for a future cleanup pass)
- AuthContext (existing `signOut` is correct)
- Routing / App.tsx
- Radera konto button (stays inert at 0.4 opacity for Prompt 5)
- All styling, layout, dividers, and the four host surfaces

### Result

Tapping Logga ut closes the sheet, ends the session, and lands on `/login` — byte-for-byte the same sequence Header.tsx already uses, just triggered from the new account sheet.

