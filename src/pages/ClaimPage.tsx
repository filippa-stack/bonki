import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getProductById } from '@/data/products';
import { Loader2, Check } from 'lucide-react';
import { MIDNIGHT_INK, LANTERN_GLOW } from '@/lib/palette';
import { usePageBackground } from '@/hooks/usePageBackground';
import { trackPixelEvent } from '@/lib/metaPixel';

const ORANGE_GRADIENT = 'linear-gradient(180deg, #E85D2C 0%, #C44D22 100%)';
const ORANGE_SHADOW = [
  '0 10px 28px rgba(232, 93, 44, 0.35)',
  '0 4px 10px rgba(232, 93, 44, 0.20)',
  '0 1px 3px rgba(0, 0, 0, 0.12)',
  'inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
  'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
].join(', ');

type LookupState =
  | { status: 'loading' }
  | { status: 'ready'; email: string; productId: string; paid: boolean }
  | { status: 'error'; message: string };

export default function ClaimPage() {
  usePageBackground(MIDNIGHT_INK);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id') ?? '';
  const productIdFromUrl = searchParams.get('product') ?? '';

  const [lookup, setLookup] = useState<LookupState>({ status: 'loading' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const purchaseTrackedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

  // Lookup the Stripe session to get the email + confirm payment
  useEffect(() => {
    if (!sessionId) {
      setLookup({
        status: 'error',
        message: 'Saknar session-ID. Kontrollera länken eller kontakta support.',
      });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/get-purchase-session`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          },
        );
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.email || !json.productId) {
          setLookup({
            status: 'error',
            message: 'Kunde inte hitta ditt köp. Kontakta support om problemet kvarstår.',
          });
          return;
        }
        setLookup({
          status: 'ready',
          email: json.email,
          productId: json.productId,
          paid: !!json.paid,
        });

        // Fire Meta Pixel Purchase event once per session
        if (!purchaseTrackedRef.current && json.paid) {
          purchaseTrackedRef.current = true;
          const priceValue = json.productId === 'still_us' ? 249 : 195;
          trackPixelEvent('Purchase', { value: priceValue, currency: 'SEK' });
        }
      } catch (err) {
        if (!cancelled) {
          console.error('get-purchase-session error:', err);
          setLookup({
            status: 'error',
            message: 'Kunde inte hämta köpinformation. Försök ladda om sidan.',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const product =
    lookup.status === 'ready'
      ? getProductById(lookup.productId)
      : productIdFromUrl
        ? getProductById(productIdFromUrl)
        : null;

  const startCooldown = () => {
    setResendCooldown(60);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = useCallback(async () => {
    if (lookup.status !== 'ready') return;
    setSendingOtp(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: lookup.email,
        options: { shouldCreateUser: true },
      });
      if (error) {
        setError(error.message);
      } else {
        setOtpSent(true);
        startCooldown();
      }
    } catch {
      setError('Något gick fel. Försök igen.');
    } finally {
      setSendingOtp(false);
    }
  }, [lookup]);

  const handleVerifyOtp = async () => {
    if (lookup.status !== 'ready' || otpCode.length !== 6) return;
    setVerifying(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: lookup.email,
        token: otpCode,
        type: 'email',
      });
      if (error) {
        setError(error.message);
      } else if (product) {
        navigate(`/product/${product.slug}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch {
      setError('Något gick fel. Försök igen.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || lookup.status !== 'ready') return;
    setSendingOtp(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: lookup.email,
        options: { shouldCreateUser: true },
      });
      if (error) setError(error.message);
      else startCooldown();
    } catch {
      setError('Något gick fel. Försök igen.');
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Loading state ──
  if (lookup.status === 'loading') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: MIDNIGHT_INK,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Loader2 className="animate-spin" size={32} style={{ color: LANTERN_GLOW, opacity: 0.6 }} />
      </div>
    );
  }

  // ── Error state ──
  if (lookup.status === 'error') {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: MIDNIGHT_INK,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          gap: '20px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '15px',
            color: LANTERN_GLOW,
            opacity: 0.85,
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '320px',
          }}
        >
          {lookup.message}
        </div>
        <button
          onClick={() => navigate('/login')}
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: LANTERN_GLOW,
            opacity: 0.6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Gå till inloggning →
        </button>
      </div>
    );
  }

  // ── Main claim UI ──
  const productName = product?.name ?? 'din produkt';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: MIDNIGHT_INK,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Payment-confirmed pill */}
        <div
          style={{
            alignSelf: 'center',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '999px',
            background: 'rgba(212, 245, 192, 0.12)',
            border: '1px solid rgba(212, 245, 192, 0.25)',
          }}
        >
          <Check size={14} style={{ color: '#D4F5C0' }} strokeWidth={2.5} />
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              fontWeight: 500,
              color: '#D4F5C0',
              letterSpacing: '0.02em',
            }}
          >
            Tack för ditt köp!
          </span>
        </div>

        {/* Heading */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif, Georgia)',
              fontSize: '24px',
              fontWeight: 400,
              color: LANTERN_GLOW,
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            Ett steg kvar — bekräfta din e-post för att få tillgång till {productName}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              color: LANTERN_GLOW,
              opacity: 0.65,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            Vi skickar en engångskod till <strong style={{ opacity: 0.95, fontWeight: 600 }}>{lookup.email}</strong>.
            Fyll i koden nedan för att logga in — ditt köp är redan sparat.
          </p>
        </div>

        {/* OTP flow */}
        {!otpSent ? (
          <button
            onClick={handleSendOtp}
            disabled={sendingOtp}
            className="w-full h-14 rounded-full font-semibold text-base transition-transform active:scale-[0.98] disabled:opacity-70"
            style={{
              background: ORANGE_GRADIENT,
              color: '#FFFDF8',
              boxShadow: ORANGE_SHADOW,
              border: 'none',
              fontFamily: 'var(--font-sans)',
              letterSpacing: '0.01em',
            }}
          >
            {sendingOtp ? <Loader2 className="animate-spin inline" size={18} /> : 'Skicka engångskod'}
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={otpCode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                setOtpCode(v);
                setError(null);
              }}
              placeholder="000000"
              className="w-full h-14 text-center text-2xl tracking-[0.5em] rounded-xl border-0 outline-none"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#FDF6E3',
                caretColor: '#FDF6E3',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
                border: '1px solid rgba(253, 246, 227, 0.2)',
              }}
              autoFocus
            />
            <button
              onClick={handleVerifyOtp}
              disabled={verifying || otpCode.length !== 6}
              className="w-full h-14 rounded-full font-semibold text-base transition-transform active:scale-[0.98] disabled:opacity-50"
              style={{
                background: ORANGE_GRADIENT,
                color: '#FFFDF8',
                boxShadow: ORANGE_SHADOW,
                border: 'none',
                fontFamily: 'var(--font-sans)',
                letterSpacing: '0.01em',
              }}
            >
              {verifying ? (
                <Loader2 className="animate-spin inline" size={18} />
              ) : (
                `Logga in och öppna ${productName}`
              )}
            </button>

            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: LANTERN_GLOW,
                opacity: 0.5,
                textAlign: 'center',
                margin: 0,
              }}
            >
              Hittar du inte mejlet? Kolla din skräppost.
            </p>

            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || sendingOtp}
              className="text-sm disabled:opacity-40"
              style={{
                color: 'rgba(212, 245, 192, 0.7)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {resendCooldown > 0 ? `Skicka igen (${resendCooldown}s)` : 'Skicka mejlet igen'}
            </button>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(232, 93, 44, 0.12)',
              border: '1px solid rgba(232, 93, 44, 0.3)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: '#FDF6E3',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
