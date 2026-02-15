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
import { ArrowRight, Home, RotateCcw, BookOpen, Check } from 'lucide-react';
import CardTakeaways from '@/components/CardTakeaways';

import { useProposals } from '@/hooks/useProposals';

const sectionTypeLabels: Record<string, string> = {
  opening: 'Öppnare',
  reflective: 'Tankeväckare',
  scenario: 'Scenario',
  exercise: 'Teamwork',
};

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;
const STEP_LABELS = ['Öppnare', 'Tankeväckare', 'Scenario', 'Teamwork'];

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

  // View gates
  const [showOverview] = useState(false);
  const [showReentry] = useState(false);
  const [showCompletion, setShowCompletion] = useState(
    !isRevisitMode && isReturningUser && (isFullyExplored || allStepsCompleted)
  );
  
  
  const [reviewOpen, setReviewOpen] = useState(false);
  const sectionViewRef = useRef<SectionViewHandle>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [proposalSent, setProposalSent] = useState(false);
  const proposalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showProposalSheet, setShowProposalSheet] = useState(false);

  const { sendProposal } = useProposals();


  // ─── Guard: if there's an active session for a DIFFERENT card, show modal instead of redirect ───
  const hasConflictingSession = !!(currentSession && currentSession.cardId !== cardId);
  const conflictingCard = hasConflictingSession ? getCardById(currentSession!.cardId) : undefined;

  useEffect(() => {
    if (isRevisitMode) return;
    if (hasConflictingSession) {
      setShowConflictModal(true);
    }
  }, [cardId, hasConflictingSession, isRevisitMode]);

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

  // Auto-start session when entering a new card (no overview gate)
  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (!hasAutoStarted.current && !isActiveSession && !isRevisitMode && !showCompletion && card && category) {
      hasAutoStarted.current = true;
      startSession(category.id, card.id);
    }
  }, [isActiveSession, isRevisitMode, showCompletion, card, category, startSession]);

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

          {/* Navigation actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.08, duration: 0.15 }}
            className="max-w-md mx-auto mt-12 space-y-3 text-center"
          >
            {suggestedCard && suggestedCategory && memberCount >= 2 ? (
              <Button
                onClick={() => setShowProposalSheet(true)}
                disabled={proposalSent}
                size="lg"
                className="w-full gap-2"
              >
                {proposalSent ? (
                  <><Check className="w-4 h-4" /> Förslag skickat</>
                ) : (
                  <>{t('card_view.completion_next', 'Föreslå nästa samtal')} <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            ) : suggestedCard && suggestedCategory ? (
              <Button
                onClick={() => navigate(`/card/${suggestedCard.id}`)}
                size="lg"
                className="w-full gap-2"
              >
                {t('card_view.completion_next', 'Föreslå nästa samtal')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : null}
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              size="lg"
              className="w-full gap-2"
            >
              <Home className="w-4 h-4" />
              {t('card_view.completion_home', 'Hem')}
            </Button>
            <Button
              onClick={() => navigate(`/card/${card.id}?revisit=true`)}
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              {t('card_view.completion_revisit', 'Läs igen')}
            </Button>
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
            className="text-sm text-gentle not-italic mt-5 text-center max-w-2xl mx-auto leading-relaxed"
          >
            {card.subtitle}
          </motion.p>
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
              <SectionView ref={sectionViewRef} section={currentSection} card={card} isRevisitMode={isRevisitMode} initialFocusNoteIndex={isRevisitMode ? initialFocusNote : null} focusPromptIndex={isRevisitMode ? initialFocusNote : null} />

              {/* Takeaways removed from exercise step — now rendered on completion screen */}

              {/* Navigation / waiting state */}
              {userCompletedCurrentStep ? (

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  role="status"
                  aria-live="polite"
                  className="my-10 py-10 px-5 text-center space-y-3"
                >
                  <p className="text-sm font-serif text-foreground">
                    Du är klar.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ni fortsätter när båda är klara.
                  </p>
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

                  {!isRevisitMode && (
                    <p className="text-[11px] text-muted-foreground/40 leading-relaxed text-center">
                      Svara i er egen takt. Ni fortsätter när båda är klara.
                    </p>
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
