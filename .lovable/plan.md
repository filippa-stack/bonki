

## Replace "Detta Kort" with product name on all paywalls

Single, surgical fix. The string `'Detta kort'` lives in exactly one place: the heading fallback in `ProductPaywall.tsx`. It fires whenever the paywall is rendered without a specific `currentCardTitle` — which is what happens on every product home (Jag i Mig, Syskon, Vardagskort, Jag med Andra, Jag i Världen, Sexualitet) when a locked user lands there.

### The change — `src/components/ProductPaywall.tsx` only

**Heading fallback (line 73):**
- Before: `const headingText = currentCardTitle || 'Detta kort';`
- After: `const headingText = currentCardTitle || product.name;`

That's it. One line. The component already receives `product` as a prop, so `product.name` ("Jag i Mig", "Syskonkort", "Vardagskort", "Jag med Andra", "Jag i Världen", "Sexualitetskort") is available everywhere the fallback fires.

### What this does

- Locked user opens **Jag i Mig** product home → heading reads **"Jag i Mig"** (not "Detta kort")
- Locked user opens **Syskonkort** → heading reads **"Syskonkort"**
- Locked user clicks a **specific locked card** → heading still reads the card title (unchanged behavior — `currentCardTitle` is passed)

### Untouched

- `currentCardTitle` path (still used when a specific card is tapped — that framing is correct there)
- Subtitle line ("Ingår i {product} · N samtalsämnen") — separate concern, leave as-is
- All other "kort" copy across the app — separate concern, leave as-is
- CTA, pricing, value lines, layout, styling — all unchanged
- `PaywallFullScreen.tsx`, `PaywallBottomSheet.tsx` — neither uses the "Detta kort" string

### Verification

Open `/?devState=solo` (or any product home as a locked user) → heading shows the product name, not "Detta kort". OTP/Google/payment logic untouched.

