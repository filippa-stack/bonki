// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

import { useState, useEffect, useRef, useCallback } from 'react';
import { getCatchUpState } from '@/lib/catchUpState';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import Header from '@/components/Header';
import SectionView, { type SectionViewHandle } from '@/components/SectionView';
import StepProgressIndicator from '@/components/StepProgressIndicator';
import SessionStepReflection from '@/components/SessionStepReflection';

import ReviewDrawer from '@/components/ReviewDrawer';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, RotateCcw, BookOpen, Check } from 'lucide-react';
import SessionTakeaway from '@/components/SessionTakeaway';
import CompletedSessionView from '@/components/CompletedSessionView';

import { useProposalsContext, type Proposal } from '@/contexts/ProposalsContext';
import { useDevState } from '@/contexts/DevStateContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';

const sectionTypeLabels: Record<string, string> = {
  opening: 'Början',
  reflective: 'Fördjupning',
  scenario: 'I vardagen',
  exercise: 'Tillsammans',
};

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;
const STEP_LABELS = ['Början', 'Fördjupning', 'I vardagen', 'Tillsammans'];

const STEP_CTA_KEYS: Record<string, string> = {
  opening: 'card_view.cta_opening',
  reflective: 'card_view.cta_reflective',
  scenario: 'card_view.cta_scenario',
  exercise: 'card_view.cta_exercise',
};


