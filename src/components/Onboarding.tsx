import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePageBackground } from '@/hooks/usePageBackground';
import { useApp } from '@/contexts/AppContext';
import { trackOnboardingEvent } from '@/lib/trackOnboarding';
import { trackPixelEvent } from '@/lib/metaPixel';
import { LANTERN_GLOW } from '@/lib/palette';
import BonkiButton from '@/components/BonkiButton';
import bonkiLogo from '@/assets/bonki-logo-transparent.png';

/* ── Platform detection ── */
const isSafari = /^((?!chrome|android|crios|fxios|opr|edg).)*safari/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isAndroid = /android/i.test(navigator.userAgent);
const isIOSNonSafari = isIOS && !isSafari;

function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true;
}

/* ── Shared install-step styles ── */
const stepCircleStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: '50%',
  background: 'rgba(232,93,44,0.15)', border: '1.5px solid rgba(232,93,44,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-display)', fontSize: 15, color: '#E85D2C', flexShrink: 0,
};
const stepTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.5, color: '#FDF6E3',
};
const helperStyle: React.CSSProperties = {
  fontSize: 12, color: 'rgba(253,246,227,0.5)', marginTop: 4,
};
const sectionHeadlineStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 20, color: '#FDF6E3', textAlign: 'center', marginBottom: 24,
};
const confirmTextStyle: React.CSSProperties = {
  fontSize: 14, color: 'rgba(253,246,227,0.5)', textAlign: 'center',
};
const ctaButtonStyle: React.CSSProperties = {
  background: '#E85D2C', color: '#FDF6E3', border: 'none', borderRadius: 12,
  padding: '14px 32px', fontSize: 16, fontWeight: 600,
  fontFamily: 'var(--font-sans)', cursor: 'pointer', width: '100%',
};

function StepRow({ num, children, isLast }: { num: number; children: React.ReactNode; isLast?: boolean }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative' }}>
          <div style={stepCircleStyle}>{num}</div>
          {!isLast && (
            <div style={{
              position: 'absolute', left: '50%', top: 32, width: 1, height: 20,
              background: 'rgba(253,246,227,0.1)', transform: 'translateX(-50%)',
            }} />
          )}
        </div>
        <div style={{ flex: 1, paddingTop: 4 }}>{children}</div>
      </div>
      {!isLast && <div style={{ height: 20 }} />}
    </div>
  );
}

const SafariShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginLeft: 6 }}>
    <path d="M12 3L12 15" stroke="#FDF6E3" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 7L12 3L16 7" stroke="#FDF6E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10H6C5.44772 10 5 10.4477 5 11V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V11C19 10.4477 18.5523 10 18 10H16" stroke="#FDF6E3" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const fadeUp = (_delay: number) => ({
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0 },
});

