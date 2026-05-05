/**
 * ProductHomeMock — sandboxed product home surface at /product-home-mock/:productId.
 *
 * Iteration 2: solid midnight ink (no atmospheric tint), flat sequenced card list
 * grouped by editorial category dividers, product-color progress bar fills.
 *
 * Mirrors ProductLibraryMock pattern. Live ProductHome.tsx is untouched.
 */

import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import KontoIcon from '@/components/KontoIcon';
import KontoSheet from '@/components/KontoSheet';
import { usePageBackground } from '@/hooks/usePageBackground';
import { getProductById } from '@/data/products';
import { hasCardImage } from '@/hooks/useCardImage';
import type { Card } from '@/types';

import illustrationStillUs from '@/assets/illustration-still-us-tile.png';
import illustrationJagIMig from '@/assets/illustration-jag-i-mig.png';
import illustrationJagMedAndra from '@/assets/illustration-jag-med-andra.png';
import illustrationJagIVarlden from '@/assets/illustration-jag-i-varlden.png';
import illustrationSyskon from '@/assets/illustration-syskon.png';
import illustrationVardag from '@/assets/illustration-vardag.png';

// Product-level hero illustrations — used as fallback only for cards whose
// per-card illustration is not yet present in /card-images/. In practice all
// current product cards have entries in CARD_IDS_WITH_IMAGES.
const PRODUCT_HERO_FALLBACK: Record<string, string> = {
  jag_i_mig: illustrationJagIMig,
  jag_med_andra: illustrationJagMedAndra,
  jag_i_varlden: illustrationJagIVarlden,
  vardagskort: illustrationVardag,
  syskonkort: illustrationSyskon,
  sexualitetskort: illustrationJagIMig,
  still_us: illustrationStillUs,
};

function cardIllustration(productId: string, cardId: string): string {
  if (hasCardImage(cardId)) return `/card-images/${cardId}.webp`;
  return PRODUCT_HERO_FALLBACK[productId] ?? illustrationJagIMig;
}

const MIDNIGHT_INK = '#1A1A2E';
const DEEP_DUSK = '#2A2D3A';
const GHOST_GLOW = '#D4F5C0';
const BONKI_ORANGE = '#E85D2C';

interface MockMeta {
  subtitle: string;
  progressColor: string;
}

const MOCK_META: Record<string, MockMeta> = {
  jag_i_mig: {
    subtitle: '21 samtal om känslor som får ord.',
    progressColor: '#5BC9BC',
  },
  jag_med_andra: {
    subtitle: '21 samtal om det trygga och det svåra.',
    progressColor: '#E27BAC',
  },
  jag_i_varlden: {
    subtitle: '20 samtal om en värld som vidgas.',
    progressColor: '#D5DC4F',
  },
  vardagskort: {
    subtitle: '15 samtal om det vanliga, på djupet.',
    progressColor: '#7FCEAB',
  },
  syskonkort: {
    subtitle: '13 samtal om band för livet.',
    progressColor: '#C4A5D6',
  },
  sexualitetskort: {
    subtitle: '',
    progressColor: '#5BC9BC',
  },
  still_us: {
    subtitle: '21 samtal om att förbli ett vi.',
    progressColor: '#8898AE',
  },
};

type MockState = 'fresh' | 'progress' | 'mostly';

function cardTotal(card: Card): number {
  const opening = card.sections.find((s) => s.type === 'opening');
  return opening?.prompts?.length ?? 1;
}

function buildProgress(totals: number[], state: MockState): number[] {
  if (state === 'fresh') return totals.map(() => 0);
  if (state === 'progress') {
    return totals.map((t, i) => {
      if (i === 0) return t;
      if (i === 1) return Math.max(1, Math.round(t * 0.4));
      return 0;
    });
  }
  return totals.map((t, i) => (i === totals.length - 1 ? Math.max(1, Math.round(t * 0.6)) : t));
}

