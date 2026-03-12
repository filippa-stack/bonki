import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Card } from '@/types';
import { Check } from 'lucide-react';
import TopicPreviewOverlay from '@/components/TopicPreviewOverlay';

/**
 * Circadian color mapping — reflects psychological shift
 * from light/accessible to deep/reflective.
 */
export const CIRCADIAN_COLORS: Record<string, string> = {
  'emotional-intimacy': '#A2B5A9',
  'communication':      '#6B8E7D',
  'category-8':         '#C28A78',
  'individual-needs':   '#C5A37D',
  'parenting-together': '#6F8191',
  'category-9':         '#4A5D4E',
  'category-6':         '#8E7C8F',
  'daily-life':         '#3C5459',
  'category-10':        '#313658',
};

/** Darker variants for subtitle text — higher contrast on glass tiles */
const CIRCADIAN_COLORS_DARK: Record<string, string> = {
  'emotional-intimacy': '#D0DDD5',
  'communication':      '#A8C7B5',
  'category-8':         '#E0B8AA',
  'individual-needs':   '#E0CAA8',
  'parenting-together': '#A8B8C8',
  'category-9':         '#8AAA92',
  'category-6':         '#BCA8BD',
  'daily-life':         '#7BA0A8',
  'category-10':        '#7A80B0',
};

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

const HERITAGE_GOLD = '#DA9D1D';
const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Section groupings with editorial headers
 */
const SECTION_GROUPS = [
  {
    label: 'Grunden',
    subtitle: 'Det ni bygger på',
    ids: ['emotional-intimacy', 'communication', 'category-8'],
  },
  {
    label: 'Det som formar er',
    subtitle: 'Arv, olikheter och riktning',
    ids: ['individual-needs', 'parenting-together', 'category-9'],
  },
  {
    label: 'Djupet',
    subtitle: 'Mod, närhet och det medvetna valet',
    ids: ['category-6', 'daily-life', 'category-10'],
  },
];

