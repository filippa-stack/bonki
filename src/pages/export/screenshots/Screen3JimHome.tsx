/**
 * Screen 3 — Jag i Mig product home. Visual replica using KidsTileFrame-
 * style composition with several saffron checkmarks.
 */
import heroImage from '@/assets/illustration-jag-i-mig.png';

const FRAME = '#E89B6B';
const INTERIOR = '#F2BC97';
const DARK_TEXT = '#5A3A1F';
const ATMOSPHERIC = '#8C4A2D';
const ON = '#F5E8CC';
const SAFFRON = '#E9B44C';

const TILES: { title: string; subtitle: string; meta: string; completed: boolean }[] = [
  { title: 'Glad', subtitle: 'Vad som ger energi och glädje', meta: 'FRÅN 3 ÅR', completed: true },
  { title: 'Trygg', subtitle: 'Det som gör att jag känner mig säker', meta: 'FRÅN 3 ÅR', completed: true },
  { title: 'Ledsen', subtitle: 'Att ha det tungt — tillsammans', meta: 'FRÅN 3 ÅR', completed: true },
  { title: 'Arg', subtitle: 'När det kokar inuti', meta: 'FRÅN 3 ÅR', completed: true },
  { title: 'Rädd', subtitle: 'Det som skrämmer — och vad som hjälper', meta: 'FRÅN 4 ÅR', completed: true },
  { title: 'Stolt', subtitle: 'Vad du gjort som du bär med dig', meta: 'FRÅN 4 ÅR', completed: false },
];

export default function Screen3JimHome() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: ATMOSPHERIC,
        padding: '160px 40px 200px',
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Atmospheric hero */}
      <img
        src={heroImage}
        alt=""
        style={{
          position: 'absolute',
          top: '4%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '110%',
          opacity: 0.34,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to bottom, transparent 0%, ${ATMOSPHERIC}80 30%, ${ATMOSPHERIC} 60%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 48 }}>
        <h1
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 92,
            fontWeight: 700,
            color: ON,
            margin: 0,
            letterSpacing: '-0.02em',
            textShadow: `0 4px 30px rgba(0,0,0,0.45), 0 0 80px ${ATMOSPHERIC}`,
            fontVariationSettings: '"opsz" 96',
          }}
        >
          Jag i Mig
        </h1>
        <p
          style={{
            fontFamily: '"Fraunces", serif',
            fontStyle: 'italic',
            fontSize: 32,
            color: '#F2BC97',
            opacity: 0.95,
            marginTop: 14,
            textShadow: '0 2px 14px rgba(0,0,0,0.55)',
          }}
        >
          När känslor får ord
        </p>
      </div>

      <div
        style={{
          position: 'relative',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 28,
        }}
      >
        {TILES.map((t, i) => (
          <Tile key={i} {...t} />
        ))}
      </div>
    </div>
  );
}

function Tile({ title, subtitle, meta, completed }: { title: string; subtitle: string; meta: string; completed: boolean }) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: 32,
        background: FRAME,
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 14px 36px rgba(0,0,0,0.20)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: 28,
          right: 28,
          bottom: '28%',
          borderRadius: 22,
          background: INTERIOR,
          border: `1px solid ${DARK_TEXT}30`,
        }}
      />

      {completed && (
        <svg
          width="34"
          height="34"
          viewBox="0 0 18 18"
          fill="none"
          style={{ position: 'absolute', top: 46, right: 46, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
        >
          <path d="M3.5 9.5 L7.5 13.5 L14.5 5.5" stroke={SAFFRON} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '24%',
          background: FRAME,
          padding: '0 28px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 28, right: 28, height: 1, background: DARK_TEXT, opacity: 0.18 }} />
        <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 38, color: DARK_TEXT, lineHeight: 1.05, fontVariationSettings: '"opsz" 36' }}>
          {title}
        </span>
        <span style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 20, color: DARK_TEXT, opacity: 0.7, marginTop: 6, lineHeight: 1.2 }}>
          {subtitle}
        </span>
        <span style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 16, fontWeight: 600, letterSpacing: '0.10em', color: DARK_TEXT, opacity: 0.55, marginTop: 8 }}>
          {meta}
        </span>
      </div>
    </div>
  );
}
