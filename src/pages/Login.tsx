import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, Mail, ArrowLeft } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';
import { signInWithApple as nativeSignInWithApple } from '@/lib/appleSignIn';
import { isDemoParam, enterDemoMode } from '@/lib/demoMode';
import { MIDNIGHT_INK, LANTERN_GLOW } from '@/lib/palette';
import bonkiLogo from '@/assets/bonki-logo-transparent.png';
import bonkiWordmark from '@/assets/bonki-wordmark.png';

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

// Focus ring using LANTERN_GLOW token — applied via style on focus events
const FOCUS_RING = `0 0 0 2px ${LANTERN_GLOW}`;
const SOFT_BORDER = '1px solid rgba(253, 246, 227, 0.15)';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isReviewerMode = searchParams.get('review') === '1';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email flow state
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [appleLoading, setAppleLoading] = useState(false);
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerPassword, setReviewerPassword] = useState('');
  const [reviewerLoading, setReviewerLoading] = useState(false);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    return () => {
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, []);

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

  // Implicit consent on action — same legal posture Apple/Linear use.
  const saveConsent = () => {
    const consentTimestamp = new Date().toISOString();
    localStorage.setItem('pending-legal-consent', JSON.stringify({
      terms: { acceptedAt: consentTimestamp, version: TERMS_VERSION },
      privacy: { acceptedAt: consentTimestamp, version: PRIVACY_VERSION },
    }));
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setError(null);
    saveConsent();

    try {
      const { error } = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });

      if (error) {
        setError(error.message || t('login.error_generic'));
        localStorage.removeItem('pending-legal-consent');
      }
    } catch (err) {
      setError(t('login.error_start'));
      localStorage.removeItem('pending-legal-consent');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => handleOAuthSignIn('google');
  const handleAppleSignIn = () => handleOAuthSignIn('apple');

  const handleNativeAppleSignIn = async () => {
    if (appleLoading) return;
    setAppleLoading(true);
    setError(null);
    saveConsent();

    try {
      const result = await nativeSignInWithApple();
      if (result.cancelled) {
        localStorage.removeItem('pending-legal-consent');
        return;
      }
      if (!result.success) {
        localStorage.removeItem('pending-legal-consent');
        toast.error('Kunde inte logga in med Apple. Försök igen.');
        return;
      }
      // Success: AuthContext's onAuthStateChange handles navigation.
    } finally {
      setAppleLoading(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    saveConsent();

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });

      if (error) {
        setError(error.message || t('login.error_generic'));
        localStorage.removeItem('pending-legal-consent');
      } else {
        setOtpSent(true);
        startCooldown();
      }
    } catch (err) {
      setError(t('login.error_start'));
      localStorage.removeItem('pending-legal-consent');
    } finally {
      setLoading(false);
    }
  };

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

      if (error) {
        setError(error.message || t('login.error_generic'));
      }
    } catch (err) {
      setError(t('login.error_start'));
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });

      if (error) {
        setError(error.message);
      } else {
        startCooldown();
      }
    } catch (err) {
      setError(t('login.error_start'));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewerSignIn = async () => {
    if (!reviewerEmail.trim() || !reviewerPassword) return;
    setReviewerLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: reviewerEmail.trim(),
        password: reviewerPassword,
      });
      if (error) toast.error('Felaktig inloggning.');
      // Success: AuthContext's onAuthStateChange handles navigation.
    } catch {
      toast.error('Felaktig inloggning.');
    } finally {
      setReviewerLoading(false);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = FOCUS_RING;
    e.currentTarget.style.borderColor = 'rgba(253, 246, 227, 0.35)';
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.borderColor = 'rgba(253, 246, 227, 0.15)';
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        backgroundColor: MIDNIGHT_INK,
        paddingTop: 'max(env(safe-area-inset-top), 24px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
      }}
    >
      <div className="w-full max-w-[320px] flex flex-col items-center text-center">
        {/* Brand mark */}
        <img
          src={bonkiLogo}
          alt="Bonki"
          style={{ width: 112, height: 112, objectFit: 'contain' }}
        />

        {/* Wordmark + promise (two voices, not three) */}
        <img
          src={bonkiWordmark}
          alt="BONKI"
          style={{
            maxHeight: 56,
            width: 'auto',
            objectFit: 'contain',
            display: 'block',
            marginTop: 16,
          }}
        />
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'rgba(253, 246, 227, 0.7)',
            marginTop: 12,
            lineHeight: 1.5,
          }}
        >
          Verktyg för samtalen som vill bli av
        </p>

        {/* CTA stack */}
        <div className="w-full" style={{ marginTop: 40 }}>
          <AnimatePresence mode="wait">
            {otpSent ? (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center gap-4"
              >
                <button
                  onClick={() => { setOtpSent(false); setOtpCode(''); setError(null); }}
                  className="flex items-center gap-1 text-sm self-start"
                  style={{ color: 'rgba(253, 246, 227, 0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Tillbaka
                </button>

                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'rgba(253, 246, 227, 0.85)', lineHeight: 1.6 }}>
                    Vi har skickat en kod till
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'rgba(212, 245, 192, 0.9)', fontWeight: 500, marginTop: 4 }}>
                    {email}
                  </p>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'rgba(253, 246, 227, 0.6)', marginTop: 16, lineHeight: 1.5 }}>
                    Ange den 6-siffriga koden nedan.
                  </p>
                </div>

                <input
                  type="tel"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, '').slice(0, 6); setOtpCode(v); setError(null); }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  placeholder="000000"
                  className="w-full h-14 text-center text-2xl tracking-[0.5em] rounded-xl outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#FDF6E3',
                    caretColor: '#FDF6E3',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                    border: SOFT_BORDER,
                    transition: 'box-shadow 150ms ease, border-color 150ms ease',
                  }}
                  autoFocus
                />

                <button
                  onClick={handleVerifyOtp}
                  disabled={verifying || otpCode.length !== 6}
                  className="w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2 border-0 text-white disabled:opacity-50"
                  style={{
                    background: ORANGE_GRADIENT,
                    boxShadow: ORANGE_SHADOW,
                  }}
                >
                  {verifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verifiera'}
                </button>

                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(253, 246, 227, 0.4)', lineHeight: 1.5 }}>
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
              </motion.div>
            ) : showEmailForm ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3"
              >
                <button
                  onClick={() => { setShowEmailForm(false); setError(null); }}
                  className="flex items-center gap-1 text-sm mb-1 self-start"
                  style={{ color: 'rgba(253, 246, 227, 0.6)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Tillbaka
                </button>

                <input
                  type="email"
                  placeholder="din@epost.se"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSignIn()}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  className="w-full h-14 px-4 text-base rounded-xl outline-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#F5EFE6',
                    fontFamily: 'var(--font-sans)',
                    border: SOFT_BORDER,
                    transition: 'box-shadow 150ms ease, border-color 150ms ease',
                  }}
                />

                <button
                  onClick={handleEmailSignIn}
                  disabled={loading || !email.trim()}
                  className="w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2 border-0 text-white disabled:opacity-50"
                  style={{
                    background: ORANGE_GRADIENT,
                    boxShadow: ORANGE_SHADOW,
                  }}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Skicka inloggningskod'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3"
              >
                {isNative && (
                  <button
                    onClick={handleNativeAppleSignIn}
                    disabled={appleLoading || loading}
                    className="w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2 border-0 disabled:opacity-50"
                    style={{
                      background: '#000',
                      color: '#FFFFFF',
                    }}
                  >
                    {appleLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Loggar in...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
                        </svg>
                        Fortsätt med Apple
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-14 text-base font-semibold rounded-xl flex items-center justify-center gap-2 border-0 text-white disabled:opacity-50"
                  style={{
                    background: ORANGE_GRADIENT,
                    boxShadow: ORANGE_SHADOW,
                  }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Fortsätt med Google
                </button>

                {!isNative && (
                  <button
                    onClick={handleAppleSignIn}
                    disabled={loading}
                    className="w-full h-14 flex items-center justify-center gap-2 text-base font-medium rounded-xl disabled:opacity-50"
                    style={{
                      color: '#FDF6E3',
                      border: '1px solid rgba(255,255,255,0.15)',
                      background: 'rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25"/>
                    </svg>
                    Fortsätt med Apple
                  </button>
                )}

                <button
                  onClick={() => setShowEmailForm(true)}
                  className="w-full h-14 flex items-center justify-center gap-2 text-base font-medium rounded-xl"
                  style={{
                    color: 'rgba(245, 237, 210, 0.8)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <Mail className="w-5 h-5" />
                  Fortsätt med e-post
                </button>

                {isDemoParam() && (
                  <button
                    onClick={() => { enterDemoMode(); navigate('/', { replace: true }); }}
                    className="w-full h-14 flex items-center justify-center gap-2 text-base font-medium rounded-xl"
                    style={{
                      color: 'rgba(245, 237, 210, 0.55)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      background: 'rgba(255, 255, 255, 0.04)',
                    }}
                  >
                    <Eye className="w-5 h-5" />
                    Fortsätt utan konto (demo)
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Inline consent — only on main screen, not OTP/email sub-flows */}
          {!otpSent && (
            <div style={{ marginTop: 20 }}>
              <TermsConsent
                linksOnly
                className="text-xs leading-relaxed"
                linkClassName="underline underline-offset-2 transition-colors"
              />
            </div>
          )}

          {error && (
            <p className="text-sm mt-4" style={{ color: '#E85D2C' }}>{error}</p>
          )}
        </div>
      </div>

      <style>{`
        .text-xs.leading-relaxed { color: rgba(253, 246, 227, 0.45); }
        .text-xs.leading-relaxed button { color: rgba(212, 245, 192, 0.75); }
      `}</style>
    </div>
  );
}
