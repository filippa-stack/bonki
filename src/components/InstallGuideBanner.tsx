import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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

export default function InstallGuideBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    const dismissed = localStorage.getItem('install-guide-dismissed');
    if (dismissed) return;

    const p = detectPlatform();
    if (!p) return;
    setPlatform(p);

    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('install-guide-dismissed', Date.now().toString());
  };

  const handleInstall = () => {
    setShowSteps(true);
  };

  return (
    <AnimatePresence>
      {visible && platform && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-0 left-0 right-0"
          style={{ zIndex: 9998 }}
        >
          {/* Top banner bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              backgroundColor: 'hsl(var(--card))',
              borderBottom: '1px solid hsl(var(--border))',
              boxShadow: '0 2px 8px hsla(0, 0%, 0%, 0.08)',
            }}
          >
            <button
              onClick={dismiss}
              aria-label="Stäng"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: 'hsl(var(--muted-foreground))',
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>

            {/* App icon */}
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'hsl(var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              <img
                src="/apple-touch-icon-180x180.png"
                alt="Still Us"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                className="font-serif"
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'hsl(var(--foreground))',
                  lineHeight: 1.2,
                  margin: 0,
                }}
              >
                Still Us
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: 'hsl(var(--muted-foreground))',
                  lineHeight: 1.3,
                  margin: 0,
                }}
              >
                Öppna som app på hemskärmen
              </p>
            </div>

            {/* Install button */}
            <button
              onClick={handleInstall}
              style={{
                flexShrink: 0,
                padding: '6px 16px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                letterSpacing: '0.2px',
              }}
            >
              Installera
            </button>
          </div>

          {/* Expandable steps panel */}
          <AnimatePresence>
            {showSteps && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  overflow: 'hidden',
                  backgroundColor: 'hsl(var(--card))',
                  borderBottom: '1px solid hsl(var(--border))',
                }}
              >
                <div style={{ padding: '12px 16px 14px' }}>
                  {platform === 'ios' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <StepText step={1} text="Tryck på dela-ikonen ⎋ i Safari" />
                      <StepText step={2} text="Välj 'Lägg till på hemskärmen'" />
                      <StepText step={3} text="Tryck Lägg till — klart!" />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <StepText step={1} text="Tryck på ⋮-menyn i Chrome" />
                      <StepText step={2} text="Välj 'Lägg till på startskärmen'" />
                      <StepText step={3} text="Tryck Installera — klart!" />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StepText({ step, text }: { step: number; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'hsl(var(--primary) / 0.12)',
          color: 'hsl(var(--primary))',
          fontSize: '11px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {step}
      </span>
      <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>{text}</span>
    </div>
  );
}
