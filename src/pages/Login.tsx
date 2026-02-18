import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BEAT_1, BEAT_2 } from '@/lib/motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { lovable } from '@/integrations/lovable/index';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Loader2 } from 'lucide-react';
import bonkiLogo from '@/assets/bonki-logo.png';
import TermsConsent from '@/components/TermsConsent';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/legal';
import { supabase } from '@/integrations/supabase/client';
import { storePendingInvite } from '@/hooks/usePendingInvite';
import type { Json } from '@/integrations/supabase/types';

export default function Login() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const { settings } = useSiteSettings();
  const location = useLocation();

  // Invite code input
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [inviteCode, setInviteCode] = useState('');

  // Determine where to redirect after OAuth — if we came from /join, include the returnTo path
  const returnTo = (location.state as any)?.returnTo;

  const handleGoogleSignIn = async () => {
    if (!termsAccepted) {
      setTermsError(true);
      return;
    }
    setTermsError(false);
    setLoading(true);
    setError(null);

    // If user entered an invite code, store it so it auto-claims after login
    if (inviteCode.trim()) {
      storePendingInvite(null, inviteCode.trim());
    }

    // Store consent timestamp before redirect
    const consentTimestamp = new Date().toISOString();
    localStorage.setItem('pending-legal-consent', JSON.stringify({
      terms: { acceptedAt: consentTimestamp, version: TERMS_VERSION },
      privacy: { acceptedAt: consentTimestamp, version: PRIVACY_VERSION },
    }));

    try {
      // If there's a returnTo (e.g. /join?token=XYZ), redirect back there after OAuth
      const redirectUri = returnTo
        ? `${window.location.origin}${returnTo}`
        : window.location.origin;

      const { error } = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: redirectUri,
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

  const buttonStyle = {
    ...(settings.buttonColor && { '--btn-primary-bg': settings.buttonColor, '--btn-primary-text': settings.buttonTextColor } as React.CSSProperties),
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xs space-y-10 text-center"
      >
        <motion.img
          src={bonkiLogo}
          alt="Still Us"
          className="h-20 w-auto mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15, delay: BEAT_1 }}
        />

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_1, duration: 0.15 }}
          className="text-display font-serif"
          style={{ color: '#FF0000' }}
        >
          STILL US
          <br />
          So we stay us
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_2, duration: 0.15 }}
          className="space-y-5"
        >
          {/* Invite code section */}
          <AnimatePresence>
            {showCodeInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <Label className="text-sm text-muted-foreground">{t('join.invite_code', 'Inbjudningskod')}</Label>
                <Input
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={6}
                  className="text-center tracking-widest text-lg font-mono"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className={`w-full h-14 text-base font-medium rounded-2xl shadow-sm ${settings.buttonColor ? 'btn-themed' : ''}`}
            variant={settings.buttonColor ? "default" : "outline"}
            style={buttonStyle}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            )}
            {t('login.sign_in_google')}
          </Button>

          <div className="text-left">
            <TermsConsent checked={termsAccepted} onCheckedChange={(val) => { setTermsAccepted(val); if (val) setTermsError(false); }} />
            {termsError && (
              <p className="text-xs text-destructive mt-2">{t('login.terms_required')}</p>
            )}
          </div>

          {!showCodeInput && (
            <button
              type="button"
              onClick={() => setShowCodeInput(true)}
              className="inline-flex items-center gap-1.5 text-sm text-primary/80 hover:text-primary transition-colors font-medium"
            >
              {t('login.have_invite_code', 'Jag har en inbjudningskod')}
            </button>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
