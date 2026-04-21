import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getProductById } from '@/data/products';
import { Loader2, ArrowLeft } from 'lucide-react';
import { MIDNIGHT_INK, LANTERN_GLOW } from '@/lib/palette';
import { usePageBackground } from '@/hooks/usePageBackground';

import TermsConsent from '@/components/TermsConsent';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/legal';
import { PREVIEW_QUESTION } from '@/lib/productPreviewQuestions';

const ORANGE_GRADIENT = 'linear-gradient(180deg, #E85D2C 0%, #C44D22 100%)';
const ORANGE_SHADOW = [
  '0 10px 28px rgba(232, 93, 44, 0.35)',
  '0 4px 10px rgba(232, 93, 44, 0.20)',
  '0 1px 3px rgba(0, 0, 0, 0.12)',
  'inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
  'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
].join(', ');

export default function BuyPage() {
  usePageBackground(MIDNIGHT_INK);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const productId = searchParams.get('product') ?? '';
  const product = getProductById(productId);

  // Login state
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Checkout state (authenticated flow auto-trigger)
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const checkoutTriggered = useRef(false);

  // Website-direct checkout state (unauthenticated flow)
  const [directCheckoutLoading, setDirectCheckoutLoading] = useState(false);
  const [directCheckoutError, setDirectCheckoutError] = useState<string | null>(null);

  // Price from DB
  const [priceSek, setPriceSek] = useState<number | null>(null);

  // Detect return from Stripe cancel — prevents auto-retrigger loop
  const isCancelReturn = searchParams.get('cancelled') === '1';

  useEffect(() => {
    return () => { if (cooldownRef.current) clearInterval(cooldownRef.current); };
  }, []);

  // Fetch price
  useEffect(() => {
    if (!productId) return;
    supabase
      .from('products')
      .select('price_sek')
      .eq('id', productId)
      .single()
      .then(({ data }) => {
        setPriceSek(data?.price_sek ?? (productId === 'still_us' ? 249 : 195));
      });
  }, [productId]);

  const startCooldown = () => {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { if (cooldownRef.current) clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const saveConsent = () => {
    const consentTimestamp = new Date().toISOString();
    localStorage.setItem('pending-legal-consent', JSON.stringify({
      terms: { acceptedAt: consentTimestamp, version: TERMS_VERSION },
      privacy: { acceptedAt: consentTimestamp, version: PRIVACY_VERSION },
    }));
  };

  // Trigger Stripe checkout
  const triggerCheckout = useCallback(async () => {
    if (checkoutTriggered.current) return;
    checkoutTriggered.current = true;
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setCheckoutError('Kunde inte verifiera din session. Försök ladda om sidan.');
        checkoutTriggered.current = false;
        setCheckoutLoading(false);
        return;
      }

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            productId,
            successUrl: `${window.location.origin}/?purchase=success&product=${productId}`,
            cancelUrl: `${window.location.origin}/buy?product=${productId}&cancelled=1`,
          }),
        },
      );

      const json = await res.json();

      if (json.error === 'already_purchased') {
        navigate(`/product/${product?.slug ?? productId}`, { replace: true });
        return;
      }

      if (!res.ok) {
        setCheckoutError(res.status === 503
          ? 'Betalning är inte konfigurerad ännu. Kontakta oss!'
          : json.error || 'Något gick fel');
        checkoutTriggered.current = false;
        setCheckoutLoading(false);
        return;
      }

      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError('Kunde inte starta betalningen');
      checkoutTriggered.current = false;
      setCheckoutLoading(false);
    }
  }, [productId, product?.slug, navigate]);

  // Direct-to-Stripe for unauthenticated website-direct visitors.
  // No auth, no email form beforehand — Stripe collects email on its hosted form.
  // Post-payment: redirects to /claim for OTP-based login.
  const handleDirectCheckout = useCallback(async () => {
    if (directCheckoutLoading) return;

    if (!termsAccepted) {
      setTermsError(true);
      return;
    }

    setDirectCheckoutLoading(true);
    setDirectCheckoutError(null);

    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

      const consentTimestamp = new Date().toISOString();
      localStorage.setItem('pending-legal-consent', JSON.stringify({
        terms: { acceptedAt: consentTimestamp, version: TERMS_VERSION },
        privacy: { acceptedAt: consentTimestamp, version: PRIVACY_VERSION },
      }));

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/create-checkout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            successUrl: `${window.location.origin}/claim?session_id={CHECKOUT_SESSION_ID}&product=${productId}`,
            cancelUrl: `${window.location.origin}/buy?product=${productId}&cancelled=1`,
          }),
        },
      );
      const json = await res.json();

      if (!res.ok) {
        setDirectCheckoutError(res.status === 503
          ? 'Betalning är inte konfigurerad ännu. Kontakta oss!'
          : json.error || 'Något gick fel');
        setDirectCheckoutLoading(false);
        localStorage.removeItem('pending-legal-consent');
        return;
      }

      if (json.url) {
        window.location.href = json.url;
      } else {
        setDirectCheckoutError('Kunde inte starta betalningen');
        setDirectCheckoutLoading(false);
        localStorage.removeItem('pending-legal-consent');
      }
    } catch (err) {
      console.error('Direct checkout error:', err);
      setDirectCheckoutError('Kunde inte starta betalningen');
      setDirectCheckoutLoading(false);
      localStorage.removeItem('pending-legal-consent');
    }
  }, [productId, directCheckoutLoading, termsAccepted]);

  // Auto-trigger checkout when user is logged in — unless they just tapped back from Stripe
  useEffect(() => {
    if (authLoading) return;
    if (isCancelReturn) return; // User tapped back from Stripe — don't slingshot them
    if (user && product && !checkoutTriggered.current) {
      triggerCheckout();
    }
  }, [user, authLoading, product, triggerCheckout, isCancelReturn]);

  // Email login
  const handleEmailSignIn = async () => {
    if (!termsAccepted) { setTermsError(true); return; }
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    saveConsent();
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) { setError(error.message); localStorage.removeItem('pending-legal-consent'); }
      else { setOtpSent(true); startCooldown(); }
    } catch {
      setError('Något gick fel. Försök igen.');
      localStorage.removeItem('pending-legal-consent');
    } finally { setLoading(false); }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) return;
    setVerifying(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode,
        type: 'email',
      });
      if (error) { setError(error.message); }
    } catch {
      setError('Något gick fel. Försök igen.');
    } finally { setVerifying(false); }
  };

  // Resend
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (error) { setError(error.message); } else { startCooldown(); }
    } catch {
      setError('Något gick fel. Försök igen.');
    } finally { setLoading(false); }
  };

  // ── Invalid product ──
  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '16px', color: LANTERN_GLOW, opacity: 0.7 }}>
          Produkten hittades inte.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: LANTERN_GLOW, opacity: 0.5, background: 'none', border: 'none', cursor: 'pointer', marginTop: '16px' }}
        >
          Gå till inloggning →
        </button>
      </div>
    );
  }

  // ── Checkout in progress (user is logged in) ──
  if (user && (checkoutLoading || checkoutTriggered.current)) {
    return (
      <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', gap: '16px' }}>
        {checkoutError ? (
          <>
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: '#f87171', textAlign: 'center', maxWidth: '300px' }}>
              {checkoutError}
            </p>
            <button
              onClick={() => { checkoutTriggered.current = false; triggerCheckout(); }}
              style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 600, color: '#fff', background: ORANGE_GRADIENT, border: 'none', borderRadius: '12px', padding: '14px 28px', cursor: 'pointer' }}
            >
              Försök igen
            </button>
          </>
        ) : (
          <>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: LANTERN_GLOW }} />
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', color: LANTERN_GLOW, opacity: 0.7 }}>
              Förbereder betalning...
            </p>
          </>
        )}
      </div>
    );
  }

  // ── Unauthenticated website-direct flow ──
  // Selling surface + single direct-to-Stripe button. OTP happens post-purchase
  // on /claim, not here.
  return (
    <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Product hero */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(253, 246, 227, 0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Du köper
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', color: LANTERN_GLOW, fontWeight: 600, marginTop: '6px', lineHeight: 1.2 }}>
            {product.name}
          </p>
          {product.tagline && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'rgba(253, 246, 227, 0.6)', marginTop: '8px', lineHeight: 1.5 }}>
              {product.tagline}
            </p>
          )}
        </div>

        {/* Preview question */}
        {PREVIEW_QUESTION[productId] && (
          <div
            style={{
              padding: '18px 20px',
              borderRadius: '14px',
              backgroundColor: 'rgba(253, 246, 227, 0.06)',
              border: '1px solid rgba(253, 246, 227, 0.10)',
            }}
          >
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', color: LANTERN_GLOW, opacity: 0.45, margin: 0, textAlign: 'center' }}>
              En fråga ur samtalen
            </p>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '17px', fontWeight: 400, color: LANTERN_GLOW, opacity: 0.92, lineHeight: 1.45, margin: '10px 0 0', textAlign: 'center' }}>
              &ldquo;{PREVIEW_QUESTION[productId]}&rdquo;
            </p>
          </div>
        )}

        {/* Offer details */}
        <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(253, 246, 227, 0.12)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: LANTERN_GLOW, opacity: 0.7, margin: 0, lineHeight: 1.5 }}>
            {product.cards.length} samtal · {product.categories.length} kategorier
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: LANTERN_GLOW, opacity: 0.7, margin: '6px 0 0', lineHeight: 1.5 }}>
            {priceSek !== null ? `${priceSek} kr` : '...'} · Engångsköp · Tillgång för alltid
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: LANTERN_GLOW, opacity: 0.55, margin: '12px 0 0', lineHeight: 1.5 }}>
            Utvecklat tillsammans med psykolog · 25 års klinisk erfarenhet
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: LANTERN_GLOW, opacity: 0.55, margin: '8px 0 0', lineHeight: 1.5 }}>
            Säker betalning · Ingen prenumeration
          </p>
        </div>

        {/* Terms consent */}
        <div style={{ width: '100%' }}>
          <div className="[&_label]:!text-[rgba(253,246,227,0.85)] [&_button]:!text-[#E85D2C] [&_a]:!text-[#E85D2C]" style={{ display: 'flex', justifyContent: 'center' }}>
            <TermsConsent checked={termsAccepted} onCheckedChange={(val) => { setTermsAccepted(!!val); if (val) setTermsError(false); }} />
          </div>
          {termsError && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#f87171', textAlign: 'center', marginTop: '8px' }}>
              Du behöver godkänna villkoren för att fortsätta.
            </p>
          )}
        </div>

        {/* Direct-to-Stripe CTA */}
        <button
          onClick={handleDirectCheckout}
          disabled={directCheckoutLoading}
          className="w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2 border-0 text-white disabled:opacity-50"
          style={{ background: ORANGE_GRADIENT, boxShadow: ORANGE_SHADOW }}
        >
          {directCheckoutLoading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : `Köp ${product.name}${priceSek !== null ? ` · ${priceSek} kr` : ''}`}
        </button>

        {/* Recovery link */}
        <button
          onClick={() => navigate('/login')}
          style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(253, 246, 227, 0.5)', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center', padding: '4px 0' }}
        >
          Har du redan köpt? Logga in →
        </button>

        {directCheckoutError && (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#f87171', textAlign: 'center', marginTop: '4px' }}>
            {directCheckoutError}
          </p>
        )}
      </div>
    </div>
  );
}
