

## Fix Email Subject + OTP Input Text Color

### Problem
1. Magic link email subject is in English ("Your login link") instead of Swedish
2. OTP input digits are invisible on dark background (black text on dark blue)

### Solution
Three simple text/styling changes across three files.

---

### Change 1: Email Subject (supabase/functions/auth-email-hook/index.ts)

**Line 22** — Change subject from English to Swedish:

**FROM:**
```typescript
magiclink: 'Your login link',
```

**TO:**
```typescript
magiclink: 'Din inloggningskod',
```

---

### Change 2: OTP Input Styling (src/pages/Login.tsx)

**Line 258** — Add Tailwind utility classes to force light text color:

**FROM:**
```tsx
<div className="flex justify-center" style={{ marginTop: '8px' }}>
```

**TO:**
```tsx
<div className="flex justify-center [&_input]:!text-[#FDF6E3] [&_input]:!caret-[#FDF6E3] [&_div[data-slot]]:!text-[#FDF6E3] [&_div[data-slot]]:border-[rgba(253,246,227,0.3)]" style={{ marginTop: '8px' }}>
```

---

### Change 3: OTP Input Styling (src/pages/BuyPage.tsx)

**Line 295** — Same styling fix as Login.tsx:

**FROM:**
```tsx
<div className="flex justify-center" style={{ marginTop: '8px' }}>
```

**TO:**
```tsx
<div className="flex justify-center [&_input]:!text-[#FDF6E3] [&_input]:!caret-[#FDF6E3] [&_div[data-slot]]:!text-[#FDF6E3] [&_div[data-slot]]:border-[rgba(253,246,227,0.3)]" style={{ marginTop: '8px' }}>
```

---

### Files Modified
- `supabase/functions/auth-email-hook/index.ts` (1 line)
- `src/pages/Login.tsx` (1 line)
- `src/pages/BuyPage.tsx` (1 line)

### Not Changed
- OTP verification logic
- Email templates
- Any functions (handleVerifyOtp, handleEmailSignIn, handleResend)

