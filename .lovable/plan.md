

## Onboarding Age Routing

Two files modified: `Onboarding.tsx` and `Index.tsx`.

### 1. `src/components/Onboarding.tsx`

**Add import**: `useState` from React (line 1).

**Add state** (line 18, inside component):
```tsx
const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
```

**Insert audience selector** between the body text `</motion.p>` (line 159) and the closing `</div>` of the content section (line 160). New block:

```tsx
{/* ── Audience routing pills ── */}
<div style={{ padding: '20px 0 0' }}>
  <p style={{
    fontFamily: 'var(--font-sans)', fontSize: '13px', fontWeight: 500,
    color: '#FDF6E3', opacity: 0.5, marginBottom: '12px', margin: '0 0 12px',
  }}>
    Vem vill ni prata med?
  </p>
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {[
      { label: 'Barn 3–6', value: 'young' },
      { label: 'Barn 7–11', value: 'middle' },
      { label: 'Barn 12+', value: 'teen' },
      { label: 'Oss som par', value: 'couple' },
    ].map(({ label, value }) => {
      const selected = selectedAudience === value;
      return (
        <button key={value} onClick={() => setSelectedAudience(value)} style={{
          padding: '10px 20px', borderRadius: '20px', cursor: 'pointer',
          transition: 'all 0.15s ease',
          fontFamily: 'var(--font-sans)', fontSize: '14px',
          border: selected
            ? '1px solid hsla(40, 78%, 61%, 0.4)'
            : '1px solid hsla(0, 0%, 100%, 0.15)',
          background: selected
            ? 'hsla(40, 78%, 61%, 0.12)'
            : 'hsla(0, 0%, 100%, 0.06)',
          color: selected ? '#DA9D1D' : 'rgba(253, 246, 227, 0.85)',
        }}>
          {label}
        </button>
      );
    })}
  </div>
</div>
```

**Modify CTA button** (line 175): Add conditional styling and persist audience on click.

- Add to BonkiButton's style: `opacity: selectedAudience ? 1 : 0.4, pointerEvents: selectedAudience ? 'auto' : 'none'`
- Update onClick:
```tsx
onClick={() => {
  localStorage.setItem('bonki-onboarding-audience', selectedAudience!);
  trackOnboardingEvent('onboarding_complete', { audience: selectedAudience });
  initializeCoupleSpace();
  completeOnboarding();
}}
```

### 2. `src/pages/Index.tsx`

Insert after line 127 (after the onboarding gate `return <Onboarding />`), before the purchase redirect block:

```tsx
// One-time audience routing after first onboarding
const audience = localStorage.getItem('bonki-onboarding-audience');
if (audience && !localStorage.getItem('bonki-first-session-done')) {
  localStorage.removeItem('bonki-onboarding-audience');
  localStorage.setItem('bonki-first-session-done', '1');
  const routes: Record<string, string> = {
    young: '/product/jag-i-mig',
    middle: '/product/jag-med-andra',
    teen: '/product/jag-i-varlden',
    couple: '/product/still-us',
  };
  const target = routes[audience] || '/';
  return <Navigate to={target} replace />;
}
```

No other files changed. Existing routing, auth, and ProductIntro logic untouched.

