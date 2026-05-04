/**
 * ProductHomeMock — sandboxed product home surface at /product-home-mock/:productId.
 *
 * Mirrors ProductLibraryMock pattern. Live ProductHome.tsx is untouched.
 * Hardcoded mock progress data switched via dev panel.
 */

import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import { usePageBackground } from '@/hooks/usePageBackground';

import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/illustration-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/illustration-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/illustration-jag-i-varlden.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';

const PLACEHOLDER_POOL = [
  illustrationJagIMig,
  illustrationJagMedAndra,
  illustrationJagIVarlden,
  illustrationVardag,
  illustrationSyskon,
  illustrationStillUs,
];

const MIDNIGHT_INK = '#1A1A2E';
const DEEP_DUSK = '#2A2D3A';
const GHOST_GLOW = '#D4F5C0';
const LANTERN_GLOW = '#FDF6E3';
const BONKI_ORANGE = '#E85D2C';

type ProductId =
  | 'jag_i_mig'
  | 'jag_med_andra'
  | 'jag_i_varlden'
  | 'vardagskort'
  | 'syskonkort'
  | 'still_us';

interface ProductSpec {
  name: string;
  tint: string;
  subtitle: string;
  illustration: string;
  cards: Array<{ title: string; total: number }>;
}

const SPECS: Record<ProductId, ProductSpec> = {
  jag_i_mig: {
    name: 'Jag i Mig',
    tint: '#2A6B65',
    subtitle: '21 samtal om känslor som får ord.',
    illustration: illustrationJagIMig,
    cards: [
      { title: 'Mina känslor', total: 5 },
      { title: 'Starka känslor', total: 5 },
      { title: 'Stora känslor', total: 5 },
      { title: 'Att vara jag', total: 6 },
    ],
  },
  jag_med_andra: {
    name: 'Jag med Andra',
    tint: '#8C3D69',
    subtitle: '21 samtal om det trygga och det svåra.',
    illustration: illustrationJagMedAndra,
    cards: [
      { title: 'Att vara nära', total: 5 },
      { title: 'Att höra till', total: 5 },
      { title: 'Bråk', total: 5 },
      { title: 'Kompisar', total: 3 },
      { title: 'Ensam', total: 3 },
    ],
  },
  jag_i_varlden: {
    name: 'Jag i Världen',
    tint: '#7A8019',
    subtitle: '20 samtal om en värld som vidgas.',
    illustration: illustrationJagIVarlden,
    cards: [
      { title: 'Omvärlden', total: 5 },
      { title: 'Vem är jag', total: 5 },
      { title: 'Jag & andra', total: 5 },
      { title: 'Vad tror jag på', total: 5 },
    ],
  },
  vardagskort: {
    name: 'Vardagskort',
    tint: '#549478',
    subtitle: '15 samtal om det vanliga, på djupet.',
    illustration: illustrationVardag,
    cards: [
      { title: 'Morgon', total: 5 },
      { title: 'Skola', total: 5 },
      { title: 'Kväll', total: 5 },
    ],
  },
  syskonkort: {
    name: 'Syskonkort',
    tint: '#9D7FB8',
    subtitle: '13 samtal om band för livet.',
    illustration: illustrationSyskon,
    cards: [
      { title: 'Att vara syskon', total: 5 },
      { title: 'När det skaver', total: 4 },
      { title: 'Tillsammans', total: 4 },
    ],
  },
  still_us: {
    name: 'Vårt Vi',
    tint: '#7989A0',
    subtitle: '21 samtal om att förbli ett vi.',
    illustration: illustrationStillUs,
    cards: [
      { title: 'Vi som par', total: 7 },
      { title: 'Vi som föräldrar', total: 7 },
      { title: 'Vi i världen', total: 7 },
    ],
  },
};

type MockState = 'fresh' | 'progress' | 'mostly';

function buildProgress(spec: ProductSpec, state: MockState): number[] {
  const totals = spec.cards.map((c) => c.total);
  if (state === 'fresh') return totals.map(() => 0);
  if (state === 'progress') {
    return totals.map((t, i) => {
      if (i === 0) return t;
      if (i === 1) return Math.max(1, Math.round(t * 0.4));
      return 0;
    });
  }
  // mostly
  return totals.map((t, i) => (i === totals.length - 1 ? Math.max(1, Math.round(t * 0.6)) : t));
}

