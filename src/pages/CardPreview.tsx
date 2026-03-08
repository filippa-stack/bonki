import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useProductTheme } from '@/hooks/useProductTheme';
import { getProductForCard } from '@/data/products';
import { CARD_PREVIEW_TEXTS } from '@/data/previewTexts';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function CardPreview() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const { getCardById, getCategoryById } = useApp();

  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;
  const product = cardId ? getProductForCard(cardId) : undefined;

  // Apply product theme
  useProductTheme(
    product?.accentColor ?? 'hsl(158, 35%, 18%)',
    product?.secondaryAccent ?? 'hsl(38, 88%, 46%)',
    product?.backgroundColor,
    product?.ctaButtonColor,
  );

  const previewParagraphs = cardId ? CARD_PREVIEW_TEXTS[cardId] : undefined;

  if (!card || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF7F2' }}>
        <p style={{ fontFamily: 'var(--font-serif)', color: 'var(--color-text-secondary)' }}>
          Kortet hittades inte
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAF7F2' }}>
      {/* Back arrow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="px-5 pt-14 pb-2"
      >
        <button
          onClick={() => navigate(`/category/${card.categoryId}`)}
          className="flex items-center gap-1 transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-tertiary)', opacity: 0.6 }}
          aria-label="Tillbaka"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </button>
      </motion.div>

      {/* Content */}
      <motion.div
        className="flex-1 px-6 pb-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
      >
        {/* Category label */}
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--accent-text, hsl(158, 35%, 18%))',
            opacity: 0.6,
            marginBottom: '12px',
          }}
        >
          {category.title}
        </p>

        {/* Card title */}
        <h1
          style={{
            fontFamily: "'DM Serif Display', var(--font-serif)",
            fontSize: 'clamp(26px, 7vw, 34px)',
            fontWeight: 400,
            lineHeight: 1.2,
            color: 'var(--text-primary, #2C2420)',
            marginBottom: '8px',
          }}
        >
          {card.title}
        </h1>

        {/* Card subtitle */}
        {card.subtitle && (
          <p
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '15px',
              lineHeight: 1.5,
              color: '#8A8078',
              opacity: 0.85,
              marginBottom: '36px',
            }}
          >
            {card.subtitle}
          </p>
        )}

        {/* Preview text — 3 paragraphs */}
        {previewParagraphs ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {previewParagraphs.map((paragraph, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.25 + i * 0.1 }}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '16px',
                  lineHeight: 1.7,
                  color: 'var(--text-primary, #2C2420)',
                  opacity: 0.85,
                }}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>
        ) : (
          /* Fallback if no preview text exists for this card */
          card.subtitle && (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '16px',
                lineHeight: 1.7,
                color: 'var(--text-primary, #2C2420)',
                opacity: 0.7,
              }}
            >
              {card.subtitle}
            </p>
          )
        )}
      </motion.div>

      {/* Sticky CTA */}
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          padding: '16px 24px',
          paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          background: 'linear-gradient(0deg, #FAF7F2 60%, transparent)',
        }}
      >
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.5 }}
          onClick={() => navigate(`/card/${card.id}`)}
          className="w-full active:scale-[0.98]"
          style={{
            height: '52px',
            borderRadius: '14px',
            background: 'var(--cta-active, hsl(158, 35%, 18%))',
            color: 'hsla(0, 0%, 100%, 0.95)',
            fontFamily: 'var(--font-serif)',
            fontSize: '16px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(44, 36, 32, 0.15), 0 8px 24px -8px rgba(44, 36, 32, 0.12)',
            transition: 'transform 140ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          Starta samtalet
        </motion.button>
      </div>
    </div>
  );
}
