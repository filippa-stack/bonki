import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { COLORS } from '@/lib/stillUsTokens';
import { LAYERS, CARD_SEQUENCE } from '@/data/stillUsSequence';
import layerIntros from '@/data/layerIntros';

/** Layer color by index — sourced from stillUsTokens COLORS */
const LAYER_COLOR: Record<number, string> = {
  0: COLORS.grunden,
  1: COLORS.normen,
  2: COLORS.konflikten,
  3: COLORS.langtan,
  4: COLORS.valet,
};

/** Week range labels per layer */
const WEEK_RANGES: Record<number, string> = {
  0: 'Vecka 1–4',
  1: 'Vecka 5–9',
  2: 'Vecka 10–14',
  3: 'Vecka 15–18',
  4: 'Vecka 19–22',
};

export default function JourneyPreview() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: COLORS.emberNight,
        paddingBottom: '120px',
      }}
    >
      {/* ── Top zone ── */}
      <div
        style={{
          padding: '0 24px',
          paddingTop: 'max(16px, env(safe-area-inset-top, 16px))',
        }}
      >
        {/* Back arrow */}
        <button
          onClick={() => navigate('/product/still-us', { replace: true })}
          aria-label="Tillbaka"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 0',
            color: COLORS.lanternGlow,
          }}
        >
          <ArrowLeft size={24} />
        </button>

        {/* Heading */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 600,
            color: COLORS.lanternGlow,
            margin: '16px 0 0',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          Er resa tillsammans
        </h1>

        {/* Subheading */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '16px',
            color: COLORS.driftwoodBody,
            opacity: 0.7,
            marginTop: '8px',
            lineHeight: 1.5,
          }}
        >
          21 samtal. 4 lager. En rörelse från det trygga till det modiga.
        </p>
      </div>

      {/* ── Layer sections ── */}
      <div style={{ padding: '32px 24px 0' }}>
        {LAYERS.map((layer, layerIdx) => {
          const color = LAYER_COLOR[layerIdx];
          const intro = layerIntros.find((l) => l.layerIndex === layerIdx);
          const cards = CARD_SEQUENCE.filter((c) => c.layerIndex === layerIdx);

          return (
            <section
              key={layer.id}
              aria-label={layer.name}
              style={{ marginBottom: layerIdx < LAYERS.length - 1 ? '32px' : 0 }}
            >
              {/* Layer header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '20px',
                    fontWeight: 600,
                    color,
                    lineHeight: 1.3,
                  }}
                >
                  {layer.name}
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: COLORS.driftwood,
                    marginLeft: '4px',
                  }}
                >
                  {WEEK_RANGES[layerIdx]}
                </span>
              </div>

              {/* Layer intro */}
              {intro && (
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    color: COLORS.driftwoodBody,
                    marginTop: '6px',
                    lineHeight: 1.5,
                  }}
                >
                  {intro.intro}
                </p>
              )}

              {/* Card list */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cards.map((card) => (
                  <div
                    key={card.cardId}
                    style={{
                      borderLeft: `2px solid ${color}`,
                      paddingLeft: '16px',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        color: COLORS.driftwood,
                        display: 'block',
                      }}
                    >
                      Vecka {card.index + 1}
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '17px',
                        fontWeight: 600,
                        color: COLORS.lanternGlow,
                        lineHeight: 1.3,
                        display: 'block',
                        marginTop: '2px',
                      }}
                    >
                      {card.title}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ── Sticky CTA zone ── */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
          background: `linear-gradient(to top, ${COLORS.emberNight} 60%, transparent)`,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => navigate('/share')}
          style={{
            width: '100%',
            height: '52px',
            borderRadius: '16px',
            backgroundColor: COLORS.bonkiOrange,
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            fontSize: '17px',
            fontWeight: 600,
            color: COLORS.emberNight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Bjud in din partner
        </button>
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: COLORS.driftwood,
            textAlign: 'center',
            marginTop: '8px',
          }}
        >
          Allt börjar med en enkel check-in.
        </p>
      </div>
    </div>
  );
}
