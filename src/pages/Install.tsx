import { useState, useEffect, useRef } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Wifi, Zap } from 'lucide-react';
import BonkiButton from '@/components/BonkiButton';
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

function isIOSNonSafari(): boolean {
  const ua = navigator.userAgent;
  if (!/iPad|iPhone|iPod/.test(ua)) return false;
  return /CriOS|FxiOS|OPiOS|EdgiOS/.test(ua);
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

function StepItem({ step, text }: { step: number; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'rgba(232, 93, 44, 0.15)',
          color: BONKI_ORANGE,
          fontSize: '13px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {step}
      </span>
      <span style={{ fontSize: '15px', color: LANTERN_GLOW, lineHeight: 1.4 }}>
        {text}
      </span>
    </div>
  );
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '12px',
          background: 'rgba(232, 93, 44, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: BONKI_ORANGE,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '15px', fontWeight: 600, color: LANTERN_GLOW, margin: 0, lineHeight: 1.3 }}>
          {title}
        </p>
        <p style={{ fontSize: '13px', color: 'rgba(245,237,210,0.6)', margin: '4px 0 0', lineHeight: 1.4 }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

export default function Install() {
  const [platform, setPlatform] = useState<Platform>(null);
  const [nonSafari, setNonSafari] = useState(false);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPlatform(detectPlatform());
    setNonSafari(isIOSNonSafari());
  }, []);

  if (isStandalone()) {
    return <Navigate to="/" replace />;
  }

  const scrollToSteps = () => {
    trackPixelEvent('Lead');
    stepsRef.current?.scrollIntoView({ behavior: 'smooth' });
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
      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        style={{
          padding: '60px 24px 40px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Logo */}
        <motion.div custom={0} variants={fadeUp}>
          <img
            src="/apple-touch-icon-180x180.png"
            alt="BONKI"
            style={{ width: '72px', height: '72px', borderRadius: '16px' }}
          />
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          className="font-serif"
          style={{
            fontSize: '32px',
            fontWeight: 700,
            lineHeight: 1.15,
            margin: 0,
            maxWidth: '300px',
          }}
        >
          Samtalskort för relationer — på riktigt
        </motion.h1>

        {/* Social proof */}
        <motion.div
          custom={2}
          variants={fadeUp}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: 'rgba(245,237,210,0.7)',
          }}
        >
          <span style={{ color: '#F5C518' }}>★ 4.9</span>
          <span>·</span>
          <span>10 000+ par</span>
        </motion.div>

        {/* Primary CTA */}
        <motion.div custom={3} variants={fadeUp} style={{ width: '100%', maxWidth: '320px' }}>
          <BonkiButton
            onClick={scrollToSteps}
            style={{
              background: ORANGE_GRADIENT,
              boxShadow: ORANGE_SHADOW,
              color: '#FFFDF7',
            }}
          >
            Installera appen
          </BonkiButton>
        </motion.div>
      </motion.section>

      {/* Benefits */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        style={{
          padding: '0 24px 40px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '400px',
          margin: '0 auto',
        }}
      >
        <motion.div custom={0} variants={fadeUp}>
          <BenefitCard
            icon={<Shield size={20} />}
            title="Privat & säkert"
            desc="Era samtal stannar mellan er. Ingen data delas."
          />
        </motion.div>
        <motion.div custom={1} variants={fadeUp}>
          <BenefitCard
            icon={<Wifi size={20} />}
            title="Fungerar offline"
            desc="Använd appen var som helst, även utan internet."
          />
        </motion.div>
        <motion.div custom={2} variants={fadeUp}>
          <BenefitCard
            icon={<Zap size={20} />}
            title="Ingen appbutik"
            desc="Installera direkt från webbläsaren på 10 sekunder."
          />
        </motion.div>
      </motion.section>

      {/* Install Steps */}
      <motion.section
        ref={stepsRef}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px' }}
        style={{
          padding: '40px 24px',
          maxWidth: '400px',
          margin: '0 auto',
        }}
      >
        <motion.h2
          custom={0}
          variants={fadeUp}
          className="font-serif"
          style={{
            fontSize: '22px',
            fontWeight: 600,
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Så installerar du
        </motion.h2>

        {nonSafari ? (
          <motion.div
            custom={1}
            variants={fadeUp}
            style={{
              background: 'rgba(232, 93, 44, 0.1)',
              border: '1px solid rgba(232, 93, 44, 0.25)',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '14px',
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            Öppna den här sidan i <strong>Safari</strong> för att kunna installera appen på din hemskärm.
          </motion.div>
        ) : !platform ? (
          /* Desktop */
          <motion.div
            custom={1}
            variants={fadeUp}
            style={{
              textAlign: 'center',
              fontSize: '15px',
              color: 'rgba(245,237,210,0.7)',
              lineHeight: 1.5,
            }}
          >
            Öppna den här sidan på din mobil för att installera appen.
          </motion.div>
        ) : (
          <motion.div custom={1} variants={fadeUp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {platform === 'ios' ? (
              <>
                <StepItem step={1} text="Tryck på dela-ikonen ⎋ längst ner i Safari" />
                <StepItem step={2} text='Scrolla ner och välj "Lägg till på hemskärmen"' />
                <StepItem step={3} text="Tryck Lägg till — klart!" />
              </>
            ) : (
              <>
                <StepItem step={1} text="Tryck på ⋮-menyn uppe till höger i Chrome" />
                <StepItem step={2} text='Välj "Lägg till på startskärmen"' />
                <StepItem step={3} text="Tryck Installera — klart!" />
              </>
            )}
          </motion.div>
        )}

        {/* Bottom CTA */}
        <div style={{ marginTop: '32px', maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto' }}>
          <BonkiButton
            onClick={scrollToSteps}
            style={{
              background: ORANGE_GRADIENT,
              boxShadow: ORANGE_SHADOW,
              color: '#FFFDF7',
            }}
          >
            Installera appen
          </BonkiButton>
        </div>

        {/* Login link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'rgba(245,237,210,0.5)' }}>
          Redan medlem?{' '}
          <Link to="/login" style={{ color: BONKI_ORANGE, textDecoration: 'underline' }}>
            Logga in
          </Link>
        </p>
      </motion.section>
    </div>
  );
}
