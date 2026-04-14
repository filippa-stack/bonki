

## Skip Install Step — Default to Audience Selection

Single-line change in `src/components/Onboarding.tsx` to bypass the install step and default directly to audience selection.

### Change

**Line 240-244**: Replace the conditional `useState` initializer with a simple string literal:

```typescript
const [step, setStep] = useState<'install' | 'audience'>('audience');
```

This removes the localStorage check and standalone detection, ensuring all users land directly on the audience selection screen.

### Preserved

- `InstallStepView` component (lines 71-174) — kept as unused code
- `handleSkipInstall` function (lines 247-250) — kept as unused code
- No other files modified

