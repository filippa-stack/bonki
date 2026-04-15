

## Fix Login OTP UI: Show Code Input & Update Button Label

### Problem
The email login flow sends a 6-digit OTP code, but the UI still references a "magic link" in two places:
1. Lines 243-258: Instructions say "Tryck på knappen i mejlet" (click button in email)
2. Line 311: Button says "Skicka inloggningslänk" (Send login link)

### Solution
Replace magic link text with OTP code input UI and update button label.

---

### Change 1: Replace Magic Link Instructions with OTP Code Input (lines 243-268)

**Current (lines 243-268):**
```tsx
<div style={{ 
  textAlign: 'center',
  padding: '8px 0',
}}>
  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'rgba(253, 246, 227, 0.85)', lineHeight: 1.6 }}>
    Vi har skickat ett mejl till
  </p>
  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'rgba(212, 245, 192, 0.9)', fontWeight: 500, marginTop: '4px' }}>
    {email}
  </p>
  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'rgba(253, 246, 227, 0.6)', marginTop: '16px', lineHeight: 1.5 }}>
    Tryck på knappen i mejlet för att verifiera och logga in.
  </p>
  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(253, 246, 227, 0.4)', marginTop: '12px', lineHeight: 1.5 }}>
    Hittar du inte mejlet? Kolla din skräppost.
  </p>
</div>

<button
  onClick={handleResend}
  disabled={resendCooldown > 0 || loading}
  className="text-sm disabled:opacity-40"
  style={{ color: 'rgba(212, 245, 192, 0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
>
  {resendCooldown > 0 ? `Skicka igen (${resendCooldown}s)` : 'Skicka mejlet igen'}
</button>
```

**Replace with:**
```tsx
<div style={{ 
  textAlign: 'center',
  padding: '8px 0',
}}>
  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'rgba(253, 246, 227, 0.85)', lineHeight: 1.6 }}>
    Vi har skickat en kod till
  </p>
  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: 'rgba(212, 245, 192, 0.9)', fontWeight: 500, marginTop: '4px' }}>
    {email}
  </p>
  <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'rgba(253, 246, 227, 0.6)', marginTop: '16px', lineHeight: 1.5 }}>
    Ange den 6-siffriga koden nedan.
  </p>
</div>

<div className="flex justify-center" style={{ marginTop: '8px' }}>
  <InputOTP maxLength={6} value={otpCode} onChange={(val) => { setOtpCode(val); setError(null); }}>
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
      <InputOTPSlot index={3} />
      <InputOTPSlot index={4} />
      <InputOTPSlot index={5} />
    </InputOTPGroup>
  </InputOTP>
</div>

<button
  onClick={handleVerifyOtp}
  disabled={verifying || otpCode.length !== 6}
  className="w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2 border-0 text-white disabled:opacity-50"
  style={{
    background: ORANGE_GRADIENT,
    boxShadow: ORANGE_SHADOW,
    marginTop: '8px',
  }}
>
  {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verifiera'}
</button>

<p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(253, 246, 227, 0.4)', marginTop: '12px', lineHeight: 1.5 }}>
  Hittar du inte mejlet? Kolla din skräppost.
</p>

<button
  onClick={handleResend}
  disabled={resendCooldown > 0 || loading}
  className="text-sm disabled:opacity-40"
  style={{ color: 'rgba(212, 245, 192, 0.7)', background: 'none', border: 'none', cursor: 'pointer' }}
>
  {resendCooldown > 0 ? `Skicka igen (${resendCooldown}s)` : 'Skicka mejlet igen'}
</button>
```

---

### Change 2: Fix Email Form Button Label (line 311)

**Current:**
```tsx
{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Skicka inloggningslänk'}
```

**Replace with:**
```tsx
{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Skicka inloggningskod'}
```

---

### Files Modified
- `src/pages/Login.tsx` (2 changes)

### Not Changed
- Import statement (InputOTP already imported on line 13)
- State variables `otpCode`, `verifying` (already defined)
- Functions: `handleEmailSignIn`, `handleVerifyOtp`, `handleGoogleSignIn`, `handleResend`
- Tillbaka button, terms consent, Google sign-in flow

