// Recommended category order for silent curation — first unexplored wins.
const RECOMMENDED_CATEGORY_ORDER = [
  "emotional-intimacy",
  "communication",
  "category-8",
  "category-7",
  "parenting-together",
  "individual-needs",
  "category-9",
  "category-6",
  "daily-life",
  "category-10",
];

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import CategoryCard from '@/components/CategoryCard';
import Header from '@/components/Header';
import { ArrowRight, Bookmark, Share2, ChevronDown } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';
import RelationSettings from '@/components/RelationSettings';
import RelationshipMemory from '@/components/RelationshipMemory';
import Footer from '@/components/Footer';
import ReturnOverlay from '@/components/ReturnOverlay';
import ConfidenceCheckPanel from '@/components/ConfidenceCheckPanel';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toastSuccessOnce, toastErrorOnce } from '@/lib/toastOnce';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useTogetherMode } from '@/hooks/useTogetherMode';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
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
  const { isTogether } = useTogetherMode();

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

  // Suggested context for highlighting
  const suggestedContext = useMemo(() => {
    const suggestedCardId = snapshotSuggestedNextCardId
      || (snapshotLastOpenedCardId && !exploredIds.includes(snapshotLastOpenedCardId) ? snapshotLastOpenedCardId : null);
    const suggestedCard = suggestedCardId ? getCardById(suggestedCardId) : null;
    const suggestedCategory = suggestedCard ? getCategoryById(suggestedCard.categoryId) : null;
    return { suggestedCardId, suggestedCard, suggestedCategory };
  }, [snapshotSuggestedNextCardId, snapshotLastOpenedCardId, exploredIds, getCardById, getCategoryById]);

  const highlightedCategoryId = normalizedSession.categoryId || suggestedContext.suggestedCategory?.id || null;

  // Recommended category: first with unexplored cards
  const recommendedCategoryId = useMemo(() => {
    for (const catId of RECOMMENDED_CATEGORY_ORDER) {
      const catCards = cards.filter((c) => c.categoryId === catId);
      if (catCards.length === 0) continue;
      const allExplored = catCards.every((c) => exploredIds.includes(c.id));
      if (!allExplored) return catId;
    }
    return RECOMMENDED_CATEGORY_ORDER[0];
  }, [cards, exploredIds]);

  // Idle primary CTA: recommended card or first card of first category
  const recommendedCardId = useMemo(() => {
    const id = snapshotSuggestedNextCardId;
    if (id) return id;
    const fallbackCat = categories[0];
    if (!fallbackCat) return null;
    const fallbackCard = cards.find((c) => c.categoryId === fallbackCat.id);
    return fallbackCard?.id ?? null;
  }, [snapshotSuggestedNextCardId, categories, cards]);

  return (
    <div className="min-h-screen flex flex-col page-bg">
      {/* 7+ day return overlay — only in idle */}
      <AnimatePresence>
        {showReturnOverlay && mode !== 'active' && (
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
        <Header showBackgroundPicker={false} showBackupManager={false} showSaveIndicator={false} />
        {mode !== 'active' && <ConfidenceCheckPanel />}

        {/* Loading skeleton */}
        {mode === 'loading' && (
          <div className="px-6 pt-8 pb-10">
            <div className="h-14 rounded-2xl bg-muted/20 animate-pulse" />
          </div>
        )}

        {/* ═══ ACTIVE — single dominant resume surface ═══ */}
        {mode === 'active' && normalizedSession.cardId && (() => {
          const activeCard = getCardById(normalizedSession.cardId!);
          const activeCategory = activeCard ? getCategoryById(activeCard.categoryId) : null;
          const totalSteps = 4;
          const completedSteps = Math.min(normalizedSession.currentStepIndex, totalSteps);
          if (!activeCard || !activeCategory) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="px-6 pt-12 pb-16 flex flex-col"
            >
              {/* Resume card */}
              <div
                className="rounded-[20px] p-8 mb-8"
                style={{ backgroundColor: 'var(--color-surface-secondary)' }}
              >
                {/* Label */}
                <p
                  className="text-xs uppercase tracking-widest font-medium mb-6"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  Pågående samtal
                </p>

                {/* Category */}
                <p
                  className="text-sm mb-1"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {activeCategory.title}
                </p>

                {/* Card title — dominant */}
                <h2
                  className="font-serif text-3xl font-medium leading-tight mb-8"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {activeCard.title}
                </h2>

                {/* Neutral grey progress — dots only */}
                <div className="flex items-center gap-2 mb-8">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full"
                      style={{
                        backgroundColor: i < completedSteps
                          ? '#9CA3AF'
                          : '#E5E7EB',
                      }}
                    />
                  ))}
                </div>

                {/* Primary action */}
                <button
                  onClick={() => { markNavigated(); navigate(`/card/${normalizedSession.cardId}`); }}
                  className="w-full h-14 rounded-[16px] flex items-center justify-center gap-2 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--color-button-primary)',
                    color: 'var(--color-button-text)',
                  }}
                >
                  Fortsätt samtalet
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })()}

        {/* ═══ IDLE — Recommended + Category Grid ═══ */}
        {mode === 'idle' && (
          <motion.div
            id="category-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="px-6 mt-8"
          >
            {/* Recommended section */}
            {(() => {
              const recCat = recommendedCategoryId ? getCategoryById(recommendedCategoryId) : null;
              if (!recCat) return null;
              return (
                <div className="mb-8">
                  <p className="text-xs uppercase tracking-widest font-medium mb-4"
                     style={{ color: 'var(--color-text-secondary)' }}>
                    Rekommenderat nästa steg
                  </p>
                  <div
                    onClick={() => { markNavigated(); navigate(`/category/${recCat.id}`); }}
                    className="cursor-pointer rounded-[20px] p-8 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-surface-secondary)' }}
                  >
                    <h2
                      className="font-serif text-2xl font-medium leading-snug mb-2"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {recCat.title}
                    </h2>
                    {recCat.entryLine && (
                      <p className="text-sm leading-relaxed"
                         style={{ color: 'var(--color-text-secondary)' }}>
                        {recCat.entryLine}
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Full category grid — uniform, no highlights */}
            <div className="space-y-3 pb-12">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => navigate(`/category/${category.id}`)}
                  index={index}
                  highlighted={false}
                  isCompleted={getCategoryStatus(category.id) === 'explored'}
                  isFeatured={false}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Relationship Memory — last completed card */}
        {(() => {
          const lastCompletedId = snapshotLastCompletedCardId;
          const lastCard = lastCompletedId ? getCardById(lastCompletedId) : null;
          const lastCategory = lastCard ? getCategoryById(lastCard.categoryId) : null;
          const lastActivity = snapshotLastActivityAt;
          if (lastCard && lastCategory && lastActivity) {
            return (
              <RelationshipMemory
                cardTitle={lastCard.title}
                categoryTitle={lastCategory.title}
                completedAt={lastActivity.toISOString()}
              />
            );
          }
          return null;
        })()}

        {/* Navigation links */}
        {mode !== 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="px-6 pt-8 pb-10 mt-4 space-y-2"
          >
            <button
              onClick={() => navigate('/shared')}
              className="w-full flex items-center gap-3 py-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm">{t('shared.title')}</span>
            </button>

            {savedConversations.length > 0 && (
              <button
                onClick={() => navigate('/saved')}
                className="w-full flex items-center gap-3 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span className="text-sm">
                  {t('home.saved_conversations', { count: savedConversations.length })}
                </span>
              </button>
            )}
          </motion.div>
        )}

        {/* Notification preferences */}
        <NotiserSection />

        {/* Relation & space settings */}
        <RelationSettings
          onCreateNewSpace={async () => {
            const result = await switchToNewSpace();
            if (result.ok) {
              toastSuccessOnce('new_space', 'Nytt utrymme skapat.');
              navigate('/');
            } else {
              toastErrorOnce('new_space_fail', 'Kunde inte skapa nytt utrymme.');
            }
          }}
          onLeavePartner={async () => {
            if (!space?.id) return;
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              const accessToken = sessionData?.session?.access_token;
              if (!accessToken) return;
              await supabase.functions.invoke('leave-and-create-new-space', {
                headers: { Authorization: `Bearer ${accessToken}` },
                body: {},
              });
              toastSuccessOnce('leave_partner', 'Kopplingen till din partner är avslutad.');
              navigate('/', { replace: true });
            } catch {
              toastErrorOnce('leave_partner_fail', 'Något gick fel. Försök igen.');
            }
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
