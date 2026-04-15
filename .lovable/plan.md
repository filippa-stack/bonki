

## Fix Capacitor Config for Production Build

### Change
**File:** `capacitor.config.ts`

Replace the `server` block that points to the Lovable preview URL with an empty object, so the native app loads from locally built files in `dist/`.

**FROM:**
```ts
server: {
  url: 'https://1604837d-627c-4368-a714-aa6b770c1b8c.lovableproject.com?forceHideBadge=true',
  cleartext: true,
},
```

**TO:**
```ts
server: {},
```

Everything else (`appId`, `appName`, `webDir`) stays unchanged.

### Files Modified
- `capacitor.config.ts` (1 line change)

