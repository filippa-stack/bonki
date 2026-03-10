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

import TermsConsent from '@/components/TermsConsent';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/legal';
import type { Json } from '@/integrations/supabase/types';

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

  const buttonStyle = {
    ...(settings.buttonColor && { '--btn-primary-bg': settings.buttonColor, '--btn-primary-text': settings.buttonTextColor } as React.CSSProperties),
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center px-6"
      style={{
        paddingTop: '36vh',
        paddingBottom: '24px',
        backgroundColor: 'var(--surface-base)',
        backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, hsla(36, 20%, 80%, 0.12) 0%, transparent 70%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xs text-center"
        style={{ marginTop: '-100px' }}
      >
        {/* Brand hierarchy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_1, duration: 0.15 }}
        >
          <h1
            className="font-serif"
            style={{ fontSize: '42px', fontWeight: 700, lineHeight: 1.1, color: 'var(--color-text-primary)', letterSpacing: '0.02em', textAlign: 'center' }}
          >
            BONKI
          </h1>
          <p
            className="font-serif italic"
            style={{ fontSize: '22px', color: 'var(--accent-text)', textAlign: 'center', marginTop: '4px' }}
          >
            Still Us
          </p>
          <p
            className="font-serif"
            style={{ fontSize: '14px', color: 'var(--color-text-secondary)', opacity: 0.50, textAlign: 'center', marginTop: '10px', letterSpacing: '0.04em' }}
          >
            Så vi förblir vi.
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
                <CheckCircle className="w-8 h-8" style={{ color: 'var(--accent-text)' }} />
                <p className="font-serif text-base" style={{ color: 'var(--color-text-primary)' }}>
                  {t('login.magic_link_sent_title')}
                </p>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)', opacity: 0.75 }}>
                  {t('login.magic_link_sent_hint')}
                </p>
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-tertiary)', opacity: 0.6 }}>
                  {t('login.magic_link_spam_tip')}
                </p>
                <button
                  onClick={() => { setMagicLinkSent(false); setShowEmailForm(false); setEmail(''); }}
                  className="text-sm underline mt-2"
                  style={{ color: 'var(--color-text-tertiary)' }}
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
                  className="w-full h-14 px-4 text-base rounded-xl border bg-background"
                  style={{
                    borderColor: 'rgba(0,0,0,0.12)',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                  }}
                />
                <Button
                  onClick={handleEmailSignIn}
                  disabled={loading || !email.trim()}
                  className="w-full h-14 text-base font-medium rounded-xl"
                  variant="default"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-5 h-5 mr-2" />
                  )}
                  {t('login.send_magic_link')}
                </Button>
                <button
                  onClick={() => { setShowEmailForm(false); setError(null); }}
                  className="flex items-center justify-center gap-1 text-sm mt-1"
                  style={{ color: 'var(--color-text-tertiary)' }}
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
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className={`w-full h-14 text-base font-medium shadow-sm ${settings.buttonColor ? 'btn-themed' : ''}`}
                  variant={settings.buttonColor ? "default" : "outline"}
                  style={{ ...buttonStyle, border: '1px solid rgba(0,0,0,0.08)', borderRadius: '14px', boxShadow: '0 1px 4px hsla(30, 15%, 20%, 0.06)' }}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  {t('login.sign_in_google')}
                </Button>

                <button
                  onClick={() => { setShowEmailForm(true); setError(null); }}
                  className="w-full h-14 flex items-center justify-center gap-2 text-base font-medium rounded-xl"
                  style={{
                    color: 'var(--color-text-secondary)',
                    border: 'none',
                    background: 'none',
                  }}
                >
                  <Mail className="w-5 h-5" />
                  {t('login.continue_with_email')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {!magicLinkSent && (
            <div className={`text-center mt-5 transition-transform duration-200 ${termsError ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
              <TermsConsent checked={termsAccepted} onCheckedChange={(val) => { setTermsAccepted(val); if (val) setTermsError(false); }} />
              {termsError && (
                <p className="text-xs text-destructive mt-2">{t('login.terms_required')}</p>
              )}
            </div>
          )}

          <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '13px', color: 'var(--color-text-tertiary)', opacity: 0.40, textAlign: 'center', marginTop: '20px', letterSpacing: '0.01em' }}>
            Ert konto. Era samtal.
          </p>

          {error && (
            <p className="text-sm text-destructive mt-4">{error}</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
