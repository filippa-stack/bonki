// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { QUESTION_HOOKS } from '@/data/questionHooks';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { toastOnce, toastErrorOnce } from '@/lib/toastOnce';
import { getProductForCard } from '@/data/products';
import { useProductAccess } from '@/hooks/useProductAccess';
import ProductPaywall from '@/components/ProductPaywall';
import { getCompletionMessages, getUIText, type PronounMode } from '@/lib/pronouns';
import { useCardImage } from '@/hooks/useCardImage';
import { isDemoMode, isDemoParam } from '@/lib/demoMode';
import { useCardVisit } from '@/hooks/useCardVisit';
import { useProductTheme } from '@/hooks/useProductTheme';

import Header from '@/components/Header';
import SectionView, { type SectionViewHandle } from '@/components/SectionView';
import StepProgressIndicator, { buildDynamicSteps } from '@/components/StepProgressIndicator';
import SessionStepReflection from '@/components/SessionStepReflection';
import { useSessionReflections } from '@/hooks/useSessionReflections';

import StageInterstitial from '@/components/StageInterstitial';
import SessionFocusShell from '@/components/SessionFocusShell';

import { ArrowRight, ArrowLeft, Feather, X, Pencil, ChevronDown } from 'lucide-react';

import CompletedSessionView from '@/components/CompletedSessionView';
import FeedbackSheet from '@/components/FeedbackSheet';
import LockedReflectionDisplay from '@/components/LockedReflectionDisplay';

import GorTillsammansOverlay, { hasSeenGorTillsammans } from '@/components/GorTillsammansOverlay';
import IllustrationPeek from '@/components/IllustrationPeek';
import { useVerdigrisTheme } from '@/components/VerdigrisAtmosphere';
import { CIRCADIAN_COLORS, CIRCADIAN_COLORS_LIGHT } from '@/components/CircadianMenu';
import { useDevState } from '@/contexts/DevStateContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { isDevToolsEnabled } from '@/lib/devTools';
// samtalsläge removed from UI — always defaults to Tillsammans
import { useTogetherMode } from '@/hooks/useTogetherMode';
import { useOptimisticCompletions } from '@/contexts/OptimisticCompletionsContext';
import { BEAT_1, BEAT_2, BEAT_3, EASE, PRESS, PAGE, EMOTION } from '@/lib/motion';
import { getRecommendedCategoryOrder } from '@/lib/recommendedOrder';

// Completion messages are now in src/lib/pronouns.ts

// ─────────────────────────────────────────────────────────────
// Card view mode — the single source of truth for which surface mounts.
//
//   'live'       → active session, SessionStepReflection visible
//   'archive'    → read-only view from Era samtal (from=archive)
//   'completion' → session just finished, takeaway screen
// ─────────────────────────────────────────────────────────────
type CardViewMode = 'live' | 'archive' | 'completion';

const STILL_US_STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

/**
 * Derive the effective step order from a card's actual sections.
 * Still Us cards always use the canonical 4-step order.
 * Product cards use whatever sections they define.
 */
function getCardStepOrder(card: { sections: { type: string }[] } | undefined): readonly string[] {
  if (!card) return STILL_US_STEP_ORDER;
  // If card has all 4 canonical types, use Still Us order
  const types = card.sections.map(s => s.type);
  const hasAll4 = STILL_US_STEP_ORDER.every(t => types.includes(t));
  if (hasAll4) return STILL_US_STEP_ORDER;
  return types.length > 0 ? types : STILL_US_STEP_ORDER;
}

/**
 * Returns the effective prompt count for a section, matching SectionView's
 * rendering logic. Content is shown as preamble (not an extra prompt step).
 */
function getEffectivePromptCount(section: { type: string; content?: string; prompts?: unknown[] } | undefined): number {
  if (!section) return 1;
  return section.prompts?.length ?? (section.content ? 1 : 1);
}

// Ritual hints are now in getUIText() from src/lib/pronouns.ts

const STEP_CTA_KEYS: Record<string, string> = {
  opening: 'card_view.cta_opening',
  reflective: 'card_view.cta_reflective',
  scenario: 'card_view.cta_scenario',
  exercise: 'card_view.cta_exercise',
};

