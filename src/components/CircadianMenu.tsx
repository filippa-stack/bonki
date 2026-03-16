import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Category, Card } from '@/types';
import { Check } from 'lucide-react';

/**
 * Circadian color mapping — kept for category view compatibility.
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

/* ── Still Us Home palette ── */
const DEEP_SAFFRON = '#D4A03A';
const EMBER_MID = '#473454';
const EMBER_NIGHT = '#2E2233';
const MIDNIGHT_INK = '#1A1A2E';
const LANTERN_GLOW = '#FDF6E3';
const DRIFTWOOD = '#6B5E52';
const SAFFRON = '#E9B44C';
const BARK = '#2C2420';

const ENTER_EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Section groupings — depth progression with tile colors.
 * GRUNDEN = Saffron (warm entry), DET SOM FORMAR ER = Ember Mid, DJUPET = Ember Night
 */
/**
 * Per-tile color overrides: each tile gets its own bg + text color
 * to create the warm-to-deep amber gradient across sections.
 */
const TILE_COLORS: Record<string, { bg: string; text: string }> = {
  // GRUNDEN — bright saffron, dark text
  'emotional-intimacy': { bg: '#E8B44C', text: BARK },   // Ert minsta vi
  'communication':      { bg: '#D8A141', text: BARK },   // Vardagen mellan er
  'category-8':         { bg: '#E0B550', text: BARK },   // Hur ni bär varandra
  // DET SOM FORMAR ER — rich amber, transition point
  'individual-needs':   { bg: '#B7872D', text: BARK },           // Arvet ni delar
  'parenting-together': { bg: '#976820', text: LANTERN_GLOW },   // Det som skaver
  'category-9':         { bg: '#B28931', text: BARK },           // Vad ni står för
  // DJUPET — dark bronze-amber, light text
  'category-6':         { bg: '#845D1A', text: LANTERN_GLOW },   // Vad ni satsar på
  'daily-life':         { bg: '#7A5B1D', text: LANTERN_GLOW },   // Nära varandra
  'category-10':        { bg: '#704B14', text: LANTERN_GLOW },   // Att välja varandra
};

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

  const nextSuggestedId = useMemo(() => {
    for (const cat of categories) {
      const catCards = categoryCards.get(cat.id) || [];
      const allDone = catCards.length > 0 && catCards.every(c => completedCardIds.includes(c.id));
      if (!allDone) return cat.id;
    }
    return null;
  }, [categories, categoryCards, completedCardIds]);

  const groups = useMemo(() => {
    return SECTION_GROUPS.map(group => ({
      ...group,
      categories: group.ids
        .map(id => categories.find(c => c.id === id))
        .filter(Boolean) as Category[],
    })).filter(g => g.categories.length > 0);
  }, [categories]);

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
            {/* Section header — 12px uppercase Driftwood */}
            <motion.div
              variants={tileVariants}
              style={{
                padding: groupIdx === 0 ? '0 4px 8px' : '28px 4px 8px',
              }}
            >
              <h2
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: DRIFTWOOD,
                  opacity: 0.65,
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
                gap: '4px',
              }}
            >
              {group.categories.map((category) => {
                const catCards = categoryCards.get(category.id) || [];
                const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
                const allCompleted = completedCount === catCards.length && catCards.length > 0;
                const tileColor = TILE_COLORS[category.id] || { bg: EMBER_MID, text: LANTERN_GLOW };
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
                      backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.08) 100%)',
                      backgroundColor: tileColor.bg,
                      borderRadius: '16px',
                      padding: '14px 8px 14px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      height: '110px',
                      borderLeft: isNextSuggested
                        ? `2px solid ${DEEP_SAFFRON}`
                        : '1.5px solid rgba(255, 255, 255, 0.30)',
                      borderTop: '1.5px solid rgba(255, 255, 255, 0.30)',
                      borderRight: '1.5px solid rgba(255, 255, 255, 0.30)',
                      borderBottom: '1.5px solid rgba(255, 255, 255, 0.30)',
                      boxShadow: [
                        '0 12px 32px rgba(0, 0, 0, 0.30)',
                        '0 4px 12px rgba(0, 0, 0, 0.18)',
                        '0 1px 3px rgba(0, 0, 0, 0.08)',
                        'inset 0 3px 6px rgba(255, 255, 255, 0.45)',
                        'inset 0 -4px 10px rgba(0, 0, 0, 0.14)',
                      ].join(', '),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      lineHeight: 1.15,
                      overflow: 'hidden',
                    }}
                  >
                    {/* Title */}
                    <span
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: 'clamp(14px, 3.8vw, 17px)',
                        fontWeight: 400,
                        color: tileColor.text,
                        padding: '0 2px',
                        lineHeight: 1.2,
                      }}
                    >
                      {category.title}
                    </span>

                    {/* Completed checkmark — top right */}
                    {allCompleted && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: DEEP_SAFFRON,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={10} style={{ color: '#fff' }} />
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