export default function CardView() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRevisitMode = searchParams.get('revisit') === 'true';
  const { t } = useTranslation();
  const {
    getConversationForCard,
    saveConversation,
    getCardById,
    getCategoryById,
    currentSession,
    startSession,
    completeSessionStep,
    pauseSession,
    journeyState,
  } = useApp();
  const { user } = useAuth();
  const { memberCount, space } = useCoupleSpaceContext();
  const devState = useDevState();

  // Normalized session state (dual-read, not yet authoritative)
  const normalizedSession = useNormalizedSessionContext();

  // Active session ID for takeaways on the completion screen
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    devState ? 'dev-session' : null
  );
  // Whether the card has a completed session in couple_sessions (normalized)
  const [hasCompletedNormalizedSession, setHasCompletedNormalizedSession] = useState(false);
  useEffect(() => {
    if (devState) return;
    if (!space || !cardId) return;

    // Query normalized couple_sessions for active (for takeaway) and completed (for revisit)
    Promise.all([
      supabase
        .from('couple_sessions')
        .select('id')
        .eq('couple_space_id', space.id)
        .eq('card_id', cardId)
        .eq('status', 'active')
        .limit(1)
        .single(),
      supabase
        .from('couple_sessions')
        .select('id')
        .eq('couple_space_id', space.id)
        .eq('card_id', cardId)
        .eq('status', 'completed')
        .limit(1)
        .single(),
    ]).then(([activeRes, completedRes]) => {
      if (activeRes.data) setActiveSessionId(activeRes.data.id);
      // Fall back to legacy card_sessions if no normalized active session
      if (!activeRes.data) {
        supabase
          .from('card_sessions')
          .select('id')
          .eq('couple_space_id', space.id)
          .eq('card_id', cardId)
          .is('completed_at', null)
          .order('started_at', { ascending: false })
          .limit(1)
          .single()
          .then(({ data }) => { if (data) setActiveSessionId(data.id); });
      }
      setHasCompletedNormalizedSession(!!completedRes.data);
    });
  }, [space, cardId, devState]);

  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;
  const existingConversation = cardId ? getConversationForCard(cardId) : undefined;

  // ─── Derive per-user completedSteps from journeyState.sessionProgress ───
  const uid = user?.id || 'local';
  const myCompletedSteps: number[] =
    (cardId && journeyState?.sessionProgress?.[cardId]?.perUser?.[uid]?.completedSteps) || [];

  // ─── Shared step index: driven entirely by currentSession ───
  const isActiveSession = !!(currentSession && currentSession.cardId === cardId);
  const sharedStepIndex = isActiveSession ? currentSession!.currentStepIndex : 0;

  // ─── Catch-up: unified helper ensures consistent rules everywhere ───
  const { myFirstUncompletedStep, effectiveStep: effectiveSharedStep, isCatchingUp } =
    getCatchUpState(myCompletedSteps, sharedStepIndex, isActiveSession);

  // ─── Determine if card is fully explored ───
  const isFullyExplored = cardId
    ? (hasCompletedNormalizedSession || (journeyState?.exploredCardIds?.includes(cardId) ?? false))
    : false;
  const allStepsCompleted = STEP_ORDER.every((_, i) => myCompletedSteps.includes(i));

  // ─── Determine initial view state ───
  const isReturningUser = !!(isActiveSession || existingConversation);

  // For revisit mode, use local navigation; otherwise follow shared step
  const initialRevisitStep = (() => {
    const stepParam = searchParams.get('step');
    if (stepParam !== null) {
      const parsed = parseInt(stepParam, 10);
      if (!isNaN(parsed) && parsed >= 0 && parsed < STEP_ORDER.length) return parsed;
    }
    return 0;
  })();
  const [revisitStepIndex, setRevisitStepIndex] = useState(initialRevisitStep);
  const focusNoteParam = searchParams.get('focusNote');
  const promptParam = searchParams.get('prompt');
  const initialFocusNote = (() => {
    // Support both ?focusNote= (legacy) and ?prompt= (new deep link)
    const raw = focusNoteParam ?? promptParam;
    if (raw === null) return null;
    const parsed = parseInt(raw, 10);
    return !isNaN(parsed) && parsed >= 0 ? parsed : null;
  })();

  // The step the user sees
  const currentStepIndex = isRevisitMode ? revisitStepIndex : effectiveSharedStep;

  // Has the current user already completed the current shared step?
  const userCompletedCurrentStep = !isRevisitMode && myCompletedSteps.includes(currentStepIndex);

  // Has the partner completed the current shared step?
  const partnerCompletedCurrentStep = (() => {
    if (isRevisitMode || !cardId) return false;
    const perUser = journeyState?.sessionProgress?.[cardId]?.perUser;
    if (!perUser) return false;
    return Object.entries(perUser).some(
      ([id, data]) => id !== uid && data.completedSteps?.includes(currentStepIndex)
    );
  })();
  const bothCompleted = userCompletedCurrentStep && partnerCompletedCurrentStep;

  // View gates
  const [showOverview] = useState(false);
  const [showReentry] = useState(false);
  const [showCompletion, setShowCompletion] = useState(
    devState === 'completed' ? true :
    !isRevisitMode && isReturningUser && (isFullyExplored || allStepsCompleted)
  );

  // Dev state: force waiting view
  const devWaiting = devState === 'waiting';
  
  
  const [reviewOpen, setReviewOpen] = useState(false);

  // Initiator nudge: show once if same partner started last 2 sessions and current user is the other
  const [initiatorNudgeDismissed, setInitiatorNudgeDismissed] = useState(false);
  const showInitiatorNudge = (() => {
    if (initiatorNudgeDismissed || isRevisitMode) return false;
    const inits = journeyState?.lastInitiators;
    if (!inits || inits.length < 2) return false;
    const [prev, last] = inits;
    return prev === last && last !== uid;
  })();

  // Auto-dismiss after first render
  useEffect(() => {
    if (showInitiatorNudge) {
      const timer = setTimeout(() => setInitiatorNudgeDismissed(true), 8000);
      return () => clearTimeout(timer);
    }
  }, [showInitiatorNudge]);

  const sectionViewRef = useRef<SectionViewHandle>(null);
  // ConflictingSessionModal removed — route guard handles this
  const [proposalSent, setProposalSent] = useState(false);
  const proposalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showProposalSheet, setShowProposalSheet] = useState(false);

  const { sendProposal, proposals } = useProposalsContext();

  // ─── Proposal gate: when paired, new cards need mutual agreement ───
  const isPaired = memberCount >= 2;
  // Check if BOTH partners have progress (not just one solo user)
  const cardProgress = cardId ? journeyState?.sessionProgress?.[cardId] : null;
  const perUserEntries = cardProgress?.perUser ? Object.keys(cardProgress.perUser) : [];
  const hasMutualProgress = isPaired ? perUserEntries.length >= 2 : !!cardProgress;
  const hasAcceptedProposal = !!(cardId && proposals.some(
    p => p.card_id === cardId && p.status === 'accepted'
  ));
  const hasPendingProposalForCard = !!(cardId && proposals.some(
    p => p.card_id === cardId && p.status === 'pending'
  ));
  // Allow session if: solo, both have progress, has accepted proposal, or revisit
  const canStartSharedSession = !isPaired || hasMutualProgress || hasAcceptedProposal || isRevisitMode;
  const [autoProposalSent, setAutoProposalSent] = useState(false);
  // Non-blocking: show a propose banner instead of blocking the user
  const showProposeBanner = isPaired && !canStartSharedSession && !isActiveSession && !isRevisitMode && !showCompletion && !hasPendingProposalForCard;
  // Conflicting session logic removed — ActiveSessionGuard redirects before this renders

  // ─── Save conversation for local resume ───
  useEffect(() => {
    if (isRevisitMode) return;
    if (card && currentStepIndex >= 0) {
      const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);
      if (currentSection) {
        saveConversation(card.id, currentSection.id, currentStepIndex);
      }
    }
  }, [currentStepIndex, myCompletedSteps.length, card]);

  // ─── Show completion directly when card is fully explored ───
  useEffect(() => {
    if (isRevisitMode) return;
    if (!showCompletion && isFullyExplored) {
      setShowCompletion(true);
    }
  }, [isFullyExplored, isRevisitMode]);

  // ─── Show stage choice when effective step advances (shared or catch-up) ───
  const prevEffectiveStepRef = useRef(effectiveSharedStep);
  useEffect(() => {
    prevEffectiveStepRef.current = effectiveSharedStep;
  }, [effectiveSharedStep]);

  // Auto-start session when entering a new card (gated by proposal acceptance when paired)
  const hasAutoStarted = useRef(false);
  useEffect(() => {
    // Solo gate: never auto-start sessions when unpaired
    if (!isPaired) return;
    if (!hasAutoStarted.current && !isActiveSession && !isRevisitMode && !showCompletion && card && category) {
      if (canStartSharedSession) {
        hasAutoStarted.current = true;
        startSession(category.id, card.id);
      }
    }
  }, [isPaired, isActiveSession, isRevisitMode, showCompletion, card, category, startSession, canStartSharedSession]);

  // Proposal gate removed — users can browse freely. Propose banner shown inline instead.

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

  const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);


  // ─── Handle "Next" press ───
  const handleNextStep = () => {
    if (isRevisitMode) {
      // In revisit mode, just navigate linearly
      if (revisitStepIndex < STEP_ORDER.length - 1) {
        const next = revisitStepIndex + 1;
        setRevisitStepIndex(next);
        const promptParam_ = initialFocusNote !== null ? `&prompt=${initialFocusNote}` : '';
        navigate(`/card/${card.id}?revisit=true&step=${next}${promptParam_}`, { replace: true });
      } else {
        navigate(category ? `/category/${category.id}` : '/');
      }
      return;
    }

    // Solo gate: no step completion when unpaired
    if (!isPaired) return;
    // Mark the current step as completed for THIS user only
    if (!myCompletedSteps.includes(currentStepIndex)) {
      completeSessionStep(currentStepIndex);
    }
    // UI stays on the same step — shared step will advance when both complete
  };

  const handleStartFromOverview = () => {
    if (!isPaired) return; // Solo gate
    if (card && category && !isActiveSession) {
      startSession(category.id, card.id);
    }
  };


  // ─── History view: returning to a fully-explored card with no active session ───
  const isHistoryView = showCompletion && !activeSessionId;

  if (isHistoryView && card && cardId) {
    return (
      <CompletedSessionView
        cardId={cardId}
        cardTitle={card.title}
        categoryId={category?.id}
        categoryTitle={category?.title}
        onExploreAgain={() => {
          if (card && category && space) {
            // Create a new card_session — does NOT overwrite previous
            startSession(category.id, card.id);
            setShowCompletion(false);
          }
        }}
      />
    );
  }

  // ─── Completion screen (just finished — active session still open) ───
  if (showCompletion) {
    const suggestedCardId = journeyState?.suggestedNextCardId;
    const suggestedCard = suggestedCardId ? getCardById(suggestedCardId) : null;
    const suggestedCategory = suggestedCard ? getCategoryById(suggestedCard.categoryId) : null;

    return (
      <div className="min-h-screen page-bg">
        <Header
          title={category?.title}
          showBack
          backTo="/"
        />
        <div className="px-6 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-center max-w-md mx-auto space-y-3"
          >
            <h2 className="text-xl font-serif text-foreground">
              Ta en stund.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Det ni just delade får landa. Här kan ni skriva en gemensam sammanfattning om ni vill.
            </p>
          </motion.div>

          {/* Takeaways — card-level closing ritual */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.15 }}
            className="max-w-md mx-auto mt-12 space-y-3"
          >
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Vill ni formulera något att ta med er?
            </p>
            <SessionTakeaway sessionId={activeSessionId} />
          </motion.div>

          {/* Navigation actions — single primary CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.15 }}
            className="max-w-md mx-auto mt-12 space-y-6 text-center"
          >
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="w-full h-14 rounded-2xl gap-2 font-normal"
            >
              Till Hem
            </Button>
            <div className="pt-4 text-center">
              <button
                onClick={() => navigate(`/card/${card.id}?revisit=true`)}
                className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Läs igen
              </button>
            </div>
          </motion.div>
        </div>

      </div>
    );
  }

  // ─── Re-entry: removed — go directly to conversation ───


  // ─── Active conversation view ───

  // ─── Active conversation view ───
  return (
    <div className="min-h-screen page-bg">
      <Header
        title={category?.title}
        showBack
        backTo={category ? `/category/${category.id}` : '/'}
      />

      {/* Progress indicator — hidden in revisit/preview mode */}
      {!isRevisitMode && (
        <div className="px-4 pt-6 pb-4 border-b border-border/15">
          <StepProgressIndicator
            currentStepIndex={currentStepIndex}
            completedSteps={myCompletedSteps}
          />
        </div>
      )}

      <div className="px-6 pt-16 pb-8">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="text-xl md:text-2xl font-serif text-foreground text-center leading-relaxed"
        >
          {card.title}
        </motion.h1>
        {!isRevisitMode && showInitiatorNudge && (
          <p className="text-[11px] text-muted-foreground/40 text-center mt-2">Den här gången kan du börja.</p>
        )}
        {isRevisitMode && (
          <div className="mt-4 text-center space-y-0.5">
            <p className="text-[11px] text-muted-foreground/50 tracking-wide">Förhandskoll</p>
          </div>
        )}
        {card.subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.03, duration: 0.15 }}
            className="text-sm text-muted-foreground not-italic mt-5 text-center max-w-2xl mx-auto leading-relaxed"
          >
            {card.subtitle}
          </motion.p>
        )}

        {/* Propose banner & pending proposal banner removed during hardening —
             proposal creation is only allowed from the Home IDLE proposal mode surface.
             No new-intention triggers inside an active card view. */}
      </div>


      {/* Section content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* Partner-ahead awareness — no urgency, just clarity */}
              {isPaired && !isRevisitMode && partnerCompletedCurrentStep && !userCompletedCurrentStep && !devWaiting && (
                <p className="text-xs text-muted-foreground/50 text-center mb-6">
                  Din partner har redan markerat detta steg som klart.
                </p>
              )}

              <SectionView ref={sectionViewRef} section={currentSection} card={card} isRevisitMode={isRevisitMode} initialFocusNoteIndex={isRevisitMode ? initialFocusNote : null} focusPromptIndex={isRevisitMode ? initialFocusNote : null} disableShare={!!currentSession || (!canStartSharedSession && !isActiveSession)} />

              {/* Session-driven reflection for paired users */}
              {isPaired && !isRevisitMode && cardId && (
                <SessionStepReflection
                  cardId={cardId}
                  stepIndex={currentStepIndex}
                  onReady={() => {
                    if (!myCompletedSteps.includes(currentStepIndex)) {
                      completeSessionStep(currentStepIndex);
                    }
                  }}
                  onLocked={() => {
                    if (currentStepIndex >= STEP_ORDER.length - 1) {
                      setShowCompletion(true);
                    }
                  }}
                />
              )}

              {/* Final-step hint — only on exercise (step 3) for paired users */}
              {isPaired && !isRevisitMode && currentStepIndex === 3 && (
                <p className="text-xs text-muted-foreground/40 text-center mt-4">
                  När ni båda är klara kan ni formulera något gemensamt.
                </p>
              )}

              {/* Solo / revisit: keep legacy step CTA */}
              {(!isPaired || isRevisitMode) && (
                <div className="pt-10 pb-8 space-y-5">
                  <Button
                    onClick={handleNextStep}
                    size="lg"
                    className="gap-2 h-14 font-normal w-full rounded-2xl"
                  >
                    {isRevisitMode
                      ? (currentStepIndex >= STEP_ORDER.length - 1 ? 'Klar' : 'Nästa')
                      : t(STEP_CTA_KEYS[STEP_ORDER[currentStepIndex]])}
                    <ArrowRight className="w-4 h-4" />
                  </Button>

                  {(currentStepIndex > 0 || isRevisitMode) && (
                    <div className="flex justify-center">
                      <button
                        onClick={() => setReviewOpen(true)}
                        className="flex items-center gap-1.5 text-[12px] text-muted-foreground/50 hover:text-muted-foreground/70 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        Se sammanfattning
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Review drawer */}
              <ReviewDrawer open={reviewOpen} onClose={() => setReviewOpen(false)} card={card} activeStepIndex={currentStepIndex} completedSteps={myCompletedSteps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ConflictingSessionModal removed — ActiveSessionGuard handles this */}
      {/* ProposalSheet removed from CardView — proposals only via Home IDLE mode */}
    </div>
  );
}
