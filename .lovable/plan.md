

## Replace Creature Logo on Onboarding and Login

Swap the current creature logo (`bonki-logo-transparent.png`) with the new uploaded illustration on both the onboarding screen and login page.

### Steps

1. **Copy asset** — `user-uploads://BONKI_1_3.png` → `src/assets/bonki-logo-transparent.png` (overwrite existing)

2. **No code changes needed** — Both `Onboarding.tsx` (line 9) and `Login.tsx` (line 13) already import from `@/assets/bonki-logo-transparent.png`, so the new image will appear automatically.

The new illustration is a transparent PNG with the same soft green line-art style, so it will work with the existing radial glow backdrop on onboarding and the dark background on login.

