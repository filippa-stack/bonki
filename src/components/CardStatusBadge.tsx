/**
 * CardStatusBadge — Unified status marker for all card listings.
 *
 * Three states:
 *   • next       – Saffron pill, "NÄSTA"
 *   • inProgress – Green pulsing dot + "PÅBÖRJAD"
 *   • completed  – Check icon + "UTFORSKAD"
 *
 * Two visual modes:
 *   • "light"  – Frosted white glass (for cards with illustrations / light bg)
 *   • "dark"   – Translucent dark glass (for verdigris / dark bg)
 */

const SAFFRON = '#DA9D1D';

type BadgeVariant = 'next' | 'inProgress' | 'completed';
type BadgeMode = 'light' | 'dark';

interface CardStatusBadgeProps {
  variant: BadgeVariant;
  /** Visual mode: 'light' for illustrated cards, 'dark' for verdigris/dark surfaces */
  mode?: BadgeMode;
  className?: string;
}

const lightGlass: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.78)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
};

const darkGlass: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.28)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.18)',
};

export default function CardStatusBadge({ variant, mode = 'light' }: CardStatusBadgeProps) {
  const glass = mode === 'dark' ? darkGlass : lightGlass;

  const config = {
    next: {
      label: 'Nästa',
      dotColor: SAFFRON,
      textColor: mode === 'dark' ? SAFFRON : '#B8850E',
      showDot: true,
      dotPulse: false,
      glassOverride: mode === 'dark'
        ? { ...darkGlass, background: 'rgba(218, 157, 29, 0.14)', border: '1px solid rgba(218, 157, 29, 0.30)' }
        : { ...lightGlass, background: 'rgba(218, 157, 29, 0.14)', border: '1px solid rgba(218, 157, 29, 0.35)' },
    },
    inProgress: {
      label: 'Påbörjad',
      dotColor: mode === 'dark' ? SAFFRON : '#8A9A10',
      textColor: mode === 'dark' ? 'rgba(255,255,255,0.7)' : '#6B7A3A',
      showDot: true,
      dotPulse: true,
      glassOverride: glass,
    },
    completed: {
      label: 'Utforskad',
      dotColor: '',
      textColor: mode === 'dark' ? 'rgba(255,255,255,0.55)' : '#6B7A3A',
      showDot: false,
      dotPulse: false,
      glassOverride: glass,
    },
  } as const;

  const c = config[variant];

  if (variant === 'completed') {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" aria-label="Utforskad">
        <circle cx="9" cy="9" r="8" stroke={c.textColor} strokeWidth="1.5" opacity="0.5" />
        <path d="M5.5 9l2.5 2.5 4.5-4.5" stroke={c.textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    );
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        borderRadius: '12px',
        padding: '5px 10px 5px 8px',
        ...c.glassOverride,
      }}
    >
      {c.showDot && (
        <span
          style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            backgroundColor: c.dotColor,
            flexShrink: 0,
            ...(c.dotPulse ? { animation: 'saffron-pulse 2.0s ease-in-out infinite' } : {}),
          }}
        />
      )}
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: c.textColor,
          lineHeight: 1,
        }}
      >
        {c.label}
      </span>
    </div>
  );
}
