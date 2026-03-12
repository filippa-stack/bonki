import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Card } from '@/types';
import { Check } from 'lucide-react';
import TopicPreviewOverlay from '@/components/TopicPreviewOverlay';

/**
 * Circadian color mapping — reflects psychological shift
 * from light/accessible to deep/reflective.
 * Updated for high-visibility with brighter, more distinct hues.
 */
export const CIRCADIAN_COLORS: Record<string, string> = {
  'emotional-intimacy': '#A8C4B0', // Bright desaturated Sage
  'communication':      '#6B8E7D', // Vitality Green
  'category-8':         '#D4896E', // Vibrant earthy Terracotta
  'individual-needs':   '#C5A37D', // Hearth Ochre
  'parenting-together': '#6F8191', // Steel Blue
  'category-9':         '#4A5D4E', // Deep Moss
  'category-6':         '#8E7C8F', // Dusky Orchid
  'daily-life':         '#3C5459', // Midnight Teal
  'category-10':        '#4A50A0', // Luminous Twilight Navy
};

/**
 * Category glow shadows — each card emits light in its color.
 */
const categoryGlow = (color: string, intensity: number = 1) =>
  `0 2px 8px -2px ${color}${Math.round(25 * intensity).toString(16).padStart(2, '0')}, ` +
  `0 8px 24px -6px ${color}${Math.round(18 * intensity).toString(16).padStart(2, '0')}`;

const categoryGlowHover = (color: string) =>
  `0 4px 14px -2px ${color}${Math.round(38).toString(16).padStart(2, '0')}, ` +
  `0 12px 32px -6px ${color}${Math.round(28).toString(16).padStart(2, '0')}`;

const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

/** Deep Verdigris card background — slightly darker than canvas */
const CARD_BG = 'hsl(194, 28%, 28%)';
const CARD_BG_HOVER = 'hsl(194, 28%, 30%)';

interface CircadianMenuProps {
  categories: Category[];
  cards: Card[];
  completedCardIds: string[];
  inProgressCardIds: string[];
  onNavigateToCategory: (categoryId: string) => void;
  onNavigateToCard: (cardId: string) => void;
}

