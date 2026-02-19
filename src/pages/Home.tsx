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
import { Button } from '@/components/ui/button';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import {
  selectLastActivityAt,
  selectExploredCardIds,
  selectLastOpenedCardId,
  selectLastCompletedCardId,
  selectSuggestedNextCardId,
} from '@/selectors/spaceSnapshotSelectors';
import { categories as allCategories, cards as allCards } from '@/data/content';

const STEP_LABELS = ['Öppnare', 'Tankeväckare', 'Scenario', 'Teamwork'];

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
        <Header showBackgroundPicker={false} showBackupManager={false} showSaveIndicator={mode === 'active'} />
        <ConfidenceCheckPanel />

        {/* ═══ PRIMARY ACTION ZONE ═══ */}
        {mode === 'loading' && (
          <div className="px-6 pt-8 pb-10">
            <div className="h-14 rounded-2xl bg-muted/20 animate-pulse" />
          </div>
        )}

        {/* Active session block */}
        {mode === 'active' && normalizedSession.cardId && (() => {
          const activeCard = getCardById(normalizedSession.cardId!);
          const activeCategory = activeCard ? getCategoryById(activeCard.categoryId) : null;
          const stepLabel = STEP_LABELS[normalizedSession.currentStepIndex] || '';
          const stepProgress = `${Math.min(normalizedSession.currentStepIndex + 1, 4)} / 4`;
          if (!activeCard || !activeCategory) return null;
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="px-6 pt-12 mb-12"
            >
              <p className="text-xs text-muted-foreground/30 uppercase tracking-wide mb-2 text-center">Pågående samtal</p>
              <div className="text-center mb-4">
                <p className="font-serif text-lg text-foreground mb-1.5">{activeCard.title}</p>
                <p className="text-xs text-muted-foreground mb-1.5">{activeCategory.title}</p>
                {stepLabel && (
                  <p className="text-xs text-muted-foreground/40">{stepLabel} · {stepProgress}</p>
                )}
              </div>
              <Button
                onClick={() => { markNavigated(); navigate(`/card/${normalizedSession.cardId}`); }}
                size="lg"
                className="w-full h-14 rounded-2xl gap-2 font-normal"
              >
                Fortsätt samtalet
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          );
        })()}

        {/* ═══ IDLE — Category Discovery + single "Starta" CTA ═══ */}
        {mode === 'idle' && (
          <motion.div
            id="category-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="px-6 mt-6"
          >
            {/* Primary CTA — above categories when recommended card is known */}
            {recommendedCardId && (
              <div className="mb-8">
                <Button
                  size="lg"
                  className="w-full h-14 rounded-2xl gap-2 font-normal"
                  onClick={() => { markNavigated(); navigate(`/card/${recommendedCardId}`); }}
                >
                  Starta nästa samtal
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Category list */}
            <div className="space-y-6 pb-12">
              {categories.map((category, index) => {
                const catStatus = getCategoryStatus(category.id);
                const isFeatured = devState !== 'browse' && category.id === recommendedCategoryId;
                const nextCategory = categories[index + 1];
                const nextIsNormal = isFeatured && nextCategory;
                return (
                  <div
                    key={category.id}
                    className={isFeatured ? 'mt-4' : undefined}
                    style={nextIsNormal ? { marginBottom: '-8px' } : undefined}
                  >
                    <CategoryCard
                      category={category}
                      onClick={() => navigate(`/category/${category.id}`)}
                      index={index}
                      highlighted={category.id === highlightedCategoryId}
                      isCompleted={catStatus === 'explored'}
                      isFeatured={isFeatured}
                    />
                  </div>
                );
              })}
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
              toast.success('Nytt utrymme skapat.');
              navigate('/');
            } else {
              toast.error('Kunde inte skapa nytt utrymme.');
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
              toast.success('Kopplingen till din partner är avslutad.');
              navigate('/', { replace: true });
            } catch {
              toast.error('Något gick fel. Försök igen.');
            }
          }}
        />
      </div>
      <Footer />
    </div>
  );
}
