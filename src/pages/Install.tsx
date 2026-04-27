import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

import bonkiLogo from '@/assets/bonki-logo-transparent.png';
import bonkiWordmark from '@/assets/bonki-wordmark.png';
import { MIDNIGHT_INK, LANTERN_GLOW, BONKI_ORANGE } from '@/lib/palette';

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
}

/* ── Shared step styles ── */
const stepCircleStyle: React.CSSProperties = {
  width: 32, height: 32, borderRadius: '50%',
  background: 'rgba(232,93,44,0.15)',
  border: '1.5px solid rgba(232,93,44,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-display)', fontSize: 15, color: '#E85D2C',
  flexShrink: 0,
};
const stepTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans)', fontSize: 15, lineHeight: 1.5, color: '#FDF6E3',
};
const helperStyle: React.CSSProperties = {
  fontSize: 12, color: 'rgba(253,246,227,0.5)', marginTop: 4,
};
const sectionHeadlineStyle: React.CSSProperties = {
  fontFamily: 'var(--font-display)', fontSize: 20, color: '#FDF6E3',
  textAlign: 'center', marginBottom: 24,
};
const confirmTextStyle: React.CSSProperties = {
  fontSize: 14, color: 'rgba(253,246,227,0.5)', textAlign: 'center',
};
const ctaButtonStyle: React.CSSProperties = {
  background: '#E85D2C', color: '#FDF6E3', border: 'none', borderRadius: 12,
  padding: '14px 32px', fontSize: 16, fontWeight: 600,
  fontFamily: 'var(--font-sans)', cursor: 'pointer', width: '100%',
};

/* ── Step row with optional connector ── */
function StepRow({ num, children, isLast }: { num: number; children: React.ReactNode; isLast?: boolean }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{ position: 'relative' }}>
          <div style={stepCircleStyle}>{num}</div>
          {!isLast && (
            <div style={{
              position: 'absolute', left: '50%', top: 32,
              width: 1, height: 20,
              background: 'rgba(253,246,227,0.1)',
              transform: 'translateX(-50%)',
            }} />
          )}
        </div>
        <div style={{ flex: 1, paddingTop: 4 }}>{children}</div>
      </div>
      {!isLast && <div style={{ height: 20 }} />}
    </div>
  );
}