/* ── Install step view ── */
function InstallStepView({ onSkip }: { onSkip: () => void }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [promptOutcome, setPromptOutcome] = useState<'pending' | 'accepted' | 'dismissed'>('pending');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setPromptOutcome(outcome === 'accepted' ? 'accepted' : 'dismissed');
    setDeferredPrompt(null);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://bonkiapp.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  const renderView = () => {
    if (isIOSNonSafari) {
      return (
        <div style={{ padding: '0 24px', maxWidth: 360, margin: '0 auto' }}>
          <div style={{
            background: 'rgba(232,93,44,0.08)', border: '1px solid rgba(232,93,44,0.25)',
            borderRadius: 16, padding: 24, textAlign: 'center',
          }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: '#FDF6E3', marginBottom: 8, marginTop: 0 }}>
              Öppna i Safari
            </p>
            <p style={{ fontSize: 15, color: 'rgba(253,246,227,0.7)', lineHeight: 1.5, marginBottom: 20 }}>
              Bonki kan bara läggas till på hemskärmen via Safari. Det tar bara några sekunder.
            </p>
            <button onClick={handleCopyLink} style={ctaButtonStyle}>
              {copied ? 'Kopierad ✓' : 'Kopiera länk'}
            </button>
            <p style={{ fontSize: 13, color: 'rgba(253,246,227,0.45)', marginTop: 12 }}>
              Klistra sedan in länken i Safari
            </p>
          </div>
        </div>
      );
    }

    if (isIOS) {
      return (
        <div style={{ padding: '0 24px', maxWidth: 360, margin: '0 auto' }}>
          <p style={{ ...sectionHeadlineStyle, margin: '0 0 24px' }}>Lägg till Bonki på hemskärmen</p>
          <StepRow num={1}>
            <p style={{ ...stepTextStyle, margin: 0 }}>
              Tryck på <strong>dela-knappen</strong> i Safaris verktygsfält nedanför
              <SafariShareIcon />
            </p>
            <p style={{ ...helperStyle, margin: '4px 0 0' }}>
              Ser du den inte? Tryck på ⋯-knappen längst ner i Safari först.
            </p>
          </StepRow>
          <StepRow num={2}>
            <p style={{ ...stepTextStyle, margin: 0 }}>
              Scrolla ner i menyn och tryck <strong>Lägg till på hemskärmen</strong>
            </p>
            <p style={{ ...helperStyle, margin: '4px 0 0' }}>
              Du kan behöva scrolla — den syns inte direkt.
            </p>
          </StepRow>
          <StepRow num={3} isLast>
            <p style={{ ...stepTextStyle, margin: 0 }}>
              Tryck <strong>Lägg till</strong> uppe till höger — klart!
            </p>
          </StepRow>
          <p style={{ ...confirmTextStyle, marginTop: 24 }}>Sen hittar du Bonki som en app på din hemskärm</p>
          <p style={{ ...confirmTextStyle, marginTop: 8 }}>Ingen nedladdning. Ingen app store. Bara er.</p>
        </div>
      );
    }

    if (isAndroid) {
      return (
        <div style={{ padding: '0 24px', maxWidth: 360, margin: '0 auto' }}>
          <p style={{ ...sectionHeadlineStyle, margin: '0 0 24px' }}>Lägg till Bonki på hemskärmen</p>
          {deferredPrompt && promptOutcome === 'pending' ? (
            <>
              <button onClick={handleInstallClick} style={{ ...ctaButtonStyle, maxWidth: 360, margin: '0 auto', display: 'block' }}>
                Lägg till Bonki
              </button>
              <p style={{ ...confirmTextStyle, marginTop: 16 }}>Ingen nedladdning. Ingen app store. Bara er.</p>
            </>
          ) : promptOutcome === 'accepted' ? (
            <button disabled style={{ ...ctaButtonStyle, background: 'rgba(232,93,44,0.3)', opacity: 0.7, cursor: 'default' }}>
              Bonki är tillagd ✓
            </button>
          ) : (
            <>
              <StepRow num={1}>
                <p style={{ ...stepTextStyle, margin: 0 }}>Tryck på <strong>⋮-menyn</strong> uppe till höger i din webbläsare</p>
              </StepRow>
              <StepRow num={2} isLast>
                <p style={{ ...stepTextStyle, margin: 0 }}>Tryck <strong>Lägg till på startskärmen</strong></p>
              </StepRow>
              <p style={{ ...confirmTextStyle, marginTop: 24 }}>Sen hittar du Bonki som en app på din hemskärm</p>
              <p style={{ ...confirmTextStyle, marginTop: 8 }}>Ingen nedladdning. Ingen app store. Bara er.</p>
            </>
          )}
        </div>
      );
    }

    // Desktop fallback
    return (
      <div style={{ padding: '0 24px', maxWidth: 360, margin: '0 auto', textAlign: 'center' }}>
        {deferredPrompt && promptOutcome === 'pending' ? (
          <>
            <p style={{ ...sectionHeadlineStyle, margin: '0 0 24px' }}>Lägg till Bonki</p>
            <button onClick={handleInstallClick} style={ctaButtonStyle}>Lägg till Bonki</button>
            <p style={{ ...confirmTextStyle, marginTop: 16 }}>Bonki fungerar bäst på mobilen, men du kan lägga till den här också.</p>
          </>
        ) : promptOutcome === 'accepted' ? (
          <button disabled style={{ ...ctaButtonStyle, background: 'rgba(232,93,44,0.3)', opacity: 0.7, cursor: 'default' }}>
            Bonki är tillagd ✓
          </button>
        ) : (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'rgba(253,246,227,0.6)', textAlign: 'center', lineHeight: 1.5 }}>
            Öppna bonkiapp.com på din mobil för den bästa upplevelsen.
          </p>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0, flex: 1 }}>
      {renderView()}
      <div style={{ textAlign: 'center', marginTop: 28, paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 16px))' }}>
        <button
          onClick={onSkip}
          style={{
            fontSize: 15, color: '#E85D2C', opacity: 0.7, cursor: 'pointer',
            background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
          }}
        >
          Hoppa över — fortsätt i webbläsaren
        </button>
      </div>
    </div>
  );
}

