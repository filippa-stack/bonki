import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMemo, useState, useEffect } from 'react';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { ArrowLeft, Check, ChevronDown } from 'lucide-react';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import { useVerdigrisTheme } from '@/components/VerdigrisAtmosphere';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import { categories as allCategories, cards as allCards } from '@/data/content';
import stillUsIllustration from '@/assets/illustration-still-us-home.png';

/* ── Color tokens ── */
const MIDNIGHT_INK = '#1A1A2E';
const EMBER_NIGHT = '#2E2233';
const LANTERN_GLOW = '#FDF6E3';
const DRIFTWOOD = '#6B5E52';
const DEEP_SAFFRON = '#D4A03A';
const EMBER_MID = '#473454';

const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Layer definitions ── */
const LAYERS: {
  label: string;
  categoryIds: string[];
  tileBg: string;
  tileText: string;
  progressText: string;
  isGold: boolean;
  hasBorder?: boolean;
}[] = [
  {
    label: 'GRUNDEN',
    categoryIds: ['emotional-intimacy', 'communication', 'category-8'],
    tileBg: DEEP_SAFFRON,
    tileText: MIDNIGHT_INK,
    progressText: MIDNIGHT_INK,
    isGold: true,
  },
  {
    label: 'DET SOM FORMAR ER',
    categoryIds: ['individual-needs', 'parenting-together', 'category-9'],
    tileBg: EMBER_MID,
    tileText: LANTERN_GLOW,
    progressText: LANTERN_GLOW,
    isGold: false,
  },
  {
    label: 'DJUPET',
    categoryIds: ['category-6', 'daily-life', 'category-10'],
    tileBg: EMBER_NIGHT,
    tileText: LANTERN_GLOW,
    progressText: LANTERN_GLOW,
    isGold: false,
    hasBorder: true,
  },
];

