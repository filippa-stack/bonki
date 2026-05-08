/**
 * Screen 6 — Jag i Mig completion + takeaway.
 */
import { DEMO_TAKEAWAY } from '@/lib/exportScreenshot/demoJournal';

const ATMOSPHERIC = '#8C4A2D';
const ON = '#F5E8CC';
const SAFFRON = '#E9B44C';
const CREAM = '#FDF6E3';
const BARK = '#2C2420';
const DRIFTWOOD = '#6B5E52';
const JIM_PILL = '#F2BC97';

export default function Screen6JimCompletion() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: ATMOSPHERIC,
        padding: '210px 56px 0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
      }}
    >
      {/* Saffron checkmark medallion */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'rgba(233, 180, 76, 0.18)',
          border: `2px solid ${SAFFRON}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 36,
          boxShadow: `0 0 60px ${SAFFRON}40`,
        }}
      >
        <svg width="60" height="60" viewBox="0 0 18 18" fill="none">
          <path d="M3.5 9.5 L7.5 13.5 L14.5 5.5" stroke={SAFFRON} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 18, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(245,232,204,0.55)', margin: '0 0 24px', fontWeight: 600 }}>
        Valfritt
      </p>

      <h1
        style={{
          fontFamily: '"Fraunces", serif',
          fontSize: 64,
          fontWeight: 500,
          color: ON,
          margin: 0,
          textAlign: 'center',
          letterSpacing: '-0.005em',
          textShadow: '0 2px 14px rgba(0,0,0,0.30)',
        }}
      >
        Ni pratade om {DEMO_TAKEAWAY.cardTitle}.
      </h1>
      <p style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 26, color: 'rgba(245,232,204,0.78)', margin: '20px 0 56px', textAlign: 'center' }}>
        Vad vill ni bära med er?
      </p>

      {/* Takeaway field */}
      <div
        style={{
          background: CREAM,
          borderRadius: 32,
          padding: '40px 44px',
          width: '100%',
          boxShadow: '0 22px 56px rgba(0,0,0,0.30), 0 4px 14px rgba(255, 220, 160, 0.16)',
        }}
      >
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 16, letterSpacing: '0.16em', textTransform: 'uppercase', color: DRIFTWOOD, margin: '0 0 22px', fontWeight: 600 }}>
          En reflektion att spara
        </p>
        <p style={{ fontFamily: '"Fraunces", serif', fontSize: 36, fontWeight: 400, color: BARK, lineHeight: 1.35, margin: 0 }}>
          {DEMO_TAKEAWAY.body}
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: 130, left: 56, right: 56, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <button
          style={{
            background: `${JIM_PILL}E6`,
            color: '#5A3A1F',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 999,
            padding: '24px 88px',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '0.04em',
            boxShadow: '0 12px 32px rgba(0,0,0,0.22)',
          }}
        >
          Nästa samtal
        </button>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 22, color: 'rgba(245,232,204,0.6)' }}>
          Tillbaka till Jag i Mig
        </span>
      </div>
    </div>
  );
}
