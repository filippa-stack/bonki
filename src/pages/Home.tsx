import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import React, { useMemo, useState, useEffect } from 'react';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { Check, ChevronDown } from 'lucide-react';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import { useVerdigrisTheme } from '@/components/VerdigrisAtmosphere';
import UnifiedResumeBanner from '@/components/UnifiedResumeBanner';
import ProductHomeBackButton from '@/components/ProductHomeBackButton';
import { categories as allCategories, cards as allCards } from '@/data/content';
import stillUsIllustration from '@/assets/illustration-still-us-home.png';
import { STILL_US_CREATURES } from '@/lib/stillUsCreatures';

/* ── Color tokens ── */
const MIDNIGHT_INK = '#1A1A2E';
const EMBER_NIGHT = '#2E2233';
const LANTERN_GLOW = '#FDF6E3';
const DRIFTWOOD = '#6B5E52';
const DEEP_SAFFRON = '#D4A03A';
const EMBER_MID = '#473454';
const EMBER_DEEP = '#3A2844';

const EASE = [0.4, 0.0, 0.2, 1] as const;
const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.11, delayChildren: 0.35 } } };
const titleVariants = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } } };

/* ── Layer definitions — depth-graded tile colors ── */
const LAYERS: {
  label: string;
  categoryIds: string[];
  tileBg: string;
  tileText: string;
  progressColor: string;
}[] = [
  {
    label: 'Grunden',
    categoryIds: ['emotional-intimacy', 'communication', 'category-8'],
    tileBg: '#4F3660',       // Warm purple — lightest layer, toned down for cohesion
    tileText: LANTERN_GLOW,
    progressColor: DEEP_SAFFRON,
  },
  {
    label: 'Det som formar er',
    categoryIds: ['individual-needs', 'parenting-together', 'category-9'],
    tileBg: EMBER_MID,       // Mid depth
    tileText: LANTERN_GLOW,
    progressColor: DEEP_SAFFRON,
  },
  {
    label: 'Djupet',
    categoryIds: ['category-6', 'daily-life', 'category-10'],
    tileBg: EMBER_DEEP,      // Deepest
    tileText: LANTERN_GLOW,
    progressColor: DEEP_SAFFRON,
  },
];

