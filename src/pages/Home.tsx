import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import React, { useMemo, useState, useEffect } from 'react';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import Header from '@/components/Header';
import { Check, ChevronRight } from 'lucide-react';
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
const LANTERN_GLOW = '#FDF6E3';
const DRIFTWOOD = '#6B5E52';
const DEEP_DUSK = '#2A2D3A';
const DEEP_SAFFRON = '#D4A03A';
const EMBER_MID = '#473454';

export default function Home() {
  const { t } = useTranslation();
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
  const [lastCompletedSession, setLastCompletedSession] = useState<{ card_id: string; ended_at: string } | null>(null);

  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;
    // Fetch completed
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
          if (data.length > 0 && data[0].card_id) {
            setLastCompletedSession({ card_id: data[0].card_id, ended_at: data[0].ended_at ?? '' });
          }
        }
      });
    return () => { cancelled = true; };
  }, [space?.id]);

  // Merge server + optimistic completions
  const completedCardIds = useMemo(() => {
    if (devState === 'browse') return [];
    const merged = new Set(serverCompletedCardIds);
    optimisticCardIds.forEach(id => merged.add(id));
    return Array.from(merged);
  }, [serverCompletedCardIds, optimisticCardIds, devState]);

  // Sorted categories by recommended order
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
      const catCards = allCards.filter(c => c.categoryId === cat.id);
      result.push(...catCards);
    }
    return result;
  }, [sortedCategories]);

  // Resume: delegate to UnifiedResumeBanner (reads from NormalizedSessionContext)
  const hasResumeSession = devState !== 'browse' && !!normalizedSession.sessionId && !!normalizedSession.cardId;
  const resumeCard = hasResumeSession ? getCardById(normalizedSession.cardId!) : null;
  const isStillUsResume = resumeCard ? allCategories.some(c => c.id === resumeCard.categoryId) : false;

  // Next conversation: first uncompleted card in sequence
  const nextCard = useMemo(() => {
    return orderedCards.find(c => !completedCardIds.includes(c.id)) ?? null;
  }, [orderedCards, completedCardIds]);

  const nextCardCategory = useMemo(() => {
    if (!nextCard) return null;
    return allCategories.find(c => c.id === nextCard.categoryId) ?? null;
  }, [nextCard]);

  const allCompleted = orderedCards.length > 0 && !nextCard;

  // Last completed card info
  const lastCompletedCard = lastCompletedSession ? getCardById(lastCompletedSession.card_id) : null;
  const lastCompletedRelativeDate = useMemo(() => {
    if (!lastCompletedSession?.ended_at) return '';
    const diff = Date.now() - new Date(lastCompletedSession.ended_at).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'idag';
    if (days === 1) return 'igår';
    if (days < 7) return `${days} dagar sedan`;
    if (days < 30) return `${Math.floor(days / 7)} veckor sedan`;
    return `${Math.floor(days / 30)} månader sedan`;
  }, [lastCompletedSession]);

  return (
    <div className="min-h-screen flex flex-col relative" style={{ backgroundColor: MIDNIGHT_INK }}>
      {/* Background illustration — max 20vh */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          top: 0,
          left: '-10%',
          width: '120%',
          height: '20vh',
          zIndex: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <img
          src={stillUsIllustration}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            opacity: 0.18,
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%)',
          }}
        />
      </motion.div>

      <div className="flex-1 relative" style={{ zIndex: 1 }}>
        <Header showSharedLink showSettings minimal />

        {mode === 'loading' && (
          <div className="px-6 pt-8 pb-16">
            <div className="h-14 rounded-2xl bg-white/5 animate-pulse" />
          </div>
        )}

        {mode !== 'loading' && (
          <div className="px-4 pb-32">
            {/* ── Zone A: Identity ── */}
            <motion.div
              className="pt-8 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1
                style={{
                  fontFamily: "'DM Serif Display', var(--font-serif)",
                  fontSize: '28px',
                  fontWeight: 600,
                  color: LANTERN_GLOW,
                  marginBottom: '6px',
                  lineHeight: 1.2,
                }}
              >
                Ert utrymme
              </h1>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '14px',
                color: DRIFTWOOD,
                lineHeight: 1.5,
              }}>
                Följ ordningen — eller börja där det känns rätt.
              </p>
            </motion.div>

            {/* ── 1. Resume Card (conditional) ── */}
            {isStillUsResume && resumeCard && (
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => navigate(`/card/${resumeCard.id}`, { state: { resumed: true } })}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  padding: '18px 20px',
                  background: DEEP_DUSK,
                  borderLeft: `3px solid ${DEEP_SAFFRON}`,
                  borderTop: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  color: DRIFTWOOD,
                }}>
                  Fortsätt ert samtal
                </span>
                <span style={{
                  fontFamily: "'DM Serif Display', var(--font-serif)",
                  fontSize: '18px',
                  fontWeight: 500,
                  color: LANTERN_GLOW,
                  lineHeight: 1.3,
                }}>
                  {resumeCard.title}
                </span>
                {resumeStepLabel && (
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: DRIFTWOOD,
                  }}>
                    {resumeStepLabel}
                  </span>
                )}
              </motion.button>
            )}

            {/* ── 2. Next Conversation Card ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: isStillUsResume ? 0.35 : 0.25, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginTop: '24px' }}
            >
              {allCompleted ? (
                <div style={{
                  padding: '24px 20px',
                  background: EMBER_MID,
                  borderRadius: '16px',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: '18px',
                    color: LANTERN_GLOW,
                    marginBottom: '6px',
                  }}>
                    Ni har utforskat alla samtal
                  </p>
                  <p style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    color: DRIFTWOOD,
                  }}>
                    Fortsätt prata — eller börja om.
                  </p>
                </div>
              ) : nextCard ? (
                <button
                  onClick={() => navigate(`/card/${nextCard.id}`)}
                  style={{
                    width: '100%',
                    padding: '20px',
                    background: EMBER_MID,
                    borderLeft: `3px solid ${DEEP_SAFFRON}`,
                    borderTop: 'none',
                    borderRight: 'none',
                    borderBottom: 'none',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    color: DRIFTWOOD,
                  }}>
                    Ert nästa samtal
                  </span>
                  <span style={{
                    fontFamily: "'DM Serif Display', var(--font-serif)",
                    fontSize: '20px',
                    fontWeight: 500,
                    color: LANTERN_GLOW,
                    lineHeight: 1.3,
                  }}>
                    {nextCard.title}
                  </span>
                  {nextCard.subtitle && (
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      color: LANTERN_GLOW,
                      opacity: 0.8,
                      lineHeight: 1.4,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {nextCard.subtitle}
                    </span>
                  )}
                  {nextCardCategory && (
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: DRIFTWOOD,
                      marginTop: '2px',
                    }}>
                      Från {nextCardCategory.title}
                    </span>
                  )}
                </button>
              ) : null}
            </motion.div>

            {/* ── 3. Last Completed ── */}
            {lastCompletedCard && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{
                  marginTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  paddingLeft: '4px',
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: DEEP_SAFFRON,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Check size={12} color={MIDNIGHT_INK} strokeWidth={3} />
                </div>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: DRIFTWOOD,
                }}>
                  {lastCompletedCard.title}
                </span>
                {lastCompletedRelativeDate && (
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px',
                    color: DRIFTWOOD,
                    opacity: 0.6,
                    marginLeft: 'auto',
                  }}>
                    {lastCompletedRelativeDate}
                  </span>
                )}
              </motion.div>
            )}

            {/* ── 4. Explore Link ── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              style={{ marginTop: '32px', textAlign: 'center' }}
            >
              <button
                onClick={() => navigate('/still-us/explore')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  color: DRIFTWOOD,
                }}
              >
                Utforska alla ämnen
                <ChevronRight size={16} color={DRIFTWOOD} />
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
