import { useState, useEffect, useRef } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import bonkiLogo from '@/assets/bonki-logo-transparent.png';
import illustrationStillUs from '@/assets/illustration-still-us-home.png';
import { trackPixelEvent } from '@/lib/metaPixel';
import { MIDNIGHT_INK, LANTERN_GLOW, BONKI_ORANGE } from '@/lib/palette';

type Platform = 'ios' | 'android' | null;

function detectPlatform(): Platform {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return null;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

const ORANGE_GRADIENT = 'linear-gradient(180deg, #E85D2C 0%, #C44D22 100%)';
const ORANGE_SHADOW = [
  '0 10px 28px rgba(232, 93, 44, 0.35)',
  '0 4px 10px rgba(232, 93, 44, 0.20)',
  '0 1px 3px rgba(0, 0, 0, 0.12)',
  'inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
  'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
].join(', ');

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

export default function Install() {
  const [platform, setPlatform] = useState<Platform>(null);
  const navigate = useNavigate();
  const iosGuideRef = useRef<HTMLDivElement>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    trackPixelEvent('PageView');

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone()) {
    return <Navigate to="/" replace />;
  }

  const handleCTA = async () => {
    trackPixelEvent('InstallCTA');

    if (deferredPrompt) {
      deferredPrompt.prompt();
      return;
    }

    if (platform === 'ios') {
      iosGuideRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    navigate('/');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: MIDNIGHT_INK,
        color: LANTERN_GLOW,
        overflowX: 'hidden',
      }}
    >
      {/* Logo + Wordmark + Tagline */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          padding: '56px 24px 0',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <motion.img
          custom={0}
          variants={fadeUp}
          src={bonkiLogo}
          alt="BONKI"
          style={{ width: '72px', height: '72px', borderRadius: '16px' }}
        />
        <motion.p
          custom={1}
          variants={fadeUp}
          className="font-serif"
          style={{
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            margin: '8px 0 0',
          }}
        >
          BONKI
        </motion.p>
        <motion.p
          custom={2}
          variants={fadeUp}
          style={{
            fontSize: '14px',
            color: 'rgba(245,237,210,0.55)',
            margin: 0,
          }}
        >
          Verktyg för samtalen som inte blir av
        </motion.p>
      </motion.section>

      {/* Hero Illustration */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          padding: '32px 24px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <motion.div
          custom={3}
          variants={fadeUp}
          style={{
            width: '100%',
            maxWidth: '360px',
            height: '40vh',
            minHeight: '240px',
            borderRadius: '24px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <img
            src={illustrationStillUs}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, transparent 50%, rgba(11,16,38,0.8) 100%)',
              pointerEvents: 'none',
            }}
          />
        </motion.div>
      </motion.section>

      {/* Value Proposition */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          padding: '32px 24px 0',
          textAlign: 'center',
          maxWidth: '360px',
          margin: '0 auto',
        }}
      >
        <motion.h1
          custom={4}
          variants={fadeUp}
          className="font-serif"
          style={{
            fontSize: '28px',
            fontWeight: 700,
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Samtal som förändrar er vardag.
        </motion.h1>
        <motion.p
          custom={5}
          variants={fadeUp}
          style={{
            fontSize: '15px',
            lineHeight: 1.5,
            color: 'rgba(245,237,210,0.65)',
            margin: '12px 0 0',
          }}
        >
          Samtalskort för familjer och par — skapade med psykologer, byggda för verkliga samtal.
        </motion.p>
      </motion.section>

      {/* Trust Stats */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          padding: '32px 24px 0',
          maxWidth: '360px',
          margin: '0 auto',
        }}
      >
        <motion.div
          custom={6}
          variants={fadeUp}
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.04)',
            borderRadius: '16px',
            padding: '20px 12px',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {[
            { number: '7', label: 'produkter' },
            { number: '130+', label: 'samtal' },
            { number: '1 gratis', label: 'per produkt' },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  color: LANTERN_GLOW,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {stat.number}
              </p>
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(245,237,210,0.45)',
                  margin: '4px 0 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          padding: '36px 24px 0',
          maxWidth: '360px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        <motion.button
          custom={7}
          variants={fadeUp}
          whileTap={{ scale: 0.95, y: 2 }}
          transition={{ type: 'tween', duration: 0.12 }}
          onClick={handleCTA}
          style={{
            width: '100%',
            padding: '16px 32px',
            borderRadius: '24px',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-display)',
            fontSize: '17px',
            fontWeight: 600,
            background: ORANGE_GRADIENT,
            boxShadow: ORANGE_SHADOW,
            color: '#FFFDF7',
            textShadow: '0 1px 2px rgba(0,0,0,0.15)',
          }}
        >
          Öppna appen
        </motion.button>
        <motion.p
          custom={8}
          variants={fadeUp}
          style={{
            fontSize: '13px',
            color: 'rgba(245,237,210,0.4)',
            margin: '12px 0 0',
          }}
        >
          Ingen nedladdning krävs — öppnas direkt i din webbläsare.
        </motion.p>
      </motion.section>

      {/* iOS Install Guide */}
      {platform === 'ios' && (
        <motion.section
          ref={iosGuideRef}
          initial="hidden"
          animate="visible"
          style={{
            padding: '36px 24px 0',
            maxWidth: '360px',
            margin: '0 auto',
          }}
        >
          <motion.div
            custom={9}
            variants={fadeUp}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <p
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: LANTERN_GLOW,
                margin: '0 0 16px',
                textAlign: 'center',
              }}
            >
              Lägg till på hemskärmen
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(232,93,44,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontSize: '20px',
                    color: BONKI_ORANGE,
                  }}
                >
                  ⎋
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(245,237,210,0.55)' }}>
                  Tryck dela
                </span>
              </div>
              <span style={{ fontSize: '18px', color: 'rgba(245,237,210,0.3)' }}>→</span>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(232,93,44,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 6px',
                    fontSize: '20px',
                    color: BONKI_ORANGE,
                  }}
                >
                  +
                </div>
                <span style={{ fontSize: '12px', color: 'rgba(245,237,210,0.55)' }}>
                  Lägg till
                </span>
              </div>
            </div>
          </motion.div>
        </motion.section>
      )}

      {/* Login link */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          padding: '32px 24px 48px',
          textAlign: 'center',
        }}
      >
        <motion.p custom={10} variants={fadeUp} style={{ fontSize: '14px', color: 'rgba(245,237,210,0.45)', margin: 0 }}>
          Redan medlem?{' '}
          <Link to="/login" style={{ color: BONKI_ORANGE, textDecoration: 'underline' }}>
            Logga in
          </Link>
        </motion.p>
      </motion.section>
    </div>
  );
}
