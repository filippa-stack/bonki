import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { getProductById } from '@/data/products';
import { Loader2, ArrowLeft } from 'lucide-react';
import { MIDNIGHT_INK, LANTERN_GLOW } from '@/lib/palette';
import { usePageBackground } from '@/hooks/usePageBackground';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import TermsConsent from '@/components/TermsConsent';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/legal';

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

  // Checkout state
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const checkoutTriggered = useRef(false);

  // Price from DB
  const [priceSek, setPriceSek] = useState<number | null>(null);

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
            cancelUrl: `${window.location.origin}/buy?product=${productId}`,
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

  // Auto-trigger checkout when user is logged in
  useEffect(() => {
    if (authLoading) return;
    if (user && product && !checkoutTriggered.current) {
      triggerCheckout();
    }
  }, [user, authLoading, product, triggerCheckout]);

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

  // ── Login form (user is NOT logged in) ──
  return (
    <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Product context */}
        <div style={{ textAlign: 'center', padding: '8px 0' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(253, 246, 227, 0.5)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Du köper
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: LANTERN_GLOW, fontWeight: 600, marginTop: '6px' }}>
            {product.name}
          </p>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: 'rgba(253, 246, 227, 0.55)', marginTop: '6px' }}>
            {priceSek !== null ? `${priceSek} kr` : '...'} · {product.cards.length} samtal · Engångsköp
          </p>
        </div>

        {/* OTP flow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
          {otpSent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', width: '100%' }}>
              <button
                onClick={() => { setOtpSent(false); setOtpCode(''); setError(null); }}
                className="flex items-center gap-1 text-sm mb-2"
                style={{ color: 'rgba(253, 246, 227, 0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <ArrowLeft className="w-4 h-4" /> Tillbaka
              </button>

              <div style={{ textAlign: 'center', padding: '8px 0' }}>
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

              <div className="flex justify-center [&_input]:!text-[#FDF6E3] [&_input]:!caret-[#FDF6E3] [&_div[data-slot]]:!text-[#FDF6E3] [&_div[data-slot]]:border-[rgba(253,246,227,0.3)]" style={{ marginTop: '8px' }}>
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
                style={{ background: ORANGE_GRADIENT, boxShadow: ORANGE_SHADOW, marginTop: '8px' }}
              >
                {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verifiera och köp'}
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
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <input
                type="email"
                placeholder="namn@epost.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEmailSignIn()}
                className="w-full h-14 px-4 text-base rounded-xl border-0 outline-none"
                style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#F5EFE6', fontFamily: 'var(--font-sans)', border: '1px solid rgba(253, 246, 227, 0.15)' }}
              />
              <button
                onClick={handleEmailSignIn}
                disabled={loading || !email.trim()}
                className="w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2 border-0 text-white disabled:opacity-50"
                style={{ background: ORANGE_GRADIENT, boxShadow: ORANGE_SHADOW }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fortsätt'}
              </button>
            </div>
          )}

          {/* Terms */}
          <div style={{ width: '100%', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <TermsConsent checked={termsAccepted} onCheckedChange={(val) => { setTermsAccepted(!!val); if (val) setTermsError(false); }} />
            </div>
            {termsError && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#f87171', textAlign: 'center', marginTop: '8px' }}>Du behöver godkänna villkoren för att fortsätta.</p>}
          </div>

          {error && <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: '#f87171', textAlign: 'center', marginTop: '4px' }}>{error}</p>}
        </div>
      </div>
    </div>
  );
}