export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isFromArchive = searchParams.get('from') === 'archive';

  // Detect resume navigation — suppress entry animations on first paint
  const isResumed = (location.state as { resumed?: boolean } | null)?.resumed === true;
  const [suppressEntryAnim] = useState(() => isResumed);
  // Clear navigation state after first read so back-navigation animates normally
  useEffect(() => {
    if (isResumed) {
      window.history.replaceState({ ...window.history.state, usr: { resumed: false } }, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { t } = useTranslation();
  const {
    getConversationForCard,
    saveConversation,
    getCardById,
    getCategoryById,
    cards,
  } = useApp();
  const { space } = useCoupleSpaceContext();
  const devState = useDevState();

  // ─── Normalized session state — the ONLY session authority ───
  const normalizedSession = useNormalizedSessionContext();
  const { isTogether } = useTogetherMode();
  const { markCompleted: markCardCompleted } = useOptimisticCompletions();

  const isActiveSession = !!(normalizedSession.sessionId && normalizedSession.cardId === cardId);

  // ─── Product-aware card & step order ───
  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;
  const product = cardId ? getProductForCard(cardId) : undefined;
  const isStillUsCard = !product && !!card; // Legacy Still Us cards aren't in allProducts
  const pronounMode: PronounMode = product?.pronounMode ?? 'ni';
  const uiText = useMemo(() => getUIText(pronounMode), [pronounMode]);
  const effectiveSteps = useMemo(() => {
    // Kids/family products: always 1 step (all prompts flattened into one sequence)
    if (product && product.id !== 'still_us' && card?.sections.length) {
      return [card.sections[0].type] as readonly string[];
    }
    return getCardStepOrder(card);
  }, [card, product]);
  const isKidsProduct = !!(product && product.id !== 'still_us');
  // Flatten all section prompts into one sequence for kids products with multiple sections
  const flatPromptMap = useMemo(() => {
    if (!isKidsProduct || !card || card.sections.length <= 1) return null;
    const map: { section: (typeof card.sections)[0]; promptIndexInSection: number }[] = [];
    for (const section of card.sections) {
      const count = getEffectivePromptCount(section);
      for (let i = 0; i < count; i++) {
        map.push({ section, promptIndexInSection: i });
      }
    }
    return map;
  }, [isKidsProduct, card]);
  const totalFlatPrompts = flatPromptMap?.length ?? 0;
  const completionMessages = useMemo(() => getCompletionMessages(pronounMode, product?.ageLabel), [pronounMode, product?.ageLabel]);
  const cardImageUrl = useCardImage(cardId);

  // ─── Paywall: check if user has access to this product ───
  const stillUsFreeCardId = 'smallest-we';
  const isFreeCard = isStillUsCard
    ? cardId === stillUsFreeCardId
    : !!(product?.freeCardId && cardId === product.freeCardId);
  const paywallProductId = product?.id ?? (isStillUsCard ? 'still_us' : '');
  const { hasAccess: hasProductAccess, loading: accessLoading } = useProductAccess(paywallProductId);
  const [demoBypassed, setDemoBypassed] = useState(false);
  const needsPaywall = !isFreeCard && !hasProductAccess && !accessLoading && (!!product || isStillUsCard) && !devState && !demoBypassed;

  // Apply product theme (background + accent colors)
  // For Still Us: use saffron as both primary + accent, Heritage Gold for CTA
  useProductTheme(
    isStillUsCard ? 'hsl(41, 78%, 48%)' : (product?.accentColor ?? 'hsl(158, 35%, 18%)'),
    isStillUsCard ? 'hsl(41, 78%, 48%)' : (product?.secondaryAccent ?? 'hsl(38, 88%, 46%)'),
    isStillUsCard ? undefined : product?.backgroundColor,
    isStillUsCard ? 'hsl(41, 78%, 48%)' : product?.ctaButtonColor,
    product?.pronounMode,
    isStillUsCard ? undefined : product,
  );

  // Apply Verdigris theme for Still Us cards
  useVerdigrisTheme(isStillUsCard);

  // Category color for Still Us start screen text
  const startScreenCategoryColor = card ? (CIRCADIAN_COLORS_LIGHT[card.categoryId] || CIRCADIAN_COLORS[card.categoryId]) : undefined;
  const startScreenCategoryColorBase = card ? CIRCADIAN_COLORS[card.categoryId] : undefined;

  const { recordVisit } = useCardVisit();
  useEffect(() => {
    if (cardId) recordVisit(cardId);
  }, [cardId, recordVisit]);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    devState ? 'dev-session' : null
  );
  useEffect(() => {
    if (isActiveSession && normalizedSession.sessionId) {
      setActiveSessionId(normalizedSession.sessionId);
    }
  }, [isActiveSession, normalizedSession.sessionId]);

  // ─── Completed session check (for count only, not gating) ───
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [completedSessionCount, setCompletedSessionCount] = useState(0);

  // showCompletion: session just finished — takeaway ritual before archive
  const [showCompletion, _setShowCompletion] = useState(
    devState === 'completed' ? true : false
  );
  // Lock headline on first render to prevent flash when product resolves
  const completionHeadlineRef = useRef<string | null>(null);
  if (!completionHeadlineRef.current) {
    completionHeadlineRef.current = completionMessages[Math.floor(Math.random() * completionMessages.length)];
  }
  const completionHeadline = completionHeadlineRef.current;
  // Wrapper that also marks the card as optimistically completed
  const setShowCompletion = useCallback((val: boolean) => {
    _setShowCompletion(val);
    if (val && cardId) {
      markCardCompleted(cardId);
    }
  }, [cardId, markCardCompleted]);

  // ─── Feedback modal state (Still Us only) ───
  const isStillUs = product?.id === 'still_us' || !product;
  const dynamicSteps = useMemo(() => buildDynamicSteps(effectiveSteps as string[], isStillUs), [effectiveSteps, isStillUs]);
  const [feedbackDismissed, setFeedbackDismissed] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (!showCompletion || feedbackDismissed || !isStillUs) return;
    const timer = setTimeout(() => setShowFeedback(true), 2000);
    return () => clearTimeout(timer);
  }, [showCompletion, feedbackDismissed, isStillUs]);

  const handleFeedbackDismiss = useCallback(() => {
    setShowFeedback(false);
    setFeedbackDismissed(true);
  }, []);

  // Intercept navigation during completion: show feedback first if not yet seen (Still Us only)
  const navigateWithFeedback = useCallback((destination: string) => {
    if (isStillUs && showCompletion && !feedbackDismissed && !showFeedback) {
      setShowFeedback(true);
      // Store destination so we navigate after dismiss
      pendingNavRef.current = destination;
      return;
    }
    navigate(destination);
  }, [isStillUs, showCompletion, feedbackDismissed, showFeedback, navigate]);

  const pendingNavRef = useRef<string | null>(null);

  const handleFeedbackDismissWithNav = useCallback(() => {
    setShowFeedback(false);
    setFeedbackDismissed(true);
    if (pendingNavRef.current) {
      const dest = pendingNavRef.current;
      pendingNavRef.current = null;
      navigate(dest);
    }
  }, [navigate]);

  useEffect(() => {
    if (devState) return;
    if (!space || !cardId) return;
    supabase
      .from('couple_sessions')
      .select('id')
      .eq('couple_space_id', space.id)
      .eq('card_id', cardId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setCompletedSessionId(data?.id ?? null);
      });
    // Count all completed sessions in this space for message rotation
    supabase
      .from('couple_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .then(({ count }) => {
        setCompletedSessionCount(count ?? 0);
      });
  }, [space, cardId, devState, showCompletion]);

  // ─── Stale/orphan session detection ───
  const [staleSession, setStaleSession] = useState(false);
  const staleCheckedRef = useRef(false);
  useEffect(() => {
    if (staleCheckedRef.current || devState || isFromArchive) return;
    if (!normalizedSession.sessionId || normalizedSession.loading) return;
    if (normalizedSession.cardId !== cardId) return;

    staleCheckedRef.current = true;

    (async () => {
      const { data } = await supabase
        .from('couple_sessions')
        .select('created_at')
        .eq('id', normalizedSession.sessionId!)
        .maybeSingle();

      if (!data?.created_at) return;

      const ageMs = Date.now() - new Date(data.created_at).getTime();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      if (ageMs > THIRTY_DAYS) {
        setStaleSession(true);
      }
    })();
  }, [normalizedSession.sessionId, normalizedSession.loading, normalizedSession.cardId, cardId, devState, isFromArchive]);

  const handleAbandonAndRestart = useCallback(async () => {
    if (!normalizedSession.sessionId || !space?.id || !cardId) return;
    const card = getCardById(cardId);
    if (!card) return;

    await supabase.rpc('abandon_active_session', { p_session_id: normalizedSession.sessionId });
    const { error } = await supabase.rpc('activate_couple_session', {
      p_couple_space_id: space.id,
      p_category_id: card.categoryId,
      p_card_id: cardId,
      p_step_count: effectiveSteps.length,
      p_product_id: product?.id ?? 'still_us',
    });
    if (!error) {
      await normalizedSession.refetch();
      setStaleSession(false);
    }
  }, [normalizedSession.sessionId, space?.id, cardId, getCardById]);

  // ─── Auto-show completion when session disappears post-lock ───
  useEffect(() => {
    if (isFromArchive || devState) return;
    if (activeSessionId && !normalizedSession.sessionId && !normalizedSession.loading && !showCompletion) {
      setShowCompletion(true);
    }
  }, [activeSessionId, normalizedSession.sessionId, normalizedSession.loading, isFromArchive, showCompletion, devState]);

  // Volume 1: single-writer model, reflection surface always active

  // ─── Auto-abandon stale session for DIFFERENT card on mount ───
  // Session creation is LAZY — only happens when user completes a step (handleCompleteStep).
  // This keeps analytics clean: no abandoned sessions from browsing.
  const abandonCheckedRef = useRef(false);
  useEffect(() => {
    if (devState || isFromArchive || showCompletion) return;
    if (normalizedSession.loading) return;
    if (abandonCheckedRef.current) return;
    if (!space?.id || !cardId) return;

    // If there's an active session for a DIFFERENT card, abandon it so it doesn't block
    const hasOtherSession = !!(normalizedSession.sessionId && normalizedSession.cardId !== cardId);
    if (!hasOtherSession) return;

    abandonCheckedRef.current = true;

    (async () => {
      if (isDevToolsEnabled()) console.log('[lazy] abandon other session', normalizedSession.sessionId);
      await supabase.rpc('abandon_active_session', {
        p_session_id: normalizedSession.sessionId,
      });
      await normalizedSession.refetch();
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devState, isFromArchive, showCompletion, normalizedSession.loading, normalizedSession.sessionId, space?.id, cardId]);

  // ─── Single resolver ───
  const cardViewMode: CardViewMode = (() => {
    if (showCompletion) return 'completion';
    if (isFromArchive) return 'archive';
    return 'live';
  })();

  // ─── Step index ───
  // Archive mode: use step param from URL
  const initialArchiveStep = (() => {
    const stepParam = searchParams.get('step');
    if (stepParam !== null) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < effectiveSteps.length) return parsed;
    }
    return 0;
  })();
  const [archiveStepIndex, setArchiveStepIndex] = useState(initialArchiveStep);

  // ─── Local display step (live mode) ───
  const scDevStep = (() => {
    const raw = searchParams.get('__sc_dev_step');
    if (raw === null) return null;
    const n = parseInt(raw, 10);
    return !isNaN(n) ? n : null;
  })();
  const [localStepIndex, setLocalStepIndex] = useState<number | null>(scDevStep);

  // ─── Sub-prompt index within current stage ───
  const [localPromptIndex, setLocalPromptIndex] = useState(0);

  // Reset local override whenever the server advances
  const serverStepIndex = normalizedSession.currentStepIndex;
  useEffect(() => {
    setLocalStepIndex(null);
    setLocalPromptIndex(0);
  }, [serverStepIndex]);

  // ─── Session start screen — ritual gate before first question ───
  // showStartScreen is a pure UX gate, decoupled from session state.
  // Set true on mount for live mode; only cleared by explicit user tap.
  const [showStartScreen, setShowStartScreen] = useState(() => {
    if (isResumed || isFromArchive) return false;
    if (devState === 'completed') return false;
    // Always show start screen when entering a card in live mode
    return true;
  });

  const hasStarted = !showStartScreen;

  const currentStepIndex =
    cardViewMode === 'archive'
      ? archiveStepIndex
      : (localStepIndex ?? serverStepIndex);

  // ─── DEV-ONLY debug strip (disabled — never visible) ───
  const _devDebug = null;

  // ─── Stage interstitial (micro-moment between depth layers) ───
  const [showInterstitial, setShowInterstitial] = useState(false);
  const prevStepRef = useRef(currentStepIndex);

  const firstRenderRef = useRef(true);
  useEffect(() => { firstRenderRef.current = false; }, []);

  useEffect(() => {
    if (cardViewMode !== 'live') return;
    if (prevStepRef.current !== currentStepIndex && currentStepIndex > 0) {
      if (!firstRenderRef.current) {
        setShowInterstitial(true);
        const timer = setTimeout(() => setShowInterstitial(false), 500);
        prevStepRef.current = currentStepIndex;
        return () => clearTimeout(timer);
      }
    }
    prevStepRef.current = currentStepIndex;
  }, [currentStepIndex, cardViewMode]);

  const [isExiting, setIsExiting] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const sectionViewRef = useRef<SectionViewHandle>(null);

  // ─── Kids session note state ───
  const kidsNoteStepIndex = currentStepIndex * 100 + localPromptIndex;
  const kidsNoteSession = useSessionReflections(
    isKidsProduct ? (normalizedSession.sessionId ?? null) : null,
    kidsNoteStepIndex
  );
  const [kidsNoteExpanded, setKidsNoteExpanded] = useState(false);
  const [kidsNoteLocalText, setKidsNoteLocalText] = useState('');
  const kidsNoteInteractedRef = useRef(false);
  const kidsNoteTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset note UI when prompt changes
  useEffect(() => {
    setKidsNoteExpanded(false);
  }, [localPromptIndex]);

  // Sync saved note text from DB
  useEffect(() => {
    if (!kidsNoteSession.loading && kidsNoteSession.myReflection?.text) {
      setKidsNoteLocalText(kidsNoteSession.myReflection.text);
      setKidsNoteExpanded(true);
    } else if (!kidsNoteSession.loading) {
      setKidsNoteLocalText('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidsNoteSession.loading, kidsNoteStepIndex]);


  const existingConversation = cardId ? getConversationForCard(cardId) : undefined;

  // ─── Save conversation for local resume (live mode only) ───
  // Save conversation for local resume (live mode only)
  const getCardByIdRef = useRef(getCardById);
  getCardByIdRef.current = getCardById;
  useEffect(() => {
    if (cardViewMode !== 'live') return;
    const card = cardId ? getCardByIdRef.current(cardId) : undefined;
    if (card && currentStepIndex >= 0) {
      const currentSection = card.sections.find(s => s.type === effectiveSteps[currentStepIndex]);
      if (currentSection) saveConversation(card.id, currentSection.id, currentStepIndex);
    }
  }, [currentStepIndex, cardId, cardViewMode, saveConversation, effectiveSteps]);

  // ─── Handle step completion / advance ───
  const pendingRetryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completingRef = useRef(false);

  const handleCompleteStep = useCallback(async () => {
    if (cardViewMode !== 'live') return;
    if (completingRef.current) return;
    completingRef.current = true;
    try {

    const displayIndex = localStepIndex ?? serverStepIndex;
    const atFrontier = displayIndex >= serverStepIndex;

    if (!atFrontier) {
      setLocalStepIndex(displayIndex + 1);
      setLocalPromptIndex(0);
      return;
    }

    // DevState: advance locally without RPC
    if (devState) {
      if (displayIndex >= effectiveSteps.length - 1) {
        setShowCompletion(true);
      } else {
        setLocalStepIndex(displayIndex + 1);
        setLocalPromptIndex(0);
      }
      return;
    }

    // ── Always fetch fresh session ID to avoid stale/abandoned references ──
    let sessionId: string | null = null;
    {
      const { data: freshState } = await supabase.rpc('get_active_session_state');
      const row = Array.isArray(freshState) ? freshState[0] : freshState;
      sessionId = row?.session_id ?? null;
    }

    if (!sessionId) {
      const card = getCardById(cardId);
      if (space?.id && card) {
        if (isDevToolsEnabled()) console.log('[step-complete] no sessionId — lazy activate');
        const { error: actErr } = await supabase.rpc('activate_couple_session', {
          p_couple_space_id: space.id,
          p_category_id: card.categoryId,
          p_card_id: cardId,
          p_step_count: effectiveSteps.length,
          p_product_id: product?.id ?? 'still_us',
        });
        if (!actErr) {
          const { data: freshState } = await supabase.rpc('get_active_session_state');
          const row = Array.isArray(freshState) ? freshState[0] : freshState;
          sessionId = row?.session_id ?? null;
          normalizedSession.refetch();
        }
      }

      if (!sessionId) {
        if (isDevToolsEnabled()) console.warn('[step-complete] no session after retry — advancing locally');
        if (displayIndex >= effectiveSteps.length - 1) {
          setShowCompletion(true);
        } else {
          setLocalStepIndex(displayIndex + 1);
          setLocalPromptIndex(0);
        }
        toastOnce('step_retry', () =>
          toast('Vi sparar så fort vi kan. Fortsätt bara.', { duration: 2500 })
        );
        return;
      }
    }

    const rpcParams = {
      p_session_id: sessionId,
      p_step_index: displayIndex,
    };

    if (isDevToolsEnabled()) {
      console.log('[step-complete] RPC params:', rpcParams);
      console.log('[step-complete] context:', {
        couple_space_id: space?.id ?? null,
        cardViewMode,
        appMode: normalizedSession.appMode,
        normalizedCardId: normalizedSession.cardId,
        routeCardId: cardId,
      });
    }

    // Always advance UI immediately
    const isLastStep = displayIndex >= effectiveSteps.length - 1;

    const isSessionInactive = (err: any) =>
      err?.message?.includes('session_not_active') || err?.code === 'P0001' && err?.message?.includes('session_not_active');

    const attemptRpc = async (attempt: number): Promise<'ok' | 'session_inactive' | 'error'> => {
      const { data, error } = await supabase.rpc('complete_couple_session_step', rpcParams);
      if (error) {
        if (isDevToolsEnabled()) {
          console.error(`[step-complete] attempt ${attempt} FULL ERROR:`, JSON.stringify(error, null, 2));
        }
        if (isSessionInactive(error)) return 'session_inactive';
        return 'error';
      }
      const result = Array.isArray(data) ? data[0] : data;
      if (result?.is_session_complete) {
        setShowCompletion(true);
      }
      return 'ok';
    };

    const result = await attemptRpc(1);

    if (result === 'session_inactive') {
      // Session was abandoned/replaced — try to recover with the current active session
      if (isDevToolsEnabled()) console.log('[step-complete] session_inactive — attempting recovery');
      const { data: freshState } = await supabase.rpc('get_active_session_state');
      const row = Array.isArray(freshState) ? freshState[0] : freshState;
      const freshSessionId = row?.session_id ?? null;

      if (freshSessionId && freshSessionId !== sessionId && row?.card_id === cardId) {
        // We have a valid active session for THIS card — retry with it
        if (isDevToolsEnabled()) console.log('[step-complete] recovered fresh sessionId:', freshSessionId);
        const { data: retryData, error: retryErr } = await supabase.rpc('complete_couple_session_step', {
          p_session_id: freshSessionId,
          p_step_index: displayIndex,
        });
        if (!retryErr) {
          const retryResult = Array.isArray(retryData) ? retryData[0] : retryData;
          if (retryResult?.is_session_complete) {
            setShowCompletion(true);
          } else if (!isLastStep) {
            setLocalStepIndex(displayIndex + 1);
            setLocalPromptIndex(0);
          }
          normalizedSession.refetch();
          return;
        }
      }

      // If recovery failed or session is for a different card, redirect home
      navigate('/');
      toastOnce('session_ended', () =>
        toast(uiText.sessionEnded, {
          duration: 4000,
          style: {
            background: 'var(--surface-base)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
          },
        })
      );
      return;
    }

    if (result === 'ok') {
      if (isLastStep) {
        // Always show completion on the last step — single-writer model
        // doesn't require partner gating.
        setShowCompletion(true);
      } else {
        setLocalStepIndex(displayIndex + 1);
        setLocalPromptIndex(0);
      }
      await normalizedSession.refetch();
      return;
    }

    // Generic error — advance UI anyway
    if (isLastStep) {
      setShowCompletion(true);
    } else {
      setLocalStepIndex(displayIndex + 1);
      setLocalPromptIndex(0);
    }
    toastOnce('step_retry', () =>
      toast('Något gick fel. Försök igen.', {
        duration: 4000,
        style: {
          background: 'var(--surface-base)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
        },
      })
    );

    const retryInBackground = (remaining: number) => {
      if (remaining <= 0) return;
      pendingRetryRef.current = setTimeout(async () => {
        const retryResult = await attemptRpc(3 - remaining + 1);
        if (retryResult === 'session_inactive') {
          navigate('/');
          toastOnce('session_ended', () =>
            toast(uiText.sessionEnded, {
              duration: 4000,
              style: {
                background: 'var(--surface-base)',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
              },
            })
          );
        } else if (retryResult === 'ok') {
          normalizedSession.refetch();
        } else if (remaining > 1) {
          retryInBackground(remaining - 1);
        }
      }, 1500);
    };
    retryInBackground(2);
    } finally {
      completingRef.current = false;
    }
  }, [normalizedSession, localStepIndex, serverStepIndex, cardViewMode, devState]);

  // ─── Archive "Next" handler ───
  const handleArchiveNext = (card: ReturnType<typeof getCardById>) => {
    if (!card) return;
    if (archiveStepIndex < effectiveSteps.length - 1) {
      const next = archiveStepIndex + 1;
      setArchiveStepIndex(next);
      navigate(`/card/${card.id}?from=archive&step=${next}`, { replace: true });
    } else {
      navigate('/shared');
    }
  };

  // ─── GÖR TILLSAMMANS one-time overlay ───
  const [showGorTillsammans, setShowGorTillsammans] = useState(false);
  const preCardStageType = effectiveSteps[currentStepIndex];
  const preCardIsExercise = preCardStageType === 'exercise';
  useEffect(() => {
    const isLiveMode = cardViewMode === 'live';
    if (isLiveMode && preCardIsExercise && !hasSeenGorTillsammans()) {
      setShowGorTillsammans(true);
    } else {
      setShowGorTillsammans(false);
    }
  }, [cardViewMode, preCardIsExercise]);

  // ─── Post-completion navigation (hooks before early return) ───
  // card and category are computed earlier (line ~133)

  const [completedCardIds, setCompletedCardIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!space?.id) return;
    supabase
      .from('couple_sessions')
      .select('card_id')
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .then(({ data }) => {
        if (data) {
          setCompletedCardIds(new Set(data.map((r: any) => r.card_id).filter(Boolean)));
        }
      });
  }, [space?.id, cardViewMode]);

  const postCompletionNav = useMemo(() => {
    if (!category || !card) return { type: 'home' as const, destination: '/', label: '', homeDest: '/' };

    const productCards = product ? product.cards : cards;
    const effectiveCompleted = new Set(completedCardIds);
    effectiveCompleted.add(card.id);

    // Find next incomplete card in same category
    const categoryCards = productCards.filter(c => c.categoryId === category.id);
    const nextIncompleteInCategory = categoryCards.find(c => !effectiveCompleted.has(c.id));

    // Find next incomplete card in next category (for cross-category progression)
    let nextCategoryCard: { destination: string; label: string } | null = null;
    if (!nextIncompleteInCategory && product) {
      const catOrder = product.categories.map(c => c.id);
      for (const catId of catOrder) {
        if (catId === category.id) continue;
        const catCards = productCards.filter(c => c.categoryId === catId);
        const next = catCards.find(c => !effectiveCompleted.has(c.id));
        if (next) {
          nextCategoryCard = { destination: `/card/${next.id}`, label: 'Nästa ämne' };
          break;
        }
      }
    }

    const homeDest = product && product.id !== 'still_us'
      ? `/category/${category.id}`
      : '/';

    // Kids/family products: find next card, but always offer home as secondary
    if (product && product.id !== 'still_us') {
      if (nextIncompleteInCategory) {
        return { type: 'next_card' as const, destination: `/card/${nextIncompleteInCategory.id}`, label: 'Nästa', homeDest };
      }
      if (nextCategoryCard) {
        return { type: 'next_card' as const, destination: nextCategoryCard.destination, label: 'Nästa', homeDest };
      }
      return { type: 'all_complete' as const, destination: homeDest, label: 'Avsluta', homeDest };
    }

    // Still Us: recommend next card/category
    if (nextIncompleteInCategory) {
      return { type: 'next_card' as const, destination: `/card/${nextIncompleteInCategory.id}`, label: 'Nästa samtal', homeDest };
    }

    for (const catId of getRecommendedCategoryOrder(card.id)) {
      if (catId === category.id) continue;
      const catCards = productCards.filter(c => c.categoryId === catId);
      const hasIncomplete = catCards.some(c => !effectiveCompleted.has(c.id));
      if (hasIncomplete) {
        return { type: 'next_category' as const, destination: `/category/${catId}`, label: 'Nästa ämne', homeDest };
      }
    }

    return { type: 'all_complete' as const, destination: '/', label: '', homeDest };
  }, [category, card, cards, product, completedCardIds]);

  // ─────────────────────────────────────────────────────────────
  //  Early exit (card not found)
  // ─────────────────────────────────────────────────────────────
  if (!card) {
    return (
      <div className="min-h-screen page-bg animate-fade-in">
        <div className="h-14 border-b border-border bg-card" />
        <div className="px-6 pt-12 space-y-4 max-w-md mx-auto text-center">
          <div className="h-6 w-40 rounded bg-muted/30 animate-pulse mx-auto" />
          <p className="text-sm text-muted-foreground">{t('card_view.not_found')}</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  PAYWALL — non-free card without purchase
  // ─────────────────────────────────────────────────────────────
  if (needsPaywall) {
    // Build a synthetic ProductManifest for Still Us (legacy cards not in allProducts)
    const effectiveProduct: import('@/types/product').ProductManifest = product ?? {
      id: 'still_us',
      name: 'Still Us',
      slug: 'still-us',
      tagline: 'De samtal som annars aldrig blir av',
      description: 'Verktyg för att prata om det som är svårt — innan det blir för svårt.',
      headerTitle: 'Still Us',
      accentColor: 'hsl(158, 35%, 18%)',
      accentColorMuted: 'hsl(158, 20%, 92%)',
      secondaryAccent: 'hsl(41, 78%, 48%)',
      backgroundColor: '#FFFDF8',
      pronounMode: 'ni' as const,
      freeCardId: stillUsFreeCardId,
      categories: [],
      cards: [],
    };
    return (
      <ProductPaywall
        product={effectiveProduct}
        cardId={cardId}
        currentCardTitle={card?.title}
        onAccessGranted={() => {
          if (isDemoMode() || isDemoParam()) {
            setDemoBypassed(true);
          } else {
            window.location.reload();
          }
        }}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'completion' — kids products — quiet recognition
  // ─────────────────────────────────────────────────────────────
  if (cardViewMode === 'completion' && isKidsProduct) {
    const LANTERN_GLOW = '#FDF6E3';
    const SAFFRON = '#E9B44C';
    const BARK = '#2C2420';
    const DRIFTWOOD = '#6B5E52';
    const PARCHMENT = '#F5EDD2';
    const MIDNIGHT_INK = '#1A1A2E';

    const categoryName = category?.title ?? '';
    const hasNextCard = postCompletionNav.type === 'next_card' || postCompletionNav.type === 'next_category';
    const categoryDest = postCompletionNav.homeDest;

    return (
      <motion.div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: LANTERN_GLOW,
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'auto',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Content block — vertically centered */}
        <div style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          maxWidth: '400px',
          padding: '0 24px',
        }}>
          {/* 1. Completion mark — creature circle + saffron ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            {/* Ring + creature */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: `2px solid ${SAFFRON}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {cardImageUrl ? (
                <img
                  src={cardImageUrl}
                  alt=""
                  draggable={false}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: PARCHMENT,
                }} />
              )}
            </div>
            {/* Card name */}
            <p style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: BARK,
              textAlign: 'center',
              marginTop: '12px',
            }}>
              {card.title}
            </p>
          </motion.div>

          {/* 2. Affirmation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="font-serif"
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: BARK,
              textAlign: 'center',
              lineHeight: 1.3,
              marginBottom: '32px',
            }}
          >
            Ni pratade om {card.title}.
          </motion.p>

          {/* 3. Note nudge */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            style={{ width: '100%', marginBottom: '40px' }}
          >
            <KidsCompletionNote
              sessionId={activeSessionId}
              spaceId={space?.id ?? null}
              cardId={cardId}
              productId={product?.id}
            />
          </motion.div>

          {/* 4. Primary CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            style={{ width: '100%' }}
          >
            <button
              onClick={() => navigateWithFeedback(
                hasNextCard ? postCompletionNav.destination : categoryDest
              )}
              style={{
                width: '100%',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: SAFFRON,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '17px',
                fontWeight: 600,
                color: MIDNIGHT_INK,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {hasNextCard ? (
                <>Nästa samtal <ArrowRight size={16} style={{ opacity: 0.7 }} /></>
              ) : (
                `Tillbaka till ${categoryName}`
              )}
            </button>

            {/* 5. Secondary link — only when primary = "Nästa samtal" */}
            {hasNextCard && (
              <button
                onClick={() => navigateWithFeedback(categoryDest)}
                style={{
                  display: 'block',
                  width: '100%',
                  marginTop: '16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  fontSize: '14px',
                  fontWeight: 400,
                  color: DRIFTWOOD,
                  textAlign: 'center',
                }}
              >
                Tillbaka till {categoryName}
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'completion' — Still Us — takeaway ritual
  // ─────────────────────────────────────────────────────────────
  if (cardViewMode === 'completion') {
    // Still Us completion: Ember Night bg, fixed headline, Ember Glow takeaway
    const EMBER_NIGHT = '#2E2233';
    const DEEP_SAFFRON = '#D4A03A';
    const DRIFTWOOD = '#6B5E52';
    const MIDNIGHT_INK = '#1A1A2E';
    const BARK = '#2C2420';
    const EMBER_GLOW = '#F5E8CC';
    const categoryName = category?.title ?? 'kategorin';
    const homeDest = postCompletionNav.homeDest;

    return (
      <motion.div
        className="min-h-screen"
        style={{ backgroundColor: EMBER_NIGHT }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Header title="" variant="immersive" />
        <div className="px-6 pb-16 relative" style={{ paddingTop: '48px' }}>
          {/* Back arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_3, duration: EMOTION }}
            style={{ position: 'absolute', top: '12px', left: '0px', zIndex: 2 }}
          >
            <button
              onClick={() => {
                _setShowCompletion(false);
                const lastStageIndex = effectiveSteps.length - 1;
                const lastSection = card.sections.find(s => s.type === effectiveSteps[lastStageIndex]);
                const lastPromptCount = getEffectivePromptCount(lastSection);
                setLocalStepIndex(lastStageIndex);
                setLocalPromptIndex(lastPromptCount - 1);
              }}
              aria-label="Tillbaka till sista steget"
              style={{
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px',
              }}
            >
              <ArrowLeft size={20} style={{ color: DRIFTWOOD, opacity: 0.50 }} />
            </button>
          </motion.div>

          <div style={{ height: '24px' }} />

          {/* 1. Fixed headline */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-md mx-auto"
            style={{ marginBottom: '32px' }}
          >
            <h2
              className="font-serif"
              style={{
                fontSize: '26px',
                fontWeight: 600,
                color: DEEP_SAFFRON,
                textAlign: 'center',
                lineHeight: 1.2,
                textWrap: 'balance',
              }}
            >
              Varje samtal är ett val. Ni valde rätt.
            </h2>
          </motion.div>

          {/* 2. Note nudge — "Något ni vill minnas?" → Ember Glow input */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mx-auto"
            style={{ width: '100%' }}
          >
            <p
              className="font-sans"
              style={{
                fontSize: '14px',
                color: DRIFTWOOD,
                textAlign: 'center',
                marginBottom: '12px',
              }}
            >
              Något ni vill minnas?
            </p>
            <SimpleTakeaway sessionId={activeSessionId} spaceId={space?.id ?? null} cardId={cardId} productId={product?.id} stillUsMode />
          </motion.div>

          {/* Privacy */}
          <motion.p
            className="font-sans"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: '12px',
              fontStyle: 'italic',
              color: DRIFTWOOD,
              opacity: 0.55,
              textAlign: 'center',
              marginTop: '10px',
            }}
          >
            Inget ni skriver lämnar det här rummet.
          </motion.p>

          {/* 3–5. CTAs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-md mx-auto flex flex-col items-center"
            style={{ paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', marginTop: '48px' }}
          >
            {postCompletionNav.type === 'all_complete' ? (
              /* All done — go home */
              <button
                onClick={() => navigateWithFeedback(homeDest)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: '520px',
                  height: '52px',
                  borderRadius: '14px',
                  backgroundColor: DEEP_SAFFRON,
                  color: MIDNIGHT_INK,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '17px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Tillbaka till Ert utrymme
              </button>
            ) : (
              <>
                {/* Primary: Nästa samtal → */}
                <button
                  onClick={() => navigateWithFeedback(postCompletionNav.destination)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    maxWidth: '520px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: DEEP_SAFFRON,
                    color: MIDNIGHT_INK,
                    fontFamily: 'var(--font-sans)',
                    fontSize: '17px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Nästa samtal <ArrowRight size={16} style={{ opacity: 0.7 }} />
                </button>

                {/* 4. Secondary: Tillbaka till [Cat] */}
                <button
                  onClick={() => navigateWithFeedback(homeDest)}
                  className="font-sans"
                  style={{
                    fontSize: '14px',
                    color: DRIFTWOOD,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '16px',
                    textAlign: 'center',
                  }}
                >
                  Tillbaka till {categoryName}
                </button>
              </>
            )}

            {/* 5. Journal link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: EMOTION }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <button
                onClick={() => navigateWithFeedback('/shared')}
                className="font-sans"
                style={{
                  fontSize: '13px',
                  color: DRIFTWOOD,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  marginTop: '24px',
                  opacity: 0.5,
                }}
              >
                Se alla era anteckningar
              </button>
            </motion.div>
          </motion.div>

          {activeSessionId && space && (
            <FeedbackSheet
              sessionId={activeSessionId}
              coupleSpaceId={space.id}
              show={showFeedback}
              onDismiss={handleFeedbackDismissWithNav}
            />
          )}
        </div>
      </motion.div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: 'live' | 'archive' — conversation surface
  // ─────────────────────────────────────────────────────────────
  const rawSection = card.sections.find(s => s.type === effectiveSteps[currentStepIndex]);
  const resolvedFlatEntry = flatPromptMap?.[localPromptIndex];
  const currentSection = resolvedFlatEntry?.section ?? rawSection;
  const resolvedPromptIndex = resolvedFlatEntry ? resolvedFlatEntry.promptIndexInSection : localPromptIndex;
  const currentStageType = currentSection?.type ?? effectiveSteps[currentStepIndex];
  const isReflectionStep = currentStageType === 'opening' || currentStageType === 'reflective';
  const isLive = cardViewMode === 'live';
  const isExerciseStep = currentStageType === 'exercise';
  const isStillUsFocusMode = isLive && (product?.id === 'still_us' || isStillUsCard);

  // ─── Session start screen — ritual before first question ───
  const shouldShowStartScreen = showStartScreen && isLive;

  // ── Kids product intro screen — product-colored, illustration-forward ──
  if (shouldShowStartScreen && isKidsProduct && product) {
    const MIDNIGHT_INK = '#1A1A2E';
    const LANTERN_GLOW = '#FDF6E3';
    const DRIFTWOOD = '#6B5E52';
    const BONKI_ORANGE = '#E85D2C';
    const SAFFRON = '#E9B44C';

    const PRODUCT_TILE_COLOR: Record<string, string> = {
      jag_i_mig: '#657514',
      jag_med_andra: '#8B2FC6',
      jag_i_varlden: '#2D6E3A',
      vardagskort: '#0E6B99',
      syskonkort: '#247A78',
      sexualitetskort: '#A3434B',
    };
    const tileBg = PRODUCT_TILE_COLOR[product.id] ?? '#657514';

    const questionHook = card.questionHook ?? QUESTION_HOOKS[card.id];
    const totalPrompts = card.sections.reduce((sum, s) => sum + (s.prompts?.length ?? 1), 0);
    const minMinutes = Math.max(5, Math.floor(totalPrompts * 1.5));
    const maxMinutes = Math.min(minMinutes + 5, Math.ceil(totalPrompts * 2.5));
    const timeEstimate = `${minMinutes}–${maxMinutes} min`;

    return (
      <motion.div
        key="start-screen-kids"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: tileBg,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 50,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
      >
        {/* Back arrow */}
        <motion.button
          onClick={() => navigate(category ? `/category/${category.id}` : `/product/${product.slug}`)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_1, duration: EMOTION }}
          aria-label="Tillbaka"
          style={{
            position: 'absolute',
            top: 'calc(env(safe-area-inset-top, 0px) + 16px)',
            left: '16px',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 2,
            padding: '12px',
          }}
        >
          <ArrowLeft size={20} style={{ color: LANTERN_GLOW }} />
        </motion.button>

        {/* Illustration */}
        <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 56px)', paddingLeft: '24px', paddingRight: '24px' }}>
          {cardImageUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '100%',
                maxHeight: '40vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={cardImageUrl}
                alt={card.title}
                style={{
                  maxWidth: '100%',
                  maxHeight: '40vh',
                  objectFit: 'contain',
                  clipPath: 'inset(4% 0 0 0)',
                  marginTop: '-3%',
                }}
              />
            </motion.div>
          ) : (
            <div style={{ height: '40vh' }} />
          )}
        </div>

        {/* Bottom zone */}
        <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 24px', paddingBottom: 'calc(32px + env(safe-area-inset-bottom, 0px))' }}>
          {/* Card label */}
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: BEAT_1, duration: 0.6, ease: [...EASE] }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: LANTERN_GLOW,
              textAlign: 'center',
              marginBottom: '8px',
            }}
          >
            {card.title}
          </motion.p>

          {/* Question hook */}
          {questionHook && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BEAT_1 + 0.1, duration: 0.6, ease: [...EASE] }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                fontWeight: 400,
                color: SAFFRON,
                textAlign: 'center',
                lineHeight: 1.4,
                maxWidth: '90%',
              }}
            >
              {questionHook}
            </motion.p>
          )}

          {/* Practical info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_2, duration: 0.5 }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              fontWeight: 400,
              color: DRIFTWOOD,
              textAlign: 'center',
              marginTop: '12px',
              marginBottom: '32px',
            }}
          >
            Läs frågorna högt tillsammans · {timeEstimate}
          </motion.p>

          {/* Stale session banner */}
          {staleSession && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: EMOTION, ease: [...EASE] }}
              style={{
                width: '100%',
                maxWidth: '360px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: LANTERN_GLOW, marginBottom: '12px', lineHeight: 1.5 }}>
                {uiText.stalePrompt}
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => { setStaleSession(false); setShowStartScreen(false); }}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: '13px', padding: '8px 16px',
                    background: 'none', border: `1px solid ${DRIFTWOOD}`, borderRadius: '8px',
                    cursor: 'pointer', color: LANTERN_GLOW,
                  }}
                >
                  Fortsätt
                </button>
                <button
                  onClick={handleAbandonAndRestart}
                  style={{
                    fontFamily: 'var(--font-sans)', fontSize: '13px', padding: '8px 16px',
                    background: LANTERN_GLOW, color: MIDNIGHT_INK, border: 'none',
                    borderRadius: '8px', cursor: 'pointer',
                  }}
                >
                  Börja om
                </button>
              </div>
            </motion.div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [...EASE] }}
            style={{ width: '100%', maxWidth: '360px' }}
          >
            <button
              onClick={() => setShowStartScreen(false)}
              style={{
                width: '100%',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: BONKI_ORANGE,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '17px',
                fontWeight: 600,
                color: MIDNIGHT_INK,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 150ms ease',
              }}
              onPointerDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
              onPointerUp={(e) => { e.currentTarget.style.transform = ''; }}
              onPointerLeave={(e) => { e.currentTarget.style.transform = ''; }}
            >
              Vi börjar
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ── Still Us threshold screen — single unified gate ──
  if (shouldShowStartScreen) {
    const EMBER_NIGHT_T = '#2E2233';
    const LANTERN_GLOW_T = '#FDF6E3';
    const DRIFTWOOD_T = '#6B5E52';
    const MIDNIGHT_INK_T = '#1A1A2E';
    const BONKI_ORANGE_T = '#E85D2C';

    const hookText = card.questionHook ?? card.subtitle ?? '';
    const totalPrompts = card.sections.reduce((sum, s) => sum + (s.prompts?.length ?? 1), 0);
    const minMinutes = Math.max(5, Math.floor(totalPrompts * 1.5));
    const maxMinutes = Math.min(minMinutes + 5, Math.ceil(totalPrompts * 2.5));

    return (
      <motion.div
        key="threshold-screen"
        className="flex flex-col"
        style={{
          backgroundColor: EMBER_NIGHT_T,
          position: 'relative',
          overflow: 'hidden',
          height: '100dvh',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: EMOTION, ease: [...EASE] }}
      >
        {/* Back arrow — Lantern Glow */}
        <motion.button
          onClick={() => navigate(category ? `/category/${category.id}` : '/')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: BEAT_2, duration: EMOTION }}
          aria-label="Tillbaka"
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            minHeight: '44px',
            minWidth: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 2,
            padding: '12px',
          }}
        >
          <ArrowLeft size={20} style={{ color: LANTERN_GLOW_T, opacity: 0.60 }} />
        </motion.button>

        {/* Centered content */}
        <div style={{
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px',
          gap: '0',
        }}>
          {/* 1. Category */}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_1, duration: EMOTION, ease: [...EASE] }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: DRIFTWOOD_T,
              marginBottom: '10px',
            }}
          >
            {category?.title}
          </motion.span>

          {/* 2. Card name */}
          <motion.h1
            className="font-serif"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: BEAT_1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: '28px',
              fontWeight: 600,
              color: LANTERN_GLOW_T,
              textAlign: 'center',
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
            }}
          >
            {card.title}
          </motion.h1>

          {/* 3. Hook */}
          {hookText && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: BEAT_1 + 0.1, duration: EMOTION, ease: [...EASE] }}
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '16px',
                color: LANTERN_GLOW_T,
                opacity: 0.70,
                textAlign: 'center',
                marginTop: '12px',
                lineHeight: 1.45,
                maxWidth: '320px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {hookText}
            </motion.p>
          )}

          {/* 4. Info line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_2, duration: 0.5 }}
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              color: DRIFTWOOD_T,
              textAlign: 'center',
              marginTop: '16px',
            }}
          >
            Cirka {minMinutes}–{maxMinutes} min · Läs frågorna högt
          </motion.p>

          {/* 5. Privacy */}
          <motion.p
            className="font-serif"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_2 + 0.1, duration: EMOTION, ease: [...EASE] }}
            style={{
              fontSize: '12px',
              fontStyle: 'italic',
              color: DRIFTWOOD_T,
              textAlign: 'center',
              marginTop: '12px',
              opacity: 0.7,
            }}
          >
            Inget av det ni delar lämnar det här rummet.
          </motion.p>
        </div>

        {/* Bottom zone: stale banner + CTA */}
        <div style={{
          flex: '0 0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '0 24px',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}>
          {/* Orphan/stale session banner */}
          {staleSession && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: EMOTION, ease: [...EASE] }}
              style={{
                width: '100%',
                maxWidth: '360px',
                background: 'hsla(276, 20%, 25%, 0.6)',
                border: '1px solid hsla(276, 15%, 40%, 0.3)',
                borderRadius: '10px',
                padding: '16px 20px',
                marginBottom: '20px',
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                color: LANTERN_GLOW_T,
                marginBottom: '12px',
                lineHeight: 1.5,
                opacity: 0.8,
              }}>
                {uiText.stalePrompt}
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button
                  onClick={() => { setStaleSession(false); setShowStartScreen(false); }}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    padding: '8px 16px',
                    background: 'none',
                    border: `1px solid ${DRIFTWOOD_T}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: LANTERN_GLOW_T,
                  }}
                >
                  Fortsätt
                </button>
                <button
                  onClick={handleAbandonAndRestart}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    padding: '8px 16px',
                    background: LANTERN_GLOW_T,
                    color: EMBER_NIGHT_T,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Börja om
                </button>
              </div>
            </motion.div>
          )}

          {/* 6. CTA — Bonki Orange */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: '4px', width: '100%', display: 'flex', justifyContent: 'center' }}
          >
            <button
              onClick={() => setShowStartScreen(false)}
              style={{
                width: '100%',
                maxWidth: '520px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: BONKI_ORANGE_T,
                color: MIDNIGHT_INK_T,
                fontFamily: 'var(--font-sans)',
                fontSize: '17px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Vi är redo
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const exitBackTo = isFromArchive ? '/shared' : (category ? `/category/${category.id}` : '/');

  const handleSessionExit = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => navigate(exitBackTo), 300);
  };

  // ─────────────────────────────────────────────────────────────
  //  MODE: Still Us Focus — immersive, no chrome
  // ─────────────────────────────────────────────────────────────
  if (isStillUsFocusMode && currentSection) {
    const sectionPromptCount = getEffectivePromptCount(currentSection);
    const isLastPromptInStage = localPromptIndex >= sectionPromptCount - 1;
    const isLastStage = currentStepIndex >= effectiveSteps.length - 1;
    const currentStageKey = effectiveSteps[currentStepIndex];

    // Progress bar: fraction within current step
    const progressFraction = sectionPromptCount > 0
      ? (localPromptIndex + 1) / sectionPromptCount
      : 0;

    // CTA labels per step transition
    const getStillUsCtaLabel = (): string => {
      if (!isLastPromptInStage) return 'Fortsätt';
      switch (currentStageKey) {
        case 'opening': return 'Vänd perspektivet →';
        case 'reflective': return 'Tänk om... →';
        case 'scenario': return 'Gör något tillsammans →';
        default: return 'Vi är klara.';
      }
    };

    // Note trigger: after step 2 (scenario+), show pencil only
    const isAfterStep2 = currentStepIndex >= 2;

    const handleFocusAdvance = async () => {
      if (isLastPromptInStage) {
        await handleCompleteStep();
      } else {
        setLocalPromptIndex(localPromptIndex + 1);
      }
    };

    const handleFocusBack = () => {
      if (localPromptIndex > 0) {
        setLocalPromptIndex(localPromptIndex - 1);
      } else if (currentStepIndex > 0) {
        const prevStageIndex = currentStepIndex - 1;
        const prevSection = card.sections.find(
          s => s.type === effectiveSteps[prevStageIndex]
        );
        const prevPromptCount = getEffectivePromptCount(prevSection);
        setLocalStepIndex(prevStageIndex);
        setLocalPromptIndex(prevPromptCount - 1);
      } else {
        setShowLeaveConfirm(true);
      }
    };

    const MIDNIGHT_INK_LOCAL = '#1A1A2E';
    const LANTERN_GLOW_LOCAL = '#FDF6E3';
    const DEEP_SAFFRON_LOCAL = '#D4A03A';

    return (
      <>
        {_devDebug}
        <SessionFocusShell
          key={`focus-${currentStepIndex}-${localPromptIndex}`}
          onExit={() => setShowLeaveConfirm(true)}
          onPause={() => navigate('/')}
          showExitDialog={showLeaveConfirm}
          onExitDialogClose={() => setShowLeaveConfirm(false)}
          onExitConfirm={() => navigate(exitBackTo)}
          topSlot={
            <div style={{
              width: '100%',
              backgroundColor: MIDNIGHT_INK_LOCAL,
              paddingTop: 'env(safe-area-inset-top, 0px)',
            }}>
              {/* Nav bar — 52px */}
              <div style={{
                height: '52px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                paddingLeft: '48px',
                paddingRight: '48px',
              }}>
                {/* Back arrow */}
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  aria-label="Tillbaka"
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <ArrowLeft
                    size={18}
                    strokeWidth={1.8}
                    style={{ color: LANTERN_GLOW_LOCAL, opacity: 0.5 }}
                  />
                </button>

                {/* Card name */}
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '13px',
                  color: LANTERN_GLOW_LOCAL,
                  opacity: 0.85,
                  textAlign: 'center',
                  lineHeight: 1.2,
                  marginBottom: '4px',
                }}>
                  {card?.title}
                </span>

                {/* Step labels */}
                <StepProgressIndicator
                  currentStepIndex={currentStepIndex}
                  completedSteps={Array.from({ length: currentStepIndex }, (_, i) => i)}
                  isTransitioning={showInterstitial}
                  steps={dynamicSteps}
                  stillUsMode={true}
                />
              </div>

              {/* Progress bar — full width, 2px */}
              <div style={{
                width: '100%',
                height: '2px',
                backgroundColor: 'rgba(255,255,255,0.08)',
              }}>
                <motion.div
                  initial={false}
                  animate={{ width: `${progressFraction * 100}%` }}
                  transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    height: '100%',
                    backgroundColor: DEEP_SAFFRON_LOCAL,
                  }}
                />
              </div>
            </div>
          }
          ctaSlot={
            <SessionStepReflection
              key={`${currentStepIndex}-${localPromptIndex}`}
              sessionId={normalizedSession.sessionId}
              stepIndex={currentStepIndex}
              promptIndex={localPromptIndex}
              isLastStep={isLastStage && isLastPromptInStage}
              isFirstVisit={false}
              isReflectionStep={isReflectionStep}
              isExerciseStep={isExerciseStep}
              hideNoteField={false}
              stillUsMode={true}
              ctaLabel={getStillUsCtaLabel()}
              pauseLabel="Pausa för idag"
              compactNoteTrigger={isAfterStep2}
              onPause={() => navigate('/')}
              onLocked={handleFocusAdvance}
              onBack={handleFocusBack}
            />
          }
        >
          {/* Centered question — crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`focus-q-${currentSection.id}-${localPromptIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.15 }}
              className="w-full text-center"
            >
              <SectionView
                ref={sectionViewRef}
                section={currentSection}
                card={card}
                promptIndex={localPromptIndex}
                coupleSpaceId={space?.id ?? null}
                sessionId={normalizedSession.sessionId ?? null}
                cardId={cardId ?? null}
                stageIndex={currentStepIndex}
                isLive={true}
                isReflectionStep={isReflectionStep}
                isExerciseStep={isExerciseStep}
                showBackArrow={false}
                stillUsMode={true}
              />
            </motion.div>
          </AnimatePresence>
        </SessionFocusShell>

        {/* GÖR TILLSAMMANS one-time overlay */}
        <AnimatePresence>
          {showGorTillsammans && (
            <GorTillsammansOverlay onDismiss={() => setShowGorTillsammans(false)} />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  MODE: Kids product live session — the warm clearing
  // ─────────────────────────────────────────────────────────────
  if (isKidsProduct && isLive && currentSection) {
    const LANTERN_GLOW = '#FDF6E3';
    const MIDNIGHT_INK = '#1A1A2E';
    const SAFFRON = '#E9B44C';
    const PARCHMENT = '#F5EDD2';
    const BARK = '#2C2420';
    const DRIFTWOOD = '#6B5E52';

    const totalPrompts = flatPromptMap ? totalFlatPrompts : getEffectivePromptCount(currentSection);
    const progressFraction = totalPrompts > 0 ? (localPromptIndex + 1) / totalPrompts : 0;
    const isLastPrompt = localPromptIndex >= totalPrompts - 1;

    // Extract current question text
    const rawPrompts = currentSection.prompts?.length
      ? currentSection.prompts
      : (currentSection.content ? [currentSection.content] : ['']);
    const currentPromptRaw = rawPrompts[resolvedPromptIndex] ?? rawPrompts[0];
    const questionText = typeof currentPromptRaw === 'string'
      ? currentPromptRaw
      : (currentPromptRaw as any)?.text ?? '';

    const handleKidsAdvance = async () => {
      if (isLastPrompt) {
        await handleCompleteStep();
      } else {
        setLocalPromptIndex(localPromptIndex + 1);
      }
    };

    // Note nudge: show full text for first 2 prompts, then just icon unless interacted
    const showFullNudge = localPromptIndex <= 1 || kidsNoteInteractedRef.current;

    return (
      <>
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: LANTERN_GLOW,
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
        }}>
          {/* ── Header bar ── */}
          <div style={{
            flex: '0 0 auto',
            height: '56px',
            marginTop: 'env(safe-area-inset-top, 0px)',
            backgroundColor: MIDNIGHT_INK,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: '16px',
            paddingRight: '4px',
          }}>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '15px',
              fontWeight: 400,
              color: LANTERN_GLOW,
            }}>
              {card.title}
            </span>
            <button
              onClick={() => setShowLeaveConfirm(true)}
              aria-label="Stäng"
              style={{
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={20} style={{ color: LANTERN_GLOW }} />
            </button>
          </div>

          {/* ── Progress bar ── */}
          <div style={{
            width: '100%',
            height: '3px',
            backgroundColor: PARCHMENT,
          }}>
            <div style={{
              width: `${progressFraction * 100}%`,
              height: '100%',
              backgroundColor: SAFFRON,
              transition: 'width 300ms ease',
            }} />
          </div>

          {/* ── Content area ── */}
          <div style={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Creature companion — 48px circle */}
            {cardImageUrl && (
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 2,
                flexShrink: 0,
              }}>
                <img
                  src={cardImageUrl}
                  alt=""
                  draggable={false}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* Question text — centered and dominant */}
            <div style={{
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 24px 0',
            }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={`kids-q-${localPromptIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                  className="font-serif"
                  style={{
                    fontSize: '24px',
                    fontWeight: 600,
                    color: BARK,
                    textAlign: 'center',
                    lineHeight: 1.35,
                    maxWidth: 'calc(100vw - 48px)',
                    textWrap: 'balance',
                  }}
                >
                  {questionText}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Note nudge — near bottom of content area */}
            <div style={{
              flex: '0 0 auto',
              padding: '0 24px',
              marginBottom: '16px',
            }}>
              {!kidsNoteExpanded ? (
                <button
                  onClick={() => {
                    setKidsNoteExpanded(true);
                    kidsNoteInteractedRef.current = true;
                    setTimeout(() => kidsNoteTextareaRef.current?.focus(), 150);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    width: '100%',
                    padding: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Pencil size={showFullNudge ? 14 : 12} style={{ color: DRIFTWOOD, opacity: 0.6 }} />
                  {showFullNudge && (
                    <span style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '14px',
                      fontWeight: 400,
                      color: DRIFTWOOD,
                    }}>
                      Skriv något ni vill minnas
                    </span>
                  )}
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '12px',
                    fontStyle: 'italic',
                    color: DRIFTWOOD,
                    textAlign: 'center',
                    marginBottom: '8px',
                  }}>
                    Inget du skriver lämnar det här rummet.
                  </p>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      ref={kidsNoteTextareaRef}
                      value={kidsNoteLocalText}
                      onChange={(e) => {
                        setKidsNoteLocalText(e.target.value);
                        kidsNoteSession.setText(e.target.value);
                      }}
                      placeholder="Skriv här…"
                      autoCorrect="on"
                      autoCapitalize="sentences"
                      className="w-full resize-none focus:outline-none focus:ring-0"
                      style={{
                        minHeight: '72px',
                        maxHeight: '120px',
                        fontFamily: 'var(--font-serif)',
                        fontSize: '15px',
                        lineHeight: 1.6,
                        color: BARK,
                        backgroundColor: PARCHMENT,
                        border: 'none',
                        borderRadius: '12px',
                        padding: '16px',
                        overflow: 'auto',
                      }}
                    />
                    <button
                      onClick={() => setKidsNoteExpanded(false)}
                      aria-label="Stäng anteckning"
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      <ChevronDown size={16} style={{ color: DRIFTWOOD, opacity: 0.5 }} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── Advance button — fixed at bottom ── */}
          <div style={{
            flex: '0 0 auto',
            padding: '0 24px',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          }}>
            <motion.button
              onClick={handleKidsAdvance}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%',
                height: '56px',
                borderRadius: '14px',
                backgroundColor: SAFFRON,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                fontSize: '17px',
                fontWeight: 600,
                color: MIDNIGHT_INK,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isLastPrompt ? 'Avsluta samtalet' : 'Fortsätt'}
            </motion.button>
          </div>
        </div>

        {/* ── Exit confirmation dialog ── */}
        <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
          <AlertDialogContent style={{
            backgroundColor: PARCHMENT,
            borderRadius: '16px',
            border: 'none',
          }}>
            <AlertDialogHeader>
              <AlertDialogTitle style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '18px',
                color: BARK,
              }}>
                Vill du avsluta samtalet?
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter style={{ marginTop: '16px' }}>
              <AlertDialogCancel style={{
                color: BARK,
                borderColor: DRIFTWOOD + '40',
              }}>
                Nej, fortsätt
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => navigate(exitBackTo)}
                style={{
                  backgroundColor: BARK,
                  color: PARCHMENT,
                }}
              >
                Ja, avsluta
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <>
    {_devDebug}
    <motion.div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--surface-base)',
        backgroundImage: pronounMode === 'du' ? 'var(--kids-bg-glow, none)' : 'none',
        transition: 'background-color 0.6s ease',
      }}
      initial={
        suppressEntryAnim
          ? { opacity: 0 }
          : isLive
            ? { opacity: 0, scale: 0.97 }
            : false
      }
      animate={isExiting ? { opacity: 0, scale: 0.97 } : { opacity: 1, scale: 1 }}
      transition={
        isExiting
          ? { duration: PAGE, ease: [...EASE] }
          : suppressEntryAnim
            ? { duration: PRESS, ease: [...EASE] }
            : { duration: PAGE, ease: [...EASE] }
      }
    >
      <StageInterstitial visible={showInterstitial} />
      <Header
        title={card?.title ?? category?.title}
        showBack
        backTo={exitBackTo}
        variant="immersive"
        isDarkSurface={isReflectionStep || currentStageType === 'scenario' || isExerciseStep}
        onImmersiveBack={isLive ? undefined : () => navigate(exitBackTo)}
        onLeaveSession={isLive ? () => { toast('Samtalet sparas – ni kan fortsätta när ni vill', { duration: 3000 }); navigate(exitBackTo); } : undefined}
      />

      {/* Floating illustration peek — kids/family products only */}
      {!showStartScreen && cardImageUrl && card && product?.id !== 'still_us' && (isLive || devState === 'browse') && (
        <IllustrationPeek imageUrl={cardImageUrl} cardTitle={card.title} />
      )}


      {isLive && effectiveSteps.length > 1 && isStillUsCard && (
        <motion.div
          style={{ paddingTop: '12px', marginTop: '12px' }}
          initial={!suppressEntryAnim ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={{ delay: !suppressEntryAnim ? BEAT_1 : 0, duration: BEAT_3, ease: EASE }}
        >
          <StepProgressIndicator
            currentStepIndex={currentStepIndex}
            completedSteps={Array.from({ length: currentStepIndex }, (_, i) => i)}
            isTransitioning={showInterstitial}
            steps={dynamicSteps}
            currentPromptIndex={localPromptIndex}
            totalPromptsInStep={getEffectivePromptCount(currentSection)}
          />
        </motion.div>
      )}

      {/* Section content — centered, max 520px for readability */}
      <div className="px-6 relative" style={{ paddingTop: '8px', paddingBottom: 'calc(140px + env(safe-area-inset-bottom, 0px))' }}>
        {/* Single illustration is rendered inside PromptItem — no corner watermark */}
        <div className="max-w-[520px] mx-auto relative" style={{ zIndex: 1 }}>
        <AnimatePresence mode="wait">
          {!currentSection && (
            <motion.div
              key="question-skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.15, delay: 0.1 }}
              className="py-12"
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  style={{
                    width: '80%',
                    height: '20px',
                    backgroundColor: 'hsl(var(--neutral-300) / 0.6)',
                    borderRadius: '4px',
                    animation: 'skeletonPulse 2s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    width: '60%',
                    height: '20px',
                    backgroundColor: 'hsl(var(--neutral-300) / 0.6)',
                    borderRadius: '4px',
                    animation: 'skeletonPulse 2s ease-in-out infinite',
                    animationDelay: '0.3s',
                  }}
                />
              </div>
            </motion.div>
          )}
          {currentSection && (
            <motion.div
              key={`${currentSection.id}-${localPromptIndex}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.15, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
            >
              {/* Stage label — archive mode only, multi-step cards only */}
              {cardViewMode === 'archive' && effectiveSteps.length > 1 && (() => {
                const isKidsProduct = product && product.id !== 'still_us';
                const STAGE_LABELS: Record<number, string> = isKidsProduct
                  ? { 0: 'FRÅGOR', 1: 'I VERKLIGHETEN' }
                  : { 0: 'KOM IGÅNG', 1: 'GÅ DJUPARE', 2: 'FÖRESTÄLL ER', 3: 'I VERKLIGHETEN' };
                const label = STAGE_LABELS[currentStepIndex];
                if (!label) return null;
                  return (
                  <p style={{
                    fontSize: '10px',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-tertiary)',
                    opacity: 0.45,
                    textAlign: 'center',
                    marginBottom: '8px',
                    marginTop: '8px',
                  }}>
                    {label}
                  </p>
                );
              })()}

              {/* Question counter — kids products and 1-step Still Us cards */}
              {isLive && currentSection && (() => {
                // Kids products: unified counter across all sections
                if (isKidsProduct) {
                  const totalPrompts = flatPromptMap ? totalFlatPrompts : getEffectivePromptCount(currentSection);
                  if (totalPrompts <= 1) return null;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: BEAT_1, duration: EMOTION, ease: [...EASE] }}
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        marginTop: '40px',
                        marginBottom: '0px',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '11px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          color: 'var(--kids-counter-color, var(--text-tertiary))',
                          background: 'var(--kids-counter-bg, transparent)',
                          border: '1px solid var(--kids-counter-border, transparent)',
                          borderRadius: '20px',
                          padding: '5px 14px 5px 10px',
                        }}
                      >
                        <span style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--kids-counter-color, var(--text-tertiary))',
                          opacity: 0.6,
                        }} />
                        {localPromptIndex + 1} av {totalPrompts}
                      </span>
                    </motion.div>
                  );
                }

                // Still Us 1-step fallback
                if (effectiveSteps.length === 1) {
                  const totalPrompts = getEffectivePromptCount(currentSection);
                  if (totalPrompts <= 1) return null;
                  return (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: BEAT_1, duration: EMOTION, ease: [...EASE] }}
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '11px',
                        letterSpacing: '0.04em',
                        color: 'var(--text-tertiary)',
                        opacity: 0.4,
                        textAlign: 'center',
                        width: '100%',
                        marginTop: '40px',
                        marginBottom: '0px',
                      }}
                    >
                      Fråga {localPromptIndex + 1} av {totalPrompts}
                    </motion.p>
                  );
                }

                return null;
              })()}

              {/* ── Ritual hint ABOVE prompt for scenario steps (live only, not kids) ── */}
              {isLive && pronounMode !== 'du' && (() => {
                const stageKey = effectiveSteps[currentStepIndex];
                if (stageKey !== 'scenario') return null;
                const hint = uiText.ritualHints[stageKey as keyof typeof uiText.ritualHints];
                if (!hint) return null;
                return (
                  <div style={{ marginTop: '0', marginBottom: '16px' }} className="text-center">
                    <p
                      className="font-serif italic"
                      style={{ fontSize: '14px', color: 'var(--accent-text)', opacity: 0.60, lineHeight: 1.5 }}
                    >
                      {isTogether ? hint.together : hint.solo}
                    </p>
                  </div>
                );
              })()}

              {/* Prompt content */}
              <motion.div
                initial={isLive && !suppressEntryAnim ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ delay: isLive && !suppressEntryAnim ? BEAT_1 : 0, duration: BEAT_3, ease: EASE }}
              >
                <SectionView
                  ref={sectionViewRef}
                  section={currentSection}
                  card={card}
                  isRevisitMode={cardViewMode === 'archive'}
                  initialFocusNoteIndex={null}
                  focusPromptIndex={null}
                  disableShare={isActiveSession}
                  promptIndex={isLive ? resolvedPromptIndex : undefined}
                  coupleSpaceId={space?.id ?? null}
                  sessionId={normalizedSession.sessionId ?? null}
                  cardId={cardId ?? null}
                  stageIndex={currentStepIndex}
                  isLive={isLive}
                  isReflectionStep={isReflectionStep}
                  isExerciseStep={isExerciseStep}
                  backgroundImageUrl={pronounMode === 'du' ? cardImageUrl : null}
                  showBackArrow={isLive && (!(currentStepIndex === 0 && localPromptIndex === 0) || (!!product && product.id !== 'still_us'))}
                  onBack={isLive ? (() => {
                    if (localPromptIndex > 0) {
                      setLocalPromptIndex(localPromptIndex - 1);
                    } else if (currentStepIndex > 0) {
                      const prevStageIndex = currentStepIndex - 1;
                      const prevSection = card.sections.find(
                        s => s.type === effectiveSteps[prevStageIndex]
                      );
                      const prevPromptCount = getEffectivePromptCount(prevSection);
                      setLocalStepIndex(prevStageIndex);
                      setLocalPromptIndex(prevPromptCount - 1);
                    } else {
                      // First question — navigate back to category/product
                      navigate(exitBackTo);
                    }
                  }) : undefined}
                />
              </motion.div>

              {/* ── Ritual hint BELOW prompt for non-scenario steps (live only, not kids) ── */}
              {isLive && pronounMode !== 'du' && (() => {
                const stageKey = effectiveSteps[currentStepIndex];
                if (stageKey === 'scenario') return null; // already shown above
                const hint = uiText.ritualHints[stageKey as keyof typeof uiText.ritualHints];
                if (!hint) return null;
                return (
                  <div style={{ marginTop: '16px', marginBottom: '0' }} className="text-center">
                    <p
                      className="font-serif italic"
                      style={{ fontSize: '14px', color: 'var(--accent-text)', opacity: 0.60, lineHeight: 1.5 }}
                    >
                      {isTogether ? hint.together : hint.solo}
                    </p>
                  </div>
                );
              })()}

              {/* ── Scenario bottom encouragement (live only, not kids) ── */}
              {isLive && pronounMode !== 'du' && effectiveSteps[currentStepIndex] === 'scenario' && (() => {
                const bottomHint = uiText.ritualHints['scenarioBottom' as keyof typeof uiText.ritualHints];
                if (!bottomHint) return null;
                return (
                  <div style={{ marginTop: '16px', marginBottom: '0' }} className="text-center">
                    <p
                      className="font-serif italic"
                      style={{ fontSize: '14px', color: 'var(--accent-text)', opacity: 0.50, lineHeight: 1.5 }}
                    >
                      {isTogether ? bottomHint.together : bottomHint.solo}
                    </p>
                  </div>
                );
              })()}

              {/* ── MODE: live — session reflection (single writer) ── */}
              {isLive && cardId && (() => {
                const sectionPromptCount = flatPromptMap ? totalFlatPrompts : getEffectivePromptCount(currentSection);
                const isLastPromptInStage = localPromptIndex >= sectionPromptCount - 1;
                const isLastStage = currentStepIndex >= effectiveSteps.length - 1;

                return (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: BEAT_2, duration: BEAT_3, ease: EASE }}
                    style={isKidsProduct ? {
                      position: 'fixed',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      zIndex: 20,
                      background: 'linear-gradient(to top, var(--surface-base) 70%, hsla(var(--background) / 0.85) 90%, transparent)',
                      paddingTop: '20px',
                      paddingLeft: '24px',
                      paddingRight: '24px',
                      paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))',
                    } : undefined}
                  >
                    <SessionStepReflection
                      key={`${currentStepIndex}-${localPromptIndex}`}
                      sessionId={normalizedSession.sessionId}
                      stepIndex={currentStepIndex}
                      promptIndex={localPromptIndex}
                      isLastStep={isLastStage && isLastPromptInStage}
                      isFirstVisit={false}
                      isReflectionStep={isReflectionStep}
                      isExerciseStep={isExerciseStep}
                      hideNoteField={false}
                      noteFieldLabel={isKidsProduct ? 'Skriv något ni vill minnas' : undefined}
                      onLocked={async () => {
                        if (isLastPromptInStage) {
                          await handleCompleteStep();
                        } else {
                          setLocalPromptIndex(localPromptIndex + 1);
                        }
                      }}
                      onBack={() => {
                        if (localPromptIndex > 0) {
                          setLocalPromptIndex(localPromptIndex - 1);
                        } else if (currentStepIndex > 0) {
                          const prevStageIndex = currentStepIndex - 1;
                          const prevSection = card.sections.find(
                            s => s.type === effectiveSteps[prevStageIndex]
                          );
                          const prevPromptCount = getEffectivePromptCount(prevSection);
                          setLocalStepIndex(prevStageIndex);
                          setLocalPromptIndex(prevPromptCount - 1);
                        } else {
                          if (isKidsProduct) {
                            navigate(exitBackTo);
                          } else {
                            toast('Samtalet sparas – ni kan fortsätta när ni vill', { duration: 3000 });
                            navigate(exitBackTo);
                          }
                        }
                      }}
                    />
                    {!isKidsProduct && (
                      <p
                        style={{
                          marginTop: '12px',
                          fontFamily: 'var(--font-sans)',
                          fontSize: '11px',
                          fontStyle: 'italic',
                          color: 'rgba(255, 255, 255, 0.25)',
                          textAlign: 'center',
                        }}
                      >
                        Ni kan pausa när som helst.
                      </p>
                    )}
                  </motion.div>
                );
              })()}

              {/* ── MODE: archive — read-only saved reflection ── */}
              {cardViewMode === 'archive' && (
                <motion.div
                  className="pb-8"
                  style={{ padding: '0 8px' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: BEAT_1, duration: BEAT_3, ease: EASE }}
                >
                  {completedSessionId && (
                    <LockedReflectionDisplay
                      sessionId={completedSessionId}
                      stepIndex={currentStepIndex}
                    />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                    <button
                      onClick={() => handleArchiveNext(card)}
                      className="cta-primary gap-2"
                      style={{ width: '60%', margin: '0 auto' }}
                    >
                      {currentStepIndex >= effectiveSteps.length - 1 ? (product && product.id !== 'still_us' ? 'Vi är klara' : 'Klar') : 'Nästa'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </motion.div>

    {/* GÖR TILLSAMMANS one-time overlay */}
    <AnimatePresence>
      {showGorTillsammans && (
        <GorTillsammansOverlay onDismiss={() => setShowGorTillsammans(false)} />
      )}
    </AnimatePresence>

    </>
  );
}

/* ─── Kids completion note — opt-in nudge ─── */

function KidsCompletionNote({ sessionId, spaceId, cardId, productId }: {
  sessionId: string | null;
  spaceId: string | null;
  cardId?: string;
  productId?: string;
}) {
  const BARK = '#2C2420';
  const DRIFTWOOD = '#6B5E52';
  const PARCHMENT = '#F5EDD2';

  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [rowId, setRowId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const isDemo = isDemoMode();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const persistToDb = useCallback(async (value: string) => {
    if (!sessionId || !user?.id || !spaceId) return;
    if (rowId) {
      await supabase.from('couple_takeaways').update({ content: value } as any).eq('id', rowId);
    } else if (value.trim()) {
      const { data } = await supabase
        .from('couple_takeaways')
        .insert({ session_id: sessionId, couple_space_id: spaceId, content: value, created_by: user.id } as any)
        .select('id')
        .single();
      if (data) setRowId(data.id);
    }
  }, [sessionId, user?.id, spaceId, rowId]);

  const persistToLocal = useCallback((value: string) => {
    if (!productId || !cardId) return;
    try {
      const key = `bonki-demo-diary-${productId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = existing.findIndex((e: any) => e.cardId === cardId);
      const entry = { cardId, text: value, date: new Date().toISOString(), type: 'reflection' };
      if (idx >= 0) existing[idx] = entry;
      else existing.unshift(entry);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
  }, [productId, cardId]);

  const handleChange = (value: string) => {
    setText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        if (isDemo) persistToLocal(value);
        else persistToDb(value);
      }
    }, 1000);
  };

  if (!expanded) {
    return (
      <button
        onClick={() => {
          setExpanded(true);
          setTimeout(() => textareaRef.current?.focus(), 150);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          width: '100%',
          padding: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Pencil size={14} style={{ color: DRIFTWOOD, opacity: 0.6 }} />
        <span style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          fontWeight: 400,
          color: DRIFTWOOD,
        }}>
          Vill ni skriva något om samtalet?
        </span>
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '12px',
        fontStyle: 'italic',
        color: DRIFTWOOD,
        textAlign: 'center',
        marginBottom: '8px',
      }}>
        Inget du skriver lämnar det här rummet.
      </p>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Skriv här…"
        autoCorrect="on"
        autoCapitalize="sentences"
        className="w-full resize-none focus:outline-none focus:ring-0"
        style={{
          minHeight: '80px',
          maxHeight: '140px',
          fontFamily: 'var(--font-serif)',
          fontSize: '15px',
          lineHeight: 1.6,
          color: BARK,
          backgroundColor: PARCHMENT,
          border: 'none',
          borderRadius: '12px',
          padding: '16px',
          overflow: 'auto',
        }}
      />
    </motion.div>
  );
}

/* ─── Simple takeaway for completion screen ─── */

function SimpleTakeaway({ sessionId, spaceId, cardId, productId, stillUsMode }: {
  sessionId: string | null;
  spaceId: string | null;
  cardId?: string;
  productId?: string;
  stillUsMode?: boolean;
}) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [rowId, setRowId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const userId = user?.id;
  const isDemo = isDemoMode();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const DRIFTWOOD_T = '#6B5E52';
  const BARK_T = '#2C2420';
  const EMBER_GLOW_T = '#F5E8CC';
  const hasFill = text.trim().length > 0;

  const persistToDb = useCallback(async (value: string) => {
    if (!sessionId || !userId || !spaceId) return;
    if (rowId) {
      await supabase.from('couple_takeaways').update({ content: value } as any).eq('id', rowId);
    } else if (value.trim()) {
      const { data } = await supabase
        .from('couple_takeaways')
        .insert({ session_id: sessionId, couple_space_id: spaceId, content: value, created_by: userId } as any)
        .select('id')
        .single();
      if (data) setRowId(data.id);
    }
  }, [sessionId, userId, spaceId, rowId]);

  const persistToLocal = useCallback((value: string) => {
    if (!productId || !cardId) return;
    try {
      const key = `bonki-demo-diary-${productId}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const idx = existing.findIndex((e: any) => e.cardId === cardId);
      const entry = { cardId, text: value, date: new Date().toISOString(), type: 'reflection' };
      if (idx >= 0) existing[idx] = entry;
      else existing.unshift(entry);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch {}
  }, [productId, cardId]);

  const handleChange = (value: string) => {
    setText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        if (isDemo) persistToLocal(value);
        else persistToDb(value);
      }
    }, 1000);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Feather watermark when empty */}
      {!hasFill && !isFocused && (
        <div
          style={{
            position: 'absolute',
            top: '22px',
            left: '20px',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <Feather
            size={14}
            strokeWidth={1.5}
            style={{ color: stillUsMode ? DRIFTWOOD_T : 'var(--text-primary)', opacity: 0.25 }}
          />
        </div>
      )}
      <textarea
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder=""
        inputMode="text"
        autoCorrect="on"
        autoCapitalize="sentences"
        spellCheck={true}
        className="w-full resize-none focus:outline-none focus:ring-0"
        style={{
          height: 'auto',
          minHeight: '80px',
          maxHeight: '180px',
          overflow: 'auto',
          fontFamily: 'var(--font-serif)',
          fontSize: '16px',
          lineHeight: 1.7,
          color: stillUsMode ? BARK_T : 'var(--text-primary)',
          backgroundColor: stillUsMode
            ? (isFocused || hasFill ? EMBER_GLOW_T : 'hsla(36, 40%, 92%, 0.12)')
            : (isFocused || hasFill ? 'hsla(36, 20%, 97%, 0.12)' : 'hsla(36, 18%, 96%, 0.06)'),
          border: 'none',
          borderRadius: '12px',
          padding: '20px 24px',
          textAlign: hasFill ? 'left' : 'center',
          boxShadow: isFocused
            ? stillUsMode
              ? `0 0 0 1px hsla(36, 40%, 80%, 0.25)`
              : '0 0 0 1px hsla(36, 20%, 80%, 0.15)'
            : 'none',
          transition: 'background-color 320ms ease, box-shadow 320ms ease',
        }}
      />
    </div>
  );
}
