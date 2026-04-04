import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BEAT_1, BEAT_2 } from '@/lib/motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { lovable } from '@/integrations/lovable/index';
import { supabase } from '@/integrations/supabase/client';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Loader2, Mail, ArrowLeft, CheckCircle, Eye } from 'lucide-react';
import { isDemoParam, enterDemoMode } from '@/lib/demoMode';
import { MIDNIGHT_INK, LANTERN_GLOW, BONKI_ORANGE } from '@/lib/palette';
import bonkiLogo from '@/assets/bonki-logo-transparent.png';

import TermsConsent from '@/components/TermsConsent';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/legal';

const GHOST_GLOW = '#D4F5C0';
const ORANGE_GRADIENT = 'linear-gradient(180deg, #E85D2C 0%, #C44D22 100%)';
const ORANGE_SHADOW = [
  '0 10px 28px rgba(232, 93, 44, 0.35)',
  '0 4px 10px rgba(232, 93, 44, 0.20)',
  '0 1px 3px rgba(0, 0, 0, 0.12)',
  'inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
  'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
].join(', ');

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const { settings } = useSiteSettings();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const checkTerms = () => {
    if (!termsAccepted) {
      setTermsError(true);
      return false;
    }
    setTermsError(false);
    return true;
  };

  const saveConsent = () => {
    const consentTimestamp = new Date().toISOString();
    localStorage.setItem('pending-legal-consent', JSON.stringify({
      terms: { acceptedAt: consentTimestamp, version: TERMS_VERSION },
      privacy: { acceptedAt: consentTimestamp, version: PRIVACY_VERSION },
    }));
  };

  const handleGoogleSignIn = async () => {
    if (!checkTerms()) return;
    setLoading(true);
    setError(null);
    saveConsent();

    try {
      const { error } = await lovable.auth.signInWithOAuth('google', {
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

  const handleEmailSignIn = async () => {
    if (!checkTerms()) return;
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    saveConsent();

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        setError(error.message || t('login.error_generic'));
        localStorage.removeItem('pending-legal-consent');
      } else {
        setMagicLinkSent(true);
      }
    } catch (err) {
      setError(t('login.error_start'));
      localStorage.removeItem('pending-legal-consent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6"
      style={{
        paddingTop: '28vh',
        paddingBottom: '24px',
        backgroundColor: MIDNIGHT_INK,
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xs text-center"
        style={{ marginTop: '-80px' }}
      >
        {/* Creature logo */}
        <motion.img
          src={bonkiLogo}
          alt="Bonki"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05, duration: 0.4 }}
          style={{ width: 120, height: 120, margin: '0 auto 16px', objectFit: 'contain' }}
        />

        {/* Brand hierarchy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_1, duration: 0.15 }}
        >
          <h1
            className="font-serif"
            style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.1, color: GHOST_GLOW, letterSpacing: '0.02em', textAlign: 'center' }}
          >
            BONKI
          </h1>
          <p
            className="font-serif italic"
            style={{ fontSize: '22px', color: `rgba(212, 245, 192, 0.7)`, textAlign: 'center', marginTop: '4px' }}
          >
            På riktigt.
          </p>
        </motion.div>

        {/* Button + terms */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_2, duration: 0.15 }}
          style={{ marginTop: '40px' }}
        >
          <AnimatePresence mode="wait">
            {magicLinkSent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-3"
              >
                <CheckCircle className="w-8 h-8" style={{ color: GHOST_GLOW }} />
                <p className="font-serif text-base" style={{ color: LANTERN_GLOW }}>
                  {t('login.magic_link_sent_title')}
                </p>
                <p className="text-sm" style={{ color: LANTERN_GLOW, opacity: 0.65 }}>
                  {t('login.magic_link_sent_hint')}
                </p>
                <p className="text-xs mt-2" style={{ color: LANTERN_GLOW, opacity: 0.4 }}>
                  {t('login.magic_link_spam_tip')}
                </p>
                <button
                  onClick={() => { setMagicLinkSent(false); setShowEmailForm(false); setEmail(''); }}
                  className="text-sm underline mt-2"
                  style={{ color: `rgba(245, 237, 210, 0.6)` }}
                >
                  {t('login.back_to_login')}
                </button>
              </motion.div>
            ) : showEmailForm ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleEmailSignIn()}
                  placeholder={t('login.email_placeholder')}
                  autoFocus
                  className="w-full h-14 px-4 text-base rounded-xl border"
                  style={{
                    borderColor: 'rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    color: LANTERN_GLOW,
                    outline: 'none',
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
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Mail className="w-5 h-5" />
                  )}
                  {t('login.send_magic_link')}
                </button>
                <button
                  onClick={() => { setShowEmailForm(false); setError(null); }}
                  className="flex items-center justify-center gap-1 text-sm mt-1"
                  style={{ color: `rgba(245, 237, 210, 0.6)` }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t('login.back_to_login')}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="main"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
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
                  {t('login.sign_in_google')}
                </button>

                <button
                  onClick={() => { setShowEmailForm(true); setError(null); }}
                  className="w-full h-14 flex items-center justify-center gap-2 text-base font-medium rounded-xl"
                  style={{
                    color: `rgba(245, 237, 210, 0.7)`,
                    border: 'none',
                    background: 'none',
                  }}
                >
                  <Mail className="w-5 h-5" />
                  {t('login.continue_with_email')}
                </button>
                {isDemoParam() && (
                  <button
                    onClick={() => { enterDemoMode(); navigate('/', { replace: true }); }}
                    className="w-full h-14 flex items-center justify-center gap-2 text-base font-medium rounded-xl"
                    style={{
                      color: `rgba(245, 237, 210, 0.6)`,
                      border: '1px dashed rgba(255,255,255,0.15)',
                      background: 'none',
                      marginTop: '4px',
                    }}
                  >
                    <Eye className="w-5 h-5" />
                    Fortsätt utan konto (demo)
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!magicLinkSent && (
            <div className={`text-center mt-5 transition-transform duration-200 ${termsError ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
              <div className="[&_label]:text-[rgba(245,237,210,0.6)] [&_button]:text-[rgba(212,245,192,0.7)]">
                <TermsConsent checked={termsAccepted} onCheckedChange={(val) => { setTermsAccepted(val); if (val) setTermsError(false); }} />
              </div>
              {termsError && (
                <p className="text-xs mt-2" style={{ color: '#E85D2C' }}>{t('login.terms_required')}</p>
              )}
            </div>
          )}

          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', color: `rgba(245, 237, 210, 0.5)`, textAlign: 'center', marginTop: '20px', letterSpacing: '0.01em' }}>
            Ert konto. Era samtal.
          </p>

          {error && (
            <p className="text-sm mt-4" style={{ color: '#E85D2C' }}>{error}</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