export default function CircadianMenu({
  categories,
  cards,
  completedCardIds,
  inProgressCardIds,
  onNavigateToCategory,
  onNavigateToCard,
}: CircadianMenuProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [previewCard, setPreviewCard] = useState<Card | null>(null);
  const [previewCategory, setPreviewCategory] = useState<Category | null>(null);
  const [previewColor, setPreviewColor] = useState('#A8C4B0');
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleCardClick = (card: Card, category: Category) => {
    const color = CIRCADIAN_COLORS[category.id] || '#A8C4B0';
    setPreviewCard(card);
    setPreviewCategory(category);
    setPreviewColor(color);
    setOverlayOpen(true);
  };

  const categoryCards = useMemo(() => {
    const map = new Map<string, Card[]>();
    categories.forEach(cat => {
      map.set(cat.id, cards.filter(c => c.categoryId === cat.id));
    });
    return map;
  }, [categories, cards]);

  const handleToggle = (categoryId: string) => {
    setExpandedId(prev => prev === categoryId ? null : categoryId);
  };

  return (
    <div className="flex flex-col" style={{ gap: '10px', padding: '0 4px' }}>
      {categories.map((category, index) => {
        const isExpanded = expandedId === category.id;
        const isDimmed = expandedId !== null && !isExpanded;
        const color = CIRCADIAN_COLORS[category.id] || '#A8C4B0';
        const catCards = categoryCards.get(category.id) || [];
        const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
        const allCompleted = completedCount === catCards.length && catCards.length > 0;
        const hasInProgress = catCards.some(c =>
          inProgressCardIds.includes(c.id) && !completedCardIds.includes(c.id)
        );

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{
              opacity: isDimmed ? 0.20 : 1,
              y: 0,
            }}
            transition={{
              opacity: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
              y: { duration: 0.6, delay: 0.08 + index * 0.04, ease: [...ENTER_EASE] },
            }}
            style={{ position: 'relative' }}
          >
            {/* Category card */}
            <motion.button
              onClick={() => handleToggle(category.id)}
              className="w-full text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.985 }}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '0',
                padding: '0',
                background: CARD_BG,
                border: 'none',
                cursor: 'pointer',
                borderRadius: '14px',
                boxShadow: categoryGlow(color),
                transition: 'box-shadow 0.35s ease, background-color 0.25s ease',
                overflow: 'hidden',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = categoryGlowHover(color);
                (e.currentTarget as HTMLElement).style.backgroundColor = CARD_BG_HOVER;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = categoryGlow(color);
                (e.currentTarget as HTMLElement).style.backgroundColor = CARD_BG;
              }}
            >
              {/* Thick accent bar — left edge */}
              <div
                style={{
                  width: '4px',
                  alignSelf: 'stretch',
                  backgroundColor: color,
                  flexShrink: 0,
                  borderRadius: '14px 0 0 14px',
                }}
              />

              {/* Card content */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '16px 16px 16px 16px',
                }}
              >
                {/* Number in category color */}
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '22px',
                    fontWeight: 700,
                    color: color,
                    opacity: 0.85,
                    width: '28px',
                    textAlign: 'center',
                    flexShrink: 0,
                    lineHeight: 1,
                  }}
                >
                  {index + 1}
                </span>

                {/* Title + entry line */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '18px',
                      fontWeight: isExpanded ? 600 : 500,
                      lineHeight: 1.3,
                      color: 'var(--text-primary)',
                      transition: 'font-weight 0.2s ease',
                    }}
                  >
                    {category.title}
                  </h3>
                  {!isExpanded && category.entryLine && (
                    <p
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '12px',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: 'var(--text-secondary)',
                        opacity: 0.65,
                        lineHeight: 1.45,
                        marginTop: '2px',
                      }}
                    >
                      {category.entryLine}
                    </p>
                  )}
                </div>

                {/* Status indicator */}
                <div style={{ flexShrink: 0, width: '20px', display: 'flex', justifyContent: 'center' }}>
                  {allCompleted ? (
                    <Check size={14} style={{ color: color, opacity: 0.7 }} />
                  ) : hasInProgress ? (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        opacity: 0.7,
                        animation: 'saffron-pulse 2.5s ease-in-out infinite',
                      }}
                    />
                  ) : (
                    /* Subtle chevron hint */
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                        opacity: 0.35,
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      ›
                    </span>
                  )}
                </div>
              </div>
            </motion.button>

            {/* Expanded sub-topics */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  key={`expanded-${category.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div
                    style={{
                      padding: '8px 12px 16px 52px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                    }}
                  >
                    {catCards.map((card, cardIndex) => {
                      const isCardCompleted = completedCardIds.includes(card.id);
                      const isCardInProgress =
                        inProgressCardIds.includes(card.id) && !isCardCompleted;

                      return (
                        <motion.button
                          key={card.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.06 + cardIndex * 0.05,
                            ease: [...ENTER_EASE],
                          }}
                          onClick={() => handleCardClick(card, category)}
                          className="w-full text-left"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '11px 10px',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            transition: 'background-color 0.15s ease',
                          }}
                          whileHover={{
                            backgroundColor: 'hsla(194, 16%, 52%, 0.08)',
                          }}
                          whileTap={{ scale: 0.985 }}
                        >
                          {/* Bead indicator */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '10px',
                              height: '10px',
                              borderRadius: '50%',
                              border: `1.5px solid ${color}`,
                              backgroundColor: isCardCompleted
                                ? color
                                : 'transparent',
                              opacity: isCardCompleted ? 0.8 : 0.45,
                              flexShrink: 0,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {isCardCompleted && (
                              <Check size={6} style={{ color: CARD_BG }} />
                            )}
                          </span>

                          {/* Sub-topic title */}
                          <span
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '14px',
                              fontWeight: 400,
                              color: 'var(--text-primary)',
                              opacity: isCardCompleted ? 0.5 : 0.80,
                              lineHeight: 1.4,
                              textDecoration: isCardCompleted
                                ? 'line-through'
                                : 'none',
                              textDecorationColor: isCardCompleted
                                ? `${color}40`
                                : undefined,
                            }}
                          >
                            {card.title}
                          </span>

                          {/* In-progress dot */}
                          {isCardInProgress && (
                            <span
                              style={{
                                display: 'inline-block',
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor: color,
                                opacity: 0.6,
                                marginLeft: 'auto',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </motion.button>
                      );
                    })}

                    {/* "Utforska" link to category page */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.15 + catCards.length * 0.05, duration: 0.3 }}
                      onClick={() => onNavigateToCategory(category.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 10px 6px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        fontWeight: 500,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase' as const,
                        color: color,
                        opacity: 0.6,
                      }}
                    >
                      Utforska {category.title.toLowerCase()} →
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Topic preview overlay + instruction bridge */}
      <TopicPreviewOverlay
        card={previewCard}
        category={previewCategory}
        categoryColor={previewColor}
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
      />
    </div>
  );
}
