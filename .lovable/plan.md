

## Fix C — Auth guard feedback

Replace `if (!user) return;` with error-setting guard in four paywall files.

### Changes

**1. src/components/ProductPaywall.tsx (line 83)**
```typescript
if (!user) {
  setError('Du behöver vara inloggad. Försök ladda om sidan.');
  return;
}
```

**2. src/components/PaywallBottomSheet.tsx (line 84)**
```typescript
if (!user) {
  setError('Du behöver vara inloggad. Försök ladda om sidan.');
  return;
}
```

**3. src/pages/PaywallFullScreen.tsx (line 73)**
```typescript
if (!user) {
  setError('Du behöver vara inloggad. Försök ladda om sidan.');
  return;
}
```

**4. src/pages/Paywall.tsx (line 44)**
```typescript
if (!user?.id) {
  setError('Du behöver vara inloggad. Försök ladda om sidan.');
  return;
}
```

All four files already have `error` state and UI, so the message will display immediately.