/* ── Safari share icon SVG ── */
const SafariShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ verticalAlign: 'middle', marginLeft: 6 }}>
    <path d="M12 3L12 15" stroke="#FDF6E3" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 7L12 3L16 7" stroke="#FDF6E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 10H6C5.44772 10 5 10.4477 5 11V20C5 20.5523 5.44772 21 6 21H18C18.5523 21 19 20.5523 19 20V11C19 10.4477 18.5523 10 18 10H16" stroke="#FDF6E3" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [promptOutcome, setPromptOutcome] = useState<'pending' | 'accepted' | 'dismissed'>('pending');
  const [copied, setCopied] = useState(false);

  const isSafari = /^((?!chrome|android|crios|fxios|opr|edg).)*safari/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOSNonSafari = isIOS && !isSafari;

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone()) {
    return <Navigate to="/login" replace />;
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setPromptOutcome(outcome === 'accepted' ? 'accepted' : 'dismissed');
    setDeferredPrompt(null);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  /* ── Conditional view rendering ── */
  const renderInstallView = () => {
    // VIEW B: iOS non-Safari
    if (isIOSNonSafari) {
      return (
        <section style={{ padding: '24px 24px 0', maxWidth: 360, margin: '0 auto' }}>
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
        </section>
      );
    }

    // VIEW A: iOS Safari
    if (isIOS) {
      return (
        <section style={{ padding: '24px 24px 0', maxWidth: 360, margin: '0 auto' }}>
          <p style={{ ...sectionHeadlineStyle, margin: '0 0 24px' }}>Lägg till Bonki på din hemskärm</p>
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
          <p style={{ ...confirmTextStyle, marginTop: 24 }}>
            Sen hittar du Bonki som en app på din hemskärm
          </p>
          <p style={{ ...confirmTextStyle, marginTop: 8 }}>
            Ingen nedladdning. Ingen app store. Bara er.
          </p>
        </section>
      );
    }

    // VIEW C: Android
    if (isAndroid) {
      return (
        <section style={{ padding: '24px 24px 0', maxWidth: 360, margin: '0 auto' }}>
          <p style={{ ...sectionHeadlineStyle, margin: '0 0 24px' }}>Lägg till Bonki på din hemskärm</p>
          {deferredPrompt && promptOutcome === 'pending' ? (
            <>
              <button onClick={handleInstallClick} style={{ ...ctaButtonStyle, maxWidth: 360, margin: '0 auto', display: 'block' }}>
                Lägg till Bonki
              </button>
              <p style={{ ...confirmTextStyle, marginTop: 16 }}>
                Ingen nedladdning. Ingen app store. Bara er.
              </p>
            </>
          ) : promptOutcome === 'accepted' ? (
            <button disabled style={{ ...ctaButtonStyle, background: 'rgba(232,93,44,0.3)', opacity: 0.7, cursor: 'default' }}>
              Bonki är tillagd ✓
            </button>
          ) : (
            <>
              <StepRow num={1}>
                <p style={{ ...stepTextStyle, margin: 0 }}>
                  Tryck på <strong>⋮-menyn</strong> uppe till höger i din webbläsare
                </p>
              </StepRow>
              <StepRow num={2} isLast>
                <p style={{ ...stepTextStyle, margin: 0 }}>
                  Tryck <strong>Lägg till på startskärmen</strong>
                </p>
              </StepRow>
              <p style={{ ...confirmTextStyle, marginTop: 24 }}>
                Sen hittar du Bonki som en app på din hemskärm
              </p>
              <p style={{ ...confirmTextStyle, marginTop: 8 }}>
                Ingen nedladdning. Ingen app store. Bara er.
              </p>
            </>
          )}
        </section>
      );
    }

    // VIEW D: Desktop
    return (
      <section style={{ padding: '24px 24px 0', maxWidth: 360, margin: '0 auto', textAlign: 'center' }}>
        {deferredPrompt && promptOutcome === 'pending' ? (
          <>
            <p style={{ ...sectionHeadlineStyle, margin: '0 0 24px' }}>Lägg till Bonki</p>
            <button onClick={handleInstallClick} style={ctaButtonStyle}>
              Lägg till Bonki
            </button>
            <p style={{ ...confirmTextStyle, marginTop: 16 }}>
              Bonki fungerar bäst på mobilen, men du kan lägga till den här också.
            </p>
          </>
        ) : promptOutcome === 'accepted' ? (
          <button disabled style={{ ...ctaButtonStyle, background: 'rgba(232,93,44,0.3)', opacity: 0.7, cursor: 'default' }}>
            Bonki är tillagd ✓
          </button>
        ) : (
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: 'rgba(253,246,227,0.6)', textAlign: 'center', lineHeight: 1.5, padding: '0 24px' }}>
            Öppna bonkiapp.com på din mobil för den bästa upplevelsen.
          </p>
        )}
      </section>
    );
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse 80% 50% at 50% 30%, rgba(212, 245, 192, 0.03) 0%, transparent 70%), ${MIDNIGHT_INK}`,
        color: LANTERN_GLOW,
        overflowX: 'hidden',
      }}
    >
      {/* BONKI wordmark */}
      <section style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 24px)', textAlign: 'center' }}>
        <img
          src={bonkiWordmark}
          alt="BONKI"
          style={{ maxHeight: '48px', objectFit: 'contain', margin: '0 auto', display: 'block' }}
        />
      </section>

      {/* Brand creature */}
      <section style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 0' }}>
        <motion.img
          initial={false}
          src={bonkiLogo}
          alt="BONKI"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: '172px', height: '172px', objectFit: 'contain', opacity: 1.0,
            filter: 'drop-shadow(0 8px 32px rgba(212, 245, 192, 0.20)) drop-shadow(0 0 60px rgba(212, 245, 192, 0.10)) drop-shadow(0 0 100px rgba(212, 245, 192, 0.06))',
          }}
        />
      </section>

      {/* Headline + badge */}
      <section style={{ padding: '0 24px', textAlign: 'center', maxWidth: '360px', margin: '8px auto 0' }}>
        <h2
          className="font-serif"
          style={{
            fontSize: 'clamp(22px, 5.5vw, 26px)', fontWeight: 600, lineHeight: 1.3,
            letterSpacing: '0.01em', color: LANTERN_GLOW, margin: '0 0 6px',
          }}
        >
          Ni pratar varje dag. Men när pratade ni senast — på riktigt?
        </h2>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '20px',
          background: 'rgba(212, 245, 192, 0.08)', border: '1px solid rgba(212, 245, 192, 0.12)',
          margin: '0 auto',
        }}>
          <ShieldCheck size={14} style={{ color: '#D4F5C0', opacity: 0.8, flexShrink: 0 }} />
          <span style={{ fontSize: '13px', color: 'rgba(253, 246, 227, 0.7)' }}>
            Skapat med legitimerad psykolog
          </span>
        </div>
      </section>

      {/* Trust stats */}
      <section style={{ padding: '16px 24px 0', maxWidth: '360px', margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-around', textAlign: 'center',
          borderTop: '1px solid rgba(212, 245, 192, 0.10)', padding: '20px 10px',
        }}>
          {[
            { number: '7', label: 'produkter' },
            { number: '130+', label: 'samtal' },
            { number: '7', label: 'gratis samtal' },
          ].map((stat) => (
            <div key={stat.label} style={{ flex: 1 }}>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#D4F5C0', margin: 0, lineHeight: 1.2 }}>
                {stat.number}
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(212, 245, 192, 0.65)', margin: '4px 0 0', letterSpacing: '0.02em' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Conditional install view */}
      {renderInstallView()}

      {/* Bottom link — all views */}
      <section style={{ textAlign: 'center', padding: '0 24px' }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            fontSize: 14, color: '#E85D2C', opacity: 0.7, textAlign: 'center',
            marginTop: 32, marginBottom: 40, cursor: 'pointer',
            background: 'none', border: 'none', fontFamily: 'var(--font-sans)',
          }}
        >
          Redan installerat? Öppna Bonki →
        </button>
      </section>
    </div>
  );
}
