import { useState, useEffect, useRef, useCallback } from 'react';
import { getCatchUpState } from '@/lib/catchUpState';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { toast } from 'sonner';

import Header from '@/components/Header';
import SectionView, { type SectionViewHandle } from '@/components/SectionView';
import StepProgressIndicator from '@/components/StepProgressIndicator';

import ReviewDrawer from '@/components/ReviewDrawer';
import ConflictingSessionModal from '@/components/ConflictingSessionModal';
import ProposalSheet from '@/components/ProposalSheet';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, RotateCcw, BookOpen, Check, Send } from 'lucide-react';
import CardTakeaways from '@/components/CardTakeaways';

import { useProposals, Proposal } from '@/hooks/useProposals';

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
  const { memberCount } = useCoupleSpace();

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
  const isFullyExplored = cardId ? (journeyState?.exploredCardIds?.includes(cardId) ?? false) : false;
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
    !isRevisitMode && isReturningUser && (isFullyExplored || allStepsCompleted)
  );
  
  
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
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const proposalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showProposalSheet, setShowProposalSheet] = useState(false);

  const { sendProposal, proposals } = useProposals();

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
  // ─── Guard: if there's an active session for a DIFFERENT card, show modal instead of redirect ───
  const hasConflictingSession = !!(currentSession && currentSession.cardId !== cardId);
  const conflictingCard = hasConflictingSession ? getCardById(currentSession!.cardId) : undefined;

  // Conflict modal only shown on explicit user action (e.g. tapping step CTA),
  // never auto-triggered on mount — navigation must be user-intent driven.

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
    if (!hasAutoStarted.current && !isActiveSession && !isRevisitMode && !showCompletion && card && category) {
      // Don't auto-start if there's a conflicting session — let user decide via CTA
      if (hasConflictingSession) return;
      if (canStartSharedSession) {
        hasAutoStarted.current = true;
        startSession(category.id, card.id);
      }
    }
  }, [isActiveSession, isRevisitMode, showCompletion, card, category, startSession, canStartSharedSession, hasConflictingSession]);

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

    // Mark the current step as completed for THIS user only
    if (!myCompletedSteps.includes(currentStepIndex)) {
      completeSessionStep(currentStepIndex);
    }
    // UI stays on the same step — shared step will advance when both complete
  };

  const handleStartFromOverview = () => {
    if (hasConflictingSession) {
      setShowConflictModal(true);
      return;
    }
    if (card && category && !isActiveSession) {
      startSession(category.id, card.id);
    }
  };


  // ─── Completion screen ───
  if (showCompletion) {
    const suggestedCardId = journeyState?.suggestedNextCardId;
    const suggestedCard = suggestedCardId ? getCardById(suggestedCardId) : null;
    const suggestedCategory = suggestedCard ? getCategoryById(suggestedCard.categoryId) : null;

    const completionMessageKey = memberCount >= 2
      ? (isFullyExplored
        ? 'card_view.completion_message_together'
        : 'card_view.completion_message_solo')
      : 'card_view.completion_message';

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
              Det ni just delade får landa här.
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
              Vill ni sammanfatta något att ta med er?
            </p>
            <CardTakeaways cardId={card.id} />
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
            <div className="flex justify-center gap-6 pt-2">
              {suggestedCard && suggestedCategory && (
                <button
                  onClick={() => memberCount >= 2 ? setShowProposalSheet(true) : navigate(`/card/${suggestedCard.id}`)}
                  disabled={proposalSent}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {proposalSent ? 'Förslag skickat' : 'Föreslå nästa samtal'}
                </button>
              )}
              <button
                onClick={() => navigate(`/card/${card.id}?revisit=true`)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Läs igen
              </button>
            </div>
          </motion.div>
        </div>

        {/* Proposal Sheet */}
        {suggestedCard && suggestedCategory && (
          <ProposalSheet
            open={showProposalSheet}
            onClose={() => setShowProposalSheet(false)}
            cardTitle={suggestedCard.title}
            categoryTitle={suggestedCategory.title}
            onSend={async (msg) => {
              const result = await sendProposal(suggestedCard.id, suggestedCategory.id, msg);
              if (result.ok) {
                setProposalSent(true);
                if (proposalTimer.current) clearTimeout(proposalTimer.current);
                proposalTimer.current = setTimeout(() => setProposalSent(false), 2000);
              } else {
                toast.error('Kunde inte skicka förslaget. Försök igen.');
              }
            }}
          />
        )}
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

        {/* Propose banner — non-blocking, only when paired */}
        {showProposeBanner && isPaired && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-xl border border-border bg-card/60 px-5 py-4 text-center space-y-3"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              Vill ni utforska det här tillsammans? Föreslå det för din partner.
            </p>
            <Button
              size="sm"
              onClick={() => setShowProposalSheet(true)}
              className="gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Föreslå det här samtalet
            </Button>
          </motion.div>
        )}
        {/* Pending proposal banner */}
        {!canStartSharedSession && !isActiveSession && isPaired && hasPendingProposalForCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mt-6 rounded-xl border border-border bg-card/60 px-5 py-4 text-center space-y-1"
          >
            <p className="text-sm font-serif text-foreground">
              Förslag skickat
            </p>
            <p className="text-xs text-muted-foreground">
              Ni börjar när ni båda är redo.
            </p>
          </motion.div>
        )}
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
              <SectionView ref={sectionViewRef} section={currentSection} card={card} isRevisitMode={isRevisitMode} initialFocusNoteIndex={isRevisitMode ? initialFocusNote : null} focusPromptIndex={isRevisitMode ? initialFocusNote : null} disableShare={!!currentSession || (!canStartSharedSession && !isActiveSession)} />

              {/* Takeaways removed from exercise step — now rendered on completion screen */}

              {/* Waiting / advance state — inline below the step content */}
              {userCompletedCurrentStep ? (

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15, delay: 0.1 }}
                  role="status"
                  aria-live="polite"
                  className="mt-12 mb-8 text-center"
                >
                  {bothCompleted ? (
                    <div className="space-y-6">
                      <p className="text-sm text-muted-foreground">
                        Nu är ni klara.
                      </p>
                      <Button
                        onClick={handleNextStep}
                        size="lg"
                        className="gap-2 h-14 font-normal w-full rounded-2xl"
                      >
                        Gå vidare tillsammans
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Shared pace dots */}
                      <div className="flex justify-center gap-2">
                        <span className="block w-2 h-2 rounded-full bg-foreground/20 transition-all duration-300" />
                        <span className="block w-2 h-2 rounded-full border border-foreground/15 transition-all duration-300 ease-out" />
                      </div>

                      {/* Breathing line */}
                      <div className="flex justify-center">
                        <div
                          className="w-16 h-px bg-foreground/[0.08]"
                          style={{ animation: 'breathe 5s ease-in-out infinite' }}
                        />
                      </div>

                      <p className="text-sm text-muted-foreground/60 leading-relaxed">
                        Samtalet vilar här en stund — ni fortsätter när båda har reflekterat.
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
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
                        {t('card_view.review_edit', 'Se era svar')}
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

      {/* Conflicting session modal */}
      {conflictingCard && (
        <ConflictingSessionModal
          open={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          currentSessionCardTitle={conflictingCard.title}
          currentSessionCardId={conflictingCard.id}
          onSwitchToThisCard={() => {
            if (card && category) {
              pauseSession();
              startSession(category.id, card.id, { force: true });
            }
          }}
        />
      )}

      {/* Proposal Sheet — only triggered from non-revisit step completion or card completion */}
      {card && category && (
        <ProposalSheet
          open={showProposalSheet}
          onClose={() => setShowProposalSheet(false)}
          cardTitle={card.title}
          categoryTitle={category.title}
          onSend={async (msg) => {
            const result = await sendProposal(card.id, category.id, msg);
            if (result.ok) {
              setProposalSent(true);
              setShowProposalSheet(false);
              toast('Förslag skickat.', { duration: 3000 });
              if (proposalTimer.current) clearTimeout(proposalTimer.current);
              proposalTimer.current = setTimeout(() => setProposalSent(false), 2000);
            } else {
              toast.error('Kunde inte skicka förslaget. Försök igen.');
            }
          }}
        />
      )}
    </div>
  );
}