export default function ProductHomeMock() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<MockState>('fresh');
  const [panelOpen, setPanelOpen] = useState(false);
  const [kontoOpen, setKontoOpen] = useState(false);

  usePageBackground(MIDNIGHT_INK);

  const spec = (productId && SPECS[productId as ProductId]) || null;

  const completed = useMemo(() => (spec ? buildProgress(spec, state) : []), [spec, state]);

  if (!spec) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: MIDNIGHT_INK,
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          fontFamily: 'var(--font-serif)',
        }}
      >
        <p>Okänt produkt-id: {productId}</p>
        <button
          onClick={() => navigate('/library-mock')}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            background: BONKI_ORANGE,
            color: '#FFF',
            border: 'none',
            fontFamily: 'inherit',
          }}
        >
          → /library-mock
        </button>
      </div>
    );
  }

  const tint = spec.tint;
  const tintGradient = `linear-gradient(to bottom, ${tint} 0%, ${tint}CC 6%, ${tint}66 14%, ${tint}1A 20%, ${MIDNIGHT_INK} 28%)`;

  // Resume vs start banner content
  const isResume = state === 'progress';
  const resumeCard = isResume ? spec.cards[1] : spec.cards[0];
  const resumeQuestion = isResume ? 3 : null;

  return (
    <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, position: 'relative' }}>
      {/* Atmospheric tint */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '0 0 auto 0',
          height: '40vh',
          background: tintGradient,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* KontoIcon (top-right) */}
      <KontoIcon onClick={() => setKontoOpen(true)} />
      <KontoSheet open={kontoOpen} onClose={() => setKontoOpen(false)} />

      {/* Content layer */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header bar with back arrow */}
        <div style={{ padding: '14px 20px 0 20px', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 14px)' }}>
          <button
            onClick={() => navigate('/library-mock')}
            aria-label="Tillbaka till biblioteket"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.85)',
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              padding: 0,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            Biblioteket
          </button>
        </div>

        {/* Title + subtitle */}
        <div style={{ padding: '40px 24px 0 24px', textAlign: 'center' }}>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 36,
              fontWeight: 500,
              color: '#FFFFFF',
              textShadow: '0 1px 10px rgba(0,0,0,0.5)',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {spec.name}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 16,
              color: 'rgba(255,255,255,0.85)',
              lineHeight: 1.3,
              margin: '10px 0 0 0',
            }}
          >
            {spec.subtitle}
          </p>
        </div>

        {/* Resume / start banner */}
        <div style={{ padding: '24px 20px 0 20px' }}>
          <button
            onClick={() => navigate('/library-mock')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              background: DEEP_DUSK,
              border: '0.5px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              color: 'inherit',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <span
              aria-hidden
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: GHOST_GLOW,
                boxShadow: `0 0 10px ${GHOST_GLOW}`,
                flex: '0 0 auto',
              }}
            />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 15,
                  fontWeight: 500,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                {resumeCard.title}
              </span>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.6)',
                  marginTop: 2,
                }}
              >
                {isResume
                  ? `Pausad vid Fråga ${resumeQuestion} av ${resumeCard.total}`
                  : 'Börja här'}
              </span>
            </span>
            <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.5)', flex: '0 0 auto' }} />
          </button>
        </div>

        {/* Card thumbnails grid */}
        <div
          style={{
            padding: '24px 20px calc(96px + env(safe-area-inset-bottom, 0px)) 20px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          {spec.cards.map((card, i) => {
            const done = completed[i] ?? 0;
            const pct = card.total > 0 ? Math.round((done / card.total) * 100) : 0;
            return (
              <button
                key={card.title}
                onClick={() => navigate('/library-mock')}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  aspectRatio: '1 / 1.15',
                  background: DEEP_DUSK,
                  border: '0.5px solid rgba(255,255,255,0.06)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                }}
              >
                <div style={{ padding: '12px 12px 8px', position: 'relative', zIndex: 2 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 18,
                      fontWeight: 500,
                      color: '#FFFFFF',
                      margin: 0,
                      lineHeight: 1.15,
                    }}
                  >
                    {card.title}
                  </h3>
                </div>
                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={spec.illustration}
                    alt=""
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      objectPosition: 'center center',
                    }}
                  />
                </div>
                <div style={{ padding: '8px 12px 12px', background: DEEP_DUSK }}>
                  <div
                    style={{
                      width: '100%',
                      height: 3,
                      borderRadius: 2,
                      background: 'rgba(255,255,255,0.1)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: `${LANTERN_GLOW}B3`,
                      }}
                    />
                  </div>
                  <p
                    style={{
                      margin: '6px 0 0 0',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 11,
                      fontWeight: 500,
                      color: 'rgba(255,255,255,0.65)',
                    }}
                  >
                    {done}/{card.total} samtal
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dev panel (bottom-left) */}
      <div
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
          left: 12,
          zIndex: 9999,
          fontFamily: 'var(--font-sans)',
          transform: 'translateZ(0)',
        }}
      >
        {!panelOpen ? (
          <button
            onClick={() => setPanelOpen(true)}
            style={{
              padding: '6px 10px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.7)',
              color: '#FFF',
              border: '0.5px solid rgba(255,255,255,0.1)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >
            Mock · {spec.name} ▾
          </button>
        ) : (
          <div
            style={{
              background: 'rgba(0,0,0,0.85)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 10,
              minWidth: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <button
              onClick={() => setPanelOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFF',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.04em',
                textAlign: 'left',
                padding: '2px 4px',
                cursor: 'pointer',
              }}
            >
              Mock · {spec.name} ▴
            </button>
            {(['fresh', 'progress', 'mostly'] as MockState[]).map((s) => {
              const label =
                s === 'fresh' ? 'Just purchased' : s === 'progress' ? 'In progress' : 'Mostly complete';
              const active = state === s;
              return (
                <button
                  key={s}
                  onClick={() => setState(s)}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 8,
                    background: active ? BONKI_ORANGE : 'rgba(255,255,255,0.06)',
                    color: '#FFF',
                    border: 'none',
                    fontSize: 11,
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {label}
                </button>
              );
            })}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />
            <button
              onClick={() => navigate('/library-mock')}
              style={{
                padding: '6px 8px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                color: '#FFF',
                border: 'none',
                fontSize: 11,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              Tillbaka till biblioteket →
            </button>
            <button
              onClick={() => navigate(`/intro-mock/${productId}`)}
              style={{
                padding: '6px 8px',
                borderRadius: 8,
                background: 'rgba(255,255,255,0.06)',
                color: '#FFF',
                border: 'none',
                fontSize: 11,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              Se intro →
            </button>
          </div>
        )}
      </div>

      {/* MOCK badge top-right */}
      <button
        onClick={() => navigate('/library-mock')}
        aria-label="Mock badge"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 50px)',
          right: 12,
          zIndex: 9999,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(232, 93, 44, 0.95)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          transform: 'translateZ(0)',
          cursor: 'pointer',
        }}
      >
        MOCK · /product-home-mock → /library-mock
      </button>
    </div>
  );
}
