import { RECOMMENDED_CATEGORY_ORDER } from '@/lib/recommendedOrder';

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState, useEffect, CSSProperties } from 'react';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { useScrollCompression } from '@/hooks/useScrollCompression';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import CategoryCard from '@/components/CategoryCard';
import Header from '@/components/Header';
import { ArrowRight, Bookmark, Share2, ChevronDown, ChevronRight, Check, Circle, Settings } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';
import RelationSettings from '@/components/RelationSettings';
import RelationshipMemory from '@/components/RelationshipMemory';

import ReturnOverlay from '@/components/ReturnOverlay';
import FocusSlab from '@/components/FocusSlab';
import ConfidenceCheckPanel from '@/components/ConfidenceCheckPanel';
import CompletionMarker from '@/components/CompletionMarker';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toastSuccessOnce, toastErrorOnce } from '@/lib/toastOnce';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
// samtalsläge removed from UI — always defaults to Tillsammans
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import {
  selectLastActivityAt,
  selectExploredCardIds,
  selectLastOpenedCardId,
  selectLastCompletedCardId,
  selectSuggestedNextCardId,
} from '@/selectors/spaceSnapshotSelectors';
import { categories as allCategories, cards as allCards } from '@/data/content';

const CATEGORY_ACCENTS: Record<number, string> = {
  0: 'hsl(158, 35%, 22%)',   // deep green
  1: 'hsl(38, 70%, 48%)',    // amber
  2: 'hsl(200, 30%, 38%)',   // slate blue
  3: 'hsl(10, 40%, 42%)',    // warm terracotta
  4: 'hsl(80, 25%, 35%)',    // olive
  5: 'hsl(28, 50%, 40%)',    // burnt sienna
  6: 'hsl(260, 20%, 40%)',   // muted plum
  7: 'hsl(45, 55%, 42%)',    // dark gold
  8: 'hsl(340, 30%, 40%)',   // dusty rose
  9: 'hsl(170, 25%, 32%)',   // teal
};

