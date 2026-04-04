

## Login Page Polish — 4 Changes

**File:** `src/pages/Login.tsx`

### Change 1: Value proposition below "På riktigt."
After line 152 (closing `</p>` of "På riktigt."), add:
```tsx
<p style={{
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  color: 'rgba(253, 246, 227, 0.5)',
  textAlign: 'center',
  marginTop: '12px',
}}>
  Verktyg för samtalen som inte blir av.
</p>
```

### Change 2: Visible terms checkbox
Line 303 — update the wrapper div styling to override the checkbox border/background for dark mode visibility, and add a minimum touch target:
```tsx
<div className="[&_label]:text-[rgba(245,237,210,0.6)] [&_button]:text-[rgba(212,245,192,0.7)] [&_button[role=checkbox]]:border-[rgba(253,246,227,0.3)] [&_button[role=checkbox]]:bg-[rgba(255,255,255,0.1)] [&_button[role=checkbox][data-state=checked]]:bg-[#E85D2C] [&_button[role=checkbox][data-state=checked]]:border-[#E85D2C] [&_button[role=checkbox]]:h-5 [&_button[role=checkbox]]:w-5">
```
This uses existing Tailwind arbitrary selectors to style the Radix checkbox — visible border, subtle background, Bonki Orange fill when checked, slightly larger (20px) for better tap target. The parent `flex items-start gap-3` in TermsConsent already provides adequate spacing.

### Change 3: Replace bottom tagline
Line 312-314 — change "Ert konto. Era samtal." to:
```tsx
<p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(253, 246, 227, 0.35)', textAlign: 'center', marginTop: '20px' }}>
  Gratis att börja — inget kort krävs.
</p>
```

### Change 4: Email ghost button
Lines 270-281 — replace the borderless text-link style with a ghost button:
```tsx
<button
  onClick={() => { setShowEmailForm(true); setError(null); }}
  className="w-full flex items-center justify-center gap-2 font-medium"
  style={{
    height: '48px',
    background: 'transparent',
    border: '1px solid rgba(253, 246, 227, 0.2)',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 500,
    color: 'rgba(253, 246, 227, 0.7)',
  }}
>
  <Mail className="w-5 h-5" />
  {t('login.continue_with_email')}
</button>
```

### Not changed
- Google button styling, auth logic, logo, "På riktigt." text, terms/privacy links and dialogs, any other file.

