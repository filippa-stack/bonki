

## Onboarding CTA → Bonki Orange

### The issue
The saffron BonkiButton merges with the warm ambient glow behind the illustration, reducing visual contrast. The onboarding "Börja" button is the single most important tap target in the entire app — it needs to command attention.

### Change (1 file: `src/components/Onboarding.tsx`)

**Override BonkiButton color via `style` prop**
- Pass a custom `style` to BonkiButton that replaces the saffron gradient with a Bonki Orange gradient
- Use `BONKI_ORANGE` (#E85D2C) as the light stop and a darker variant (#C44D22) as the bottom stop
- Update the `boxShadow` glow to use orange-tinted shadows instead of saffron-tinted
- This is a one-off override — BonkiButton's default saffron stays intact for all other uses

```tsx
<BonkiButton
  style={{
    background: 'linear-gradient(180deg, #E85D2C 0%, #C44D22 100%)',
    boxShadow: [
      '0 10px 28px rgba(232, 93, 44, 0.35)',
      '0 4px 10px rgba(232, 93, 44, 0.20)',
      '0 1px 3px rgba(0, 0, 0, 0.12)',
      'inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
      'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
    ].join(', '),
  }}
  onClick={...}
>
  Börja
</BonkiButton>
```

### What stays untouched
- BonkiButton component itself (saffron default preserved)
- All animation patterns, layout, text content
- `trackOnboardingEvent` and onboarding logic

