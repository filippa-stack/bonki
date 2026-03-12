import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Card } from '@/types';
import { Check } from 'lucide-react';
import TopicPreviewOverlay from '@/components/TopicPreviewOverlay';

/**
 * Circadian color mapping — reflects psychological shift
 * from light/accessible to deep/reflective.
 */
export const CIRCADIAN_COLORS: Record<string, string> = {
  'emotional-intimacy': '#A2B5A9', // Sage Green
  'communication':      '#6B8E7D', // Vitality Green
  'category-8':         '#C28A78', // Warm Clay
  'individual-needs':   '#C5A37D', // Hearth Ochre
  'parenting-together': '#6F8191', // Steel Blue
  'category-9':         '#4A5D4E', // Deep Moss
  'category-6':         '#8E7C8F', // Dusky Orchid
  'daily-life':         '#3C5459', // Midnight Teal
  'category-10':        '#313658', // Twilight Navy
};

/**
 * RGBA fills at 15% for glassmorphism tiles.
 */
const CIRCADIAN_FILLS: Record<string, string> = {
  'emotional-intimacy': 'rgba(162, 181, 169, 0.28)',
  'communication':      'rgba(107, 142, 125, 0.28)',
  'category-8':         'rgba(194, 138, 120, 0.28)',
  'individual-needs':   'rgba(197, 163, 125, 0.28)',
  'parenting-together': 'rgba(111, 129, 145, 0.28)',
  'category-9':         'rgba(74, 93, 78, 0.28)',
  'category-6':         'rgba(142, 124, 143, 0.28)',
  'daily-life':         'rgba(60, 84, 89, 0.28)',
  'category-10':        'rgba(49, 54, 88, 0.28)',
};

const CIRCADIAN_FILLS_HOVER: Record<string, string> = {
  'emotional-intimacy': 'rgba(162, 181, 169, 0.42)',
  'communication':      'rgba(107, 142, 125, 0.42)',
  'category-8':         'rgba(194, 138, 120, 0.42)',
  'individual-needs':   'rgba(197, 163, 125, 0.42)',
  'parenting-together': 'rgba(111, 129, 145, 0.42)',
  'category-9':         'rgba(74, 93, 78, 0.42)',
  'category-6':         'rgba(142, 124, 143, 0.42)',
  'daily-life':         'rgba(60, 84, 89, 0.42)',
  'category-10':        'rgba(49, 54, 88, 0.42)',
};

/** Heritage Gold for interactive indicators */
const HERITAGE_GOLD = '#DA9D1D';

const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

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
  const [previewColor, setPreviewColor] = useState('#A2B5A9');
  const [overlayOpen, setOverlayOpen] = useState(false);

  const handleCardClick = (card: Card, category: Category) => {
    const color = CIRCADIAN_COLORS[category.id] || '#A2B5A9';
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
        const color = CIRCADIAN_COLORS[category.id] || '#A2B5A9';
        const fillDefault = CIRCADIAN_FILLS[category.id] || 'rgba(162, 181, 169, 0.15)';
        const fillHover = CIRCADIAN_FILLS_HOVER[category.id] || 'rgba(162, 181, 169, 0.25)';
        const catCards = categoryCards.get(category.id) || [];
        const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
        const allCompleted = completedCount === catCards.length && catCards.length > 0;
        const hasInProgress = catCards.some(c =>
          inProgressCardIds.includes(c.id) && !completedCardIds.includes(c.id)
        );

        const borderDefault = `1px solid ${color}73`; // ~45% opacity
        const borderGlow = `1px solid ${color}`;       // 100% opacity

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
            {/* Category tile — glassmorphism */}
            <motion.button
              onClick={() => handleToggle(category.id)}
              className="w-full text-left circadian-tile"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.985 }}
              style={{
                display: 'flex',
                alignItems: 'stretch',
                gap: '0',
                padding: '0',
                background: fillDefault,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: borderDefault,
                cursor: 'pointer',
                borderRadius: '14px',
                transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: 'none',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = fillHover;
                el.style.border = borderGlow;
                el.style.boxShadow = `0 0 20px -4px ${color}40, 0 0 40px -8px ${color}25`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = fillDefault;
                el.style.border = borderDefault;
                el.style.boxShadow = 'none';
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

                {/* Status indicator — Heritage Gold for interactive elements */}
                <div style={{ flexShrink: 0, width: '20px', display: 'flex', justifyContent: 'center' }}>
                  {allCompleted ? (
                    <Check size={14} style={{ color: HERITAGE_GOLD, opacity: 0.85 }} />
                  ) : hasInProgress ? (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: HERITAGE_GOLD,
                        opacity: 0.8,
                        animation: 'saffron-pulse 2.5s ease-in-out infinite',
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '14px',
                        color: HERITAGE_GOLD,
                        opacity: 0.4,
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease, opacity 0.25s ease',
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
                              backgroundColor: isCardCompleted ? color : 'transparent',
                              opacity: isCardCompleted ? 0.8 : 0.45,
                              flexShrink: 0,
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {isCardCompleted && (
                              <Check size={6} style={{ color: 'var(--surface-base)' }} />
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
                              textDecoration: isCardCompleted ? 'line-through' : 'none',
                              textDecorationColor: isCardCompleted ? `${color}40` : undefined,
                            }}
                          >
                            {card.title}
                          </span>

                          {/* In-progress indicator — Heritage Gold */}
                          {isCardInProgress && (
                            <span
                              style={{
                                display: 'inline-block',
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                backgroundColor: HERITAGE_GOLD,
                                opacity: 0.7,
                                marginLeft: 'auto',
                                flexShrink: 0,
                              }}
                            />
                          )}
                        </motion.button>
                      );
                    })}

                    {/* "Utforska" link — Heritage Gold */}
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
                        color: HERITAGE_GOLD,
                        opacity: 0.7,
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
