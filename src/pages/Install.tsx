import { useState, useEffect, useRef } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

import bonkiLogo from '@/assets/bonki-logo-transparent.png';
import bonkiWordmark from '@/assets/bonki-wordmark.png';
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
      {/* BONKI text + tagline */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)',
          textAlign: 'center',
        }}
      >
        <motion.img
          custom={0}
          variants={fadeUp}
          src={bonkiWordmark}
          alt="BONKI"
          style={{
            maxHeight: '48px',
            objectFit: 'contain',
            margin: '0 auto',
            display: 'block',
          }}
        />
      </motion.section>

      {/* Brand logo */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '4px 0 0',
        }}
      >
        <motion.img
          custom={2}
          variants={fadeUp}
          src={bonkiLogo}
          alt="BONKI"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '160px',
            height: '160px',
            objectFit: 'contain',
            opacity: 0.95,
            filter: 'drop-shadow(0 8px 32px rgba(212, 245, 192, 0.08))',
          }}
        />
      </motion.section>

      {/* Value Proposition */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          padding: '0 24px',
          textAlign: 'center',
          maxWidth: '360px',
          margin: '-8px auto 0',
        }}
      >
        <motion.h2
          custom={3}
          variants={fadeUp}
          className="font-serif"
          style={{
            fontSize: '20px',
            fontWeight: 600,
            lineHeight: 1.3,
            color: LANTERN_GLOW,
            margin: '0 0 6px',
          }}
        >
          Ni pratar varje dag. Men när pratade ni senast — på riktigt?
        </motion.h2>
        <motion.div
          custom={4}
          variants={fadeUp}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(212, 245, 192, 0.08)',
            border: '1px solid rgba(212, 245, 192, 0.12)',
            margin: '0 auto',
          }}
        >
          <ShieldCheck size={14} style={{ color: '#D4F5C0', opacity: 0.8, flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'rgba(253, 246, 227, 0.7)' }}>
            Skapat med legitimerad psykolog
          </span>
        </motion.div>
      </motion.section>

      {/* Trust Stats */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          padding: '10px 24px 0',
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
            padding: '16px 10px',
          }}
        >
          {[
            { number: '7', label: 'produkter' },
            { number: '130+', label: 'samtal' },
            { number: '7', label: 'gratis samtal' },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1 }}>
              <p
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                    color: '#D4F5C0',
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {stat.number}
              </p>
              <p
                style={{
                  fontSize: '12px',
                   color: 'rgba(212, 245, 192, 0.65)',
                  margin: '4px 0 0',
                   textTransform: 'none' as const,
                   letterSpacing: '0.02em',
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
  padding: '12px 24px 0',
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
            color: 'rgba(245,237,210,0.5)',
            margin: '12px 0 0',
          }}
        >
          Gratis att börja — inget kort krävs.
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
          padding: '20px 24px 36px',
          textAlign: 'center',
        }}
      >
        <motion.p custom={10} variants={fadeUp} style={{ fontSize: '14px', color: 'rgba(245,237,210,0.5)', margin: 0 }}>
          Redan medlem?{' '}
          <Link to="/login" style={{ color: 'rgba(253, 246, 227, 0.7)', textDecoration: 'underline' }}>
            Logga in
          </Link>
        </motion.p>
      </motion.section>
    </div>
  );
}