/** Gold progress ring SVG */
function ProgressRing({ completed, total, size = 20 }: { completed: number; total: number; size?: number }) {
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const allDone = completed === total && total > 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={HERITAGE_GOLD}
          strokeWidth={2}
          opacity={0.12}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={HERITAGE_GOLD}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          opacity={0.65}
        />
      </svg>
      {allDone && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Check size={9} style={{ color: HERITAGE_GOLD }} />
        </motion.div>
      )}
    </div>
  );
}

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
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 800);
    return () => clearTimeout(timer);
  }, []);

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

  // Determine the "next suggested" category (first non-completed)
  const nextSuggestedId = useMemo(() => {
    for (const cat of categories) {
      const catCards = categoryCards.get(cat.id) || [];
      const allDone = catCards.length > 0 && catCards.every(c => completedCardIds.includes(c.id));
      if (!allDone) return cat.id;
    }
    return null;
  }, [categories, categoryCards, completedCardIds]);

  const handleToggle = (categoryId: string) => {
    setExpandedId(prev => prev === categoryId ? null : categoryId);
  };

  // Build ordered groups from current categories
  const groups = useMemo(() => {
    return SECTION_GROUPS.map(group => ({
      ...group,
      categories: group.ids
        .map(id => categories.find(c => c.id === id))
        .filter(Boolean) as Category[],
    })).filter(g => g.categories.length > 0);
  }, [categories]);

  let globalIndex = 0;

  return (
    <div className="flex flex-col" style={{ gap: '6px', padding: '0 4px', position: 'relative' }}>
      {/* Ambient background glow — slow-moving radial gradient */}
      <div
        style={{
          position: 'absolute',
          inset: '-60px -40px',
          background: 'radial-gradient(ellipse 80% 50% at 30% 20%, rgba(162, 181, 169, 0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 70% 80%, rgba(49, 54, 88, 0.06) 0%, transparent 70%)',
          animation: 'ambient-drift 20s ease-in-out infinite alternate',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <style>{`
        @keyframes ambient-drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(8px, -12px) scale(1.03); }
          100% { transform: translate(-6px, 8px) scale(0.98); }
        }
        @keyframes breathe-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>

      {groups.map((group, groupIdx) => (
        <div key={group.label} style={{ position: 'relative', zIndex: 1 }}>
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1 + groupIdx * 0.15,
              ease: [...ENTER_EASE],
            }}
            style={{
              padding: groupIdx === 0 ? '0 8px 8px' : '32px 8px 8px',
              display: 'flex',
              alignItems: 'baseline',
              gap: '10px',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                opacity: 0.65,
                lineHeight: 1,
              }}
            >
              {group.label}
            </h2>
            <span
              style={{
                flex: 1,
                height: '1px',
                background: 'linear-gradient(90deg, var(--text-primary) 0%, transparent 100%)',
                opacity: 0.10,
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '11px',
                color: 'var(--text-secondary)',
                opacity: 0.75,
                whiteSpace: 'nowrap',
              }}
            >
              {group.subtitle}
            </span>
          </motion.div>

          {/* Category tiles in this group */}
          <div className="flex flex-col" style={{ gap: '7px' }}>
            {group.categories.map((category) => {
              const currentIndex = globalIndex++;
              const isExpanded = expandedId === category.id;
              const isDimmed = expandedId !== null && !isExpanded;
              const color = CIRCADIAN_COLORS[category.id] || '#A2B5A9';
              const fillDefault = CIRCADIAN_FILLS[category.id] || 'rgba(162, 181, 169, 0.28)';
              const fillHover = CIRCADIAN_FILLS_HOVER[category.id] || 'rgba(162, 181, 169, 0.42)';
              const catCards = categoryCards.get(category.id) || [];
              const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
              const allCompleted = completedCount === catCards.length && catCards.length > 0;
              const hasInProgress = catCards.some(c =>
                inProgressCardIds.includes(c.id) && !completedCardIds.includes(c.id)
              );
              const isNextSuggested = category.id === nextSuggestedId && hasEntered;

              const borderDefault = `1px solid ${color}73`;
              const borderGlow = `1px solid ${color}`;

              // Breathing glow for suggested next category
              const breatheBoxShadow = isNextSuggested
                ? `0 0 16px -2px ${color}35, 0 0 32px -6px ${color}20`
                : 'none';

              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{
                    opacity: isDimmed ? 0.20 : 1,
                    y: 0,
                  }}
                  transition={{
                    opacity: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                    y: { duration: 0.65, delay: 0.12 + currentIndex * 0.06, ease: [...ENTER_EASE] },
                  }}
                  style={{ position: 'relative' }}
                >
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
                      border: isNextSuggested ? borderGlow : borderDefault,
                      cursor: 'pointer',
                      borderRadius: '14px',
                      transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: breatheBoxShadow,
                      // no pulsating animation
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = fillHover;
                      el.style.border = borderGlow;
                      el.style.boxShadow = `0 0 24px -4px ${color}50, 0 0 48px -8px ${color}30`;
                      el.style.animation = 'none';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.background = fillDefault;
                      el.style.border = isNextSuggested ? borderGlow : borderDefault;
                      el.style.boxShadow = isNextSuggested ? breatheBoxShadow : 'none';
                      // no pulsating animation
                    }}
                  >
                    {/* Thick accent bar */}
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
                        padding: '16px',
                      }}
                    >

                      {/* Title + subtitle */}
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
                              color,
                              opacity: 1,
                              lineHeight: 1.45,
                              marginTop: '2px',
                            }}
                          >
                            {category.entryLine}
                          </p>
                        )}
                      </div>

                      {/* Progress ring */}
                      <div style={{ flexShrink: 0 }}>
                        {hasInProgress && !allCompleted ? (
                          <div style={{ position: 'relative' }}>
                            <ProgressRing completed={completedCount} total={catCards.length} size={20} />
                            <span
                              style={{
                                position: 'absolute',
                                top: -2, right: -2,
                                width: '6px', height: '6px',
                                borderRadius: '50%',
                                backgroundColor: HERITAGE_GOLD,
                                // static dot, no pulse
                              }}
                            />
                          </div>
                        ) : completedCount > 0 ? (
                          <ProgressRing completed={completedCount} total={catCards.length} size={20} />
                        ) : (
                          <span
                            style={{
                              fontFamily: 'var(--font-sans)',
                              fontSize: '14px',
                              color: HERITAGE_GOLD,
                              opacity: 0.25,
                              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                              transition: 'transform 0.25s ease, opacity 0.25s ease',
                              display: 'inline-block',
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
                            padding: '8px 12px 16px 28px',
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
                                whileHover={{ backgroundColor: 'hsla(194, 16%, 52%, 0.08)' }}
                                whileTap={{ scale: 0.985 }}
                              >
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

                                <span
                                  style={{
                                    fontFamily: 'var(--font-sans)',
                                    fontSize: '14px',
                                    fontWeight: 400,
                                    color: 'var(--text-primary)',
                                    opacity: isCardCompleted ? 0.55 : 0.90,
                                    lineHeight: 1.4,
                                    textDecoration: isCardCompleted ? 'line-through' : 'none',
                                    textDecorationColor: isCardCompleted ? `${color}40` : undefined,
                                  }}
                                >
                                  {card.title}
                                </span>

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
          </div>
        </div>
      ))}

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
