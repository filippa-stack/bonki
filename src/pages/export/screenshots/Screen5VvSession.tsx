/**
 * Screen 5 — Vårt Vi session in progress on Midnight Ink.
 */
const MIDNIGHT_INK = '#1A1A2E';
const ON = '#F5E8CC';
const SAFFRON = '#E9B44C';
const CREAM = '#FDF6E3';
const BARK = '#2C2420';
const DRIFTWOOD = '#6B5E52';
const WARM_GOLD = '#E9C890';
const CORNFLOWER = '#6495ED';

export default function Screen5VvSession() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: MIDNIGHT_INK,
        padding: '170px 56px 0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        {[true, false, false].map((filled, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              background: filled ? SAFFRON : 'rgba(245,232,204,0.20)',
            }}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', color: CORNFLOWER, margin: 0, fontWeight: 600 }}>
          Vårt Vi
        </p>
        <h2 style={{ fontFamily: '"Fraunces", serif', fontSize: 60, fontWeight: 500, color: ON, margin: '14px 0 0', letterSpacing: '-0.005em' }}>
          Att bli förälder
        </h2>
        <p style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 24, color: 'rgba(245,232,204,0.7)', margin: '12px 0 0' }}>
          Det som har förändrats sedan vi blev tre
        </p>
      </div>

      <p style={{ textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: 18, letterSpacing: '0.20em', textTransform: 'uppercase', color: 'rgba(245,232,204,0.5)', margin: '40px 0 28px', fontWeight: 600 }}>
        1 av 3
      </p>

      <div
        style={{
          background: CREAM,
          borderRadius: 36,
          padding: '64px 52px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.40), 0 4px 14px rgba(255, 220, 160, 0.14)',
          textAlign: 'center',
        }}
      >
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 18, letterSpacing: '0.18em', textTransform: 'uppercase', color: DRIFTWOOD, margin: '0 0 36px', fontWeight: 600 }}>
          Fråga
        </p>
        <p
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 56,
            fontWeight: 500,
            color: BARK,
            lineHeight: 1.18,
            letterSpacing: '-0.005em',
            margin: 0,
            textWrap: 'balance' as any,
          }}
        >
          Vad har förändrats i dig sedan ni blev föräldrar?
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: 110, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <button
          style={{
            background: `${WARM_GOLD}E6`,
            color: '#3A2D08',
            border: '1px solid rgba(255,255,255,0.25)',
            borderRadius: 999,
            padding: '24px 88px',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: '0.04em',
            boxShadow: '0 12px 32px rgba(0,0,0,0.30)',
            backdropFilter: 'blur(20px)',
          }}
        >
          Nästa fråga
        </button>
      </div>
    </div>
  );
}
