import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronDown, ChevronRight, Check, Lock } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { useDevState } from '@/contexts/DevStateContext';
import { useProductAccess } from '@/hooks/useProductAccess';
import { supabase } from '@/integrations/supabase/client';
import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';
import { categories as allCategories, cards as allCards } from '@/data/content';
import {
  EMBER_NIGHT,
  EMBER_MID,
  LANTERN_GLOW,
  DRIFTWOOD,
  DEEP_SAFFRON,
  MIDNIGHT_INK,
} from '@/lib/palette';

/** Four conceptual layers mapping category indices to labels */
const LAYERS = [
  { label: 'Vardagen', categoryIndices: [0] },
  { label: 'Tillsammans', categoryIndices: [1] },
  { label: 'Grunden', categoryIndices: [2] },
  { label: 'Riktningen', categoryIndices: [3] },
] as const;

export default function StillUsExplore() {
  const navigate = useNavigate();
  const { getCardById, cards, categories } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const devState = useDevState();
  const { optimisticCardIds } = useOptimisticCompletions();
  const { hasAccess } = useProductAccess('still_us');

  const [serverCompletedCardIds, setServerCompletedCardIds] = useState<string[]>([]);

  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;
    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .eq('product_id', 'still_us')
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

  // Sort categories by recommended order
  const sortedCategories = useMemo(() => {
    const orderMap = new Map<string, number>(RECOMMENDED_CATEGORY_ORDER.map((id, i) => [id, i]));
    return [...categories].sort((a, b) => {
      const ai = orderMap.get(a.id) ?? 999;
      const bi = orderMap.get(b.id) ?? 999;
      return ai - bi;
    });
  }, [categories]);

  // All Still Us cards in recommended order
  const orderedCards = useMemo(() => {
    const result: typeof allCards = [];
    for (const cat of sortedCategories) {
      result.push(...allCards.filter(c => c.categoryId === cat.id));
    }
    return result;
  }, [sortedCategories]);

  // Next recommended card (first uncompleted)
  const nextCardId = useMemo(() => {
    return orderedCards.find(c => !completedCardIds.includes(c.id))?.id ?? null;
  }, [orderedCards, completedCardIds]);

  // Progress
  const totalCards = orderedCards.length;
  const completedCount = orderedCards.filter(c => completedCardIds.includes(c.id)).length;

  // Section expand state — first open by default
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const toggleSection = (i: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  // Whether cards are locked (no access & not free card)
  const isLocked = !hasAccess && devState !== 'browse';

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: EMBER_NIGHT }}>
      {/* Header */}
      <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <ChevronLeft size={24} color={LANTERN_GLOW} />
        </button>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontVariationSettings: "'opsz' 24",
          fontSize: '22px',
          fontWeight: 600,
          color: LANTERN_GLOW,
        }}>
          Alla ämnen
        </h1>
      </div>

      {/* Subtitle + progress */}
      <div style={{ textAlign: 'center', padding: '12px 24px 0' }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontStyle: 'italic',
          color: DRIFTWOOD,
        }}>
          Välj det som känns rätt just nu.
        </p>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          color: DRIFTWOOD,
          marginTop: '8px',
        }}>
          {completedCount} av {totalCards} samtal utforskade
        </p>
      </div>

      {/* Expandable sections */}
      <div style={{ padding: '24px 16px 120px' }}>
        {LAYERS.map((layer, layerIdx) => {
          const isExpanded = expandedSections.has(layerIdx);
          const layerCategories = layer.categoryIndices
            .map(i => sortedCategories[i])
            .filter(Boolean);
          const layerCards = layerCategories.flatMap(cat =>
            allCards.filter(c => c.categoryId === cat.id)
          );

          return (
            <div key={layerIdx} style={{ marginBottom: '20px' }}>
              {/* Section header */}
              <button
                onClick={() => toggleSection(layerIdx)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 0',
                  width: '100%',
                }}
              >
                {isExpanded
                  ? <ChevronDown size={16} color={DRIFTWOOD} />
                  : <ChevronRight size={16} color={DRIFTWOOD} />
                }
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  color: DRIFTWOOD,
                }}>
                  {layer.label}
                </span>
              </button>

              {/* Cards */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
                      {layerCards.map(card => {
                        const isCompleted = completedCardIds.includes(card.id);
                        const isNext = card.id === nextCardId;
                        const cardLocked = isLocked && card.id !== 'smallest-we'; // free card exception

                        return (
                          <motion.button
                            key={card.id}
                            whileTap={{ scale: 0.94, y: 3 }}
                            onClick={() => navigate(`/card/${card.id}`)}
                            style={{
                              width: '100%',
                              minHeight: '100px',
                              padding: '16px',
                              backgroundImage: `linear-gradient(160deg, ${EMBER_MID} 0%, ${EMBER_MID} 100%)`,
                              border: `1.5px solid rgba(255, 255, 255, 0.30)`,
                              borderLeft: isNext ? `3px solid ${DEEP_SAFFRON}` : `1.5px solid rgba(255, 255, 255, 0.30)`,
                              borderRadius: '22px',
                              cursor: 'pointer',
                              textAlign: 'left',
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              gap: '4px',
                              boxShadow: `
                                0 12px 32px rgba(0, 0, 0, 0.30),
                                inset 0 3px 6px rgba(255, 255, 255, 0.45),
                                inset 0 -4px 10px rgba(0, 0, 0, 0.14)
                              `,
                            }}
                          >
                            {/* Status badge — top right */}
                            {isCompleted && (
                              <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: DEEP_SAFFRON,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                                <Check size={12} color={MIDNIGHT_INK} strokeWidth={3} />
                              </div>
                            )}
                            {!isCompleted && cardLocked && (
                              <div style={{
                                position: 'absolute',
                                top: '12px',
                                right: '12px',
                              }}>
                                <Lock size={16} color={DRIFTWOOD} />
                              </div>
                            )}

                            <span style={{
                              fontFamily: "var(--font-display)",
                              fontSize: '18px',
                              fontWeight: 500,
                              color: LANTERN_GLOW,
                              lineHeight: 1.3,
                              paddingRight: '28px',
                            }}>
                              {card.title}
                            </span>
                            {card.subtitle && (
                              <span style={{
                                fontFamily: 'var(--font-sans)',
                                fontSize: '13px',
                                color: DRIFTWOOD,
                                lineHeight: 1.4,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                paddingRight: '28px',
                              }}>
                                {card.subtitle}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
