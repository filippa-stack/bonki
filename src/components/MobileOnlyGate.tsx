import { ReactNode, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DESKTOP_ALLOWED_ROUTES = ['/analytics', '/login', '/flowcharts.html', '/kids-family-journey-flowchart.html', '/user-journey-flowchart.html', '/color-palette.html'];

const ADMIN_USER_IDS = [
  'b29f4c84-0426-4b8f-9293-dccf9141a4b5',
  '8105cd94-be94-473e-977a-883e461cfea8',
  '999288dd-b73a-4829-9d0d-72a8b54b6385',
];

export default function MobileOnlyGate({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isDesktopAllowed = DESKTOP_ALLOWED_ROUTES.some(r => location.pathname.startsWith(r));
  const isAdmin = user && ADMIN_USER_IDS.includes(user.id);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isDesktopAllowed) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Desktop blocker — visible only on lg+ screens */}
      <div className="hidden lg:flex min-h-screen items-center justify-center px-8" style={{ backgroundColor: 'var(--surface-base)' }}>
        <div className="max-w-sm text-center space-y-6">
          <div className="text-5xl">📱</div>
          <h1
            className="font-serif"
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.01em',
              lineHeight: 1.2,
            }}
          >
            Still Us är gjord för mobilen
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
              opacity: 0.75,
            }}
          >
            Öppna länken på din telefon för den bästa upplevelsen.
          </p>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '14px 20px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--surface-raised)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--color-text-primary)',
              lineHeight: 1.5,
              transition: 'opacity 0.15s',
            }}
          >
            {copied ? (
              <>
                <Check size={16} style={{ color: 'var(--accent-saffron)' }} />
                Kopierad!
              </>
            ) : (
              <>
                <Copy size={16} style={{ opacity: 0.5 }} />
                Kopiera länken
              </>
            )}
          </button>
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              opacity: 0.5,
              lineHeight: 1.5,
            }}
          >
            Klistra in i din mobilwebbläsare eller skicka till dig själv.
          </p>
        </div>
      </div>

      {/* Mobile content — visible only below lg */}
      <div className="lg:hidden contents">
        {children}
      </div>
    </>
  );
}
