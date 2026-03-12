import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import React, { useMemo, useState, useEffect, CSSProperties } from 'react';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { useScrollCompression } from '@/hooks/useScrollCompression';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import Header from '@/components/Header';
import { ChevronDown, ChevronRight, Check } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';

import ReturnOverlay from '@/components/ReturnOverlay';
import BackToLibraryButton from '@/components/BackToLibraryButton';
import stillUsIllustration from '@/assets/illustration-still-us-home.png';
import CircadianMenu from '@/components/CircadianMenu';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
// samtalsläge removed from UI — always defaults to Tillsammans
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import { useVerdigrisTheme } from '@/components/VerdigrisAtmosphere';
import {
  selectLastActivityAt,
  selectExploredCardIds,
  selectLastOpenedCardId,
  selectLastCompletedCardId,
  selectSuggestedNextCardId,
} from '@/selectors/spaceSnapshotSelectors';
import { categories as allCategories, cards as allCards } from '@/data/content';

/** Collapsed "Notiser" row — expands inline on tap */
function NotiserSection() {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-6 border-t border-divider">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Notiser</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-4">
          <NotificationSettings />
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useThemeVars();
  useVerdigrisTheme(true);
  const {
    categories,
    getCardById,
    getCategoryById,
    cards,
  } = useApp();
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);
  const devState = useDevState();
  const appModeState = useAppMode();
  const normalizedSession = useNormalizedSessionContext();
  const { mode } = appModeState;
  const isTogether = true; // samtalsläge removed from UI — always defaults to Tillsammans

  // Direct DB query for completed card IDs (bypasses snapshot)
  const { optimisticCardIds } = useOptimisticCompletions();
  const [serverCompletedCardIds, setServerCompletedCardIds] = useState<string[]>([]);
  const [inProgressCardIds, setInProgressCardIds] = useState<string[]>([]);
  useEffect(() => {
    if (!space?.id) return;
    let cancelled = false;
    // Fetch completed
    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .then(({ data }) => {
        if (!cancelled && data) {
          setServerCompletedCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
        }
      });
    // Fetch active/abandoned (in-progress)
    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .in('status', ['active', 'abandoned'])
      .then(({ data }) => {
        if (!cancelled && data) {
          setInProgressCardIds(data.map(s => s.card_id).filter(Boolean) as string[]);
        }
      });
    return () => { cancelled = true; };
  }, [space?.id]);

  // Merge server + optimistic completions
  const completedCardIds = useMemo(() => {
    if (devState === 'browse') return []; // simulate fresh user
    const merged = new Set(serverCompletedCardIds);
    optimisticCardIds.forEach(id => merged.add(id));
    return Array.from(merged);
  }, [serverCompletedCardIds, optimisticCardIds, devState]);

  const effectiveCardId = normalizedSession.cardId ?? (devState === 'pairedActive' ? 'listening-presence' : null);
  // Prefer normalizedSession (refetched deterministically) over snapshot for resume banner
  const resumeCardFromNormalized = devState === 'browse' ? null : (normalizedSession.sessionId ? normalizedSession.cardId : null);

  // Snapshot-derived values
  const snapshotLastActivityAt = selectLastActivityAt(snapshot);
  const exploredIds = selectExploredCardIds(snapshot);
  const snapshotLastOpenedCardId = selectLastOpenedCardId(snapshot);
  const snapshotLastCompletedCardId = selectLastCompletedCardId(snapshot);
  const snapshotSuggestedNextCardId = selectSuggestedNextCardId(snapshot, allCategories, allCards);

  // Return-overlay dismissal (7-day gate)
  const RETURN_OVERLAY_KEY = 'return_overlay_dismissed';
  const [returnOverlayDismissed, setReturnOverlayDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem(RETURN_OVERLAY_KEY);
      if (!stored) return false;
      const { timestamp, sessionKey } = JSON.parse(stored);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (timestamp < sevenDaysAgo) return false;
      const currentKey = normalizedSession.cardId || snapshotLastOpenedCardId || '';
      if (sessionKey && currentKey && sessionKey !== currentKey) return false;
      return true;
    } catch { return false; }
  });

  const dismissReturnOverlay = () => {
    const currentKey = normalizedSession.cardId || snapshotLastOpenedCardId || '';
    localStorage.setItem(RETURN_OVERLAY_KEY, JSON.stringify({ timestamp: Date.now(), sessionKey: currentKey }));
    setReturnOverlayDismissed(true);
  };

  const lastActivityElapsed = useMemo(() => {
    if (!snapshotLastActivityAt) return 0;
    return Date.now() - snapshotLastActivityAt.getTime();
  }, [snapshotLastActivityAt]);

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const showReturnOverlay = useMemo(() => {
    if (devState === 'browse') return false;
    if (returnOverlayDismissed) return false;
    if (lastActivityElapsed < SEVEN_DAYS_MS) return false;
    return !!(mode === 'active' || snapshotLastCompletedCardId || snapshotLastOpenedCardId);
  }, [devState, returnOverlayDismissed, lastActivityElapsed, mode, snapshotLastCompletedCardId, snapshotLastOpenedCardId]);

  const returnResumeCardId = normalizedSession.cardId || snapshotLastOpenedCardId || snapshotLastCompletedCardId || null;

  // Track navigation to skip highlighting on repeat visits
  const [hasNavigatedThisVisit] = useState(() => sessionStorage.getItem('home_navigated') === '1');
  const markNavigated = () => sessionStorage.setItem('home_navigated', '1');

  // Sorted categories by recommended order
  const sortedCategories = useMemo(() => {
    const orderMap = new Map<string, number>(RECOMMENDED_CATEGORY_ORDER.map((id, i) => [id, i]));
    return [...categories].sort((a, b) => {
      const ai = orderMap.get(a.id) ?? 999;
      const bi = orderMap.get(b.id) ?? 999;
      return ai - bi;
    });
  }, [categories]);

  // Dynamic recommendation logic
  const resumeBannerCardId = devState === 'browse' ? null : (snapshot?.sessions?.session?.card_id ?? null);
  const resumeBannerCategoryId = useMemo(() => {
    if (!resumeBannerCardId) return null;
    const c = cards.find(c => c.id === resumeBannerCardId);
    return c?.categoryId ?? null;
  }, [resumeBannerCardId, cards]);

  const recommendedCategory = useMemo(() => {
    if (!completedCardIds) return null;
    for (const category of sortedCategories) {
      const catCards = cards.filter(c => c.categoryId === category.id);
      if (catCards.length === 0) continue;
      const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
      if (completedCount < catCards.length) {
        return category;
      }
    }
    return null;
  }, [sortedCategories, cards, completedCardIds]);

  const { scrollRef, progress: scrollP } = useScrollCompression(80);

  // Derived compression styles
  const headerCompress: CSSProperties = {
    transition: 'transform 180ms ease-out, opacity 180ms ease-out',
    transform: `scale(${1 - scrollP * 0.03})`,
    opacity: 1 - scrollP * 0.15,
  };

  const slabCompress: CSSProperties = {
    transition: 'transform 200ms ease-out, opacity 200ms ease-out, box-shadow 200ms ease-out',
    transform: `translateY(${-scrollP * 12}px) scale(${1 - scrollP * 0.03})`,
    opacity: 1 - scrollP * 0.08,
  };

  return (
    <div ref={scrollRef} className="min-h-screen flex flex-col overflow-y-auto relative" style={{ height: '100vh', backgroundColor: 'var(--surface-base)' }}>
      {/* Background illustration — Still Us identity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          position: 'absolute',
          top: '7%',
          left: '-42%',
          width: '135%',
          height: '125%',
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
            objectFit: 'contain',
            objectPosition: 'left top',
            opacity: 0.35,
          }}
        />
      </motion.div>
      {/* 7+ day return overlay */}
      <AnimatePresence>
        {showReturnOverlay && (
          <ReturnOverlay
            onResume={() => {
              dismissReturnOverlay();
              if (returnResumeCardId) { markNavigated(); navigate(`/card/${returnResumeCardId}`); }
            }}
            onStartNew={() => { dismissReturnOverlay(); }}
            onBrowse={() => { dismissReturnOverlay(); }}
          />
        )}
      </AnimatePresence>

      <div className="flex-1" style={{ position: 'relative', zIndex: 1 }}>
        <div style={headerCompress}>
          <Header showSharedLink showSettings minimal />
        </div>

        {/* Loading skeleton */}
        {mode === 'loading' && (
          <div className="px-6 pt-8 pb-16">
            <div className="h-14 rounded-card bg-muted/20 animate-pulse" />
          </div>
        )}

        {mode !== 'loading' && (
          <>
            {/* ZONE A — Identity — compressed closer to header */}
            <motion.div
              className="pt-6 px-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="type-h1" style={{ color: 'var(--text-primary)', marginBottom: '20px' }}>
                Ert utrymme
              </h1>
            </motion.div>

            {/* Resume banner — active session */}
            {(() => {
              // Prefer normalizedSession (always fresh) over snapshot for resume banner
              if (devState === 'browse') return null; // simulate fresh user
              const cardId = resumeCardFromNormalized
                ?? snapshot?.sessions?.session?.card_id
                ?? null;
              if (!cardId) return null;
              const card = getCardById(cardId);
              const catId = normalizedSession.categoryId ?? snapshot?.sessions?.session?.category_id ?? null;
              const cat = catId ? getCategoryById(catId) : null;

              return (
                <motion.div
                  className="px-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ marginBottom: '16px' }}
                >
                  <div
                    onClick={() => { markNavigated(); navigate(`/card/${cardId}`, { state: { resumed: true } }); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/card/${cardId}`, { state: { resumed: true } }); }
                    }}
                    className="cursor-pointer tile-door row-bloom"
                    style={{
                      borderRadius: '14px',
                      padding: '20px 20px',
                      background: 'rgba(58, 88, 97, 0.35)',
                      backdropFilter: 'blur(14px)',
                      WebkitBackdropFilter: 'blur(14px)',
                      border: '1px solid rgba(218, 157, 29, 0.20)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      boxShadow: '0 4px 20px -4px hsla(194, 30%, 12%, 0.15), 0 8px 32px -8px hsla(194, 25%, 10%, 0.10)',
                      position: 'relative' as const,
                      overflow: 'hidden',
                    }}
                  >
                    <div className="flex-1 min-w-0" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <p className="font-sans" style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'hsl(36, 16%, 92%)', opacity: 0.60, marginBottom: '4px', lineHeight: 1 }}>
                        Ni var mitt i
                      </p>
                      <p className="font-serif" style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.35, color: 'hsl(36, 16%, 92%)', textWrap: 'balance', hyphens: 'auto' } as React.CSSProperties}>
                        {card?.title || cardId}
                      </p>
                      {cat && (
                        <p className="font-sans" style={{ fontSize: '12px', color: 'var(--accent-saffron)', opacity: 0.7, marginTop: '4px' }}>
                          {cat.title}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })()}

            {/* Welcome / returning card — state A or B */}
            {(() => {
              const hasResumeCard = devState === 'browse' ? false : !!(resumeCardFromNormalized ?? snapshot?.sessions?.session?.card_id);
              if (hasResumeCard) return null; // STATE C — resume card handles it
              const hasCompletedSessions = completedCardIds.length > 0;

              if (!hasCompletedSessions) {
                // STATE A — first time
                return (
                  <motion.div
                    className="px-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ marginBottom: '24px' }}
                  >
                    <div style={{
                      background: 'var(--cta-active)',
                      borderRadius: '12px',
                      padding: '24px',
                      width: '100%',
                      boxShadow: '0 2px 16px -4px hsla(158, 30%, 12%, 0.15), 0 1px 3px hsla(158, 25%, 10%, 0.08)',
                    }}>
                      <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '13.5px',
                        fontWeight: 400,
                        color: 'var(--accent-saffron)',
                        opacity: 0.75,
                        lineHeight: 1.55,
                        textWrap: 'balance',
                      } as React.CSSProperties}>
                        Det här är er plats att utforska tillsammans.
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '18px',
                        fontWeight: 600,
                        color: 'hsl(36, 16%, 92%)',
                        lineHeight: 1.35,
                        textWrap: 'balance',
                        marginTop: '14px',
                      } as React.CSSProperties}>
                        Välj ett ämne och börja samtalet.
                      </p>
                    </div>
                  </motion.div>
                );
              }

              // STATE B — returning, no active session
              return (
                <motion.div
                  className="px-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  style={{ marginBottom: '24px' }}
                >
                  <div style={{
                    background: 'var(--cta-active)',
                    borderRadius: '12px',
                    padding: '24px',
                    width: '100%',
                    boxShadow: '0 2px 16px -4px hsla(30, 20%, 12%, 0.12), 0 1px 3px hsla(30, 15%, 10%, 0.08)',
                  }}>
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: 'var(--accent-saffron)',
                      opacity: 0.70,
                      lineHeight: 1.55,
                    }}>
                      Vad kul att ni är tillbaka.
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: 'hsl(36, 16%, 92%)',
                      lineHeight: 1.35,
                      marginTop: '12px',
                    }}>
                      Vad vill ni utforska idag?
                    </p>
                  </div>
                </motion.div>
              );
            })()}

            {/* ── Circadian Menu — 9 progressive disclosure categories ── */}
            <div className="px-6" style={{ marginTop: '20px', paddingBottom: '64px' }}>
              <CircadianMenu
                categories={sortedCategories}
                cards={cards}
                completedCardIds={completedCardIds}
                inProgressCardIds={inProgressCardIds}
                onNavigateToCategory={(catId) => { markNavigated(); navigate(`/category/${catId}`); }}
                onNavigateToCard={(cardId) => { markNavigated(); navigate(`/card/${cardId}`); }}
              />

              {/* Footer sentiment */}
              {(() => {
                const totalCategories = sortedCategories.length;
                const fullyCompletedCount = sortedCategories.filter(cat => {
                  const catCards = cards.filter(c => c.categoryId === cat.id);
                  return catCards.length > 0 && catCards.every(c => completedCardIds.includes(c.id));
                }).length;
                if (fullyCompletedCount === 0) return (
                  <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '14px',
                      color: 'var(--accent-text)',
                      opacity: 0.30,
                    }}>
                      Samtalet börjar här.
                    </p>
                  </div>
                );
                const isAllDone = fullyCompletedCount >= totalCategories;
                return (
                  <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <p style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'var(--color-text-tertiary)',
                      opacity: isAllDone ? 0.55 : 0.45,
                      letterSpacing: '0.03em',
                    }}>
                      {isAllDone
                        ? 'Ni har utforskat allt. Fortsätt prata.'
                        : `Ni har utforskat ${fullyCompletedCount} av ${totalCategories} områden.`}
                    </p>
                    <p style={{
                      fontFamily: 'var(--font-serif)',
                      fontStyle: 'italic',
                      fontSize: '14px',
                      color: 'var(--accent-text)',
                      opacity: 0.35,
                      marginTop: '16px',
                    }}>
                      Samtalet börjar här.
                    </p>
                  </div>
                );
              })()}
            </div>
          </>
        )}
      </div>
      
    </div>
  );
}