/** Expandable layer accordion — warm editorial style */
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
      style={{ marginTop: '28px', paddingLeft: '4px', paddingRight: '4px' }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px 12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontVariationSettings: "'opsz' 14",
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.5px',
            color: allDone ? DEEP_SAFFRON : `${LANTERN_GLOW}90`,
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
              color: `${LANTERN_GLOW}50`,
            }}>
              {completedCount} av {totalCount}
            </span>
          )}
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.25 }}
          >
            <ChevronDown size={14} color={`${LANTERN_GLOW}60`} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '4px' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  useThemeVars();
  // Don't apply verdigris theme — Still Us home uses Ember Night, not teal
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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: EMBER_NIGHT }}>

      {/* ── Atmospheric radial glow behind hero ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-5vh',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '140vw',
          height: '55vh',
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${EMBER_MID}30 0%, ${DEEP_SAFFRON}10 50%, transparent 100%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Hero illustration — bleeding, dramatic ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'absolute',
          top: '-8vh',
          left: '-5vw',
          right: '-5vw',
          height: '65vh',
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
            objectPosition: '50% 25%',
          }}
        />
        {/* Extended scrim blending into Ember Night */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '85%',
          background: `linear-gradient(to top, ${EMBER_NIGHT} 0%, ${EMBER_NIGHT}F2 18%, rgba(46,34,51,0.85) 35%, rgba(71,52,84,0.4) 60%, rgba(71,52,84,0.1) 80%, transparent 100%)`,
          pointerEvents: 'none',
        }} />
      </motion.div>

      <ProductHomeBackButton color={LANTERN_GLOW} />

      {/* ── Content layer ── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 'clamp(28px, 8vh, 80px)',
        paddingLeft: '5vw',
        paddingRight: '5vw',
        paddingBottom: '120px',
      }}>

        {/* ── Title with staggered reveal ── */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ textAlign: 'center', width: '100%' }}>
          <motion.div variants={titleVariants}>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontSize: 'clamp(34px, 10vw, 50px)',
              fontWeight: 700,
              color: LANTERN_GLOW,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              textShadow: `0 2px 20px rgba(0,0,0,0.7), 0 0 60px ${EMBER_NIGHT}, 0 0 120px ${EMBER_NIGHT}`,
              fontVariationSettings: "'opsz' 36",
            }}>
              Ert utrymme
            </h1>
            <p className="font-serif" style={{
              fontSize: 'clamp(15px, 4vw, 19px)',
              fontWeight: 400,
              color: DEEP_SAFFRON,
              opacity: 0.9,
              marginTop: '6px',
              textShadow: `0 1px 16px rgba(0,0,0,0.8), 0 0 40px ${EMBER_NIGHT}`,
            }}>
              Följ ordningen — eller börja där det känns rätt.
            </p>
          </motion.div>
        </motion.div>

        {/* Spacer between title and action zone */}
        <div style={{ height: 'clamp(40px, 10vh, 80px)' }} />

        {/* ── Resume / Next card ── */}
        {mode === 'loading' ? (
          <div style={{ height: '80px', borderRadius: '22px', background: 'rgba(255,255,255,0.05)' }} className="animate-pulse" />
        ) : (
          <>
            <div style={{ paddingLeft: '3vw', paddingRight: '3vw' }}>
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
                    position: 'relative',
                    padding: '22px 22px',
                    borderRadius: '22px',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.06) 35%, transparent 55%, rgba(0,0,0,0.10) 100%), ${EMBER_MID}`,
                    border: `1.5px solid rgba(255, 255, 255, 0.38)`,
                    borderLeft: `3.5px solid ${DEEP_SAFFRON}`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '5px',
                    boxShadow: `0 6px 20px rgba(0,0,0,0.30), 0 12px 40px rgba(0,0,0,0.20), inset 0 2px 4px rgba(255,255,255,0.28), inset 0 -1px 3px rgba(0,0,0,0.20), 0 0 32px ${DEEP_SAFFRON}22, 0 2px 60px ${DEEP_SAFFRON}10`,
                  }}
                >
                  {/* Creature for the next card's category */}
                  {nextCard.categoryId && STILL_US_CREATURES[nextCard.categoryId] && (
                    <img
                      src={STILL_US_CREATURES[nextCard.categoryId].src}
                      alt=""
                      style={{
                        position: 'absolute',
                        right: STILL_US_CREATURES[nextCard.categoryId].tileRight ?? '0%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        height: STILL_US_CREATURES[nextCard.categoryId].tileHeight ?? '140%',
                        width: 'auto',
                        objectFit: 'contain',
                        objectPosition: STILL_US_CREATURES[nextCard.categoryId].objectPosition,
                        opacity: 0.15,
                        pointerEvents: 'none',
                        filter: 'saturate(0.25) brightness(1.15)',
                      }}
                    />
                  )}
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: DEEP_SAFFRON,
                    opacity: 0.85,
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
                      color: `${LANTERN_GLOW}70`,
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
                    borderRadius: '22px',
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

            {/* Breathing room between action and exploration */}
            <div style={{ height: '16px' }} />

            {/* ── Accordion layers ── */}
            {LAYERS.map((layer, layerIndex) => {
              const layerCats = layer.categoryIds
                .map(id => allCategories.find(c => c.id === id))
                .filter(Boolean) as typeof allCategories;

              const layerCompleted = layerCats.filter(c => isCategoryCompleted(c.id)).length;
              const layerTotal = layerCats.length;
              const allLayerDone = layerCompleted === layerTotal;
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
                    const bg = layer.tileBg;

                    return (
                      <motion.button
                        key={cat.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/category/${cat.id}`)}
                        style={{
                          position: 'relative',
                          width: '100%',
                          padding: '16px 18px',
                          borderRadius: '22px',
                          overflow: 'hidden',
                          background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(0,0,0,0.08) 100%), ${completed ? `${bg}90` : bg}`,
                          border: isRecommended
                            ? `1.5px solid rgba(212, 160, 58, 0.50)`
                            : '1.5px solid rgba(255, 255, 255, 0.25)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          boxShadow: isRecommended
                            ? `0 4px 16px rgba(0,0,0,0.25), 0 8px 32px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.20), inset 0 -1px 2px rgba(0,0,0,0.15), 0 0 36px ${DEEP_SAFFRON}30, 0 0 0 1px ${DEEP_SAFFRON}25, 0 4px 50px ${DEEP_SAFFRON}18`
                            : '0 4px 16px rgba(0,0,0,0.25), 0 8px 32px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.20), inset 0 -1px 2px rgba(0,0,0,0.15)',
                        }}
                      >
                        {/* Creature illustration — dimmed atmospheric texture */}
                        {STILL_US_CREATURES[cat.id] && (
                          <img
                            src={STILL_US_CREATURES[cat.id].src}
                            alt=""
                            style={{
                              position: 'absolute',
                               right: STILL_US_CREATURES[cat.id].tileRight ?? '0%',
                               top: '50%',
                               transform: 'translateY(-50%)',
                               height: STILL_US_CREATURES[cat.id].tileHeight ?? '140%',
                              width: 'auto',
                              objectFit: 'contain',
                              objectPosition: STILL_US_CREATURES[cat.id].objectPosition,
                              opacity: STILL_US_CREATURES[cat.id].tileOpacity,
                              pointerEvents: 'none',
                              filter: 'saturate(0.2) brightness(1.4)',
                            }}
                          />
                        )}

                        {/* Saffron accent bar for recommended */}
                        {isRecommended && (
                          <div style={{
                            position: 'absolute',
                            left: 0,
                            top: '15%',
                            bottom: '15%',
                            width: '3.5px',
                            borderRadius: '0 2px 2px 0',
                            backgroundColor: DEEP_SAFFRON,
                            boxShadow: `0 0 16px ${DEEP_SAFFRON}80, 0 0 4px ${DEEP_SAFFRON}`,
                          }} />
                        )}

                        {completed ? (
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            backgroundColor: DEEP_SAFFRON,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: `0 0 10px ${DEEP_SAFFRON}40`,
                          }}>
                            <Check size={14} color={MIDNIGHT_INK} strokeWidth={3} />
                          </div>
                        ) : (
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            border: `1.5px solid ${isRecommended ? `${DEEP_SAFFRON}80` : 'rgba(255,255,255,0.20)'}`,
                            flexShrink: 0,
                            background: isRecommended ? `${DEEP_SAFFRON}10` : 'transparent',
                          }} />
                        )}

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{
                            fontFamily: "var(--font-display)",
                            fontVariationSettings: "'opsz' 16",
                            fontSize: '16px',
                            fontWeight: 500,
                            color: completed ? `${LANTERN_GLOW}80` : LANTERN_GLOW,
                            lineHeight: 1.3,
                            display: 'block',
                          }}>
                            {cat.title}
                          </span>
                          {progress && progress.total > 0 && (
                            <span style={{
                              fontFamily: 'var(--font-body)',
                              fontSize: '12px',
                              color: progress.completed > 0 ? `${DEEP_SAFFRON}C0` : `${LANTERN_GLOW}40`,
                              marginTop: '3px',
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
          </>
        )}
      </div>
    </div>
  );
}
