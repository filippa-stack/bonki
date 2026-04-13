import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { lovable } from '@/integrations/lovable/index';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { Loader2, Eye } from 'lucide-react';
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

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState(false);
  const { settings } = useSiteSettings();

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
        initial={false}
        animate={{ opacity: 1 }}
        className="w-full max-w-xs text-center"
        style={{ marginTop: '-80px' }}
      >
        <motion.img
          src={bonkiLogo}
          alt="Bonki"
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: 120, height: 120, margin: '0 auto 16px', objectFit: 'contain' }}
        />

        <motion.div initial={false} animate={{ opacity: 1 }}>
          <img
            src={bonkiWordmark}
            alt="BONKI"
            style={{ maxHeight: '60px', width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }}
          />
          <p
            className="font-serif italic"
            style={{ fontSize: '22px', color: 'rgba(212, 245, 192, 0.85)', textAlign: 'center', marginTop: '4px' }}
          >
            På riktigt.
          </p>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
            color: 'rgba(253, 246, 227, 0.65)',
            textAlign: 'center',
            marginTop: '12px',
          }}>
            Verktyg för samtalen som inte blir av.
          </p>
        </motion.div>

        <motion.div initial={false} animate={{ opacity: 1 }} style={{ marginTop: '40px' }}>
          <div className="flex flex-col gap-3">
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

            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'rgba(253, 246, 227, 0.5)',
              textAlign: 'center',
              marginTop: '8px',
            }}>
              Fungerar med alla e-postadresser — inte bara Gmail.
            </p>

            {isDemoParam() && (
              <button
                onClick={() => { enterDemoMode(); navigate('/', { replace: true }); }}
                className="w-full h-14 flex items-center justify-center gap-2 text-base font-medium rounded-xl"
                style={{
                  color: 'rgba(245, 237, 210, 0.6)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  background: 'none',
                  marginTop: '4px',
                }}
              >
                <Eye className="w-5 h-5" />
                Fortsätt utan konto (demo)
              </button>
            )}
          </div>

          <div className={`text-center mt-5 transition-transform duration-200 ${termsError ? 'animate-[shake_0.3s_ease-in-out]' : ''}`}>
            <div className="[&_label]:text-[rgba(245,237,210,0.6)] [&_button]:text-[rgba(212,245,192,0.7)] [&_button[role=checkbox]]:border-[rgba(253,246,227,0.3)] [&_button[role=checkbox]]:bg-[rgba(255,255,255,0.1)] [&_button[role=checkbox][data-state=checked]]:bg-[#E85D2C] [&_button[role=checkbox][data-state=checked]]:border-[#E85D2C] [&_button[role=checkbox]]:h-5 [&_button[role=checkbox]]:w-5">
              <TermsConsent checked={termsAccepted} onCheckedChange={(val) => { setTermsAccepted(val); if (val) setTermsError(false); }} />
            </div>
            {termsError && (
              <p className="text-xs mt-2" style={{ color: '#E85D2C' }}>{t('login.terms_required')}</p>
            )}
          </div>

          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'rgba(253, 246, 227, 0.35)', textAlign: 'center', marginTop: '20px' }}>
            Gratis att börja — inget kort krävs.
          </p>

          {error && (
            <p className="text-sm mt-4" style={{ color: '#E85D2C' }}>{error}</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