/* ── Main Onboarding ── */
export default function Onboarding() {
  const { completeOnboarding, initializeCoupleSpace } = useApp();
  const [selectedAudience, setSelectedAudience] = useState<string | null>(null);
  const [step, setStep] = useState<'install' | 'audience'>('audience');
  usePageBackground('#1A1A2E');

  const handleSkipInstall = () => {
    localStorage.setItem('bonki-install-step-seen', '1');
    setStep('audience');
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: '#1A1A2E',
        overflow: 'hidden', overflowX: 'hidden',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}
    >
      {/* ── Logo — shared across both steps ── */}
      <motion.div
        initial={false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0 }}
        style={{
          position: 'relative', flex: '0 0 auto', minHeight: '100px',
          marginBottom: 0, paddingBottom: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', zIndex: 0,
        }}
      >
        <div style={{
          position: 'absolute', width: '240px', height: '240px', borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(170, 35%, 50%, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <img
          src={bonkiLogo} alt="" aria-hidden draggable={false}
          width={120} height={120}
          style={{
            position: 'relative', width: '120px', height: 'auto',
            objectFit: 'contain', opacity: 0.88,
            filter: 'brightness(1.15) saturate(1.3)', imageRendering: 'auto',
          }}
        />
      </motion.div>

      {step === 'install' ? (
        <InstallStepView onSkip={handleSkipInstall} />
      ) : (
        <>
          {/* ── Audience selection (unchanged) ── */}
          <div
            style={{
              position: 'relative', zIndex: 1, flex: '0 0 auto',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              paddingBottom: '24px', padding: '0 32px', paddingTop: '8px',
            }}
          >
            <motion.p {...fadeUp(0.35)} style={{
              fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: LANTERN_GLOW, opacity: 0.5, marginBottom: '14px',
            }}>
              Utvecklat av psykolog
            </motion.p>
            <motion.h1 {...fadeUp(0.5)} style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 7.5vw, 38px)',
              fontWeight: 400, color: '#FDF6E3', lineHeight: 1.28,
              letterSpacing: '-0.02em', margin: 0,
            }}>
              Verktyg för samtalen{'\u00A0'}som inte blir av.
            </motion.h1>
            <motion.div {...fadeUp(0.65)} style={{
              width: '32px', height: '2px', backgroundColor: 'hsla(40, 78%, 61%, 0.5)',
              marginTop: '20px', marginBottom: '16px',
            }} />
            <motion.p {...fadeUp(0.75)} style={{
              fontFamily: 'var(--font-sans)', fontSize: '16px', color: '#FDF6E3',
              lineHeight: 1.55, opacity: 0.85, margin: 0,
            }}>
              Bonki hjälper er prata — med varandra, med era barn, och om det som är svårt att hitta ord för. Ett samtal i taget.
            </motion.p>
          </div>

          <div style={{ position: 'relative', zIndex: 1, flex: '0 0 auto', padding: '12px 32px 0' }}>
            <p style={{
              fontFamily: 'var(--font-sans)', fontSize: '15px', fontWeight: 500,
              color: '#FDF6E3', opacity: 0.5, margin: '0 0 10px',
            }}>
              Var vill ni börja?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Barn 3–6', value: 'young' },
                { label: 'Barn 7–11', value: 'middle' },
                { label: 'Barn 12+', value: 'teen' },
                { label: 'Oss som par', value: 'couple' },
              ].map(({ label, value }) => {
                const selected = selectedAudience === value;
                return (
                  <button key={value} onClick={() => setSelectedAudience(value)} style={{
                    height: '64px', borderRadius: '16px', padding: '12px 14px',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' as const,
                    position: 'relative', overflow: 'hidden',
                    border: selected ? '1px solid rgba(218, 157, 29, 0.40)' : '1px solid rgba(255, 255, 255, 0.10)',
                    background: selected ? 'rgba(218, 157, 29, 0.10)' : 'rgba(255, 255, 255, 0.06)',
                    boxShadow: selected
                      ? '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(218,157,29,0.15)'
                      : '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 700, width: '100%', textAlign: 'center' as const,
                      letterSpacing: '-0.01em',
                      color: selected ? '#DA9D1D' : 'rgba(253, 246, 227, 0.85)',
                    }}>{label}</span>
                  </button>
                );
              })}
            </div>
            {selectedAudience !== null && (
              <p style={{
                fontFamily: 'var(--font-sans)', fontSize: '12px',
                color: '#FDF6E3', opacity: 0.35, margin: '8px 0 0',
              }}>
                Ni kan utforska alla produkter efteråt.
              </p>
            )}
          </div>

          <motion.div {...fadeUp(0.9)} style={{
            position: 'relative', zIndex: 1, flex: '0 0 auto',
            padding: '16px 24px 0',
            paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 16px))',
            display: 'flex', flexDirection: 'column', gap: '12px',
          }}>
            <BonkiButton
              style={{
                background: 'linear-gradient(180deg, #E85D2C 0%, #C44D22 100%)',
                boxShadow: [
                  '0 10px 28px rgba(232, 93, 44, 0.35)', '0 4px 10px rgba(232, 93, 44, 0.20)',
                  '0 1px 3px rgba(0, 0, 0, 0.12)', 'inset 0 1.5px 0 rgba(255, 255, 255, 0.35)',
                  'inset 0 -2px 6px rgba(0, 0, 0, 0.12)',
                ].join(', '),
                opacity: selectedAudience ? 1 : 0.4,
                pointerEvents: selectedAudience ? 'auto' : 'none',
              }}
              onClick={() => {
                localStorage.setItem('bonki-onboarding-audience', selectedAudience!);
                trackOnboardingEvent('onboarding_complete', { audience: selectedAudience });
                trackPixelEvent('Lead');
                initializeCoupleSpace();
                completeOnboarding();
              }}
            >
              Börja
            </BonkiButton>
          </motion.div>
        </>
      )}
    </div>
  );
}
