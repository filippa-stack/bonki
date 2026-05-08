/**
 * Screen 1 — Vårt Vi marquee close-up. Visual replica of StillUsMarquee
 * (src/components/ProductLibrary.tsx) authored at large scale to fill the
 * inside of the device frame.
 */
import illustrationStillUs from '@/assets/illustration-still-us-tile.png';

const CORNFLOWER = '#6495ED';
const INNER = '#5A85D5';
const ON_COLOR = '#F5E8CC';
const MIDNIGHT_INK = '#1A1A2E';

export default function Screen1Marquee() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: MIDNIGHT_INK,
        padding: '160px 56px 0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '36px',
      }}
    >
      {/* Library page eyebrow */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 56,
            fontWeight: 500,
            color: ON_COLOR,
            margin: '0 0 14px',
            letterSpacing: 0,
          }}
        >
          Biblioteket
        </h1>
        <p
          style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(245, 232, 204, 0.55)',
            margin: 0,
          }}
        >
          Samtal för hela familjen
        </p>
      </div>

      {/* "FÖR PAR" eyebrow above marquee */}
      <p
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(245, 232, 204, 0.5)',
          margin: '32px 0 0',
        }}
      >
        För par
      </p>

      {/* Vårt Vi marquee — scaled-up replica */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 36,
          padding: 36,
          borderRadius: 32,
          background: CORNFLOWER,
          boxShadow: '0 0 0 2px rgba(255,255,255,0.08), 0 24px 60px rgba(0,0,0,0.30)',
          minHeight: 360,
          boxSizing: 'border-box',
        }}
      >
        {/* Medallion */}
        <div
          style={{
            flex: '0 0 40%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 320,
              height: 320,
              borderRadius: '50%',
              background: INNER,
              border: '2px solid rgba(245, 232, 204, 0.30)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={illustrationStillUs}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
          </div>
        </div>

        {/* Text zone */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: 36,
            borderLeft: '2px solid rgba(245, 232, 204, 0.30)',
            gap: 14,
          }}
        >
          <h3
            style={{
              fontFamily: '"Fraunces", serif',
              color: ON_COLOR,
              fontSize: 64,
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: '-0.01em',
              margin: 0,
            }}
          >
            Vårt Vi
          </h3>
          <p
            style={{
              color: ON_COLOR,
              opacity: 0.85,
              fontSize: 26,
              margin: 0,
              fontStyle: 'italic',
              fontFamily: '"Fraunces", serif',
              lineHeight: 1.3,
            }}
          >
            Samtalen som dagen inte gav plats för
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 16 }}>
            <span
              style={{
                background: 'rgba(255,255,255,0.20)',
                borderRadius: 999,
                padding: '12px 28px',
                fontSize: 26,
                color: ON_COLOR,
                fontWeight: 600,
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              16 av 18
            </span>
            <span
              style={{
                color: ON_COLOR,
                opacity: 0.6,
                fontSize: 20,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              21 samtal
            </span>
          </div>
        </div>
      </div>

      {/* Hint of more content below to feel like a real page */}
      <p
        style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(245, 232, 204, 0.5)',
          margin: '40px 0 0',
        }}
      >
        För barn
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 28,
          opacity: 0.85,
        }}
      >
        <MiniTile frame="#E89B6B" interior="#F2BC97" name="Jag i Mig" tagline="När känslor får ord" darkText="#5A3A1F" />
        <MiniTile frame="#CB7AB2" interior="#DCA1C8" name="Jag med Andra" tagline="Att höra till & vara sig själv" darkText="#FAEDF2" />
      </div>
    </div>
  );
}

function MiniTile({ frame, interior, name, tagline, darkText }: {
  frame: string; interior: string; name: string; tagline: string; darkText: string;
}) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '3 / 4',
        borderRadius: 22,
        background: frame,
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 10px 28px rgba(0,0,0,0.18)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', inset: 22, bottom: '32%', borderRadius: 16, background: interior, border: `1px solid ${darkText}30` }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '28%', background: frame, padding: '0 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ fontFamily: '"Fraunces", serif', fontWeight: 600, fontSize: 30, color: darkText, lineHeight: 1.05 }}>{name}</span>
        <span style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 16, color: darkText, opacity: 0.7, marginTop: 6 }}>{tagline}</span>
      </div>
    </div>
  );
}
