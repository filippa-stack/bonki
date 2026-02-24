import { ReactNode } from 'react';

/**
 * Blocks desktop users with a friendly message.
 * Uses CSS media query via matchMedia for reliable detection.
 * Tablets (≤1024px) are allowed through.
 */
export default function MobileOnlyGate({ children }: { children: ReactNode }) {
  // We use a simple CSS-based approach: render both views,
  // hide/show via Tailwind breakpoints (lg = 1024px)
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
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-card)',
              backgroundColor: 'var(--surface-raised)',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.5,
            }}
          >
            Kopiera länken och klistra in den i din mobilwebbläsare, eller skicka den till dig själv.
          </div>
        </div>
      </div>

      {/* Mobile content — visible only below lg */}
      <div className="lg:hidden contents">
        {children}
      </div>
    </>
  );
}
