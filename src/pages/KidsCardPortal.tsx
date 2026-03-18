/**
 * KidsCardPortal — Full-bleed illustrated card portal.
 *
 * Replaces the Category Page + session start screen for kids products.
 * Shows the next recommended card in the selected category as an
 * interactive "door" the child taps to enter conversation.
 *
 * Route: /product/:productSlug/portal/:categoryId
 */

import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { allProducts } from '@/data/products';
import { useKidsProductProgress } from '@/hooks/useKidsProductProgress';
import { useCardImage } from '@/hooks/useCardImage';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  SAFFRON_FLAME,
} from '@/lib/palette';

/* ── Helpers ── */

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  return `${parseInt(h.substring(0, 2), 16)},${parseInt(h.substring(2, 4), 16)},${parseInt(h.substring(4, 6), 16)}`;
}

function estimateMinutes(promptCount: number): string {
  const lo = promptCount * 3;
  const hi = promptCount * 4;
  return `ca ${lo}–${hi} min`;
}

function getPromptCount(card: { sections?: { prompts?: string[] }[] }): number {
  return card.sections?.reduce((sum, s) => sum + (s.prompts?.length ?? 0), 0) ?? 0;
}

/* ── Card Image Loader (wrapper to satisfy hook rules) ── */
function PortalCardImage({ cardId, children }: { cardId: string; children: (src: string | null) => React.ReactNode }) {
  const src = useCardImage(cardId);
  return <>{children(src)}</>;
}

/* ── Main Component ── */

export default function KidsCardPortal() {
  const { productSlug, categoryId } = useParams<{ productSlug: string; categoryId: string }>();
  const navigate = useNavigate();

  // Resolve product + category
  const product = allProducts.find(p => p.slug === productSlug);
  const category = product?.categories.find(c => c.id === categoryId);
  const categoryCards = useMemo(
    () => product?.cards.filter(c => c.categoryId === categoryId) ?? [],
    [product, categoryId],
  );

  const progress = useKidsProductProgress(product);

  // Determine which card to show — first uncompleted, or first if all done
  const initialCardIndex = useMemo(() => {
    if (!categoryCards.length) return 0;
    const completedSet = new Set(progress.recentlyCompletedCardIds);
    const firstUncompleted = categoryCards.findIndex(c => !completedSet.has(c.id));
    return firstUncompleted >= 0 ? firstUncompleted : 0;
  }, [categoryCards, progress.recentlyCompletedCardIds]);

  const [currentIndex, setCurrentIndex] = useState(initialCardIndex);
  const card = categoryCards[currentIndex];

  const promptCount = card ? getPromptCount(card) : 0;
  const isLast = currentIndex >= categoryCards.length - 1;

  // Navigation
  const goBack = useCallback(() => {
    navigate(`/product/${productSlug}`);
  }, [navigate, productSlug]);

  const startSession = useCallback(() => {
    if (!card) return;
    navigate(`/card/${card.id}`);
  }, [navigate, card]);

  const goNext = useCallback(() => {
    if (!isLast) setCurrentIndex(i => i + 1);
  }, [isLast]);

  // Tile background color from product
  const tileBg = product?.tileLight ?? MIDNIGHT_INK;
  const tileBgRgb = hexToRgb(tileBg);

  if (!product || !category || !card) {
    return (
      <div style={{ minHeight: '100vh', background: MIDNIGHT_INK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: DRIFTWOOD, fontSize: '14px' }}>Produkten hittades inte</p>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: MIDNIGHT_INK,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ═══ Top Bar ═══ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: `calc(env(safe-area-inset-top, 0px) + 16px) 16px 12px`,
          position: 'relative',
          zIndex: 10,
        }}
      >
        <button
          onClick={goBack}
          aria-label="Tillbaka"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: LANTERN_GLOW, opacity: 0.7, padding: '4px' }}
        >
          <ChevronLeft size={22} strokeWidth={1.5} />
        </button>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: DRIFTWOOD,
          }}
        >
          {category.title}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            color: DRIFTWOOD,
            minWidth: '28px',
            textAlign: 'right',
          }}
        >
          {currentIndex + 1}/{categoryCards.length}
        </span>
      </div>

      {/* ═══ Portal Content ═══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px' }}>

        {/* Portal tile — the "door" */}
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: '100%',
              maxWidth: '358px',
              aspectRatio: '3 / 4',
              position: 'relative',
              borderRadius: '20px',
              overflow: 'hidden',
              cursor: 'pointer',
              backgroundColor: tileBg,
              backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
              boxShadow: [
                `0 0 40px rgba(${tileBgRgb}, 0.35)`,
                '0 20px 60px rgba(0, 0, 0, 0.40)',
                '0 8px 24px rgba(0, 0, 0, 0.25)',
                'inset 0 2px 8px rgba(255, 255, 255, 0.35)',
                'inset 0 -4px 12px rgba(0, 0, 0, 0.15)',
              ].join(', '),
              border: '1.5px solid rgba(255, 255, 255, 0.20)',
            }}
            onClick={startSession}
          >
            {/* Card illustration */}
            <PortalCardImage cardId={card.id}>
              {(imageSrc) => imageSrc ? (
                <img
                  src={imageSrc}
                  alt={card.title}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: '50% 30%',
                    opacity: 0.88,
                  }}
                />
              ) : null}
            </PortalCardImage>

            {/* Subtle glow ring around tile */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '20px',
                boxShadow: `inset 0 0 20px rgba(${tileBgRgb}, 0.15)`,
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* ═══ Text Cluster Below Portal ═══ */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`text-${card.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              textAlign: 'center',
              marginTop: '16px',
              width: '100%',
              maxWidth: '320px',
            }}
          >
            {/* Card name */}
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 600,
                color: LANTERN_GLOW,
                margin: 0,
              }}
            >
              {card.title}
            </h2>

            {/* Hook / subtitle */}
            {card.subtitle && (
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '15px',
                  color: LANTERN_GLOW,
                  opacity: 0.8,
                  marginTop: '8px',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {card.subtitle}
              </p>
            )}

            {/* Practical info */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: DRIFTWOOD,
                marginTop: '8px',
              }}
            >
              {promptCount} frågor · {estimateMinutes(promptCount)}
            </p>

            {/* Tap invitation */}
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '12px',
                fontStyle: 'italic',
                color: DRIFTWOOD,
                marginTop: '12px',
              }}
            >
              Tryck på dörren när ni är redo.
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ═══ Navigation Links ═══ */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            marginTop: '20px',
            paddingBottom: '32px',
          }}
        >
          {!isLast && (
            <button
              onClick={goNext}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: DRIFTWOOD,
                padding: '8px 16px',
              }}
            >
              Nästa kort →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
