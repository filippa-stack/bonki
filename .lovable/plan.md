## Track B (revised) — Delete the reviewer surface entirely

Reviewers now use `appreview@bonkistudio.com` via the standard OTP flow with full product access on Live. Delete the reviewer-only UI and the password-reset function.

### Diffs

**1. `src/pages/Login.tsx`** — 4 edits

**Edit A — lines 54–60** (collapse reviewer flags into native-only check)
```diff
   const [searchParams] = useSearchParams();
-  // Legacy flag (URL OR native) — preserved exactly for the unchanged legacy JSX branch.
-  const isReviewerMode = searchParams.get('review') === '1' || Capacitor.isNativePlatform();
-  // New, narrowly-scoped flags for the web redesign branch.
-  const isReviewerWeb = searchParams.get('review') === '1';
-  const isNativePlatform = Capacitor.isNativePlatform();
-  const skipRedesign = isReviewerWeb || isNativePlatform;
+  const isNativePlatform = Capacitor.isNativePlatform();
+  // Native renders the legacy JSX branch; web always renders the redesign branch.
+  const skipRedesign = isNativePlatform;
```
Note: `searchParams` is still used by `isDemoParam()` (which reads `?demo=...` internally), so the import stays.

**Edit B — lines 73–75** (remove reviewer state)
```diff
   const [googleLoading, setGoogleLoading] = useState(false);
-  const [reviewerEmail, setReviewerEmail] = useState('');
-  const [reviewerPassword, setReviewerPassword] = useState('');
-  const [reviewerLoading, setReviewerLoading] = useState(false);
   const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
```

**Edit C — lines 311–341** (remove `handleReviewerSignIn`)
Delete the entire function. `toast` import stays — it's still used by `handleNativeAppleSignIn` (line 205) and `handleNativeGoogleSignIn` (line 230).

**Edit D — lines 969–1042** (remove reviewer JSX block)
Delete the entire `{isReviewerMode && !isNative && !otpSent && !showEmailForm && (...)}` block including its surrounding hairline divider and "Recensentinloggning" header.

Also: small comment cleanup on line 100 (drop "web reviewer" reference) and line 353 (update render-branching comment to reflect that web no longer has a reviewer escape hatch).

**2. `supabase/functions/reset-reviewer-password/index.ts`** — delete file. Then call `supabase--delete_edge_functions` with `["reset-reviewer-password"]` to remove from Test + Live.

**3. `supabase/config.toml`** — delete lines 54–55:
```diff
   [functions.process-email-queue]
     verify_jwt = true
-  [functions.reset-reviewer-password]
-    verify_jwt = false
   [functions.revoke-reviewer-access]
     verify_jwt = false
```

### Files NOT touched
`src/lib/appleSignIn.ts`, `src/lib/googleSignIn.ts`, `capacitor.config.ts`, `src/contexts/AuthContext.tsx`, `src/integrations/supabase/client.ts`, `src/integrations/lovable/index.ts`, `CardView.tsx`, `useNormalizedSessionState.ts`, `useSessionReflections.ts`, `SessionStepReflection.tsx`, `useCardTakeaway.ts`. Demo mode and OTP flow remain intact. `revoke-reviewer-access` stays deployed.

### Verification (run after apply)
1. `rg -n "reviewer|Reviewer|RECENSENT|Recensentinloggning|review=1|handleReviewerSignIn|isReviewerMode|isReviewerWeb|BonkiReview2026" src/ supabase/` — expect zero matches in `src/`; only `revoke-reviewer-access/index.ts` may legitimately mention "reviewer" in `supabase/`.
2. `rg -n "isDemoParam|enterDemoMode" src/pages/Login.tsx` — expect both still imported (line 12) and called (lines ~609, ~611, ~940, ~942).
3. `ls supabase/functions/ | rg reviewer` — expect only `revoke-reviewer-access`.
4. Confirm via Supabase function listing that `reset-reviewer-password` is gone from both Test and Live.
5. Manual smoke: `/login` on web shows OTP/Google/Apple only, no reviewer block; `/?demo=1` (or whatever query triggers `isDemoParam()`) still surfaces the demo CTA.

I'll paste each diff and the verification output in the reply once applied.