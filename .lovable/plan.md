

## Lock KontoSheet to a fixed light surface

Pick option A: hardcode the sheet's background and text colors so it always looks the same regardless of which theme the host page is using. This is the predictable, low-risk fix — the sheet is a system menu (account/privacy/logout), not product content, so it shouldn't drift with theme tokens.

### Changes — `src/components/KontoSheet.tsx` only

Replace token references with fixed values:

- **Sheet container** `backgroundColor`: `var(--surface-raised)` → `'#F7F2EB'` (cream)
- **Title "Konto"** `color`: `var(--color-text-primary)` → `'#2C2420'` (Bark, dark)
- **Email row** `color`: `var(--color-text-secondary)` → `'#6B5E52'` (Driftwood, muted dark)
- **Integritetspolicy button** `color`: `var(--color-text-primary)` → `'#2C2420'`
- **Dividers** `background`: `hsl(var(--divider))` → `'hsla(30, 15%, 20%, 0.10)'` (faint dark hairline that reads on cream)

Logga ut (`#8B3A3A`) and Radera konto (`#8B3A3A` at 0.4 opacity) already use hardcoded burgundy — leave them as-is.

Backdrop, layout, padding, font weights, font classes, button behavior, and all four host pages stay untouched.

### Result

Sheet renders identically on every surface — Library, kids product homes, Vårt Vi home, and Era samtal — with strong contrast: dark Bark title, muted Driftwood email, dark Bark "Integritetspolicy", burgundy "Logga ut", faded burgundy "Radera konto". No more washout when a darker theme like `stilla` is active behind it.

