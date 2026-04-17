

## Move Terms Above Email + Improve Visibility on BuyPage

**File:** `src/pages/BuyPage.tsx`

### Change 1 — Move terms block
Remove lines 360–366 (the terms block currently inside the OTP flow div) and insert it between the product context div (line 269) and the OTP flow div (line 271).

### Change 2 — Improve text visibility
Add className overrides to the terms wrapper div for cream-colored label text and orange links.

### Result (lines 269–278 area after edit):

```tsx
        </div>

        {/* Terms */}
        <div style={{ width: '100%', marginTop: '4px' }}>
          <div className="[&_label]:!text-[rgba(253,246,227,0.85)] [&_button]:!text-[#E85D2C] [&_a]:!text-[#E85D2C]" style={{ display: 'flex', justifyContent: 'center' }}>
            <TermsConsent checked={termsAccepted} onCheckedChange={(val) => { setTermsAccepted(!!val); if (val) setTermsError(false); }} />
          </div>
          {termsError && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#f87171', textAlign: 'center', marginTop: '8px' }}>Du behöver godkänna villkoren för att fortsätta.</p>}
        </div>

        {/* OTP flow */}
```

The old terms block (lines 360–366) is deleted from its current position.

### Files Modified
- `src/pages/BuyPage.tsx` (move + className addition, no logic changes)

