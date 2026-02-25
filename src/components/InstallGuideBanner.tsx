import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share, MoreVertical, Plus } from 'lucide-react';

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

  useEffect(() => {
    // Don't show if already installed or dismissed
    if (isStandalone()) return;
    const dismissed = localStorage.getItem('install-guide-dismissed');
    if (dismissed) return;

    const p = detectPlatform();
    if (!p) return; // Only show on mobile
    setPlatform(p);

    // Delay showing so user settles in first
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('install-guide-dismissed', Date.now().toString());
  };

  return (
    <AnimatePresence>
      {visible && platform && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '16px',
            right: '16px',
            zIndex: 50,
            borderRadius: 'var(--radius-card, 16px)',
            backgroundColor: 'var(--surface-raised, hsl(38, 18%, 98%))',
            boxShadow: '0 8px 32px hsla(30, 15%, 10%, 0.12), 0 1px 3px hsla(30, 15%, 10%, 0.06)',
            padding: '20px',
            border: '1px solid hsla(36, 12%, 88%, 0.6)',
          }}
        >
          <button
            onClick={dismiss}
            aria-label="Stäng"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--color-text-tertiary)',
              opacity: 0.5,
            }}
          >
            <X size={18} />
          </button>

          <p
            className="font-serif"
            style={{
              fontSize: '17px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
              lineHeight: 1.3,
              paddingRight: '24px',
            }}
          >
            Lägg till på hemskärmen
          </p>

          {platform === 'ios' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <StepRow
                step={1}
                icon={<Share size={15} style={{ color: 'var(--accent-saffron)' }} />}
                text="Tryck på dela-ikonen i Safari"
              />
              <StepRow
                step={2}
                icon={<Plus size={15} style={{ color: 'var(--accent-saffron)' }} />}
                text={<>"Lägg till på hemskärmen"</>}
              />
              <StepRow
                step={3}
                icon={<span style={{ fontSize: '13px' }}>✓</span>}
                text="Tryck Lägg till — klart!"
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <StepRow
                step={1}
                icon={<MoreVertical size={15} style={{ color: 'var(--accent-saffron)' }} />}
                text="Tryck på ⋮-menyn i Chrome"
              />
              <StepRow
                step={2}
                icon={<Plus size={15} style={{ color: 'var(--accent-saffron)' }} />}
                text={<>"Lägg till på startskärmen"</>}
              />
              <StepRow
                step={3}
                icon={<span style={{ fontSize: '13px' }}>✓</span>}
                text="Tryck Installera — klart!"
              />
            </div>
          )}

          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '13px',
              color: 'var(--color-text-tertiary)',
              opacity: 0.6,
              marginTop: '14px',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            Appen öppnas som en egen app — snabbare och snyggare.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StepRow({ step, icon, text }: { step: number; icon: React.ReactNode; text: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          backgroundColor: 'hsla(38, 40%, 50%, 0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <p
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.4,
          margin: 0,
        }}
      >
        {text}
      </p>
    </div>
  );
}
