import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Category, Card } from '@/types';
import { Check } from 'lucide-react';

/**
 * Circadian color mapping — solid tile backgrounds for dark tactile tiles.
 * Each color is a rich, matte tone that feels "leather-bound premium".
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

/** Lighter variants for text on dark backgrounds — higher contrast */
export const CIRCADIAN_COLORS_LIGHT: Record<string, string> = {
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

/** Luminous glassmorphic fill for tiles — high opacity to glow against dark bg */
export const CIRCADIAN_FILLS: Record<string, string> = {
  'emotional-intimacy': 'rgba(162, 181, 169, 0.82)',
  'communication':      'rgba(107, 142, 125, 0.80)',
  'category-8':         'rgba(194, 138, 120, 0.80)',
  'individual-needs':   'rgba(197, 163, 125, 0.80)',
  'parenting-together': 'rgba(111, 129, 145, 0.80)',
  'category-9':         'rgba(74, 93, 78, 0.82)',
  'category-6':         'rgba(142, 124, 143, 0.80)',
  'daily-life':         'rgba(60, 84, 89, 0.82)',
  'category-10':        'rgba(49, 54, 88, 0.82)',
};

export const CIRCADIAN_FILLS_HOVER: Record<string, string> = {
  'emotional-intimacy': 'rgba(162, 181, 169, 0.92)',
  'communication':      'rgba(107, 142, 125, 0.90)',
  'category-8':         'rgba(194, 138, 120, 0.90)',
  'individual-needs':   'rgba(197, 163, 125, 0.90)',
  'parenting-together': 'rgba(111, 129, 145, 0.90)',
  'category-9':         'rgba(74, 93, 78, 0.92)',
  'category-6':         'rgba(142, 124, 143, 0.90)',
  'daily-life':         'rgba(60, 84, 89, 0.92)',
  'category-10':        'rgba(49, 54, 88, 0.92)',
};

const HERITAGE_GOLD = '#DA9D1D';
const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Section groupings with editorial headers
 */
const SECTION_GROUPS = [
  {
    label: 'Grunden',
    ids: ['emotional-intimacy', 'communication', 'category-8'],
  },
  {
    label: 'Det som formar er',
    ids: ['individual-needs', 'parenting-together', 'category-9'],
  },
  {
    label: 'Djupet',
    ids: ['category-6', 'daily-life', 'category-10'],
  },
];

/** Gold progress ring SVG */
function ProgressRing({ completed, total, size = 22 }: { completed: number; total: number; size?: number }) {
  const radius = (size - 3) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? completed / total : 0;
  const strokeDashoffset = circumference * (1 - progress);
  const allDone = completed === total && total > 0;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={HERITAGE_GOLD}
          strokeWidth={2}
          opacity={0.15}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={HERITAGE_GOLD}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [...ENTER_EASE], delay: 0.3 }}
          opacity={0.6}
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
          <Check size={10} style={{ color: HERITAGE_GOLD }} />
        </motion.div>
      )}
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const EASE_ARRAY = [0.22, 1, 0.36, 1] as const;

const tileVariants = {
  hidden: { opacity: 0, y: 22, scale: 0.94 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.55, ease: EASE_ARRAY },
  },
};

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
  onNavigateToCategory,
}: CircadianMenuProps) {
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHasEntered(true), 800);
    return () => clearTimeout(timer);
  }, []);

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col"
      style={{ gap: '8px', position: 'relative' }}
    >
      {groups.map((group, groupIdx) => {
        return (
          <div key={group.label}>
            {/* Section header */}
            <motion.div
              variants={tileVariants}
              style={{
                padding: groupIdx === 0 ? '0 4px 10px' : '24px 4px 10px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: HERITAGE_GOLD,
                  opacity: 0.35,
                  lineHeight: 1,
                }}
              >
                {group.label}
              </h2>
            </motion.div>

            {/* 3-column tile grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '5px',
              }}
            >
              {group.categories.map((category) => {
                const currentIndex = globalIndex++;
                const sequenceNumber = currentIndex + 1;
                const tileFill = CIRCADIAN_FILLS[category.id] || 'rgba(162, 181, 169, 0.62)';
                const tileText = CIRCADIAN_COLORS_LIGHT[category.id] || '#D0DDD5';
                const tileColor = CIRCADIAN_COLORS[category.id] || '#A2B5A9';
                const catCards = categoryCards.get(category.id) || [];
                const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
                const allCompleted = completedCount === catCards.length && catCards.length > 0;
                const isNextSuggested = category.id === nextSuggestedId && hasEntered;

                return (
                  <motion.button
                    key={category.id}
                    variants={tileVariants}
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.93, y: 3 }}
                    onClick={() => onNavigateToCategory(category.id)}
                    style={{
                      position: 'relative',
                      background: tileFill,
                      backdropFilter: 'blur(24px) saturate(1.3)',
                      WebkitBackdropFilter: 'blur(24px) saturate(1.3)',
                      borderRadius: '22px',
                      padding: '18px 10px 16px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      aspectRatio: '1 / 1',
                      border: isNextSuggested
                        ? `2px solid ${HERITAGE_GOLD}88`
                        : `1px solid rgba(255, 255, 255, 0.15)`,
                      boxShadow: [
                        isNextSuggested ? `0 0 20px 0px ${HERITAGE_GOLD}40, 0 0 40px -4px ${HERITAGE_GOLD}25` : '',
                        '0 10px 28px rgba(0, 0, 0, 0.25)',
                        '0 4px 10px rgba(0, 0, 0, 0.15)',
                        '0 1px 3px rgba(0, 0, 0, 0.1)',
                        'inset 0 1.5px 0 rgba(255, 255, 255, 0.25)',
                        `inset 0 -3px 8px ${tileColor}25`,
                      ].filter(Boolean).join(', '),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      lineHeight: 1.15,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Sequence number — subtle gold top-left */}
                    <span
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '10px',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '10px',
                        fontWeight: 500,
                        color: HERITAGE_GOLD,
                        opacity: 0.3,
                        lineHeight: 1,
                      }}
                    >
                      {sequenceNumber}
                    </span>

                    {/* Title */}
                    <span
                      style={{
                        fontFamily: "'DM Serif Display', var(--font-serif)",
                        fontSize: 'clamp(15px, 4.2vw, 18px)',
                        fontWeight: 400,
                        color: tileText,
                        padding: '0 2px',
                        lineHeight: 1.2,
                      }}
                    >
                      {category.title}
                    </span>

                    {/* Progress ring — bottom center */}
                    {completedCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <ProgressRing
                          completed={completedCount}
                          total={catCards.length}
                          size={allCompleted ? 20 : 18}
                        />
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}
