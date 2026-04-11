

## Plan: Hardcode PostHog API Key

**One file, one change.**

In `src/lib/posthog.ts`, replace the `import.meta.env.VITE_POSTHOG_KEY` reference with the hardcoded key string `'phc_w5wABbJBgmrRGDGsZX4GaGYovzvt2qW6is7CXo5Jrxcp'`. Remove the env-var guard since the key is now always present.

### Change

**`src/lib/posthog.ts`** — Replace lines 4–7:
```typescript
// Before
const key = import.meta.env.VITE_POSTHOG_KEY;
if (!key) {
  console.warn('[PostHog] VITE_POSTHOG_KEY not set — analytics disabled');
  return;
}

posthog.init(key, {
```

```typescript
// After
posthog.init('phc_w5wABbJBgmrRGDGsZX4GaGYovzvt2qW6is7CXo5Jrxcp', {
```

No other files touched.