/** Expandable layer accordion */
function AccordionLayer({
  label, completedCount, totalCount, allDone, defaultOpen, delay, children,
}: {
  label: string;
  completedCount: number;
  totalCount: number;
  allDone: boolean;
  defaultOpen: boolean;
  delay: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: EASE }}
      style={{ marginTop: '24px', paddingLeft: '16px', paddingRight: '16px' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px 10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: DRIFTWOOD,
          }}>
            {label}
          </span>
          {allDone && (
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              backgroundColor: DEEP_SAFFRON,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Check size={10} color={MIDNIGHT_INK} strokeWidth={3} />
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!allDone && (
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: DRIFTWOOD,
              opacity: 0.7,
            }}>
              {completedCount} av {totalCount}
            </span>
          )}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown size={16} color={DRIFTWOOD} />
          </motion.div>
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: open ? 'auto' : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: 'hidden' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '4px' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  useThemeVars();
  useVerdigrisTheme(true);
  const { categories, getCardById, cards } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);
  const devState = useDevState();
  const appModeState = useAppMode();
  const normalizedSession = useNormalizedSessionContext();
  const { mode } = appModeState;

  const { optimisticCardIds } = useOptimisticCompletions();
  const [serverCompletedCardIds, setServerCompletedCardIds] = useState<string[]>([]);

  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;
    supabase
      .from('couple_sessions')
      .select('card_id, ended_at')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .eq('product_id', 'still_us')
      .order('ended_at', { ascending: false })
      .then(({ data }) => {
        if (!cancelled && data) {
          setServerCompletedCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
        }
      });
    return () => { cancelled = true; };
  }, [space?.id]);

  const completedCardIds = useMemo(() => {
    if (devState === 'browse') return [];
    const merged = new Set(serverCompletedCardIds);
    optimisticCardIds.forEach(id => merged.add(id));
    return Array.from(merged);
  }, [serverCompletedCardIds, optimisticCardIds, devState]);

  const sortedCategories = useMemo(() => {
    const orderMap = new Map<string, number>(RECOMMENDED_CATEGORY_ORDER.map((id, i) => [id, i]));
    return [...categories].sort((a, b) => {
      const ai = orderMap.get(a.id) ?? 999;
      const bi = orderMap.get(b.id) ?? 999;
      return ai - bi;
    });
  }, [categories]);

  const orderedCards = useMemo(() => {
    const result: typeof allCards = [];
    for (const cat of sortedCategories) {
      const catCards = allCards.filter(c => c.categoryId === cat.id);
      result.push(...catCards);
    }
    return result;
  }, [sortedCategories]);

  // Resume
  const hasResumeSession = devState !== 'browse' && !!normalizedSession.sessionId && !!normalizedSession.cardId;
  const resumeCard = hasResumeSession ? getCardById(normalizedSession.cardId!) : null;
  const isStillUsResume = resumeCard ? allCategories.some(c => c.id === resumeCard.categoryId) : false;

  // Next conversation
  const nextCard = useMemo(() => {
    return orderedCards.find(c => !completedCardIds.includes(c.id)) ?? null;
  }, [orderedCards, completedCardIds]);

  const nextCardCategory = useMemo(() => {
    if (!nextCard) return null;
    return allCategories.find(c => c.id === nextCard.categoryId) ?? null;
  }, [nextCard]);

  // Per-category progress
  const categoryProgress = useMemo(() => {
    const map: Record<string, { completed: number; total: number }> = {};
    for (const cat of allCategories) {
      const catCards = allCards.filter(c => c.categoryId === cat.id);
      const completed = catCards.filter(c => completedCardIds.includes(c.id)).length;
      map[cat.id] = { completed, total: catCards.length };
    }
    return map;
  }, [completedCardIds]);

  // Recommended next category
  const nextCategoryId = nextCard ? nextCard.categoryId : null;

  // Is category fully completed?
  const isCategoryCompleted = (catId: string) => {
    const p = categoryProgress[catId];
    return p && p.total > 0 && p.completed >= p.total;
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: MIDNIGHT_INK }}>

      {/* ── 1. ILLUSTRATION ZONE ── */}
      <div style={{ position: 'relative', minHeight: '30vh', overflow: 'hidden' }}>
        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        >
          <img
            src={stillUsIllustration}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 30%',
              opacity: 0.35,
            }}
          />
          {/* Bottom fade into Ember Night */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70%',
            background: `linear-gradient(to top, ${EMBER_NIGHT} 0%, ${EMBER_NIGHT}E6 25%, ${EMBER_NIGHT}80 50%, transparent 100%)`,
            pointerEvents: 'none',
          }} />
        </motion.div>

        {/* Warm glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80vw',
            height: '60%',
            background: `radial-gradient(ellipse 50% 50% at 50% 50%, ${DEEP_SAFFRON}14 0%, transparent 100%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Back arrow */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <ArrowLeft size={22} color={LANTERN_GLOW} strokeWidth={1.5} />
        </motion.button>

        {/* Title & subtitle — inside the illustration zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, ease: EASE }}
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            paddingTop: 'clamp(60px, 15vh, 120px)',
            paddingBottom: '24px',
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'opsz' 28",
              fontSize: '28px',
              fontWeight: 600,
              color: LANTERN_GLOW,
              lineHeight: 1.2,
              textShadow: `0 2px 20px ${EMBER_NIGHT}, 0 0 40px ${EMBER_NIGHT}`,
            }}
          >
            Ert utrymme
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: DRIFTWOOD,
            lineHeight: 1.5,
            marginTop: '6px',
            textShadow: `0 1px 12px ${EMBER_NIGHT}`,
          }}>
            Följ ordningen — eller börja där det känns rätt.
          </p>
        </motion.div>
      </div>

      {/* ── 3. BACKGROUND TRANSITION — Midnight Ink → Ember Night ── */}
      {/* The illustration zone already fades into Ember Night at the bottom */}

      {/* ── Content area — Ember Night territory ── */}
      <div style={{ position: 'relative', zIndex: 1, backgroundColor: EMBER_NIGHT, flex: 1 }}>

        {mode === 'loading' && (
          <div className="px-4 pt-4">
            <div style={{ height: '80px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)' }} className="animate-pulse" />
          </div>
        )}

        {mode !== 'loading' && (
          <div style={{ paddingBottom: '120px' }}>

            {/* ── 2. RESUME / NEXT CARD ── */}
            <div className="px-4" style={{ marginTop: '-8px' }}>
              {isStillUsResume ? (
                <UnifiedResumeBanner
                  accentColor={DEEP_SAFFRON}
                  isStillUs
                  getCardById={getCardById}
                />
              ) : nextCard ? (
                <motion.button
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
                  whileTap={{ scale: 0.96, y: 2 }}
                  onClick={() => navigate(`/card/${nextCard.id}`)}
                  style={{
                    width: '100%',
                    padding: '16px 18px',
                    background: `linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(0,0,0,0.06) 100%), ${EMBER_MID}`,
                    borderRadius: '16px',
                    border: '1.5px solid rgba(255, 255, 255, 0.15)',
                    borderLeft: `3px solid ${DEEP_SAFFRON}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25), inset 0 1px 3px rgba(255,255,255,0.15)',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: DRIFTWOOD,
                  }}>
                    Ert nästa samtal
                  </span>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'opsz' 20",
                    fontSize: '20px',
                    fontWeight: 500,
                    color: LANTERN_GLOW,
                    lineHeight: 1.3,
                  }}>
                    {nextCard.title}
                  </span>
                  {nextCardCategory && (
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: DRIFTWOOD,
                      marginTop: '2px',
                    }}>
                      {nextCardCategory.title}
                    </span>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  style={{
                    padding: '20px',
                    background: EMBER_MID,
                    borderRadius: '16px',
                    textAlign: 'center',
                  }}
                >
                  <p style={{
                    fontFamily: "var(--font-display)",
                    fontSize: '18px',
                    color: LANTERN_GLOW,
                    marginBottom: '4px',
                  }}>
                    Ni har utforskat alla samtal
                  </p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: DRIFTWOOD }}>
                    Fortsätt prata — eller börja om.
                  </p>
                </motion.div>
              )}
            </div>

            {/* ── 4. ACCORDION LAYERS ── */}
            {LAYERS.map((layer, layerIndex) => {
              const layerCats = layer.categoryIds
                .map(id => allCategories.find(c => c.id === id))
                .filter(Boolean) as typeof allCategories;

              // Summary stats for collapsed state
              const layerCompleted = layerCats.filter(c => isCategoryCompleted(c.id)).length;
              const layerTotal = layerCats.length;
              const allLayerDone = layerCompleted === layerTotal;
              // Auto-expand the layer that contains the next recommended category
              const containsNext = layerCats.some(c => c.id === nextCategoryId);

              return (
                <AccordionLayer
                  key={layer.label}
                  label={layer.label}
                  completedCount={layerCompleted}
                  totalCount={layerTotal}
                  allDone={allLayerDone}
                  defaultOpen={containsNext}
                  delay={0.3 + layerIndex * 0.1}
                >
                  {layerCats.map((cat) => {
                    const progress = categoryProgress[cat.id];
                    const isRecommended = cat.id === nextCategoryId;
                    const completed = isCategoryCompleted(cat.id);

                    return (
                      <motion.button
                        key={cat.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/category/${cat.id}`)}
                        style={{
                          width: '100%',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          backgroundColor: completed ? `${EMBER_MID}80` : EMBER_MID,
                          border: isRecommended
                            ? `1.5px solid ${DEEP_SAFFRON}50`
                            : '1px solid rgba(255,255,255,0.08)',
                          borderLeft: isRecommended ? `3px solid ${DEEP_SAFFRON}` : undefined,
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                      >
                        {/* Completed badge or position indicator */}
                        {completed ? (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: DEEP_SAFFRON,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Check size={14} color={MIDNIGHT_INK} strokeWidth={3} />
                          </div>
                        ) : (
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: `1.5px solid ${isRecommended ? DEEP_SAFFRON : DRIFTWOOD}40`,
                            flexShrink: 0,
                          }} />
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            fontFamily: "var(--font-display)",
                            fontVariationSettings: "'opsz' 16",
                            fontSize: '16px',
                            fontWeight: 500,
                            color: completed ? `${LANTERN_GLOW}90` : LANTERN_GLOW,
                            lineHeight: 1.3,
                            display: 'block',
                          }}>
                            {cat.title}
                          </span>
                          {progress && progress.total > 0 && (
                            <span style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '12px',
                              color: DRIFTWOOD,
                              marginTop: '2px',
                              display: 'block',
                            }}>
                              {progress.completed} av {progress.total} samtal
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </AccordionLayer>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