export default function ProductHomeMock() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<MockState>('fresh');
  const [panelOpen, setPanelOpen] = useState(false);
  const [kontoOpen, setKontoOpen] = useState(false);

  usePageBackground(MIDNIGHT_INK);

  const product = productId ? getProductById(productId) : undefined;
  const meta = productId ? MOCK_META[productId] : undefined;

  // Build sequenced sections from manifest, preserving category order.
  const sections = useMemo(() => {
    if (!product) return [];
    return product.categories.map((cat) => ({
      categoryId: cat.id,
      categoryTitle: cat.title,
      cards: product.cards.filter((c) => c.categoryId === cat.id),
    }));
  }, [product]);

  // Flat ordered list across categories
  const flatCards = useMemo(() => sections.flatMap((s) => s.cards), [sections]);
  const totals = useMemo(() => flatCards.map(cardTotal), [flatCards]);
  const completed = useMemo(() => buildProgress(totals, state), [totals, state]);

  if (!product || !meta) {
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

  // Resume vs start banner content
  const isResume = state === 'progress';
  const resumeCard = isResume ? flatCards[1] ?? flatCards[0] : flatCards[0];
  const resumeTotal = resumeCard ? cardTotal(resumeCard) : 0;
  const resumeQuestion = isResume ? Math.min(3, resumeTotal) : null;

  return (
    <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, position: 'relative' }}>
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
            {product.name}
          </h1>
          {meta.subtitle && (
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
              {meta.subtitle}
            </p>
          )}
        </div>

        {/* Resume / start banner */}
        {resumeCard && (
          <div style={{ padding: '24px 20px 0 20px' }}>
            <button
              onClick={() => navigate('/library-mock')}
              style={{
                position: 'relative',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px 12px 20px',
                background: DEEP_DUSK,
                border: '0.5px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                overflow: 'hidden',
                boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${meta.progressColor}1F`,
              }}
            >
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: 4,
                  background: meta.progressColor,
                }}
              />
              <span
                aria-hidden
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: meta.progressColor,
                  boxShadow: `0 0 10px ${meta.progressColor}`,
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
                    ? `Pausad vid Fråga ${resumeQuestion} av ${resumeTotal}`
                    : 'Börja här'}
                </span>
              </span>
              <ChevronRight size={20} style={{ color: 'rgba(255,255,255,0.5)', flex: '0 0 auto' }} />
            </button>
          </div>
        )}

        {/* Sequenced category sections */}
        <div
          style={{
            padding: '8px 20px calc(96px + env(safe-area-inset-bottom, 0px)) 20px',
          }}
        >
          {sections.map((section) => {
            // compute starting flat index for this section
            const startIdx = flatCards.indexOf(section.cards[0]);
            return (
              <div key={section.categoryId}>
                <div
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.65)',
                    borderTop: '0.5px solid rgba(255,255,255,0.10)',
                    padding: '28px 0 12px 4px',
                  }}
                >
                  {section.categoryTitle}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                  }}
                >
                  {section.cards.map((card, localIdx) => {
                    const globalIdx = startIdx + localIdx;
                    const total = totals[globalIdx] ?? 1;
                    const done = completed[globalIdx] ?? 0;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                    return (
                      <button
                        key={card.id}
                        onClick={() => navigate('/library-mock')}
                        style={{
                          position: 'relative',
                          aspectRatio: '1 / 1.05',
                          background: meta.progressColor,
                          border: '0.5px solid rgba(255,255,255,0.06)',
                          borderRadius: 14,
                          overflow: 'hidden',
                          padding: 0,
                          cursor: 'pointer',
                          textAlign: 'left',
                          color: 'inherit',
                        }}
                      >
                        <img
                          src={cardIllustration(product.id, card.id)}
                          alt=""
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            objectPosition: 'center',
                          }}
                        />
                        <div
                          aria-hidden
                          style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            height: '55%',
                            background:
                              'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)',
                            pointerEvents: 'none',
                          }}
                        />
                        <h3
                          style={{
                            position: 'absolute',
                            bottom: 14,
                            left: 14,
                            right: 14,
                            fontFamily: 'var(--font-serif)',
                            fontSize: 20,
                            fontWeight: 600,
                            color: '#FFFFFF',
                            textShadow:
                              '0 1px 2px rgba(0,0,0,0.9), 0 2px 14px rgba(0,0,0,0.7)',
                            margin: 0,
                            lineHeight: 1.15,
                          }}
                        >
                          {card.title}
                        </h3>
                        {pct > 0 && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: 3,
                              background: 'rgba(255,255,255,0.12)',
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: '100%',
                                background: meta.progressColor,
                              }}
                            />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
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
            Mock · {product.name} ▾
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
              Mock · {product.name} ▴
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

      {/* MOCK badge top-left */}
      <button
        onClick={() => navigate('/library-mock')}
        aria-label="Mock badge"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 50px)',
          left: 12,
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
