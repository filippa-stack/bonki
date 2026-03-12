import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Card } from '@/types';
import { Check } from 'lucide-react';

/**
 * Circadian color mapping — reflects psychological shift
 * from light/accessible to deep/reflective.
 */
const CIRCADIAN_COLORS: Record<string, string> = {
  'emotional-intimacy': '#A2B5A9', // Morning Sage
  'communication':      '#6B8E7D', // Vitality Green
  'category-8':         '#C28A78', // Warm Clay
  'individual-needs':   '#C5A37D', // Hearth Ochre
  'parenting-together': '#6F8191', // Steel Blue
  'category-9':         '#4A5D4E', // Deep Moss
  'category-6':         '#8E7C8F', // Dusky Orchid
  'daily-life':         '#3C5459', // Midnight Teal
  'category-10':        '#313658', // Twilight Navy
};

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
    <div className="flex flex-col" style={{ gap: '2px' }}>
      {categories.map((category, index) => {
        const isExpanded = expandedId === category.id;
        const isDimmed = expandedId !== null && !isExpanded;
        const color = CIRCADIAN_COLORS[category.id] || '#A2B5A9';
        const catCards = categoryCards.get(category.id) || [];
        const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
        const allCompleted = completedCount === catCards.length && catCards.length > 0;
        const hasInProgress = catCards.some(c =>
          inProgressCardIds.includes(c.id) && !completedCardIds.includes(c.id)
        );

        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 12 }}
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
            {/* Category row */}
            <button
              onClick={() => handleToggle(category.id)}
              className="w-full text-left"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '18px 8px 18px 4px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderBottom: isExpanded
                  ? 'none'
                  : `1px solid hsla(194, 16%, 52%, 0.12)`,
                transition: 'border-color 0.3s ease',
              }}
            >
              {/* Circadian color accent line */}
              <div
                style={{
                  width: '3px',
                  alignSelf: 'stretch',
                  borderRadius: '2px',
                  backgroundColor: color,
                  opacity: isExpanded ? 1 : 0.5,
                  transition: 'opacity 0.3s ease',
                  flexShrink: 0,
                }}
              />

              {/* Number */}
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '10px',
                  fontWeight: 500,
                  letterSpacing: '0.08em',
                  color: color,
                  opacity: 0.7,
                  width: '18px',
                  flexShrink: 0,
                }}
              >
                {String(index + 1).padStart(2, '0')}
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
                      fontSize: '13px',
                      fontWeight: 400,
                      color: 'var(--text-secondary)',
                      opacity: 0.7,
                      lineHeight: 1.45,
                      marginTop: '3px',
                    }}
                  >
                    {category.entryLine}
                  </p>
                )}
              </div>

              {/* Status indicator */}
              <div style={{ flexShrink: 0, width: '20px', display: 'flex', justifyContent: 'center' }}>
                {allCompleted ? (
                  <Check size={14} style={{ color: color, opacity: 0.6 }} />
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
                ) : null}
              </div>
            </button>

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
                      padding: '4px 8px 20px 28px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      borderBottom: `1px solid hsla(194, 16%, 52%, 0.12)`,
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
                          onClick={() => onNavigateToCard(card.id)}
                          className="w-full text-left"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 8px',
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
                        padding: '10px 8px 6px',
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
    </div>
  );
}