function getCategoryAccent(index: number): string {
  return CATEGORY_ACCENTS[index] ?? 'hsl(38, 70%, 48%)';
}

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
  const {
    savedConversations,
    categories,
    getCardById,
    getCategoryById,
    cards,
    getCategoryStatus,
    switchToNewSpace,
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
    const merged = new Set(serverCompletedCardIds);
    optimisticCardIds.forEach(id => merged.add(id));
    return Array.from(merged);
  }, [serverCompletedCardIds, optimisticCardIds]);

  const effectiveCardId = normalizedSession.cardId ?? (devState === 'pairedActive' ? 'listening-presence' : null);
  // Prefer normalizedSession (refetched deterministically) over snapshot for resume banner
  const resumeCardFromNormalized = normalizedSession.sessionId ? normalizedSession.cardId : null;

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
    if (returnOverlayDismissed) return false;
    if (lastActivityElapsed < SEVEN_DAYS_MS) return false;
    return !!(mode === 'active' || snapshotLastCompletedCardId || snapshotLastOpenedCardId);
  }, [returnOverlayDismissed, lastActivityElapsed, mode, snapshotLastCompletedCardId, snapshotLastOpenedCardId]);

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
  const resumeBannerCardId = snapshot?.sessions?.session?.card_id ?? null;
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
    <div ref={scrollRef} className="min-h-screen flex flex-col overflow-y-auto" style={{ height: '100vh', backgroundColor: 'hsl(36, 18%, 93%)' }}>
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

      <div className="flex-1">
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
            {/* ZONE A — Identity */}
            <motion.div
              className="pt-8 px-6 text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="type-h1" style={{ color: 'var(--text-primary)', marginBottom: '36px' }}>
                Vårt utrymme
              </h1>
            </motion.div>

            {/* Resume banner — active session */}
            {(() => {
              // Prefer normalizedSession (always fresh) over snapshot for resume banner
              const cardId = resumeCardFromNormalized
                ?? snapshot?.sessions?.session?.card_id
                ?? null;
              if (!cardId) return null;
              const card = getCardById(cardId);
              const catId = normalizedSession.categoryId ?? snapshot?.sessions?.session?.category_id ?? null;
              const cat = catId ? getCategoryById(catId) : null;

              return (
                <motion.div
                  className="px-6 mt-8"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div
                    onClick={() => { markNavigated(); navigate(`/card/${cardId}`, { state: { resumed: true } }); }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/card/${cardId}`, { state: { resumed: true } }); }
                    }}
                    className="cursor-pointer flex items-center justify-between"
                    style={{
                      borderRadius: '16px',
                      padding: '20px 24px',
                      background: 'hsl(158, 30%, 14%)',
                      border: 'none',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-semibold" style={{ fontSize: '20px', color: 'hsl(36, 16%, 92%)', textWrap: 'balance', hyphens: 'auto' }}>
                        {card?.title || cardId}
                      </p>
                      {cat && (
                        <p className="font-sans mt-1" style={{ fontSize: '13px', color: '#C4821D', opacity: 0.75 }}>
                          {cat.title}
                        </p>
                      )}
                    </div>
                    <span className="font-sans shrink-0 ml-3 flex items-center self-stretch" style={{ fontSize: '14px', fontWeight: 500, color: 'white', minWidth: '80px', justifyContent: 'flex-end' }}>
                      Fortsätt<span style={{ marginLeft: '6px' }}>→</span>
                    </span>
                  </div>
                </motion.div>
              );
            })()}

            {/* Spacing before categories */}
            <div style={{ height: '0px' }} />

            {/* Recommendation section */}
            {recommendedCategory && (() => {
              const recCat = recommendedCategory;
              return (
                <div className="px-6" style={{ marginBottom: '12px' }}>
               {(() => {
                  const recIndex = sortedCategories.findIndex(c => c.id === recCat.id);
                  const recAccent = getCategoryAccent(recIndex >= 0 ? recIndex : 0);
                  return (
                    <>
                      <p style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-sans)',
                        color: '#8B5E1A',
                        marginBottom: '14px',
                        display: 'block',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                      }}>
                        Börja här
                      </p>
                      <div
                        onClick={() => { markNavigated(); navigate(`/category/${recCat.id}`); }}
                        role="button"
                        tabIndex={0}
                        aria-label={recCat.title}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/category/${recCat.id}`); }
                        }}
                        className="cursor-pointer"
                         style={{
                          borderRadius: '0 14px 14px 0',
                          borderLeft: '2px solid hsla(158, 32%, 14%, 0.70)',
                          padding: '20px',
                          minHeight: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          background: 'hsl(36, 16%, 90%)',
                          boxShadow: '0 2px 8px hsla(0, 0%, 0%, 0.06)',
                          transition: 'transform 120ms ease-out, box-shadow 120ms ease-out, background-color 0.15s ease',
                        }}
                         onPointerDown={(e) => {
                          const chevron = e.currentTarget.querySelector('[data-chevron]') as HTMLElement;
                          if (chevron) chevron.style.color = 'var(--text-primary)';
                        }}
                        onPointerUp={(e) => {
                          const chevron = e.currentTarget.querySelector('[data-chevron]') as HTMLElement;
                          if (chevron) chevron.style.color = '';
                        }}
                        onPointerLeave={(e) => {
                          const chevron = e.currentTarget.querySelector('[data-chevron]') as HTMLElement;
                          if (chevron) chevron.style.color = '';
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="type-h3" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '16px', textWrap: 'balance', hyphens: 'auto' }}>
                            {recCat.title}
                          </h3>
                          {recCat.entryLine && (
                            <p className="font-serif" style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                              {recCat.entryLine}
                            </p>
                          )}
                        </div>
                        <ChevronRight data-chevron className="w-4 h-4 shrink-0" style={{ color: 'var(--accent-saffron)', opacity: 0.6 }} />
                      </div>
                    </>
                  );
                })()}
                </div>
              );
            })()}

            {/* Categories */}
            <div className="px-6" style={{ paddingBottom: '48px' }}>
              <div className="flex flex-col" style={{ gap: '8px' }}>
                {(recommendedCategory ? sortedCategories.filter(c => c.id !== recommendedCategory.id) : sortedCategories).map((category, index) => {
                  const globalIndex = sortedCategories.findIndex(c => c.id === category.id);
                  const accent = getCategoryAccent(globalIndex >= 0 ? globalIndex : index);
                  const catCards = cards.filter((c) => c.categoryId === category.id);
                  const completedCount = catCards.filter(c => completedCardIds.includes(c.id)).length;
                  const allCompleted = completedCount === catCards.length && catCards.length > 0;
                  const hasInProgressCards = catCards.some(c => inProgressCardIds.includes(c.id) && !completedCardIds.includes(c.id));
                   const someStarted = (completedCount > 0 || hasInProgressCards) && !allCompleted;
                  

                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.4, ease: 'easeOut' }}
                    >
                      <div
                        onClick={() => { markNavigated(); navigate(`/category/${category.id}`); }}
                        role="button"
                        tabIndex={0}
                        aria-label={category.title}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/category/${category.id}`); }
                        }}
                        className="cursor-pointer"
                         style={{
                          borderRadius: '0 14px 14px 0',
                          borderLeft: '2px solid hsla(36, 15%, 80%, 0.40)',
                          padding: '16px 18px',
                          minHeight: '72px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          background: 'hsl(36, 20%, 97%)',
                          boxShadow: 'none',
                          transition: 'transform 120ms ease-out, box-shadow 120ms ease-out, background-color 0.15s ease',
                        }}
                        onPointerDown={(e) => {
                          const chevron = e.currentTarget.querySelector('[data-chevron]') as HTMLElement;
                          if (chevron) chevron.style.color = 'var(--text-primary)';
                        }}
                        onPointerUp={(e) => {
                          const chevron = e.currentTarget.querySelector('[data-chevron]') as HTMLElement;
                          if (chevron) chevron.style.color = '';
                        }}
                        onPointerLeave={(e) => {
                          const chevron = e.currentTarget.querySelector('[data-chevron]') as HTMLElement;
                          if (chevron) chevron.style.color = '';
                        }}
                      >
                        <div className="flex items-center justify-between gap-3 w-full">
                          <div className="flex-1 min-w-0">
                            <p className="font-sans uppercase" style={{ fontSize: '10px', letterSpacing: '0.08em', color: 'var(--color-text-tertiary)', opacity: 0.40 }}>
                              {String((RECOMMENDED_CATEGORY_ORDER as readonly string[]).indexOf(category.id) + 1).padStart(2, '0')}
                            </p>
                            <h3
                              className="type-h3"
                            style={{
                              color: 'var(--text-primary)',
                                fontWeight: 500,
                                fontSize: '16px',
                                textWrap: 'balance',
                                hyphens: 'auto',
                                marginTop: '2px',
                              }}
                            >
                              {category.title}
                            </h3>
                            {category.entryLine && (
                              <p
                                className="font-serif"
                                style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '8px' }}
                              >
                                {category.entryLine}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {allCompleted ? (
                              <Check size={13} style={{ color: '#1E3D2F', opacity: 0.50, marginRight: '10px' }} />
                            ) : someStarted ? (
                              <span style={{
                                display: 'inline-block',
                                width: '7px',
                                height: '7px',
                                borderRadius: '50%',
                                backgroundColor: '#C4821D',
                                opacity: 0.70,
                              }} />
                            ) : null}
                            <ChevronRight
                              data-chevron
                              className="w-4 h-4"
                              style={{ color: 'var(--accent-saffron)', opacity: 0.6, transition: 'transform 120ms ease-out' }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              {(() => {
                const totalCategories = sortedCategories.length;
                const fullyCompletedCount = sortedCategories.filter(cat => {
                  const catCards = cards.filter(c => c.categoryId === cat.id);
                  return catCards.length > 0 && catCards.every(c => completedCardIds.includes(c.id));
                }).length;
                if (fullyCompletedCount === 0) return null;
                const isAllDone = fullyCompletedCount >= totalCategories;
                return (
                  <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '24px' }}>
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
