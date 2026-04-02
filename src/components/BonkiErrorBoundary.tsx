import React from 'react';
import BonkiButton from '@/components/BonkiButton';

interface State {
  hasError: boolean;
}

export default class BonkiErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[BonkiErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#0B1026',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
          paddingLeft: 32,
          paddingRight: 32,
          zIndex: 99999,
        }}
      >
        {/* Saffron ambient glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 40% at 50% 38%, hsla(40, 78%, 61%, 0.14) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
            maxWidth: 320,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <img
            src="/assets/bonki-logo-transparent.png"
            alt="Bonki"
            style={{ width: 120, opacity: 0.6 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />

          <div>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 24,
                color: '#FDF6E3',
                margin: 0,
                fontWeight: 600,
              }}
            >
              Något gick fel
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                color: 'rgba(253, 246, 227, 0.6)',
                margin: '8px 0 0',
              }}
            >
              Vi beklagar — försök igen.
            </p>
          </div>

          <BonkiButton
            variant="primary"
            onClick={() => window.location.reload()}
          >
            Försök igen
          </BonkiButton>

          <button
            onClick={() => { window.location.href = '/'; }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              color: 'rgba(253, 246, 227, 0.5)',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              padding: 4,
            }}
          >
            Tillbaka till start
          </button>
        </div>
      </div>
    );
  }
}
