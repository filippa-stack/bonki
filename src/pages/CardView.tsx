import { useState, useEffect, useRef } from 'react';
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
import PauseDialog from '@/components/PauseDialog';
import ReviewDrawer from '@/components/ReviewDrawer';
import ConflictingSessionModal from '@/components/ConflictingSessionModal';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, RotateCcw, BookOpen, PenLine } from 'lucide-react';
import CardTakeaways from '@/components/CardTakeaways';

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

const TRANSITION_KEYS: Record<string, string> = {
  opening: 'card_view.transition_opening',
  reflective: 'card_view.transition_reflective',
  scenario: 'card_view.transition_scenario',
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
    proposeCard,
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

  // The step the user sees
  const currentStepIndex = isRevisitMode ? revisitStepIndex : sharedStepIndex;

  // Has the current user already completed the current shared step?
  const userCompletedCurrentStep = !isRevisitMode && myCompletedSteps.includes(currentStepIndex);

  // View gates
  const [showOverview, setShowOverview] = useState(!isRevisitMode && !isReturningUser);
  const [showReentry, setShowReentry] = useState(
    !isRevisitMode && isReturningUser && !isFullyExplored && !allStepsCompleted
  );
  const [showCompletion, setShowCompletion] = useState(
    !isRevisitMode && isReturningUser && (isFullyExplored || allStepsCompleted)
  );
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const sectionViewRef = useRef<SectionViewHandle>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

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
        saveConversation(card.id, currentSection.id, currentStepIndex, myCompletedSteps);
      }
    }
  }, [currentStepIndex, myCompletedSteps.length, card]);

  // ─── Show completion when shared session ends and card is fully explored ───
  useEffect(() => {
    if (isRevisitMode) return;
    if (!showCompletion && isFullyExplored) {
      setShowCompletion(true);
    }
  }, [isFullyExplored, isRevisitMode]);

  // ─── Show transition when shared step advances ───
  const prevSharedStepRef = useRef(sharedStepIndex);
  useEffect(() => {
    const prev = prevSharedStepRef.current;
    prevSharedStepRef.current = sharedStepIndex;
    if (isRevisitMode || showOverview || showReentry || showCompletion) return;
    if (sharedStepIndex > prev) {
      const prevType = STEP_ORDER[prev];
      const msgKey = TRANSITION_KEYS[prevType];
      if (msgKey) {
        setTransitionMessage(t(msgKey));
        setTimeout(() => setTransitionMessage(null), 2400);
      }
    }
  }, [sharedStepIndex]);

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
        setRevisitStepIndex(revisitStepIndex + 1);
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
    setShowOverview(false);
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
        <div className="px-6 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md mx-auto space-y-7"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h2 className="text-xl font-serif text-foreground leading-snug">
                {card.title}
              </h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto"
            >
              {t(completionMessageKey)}
            </motion.p>

            <p className="text-xs text-muted-foreground/60 leading-relaxed">
              Ni kan bara landa här en stund. Nästa steg kan ni ta senare.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="pt-3 space-y-3"
            >
              {suggestedCard && suggestedCategory && memberCount >= 2 ? (
                <Button
                  onClick={() => {
                    proposeCard(suggestedCategory.id, suggestedCard.id);
                    toast(t('topic_proposal.proposed_toast'));
                    navigate('/');
                  }}
                  size="lg"
                  className="w-full gap-2"
                >
                  {t('card_view.completion_next', 'Föreslå nästa samtal')}
                  <ArrowRight className="w-4 h-4" />
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
                {t('card_view.completion_home', 'Tillbaka till Hem')}
              </Button>
              <Button
                onClick={() => navigate(`/card/${card.id}?revisit=true`)}
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                {t('card_view.completion_revisit', 'Läs igenom igen')}
              </Button>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className="text-xs text-muted-foreground/50 italic pt-2"
            >
              {t('card_view.completion_rest')}
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Re-entry screen ───
  if (showReentry) {
    const resumeStepLabel = STEP_LABELS[currentStepIndex] || STEP_LABELS[0];
    return (
      <div className="min-h-screen page-bg">
        <Header
          title={category?.title}
          showBack
          backTo={category ? `/category/${category.id}` : '/'}
        />
        <div className="px-6 pt-12 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md mx-auto space-y-6"
          >
            <h1 className="text-2xl font-serif text-foreground leading-snug">
              {card.title}
            </h1>
            {card.subtitle && (
              <p className="text-sm text-muted-foreground italic">{card.subtitle}</p>
            )}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto"
            >
              {t('card_view.reentry_message', 'Ni var mitt i det här samtalet. Ni kan fortsätta precis där ni var.')}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="text-xs text-muted-foreground/60"
            >
              {resumeStepLabel}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="pt-2"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto gap-2"
                onClick={() => setShowReentry(false)}
              >
                {t('card_view.reentry_continue', 'Fortsätt samtalet')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Overview screen ───
  if (showOverview) {
    return (
      <div className="min-h-screen page-bg">
        <Header
          title={category?.title}
          showBack
          backTo={category ? `/category/${category.id}` : '/'}
        />

        <div className="px-6 pt-8 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <h1 className="text-2xl md:text-3xl font-serif text-foreground mb-3">
              {card.title}
            </h1>
            {card.subtitle && (
              <p className="text-gentle italic mb-8">{card.subtitle}</p>
            )}

            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              {t('card_view.overview_description')}
            </p>

            {/* Step overview */}
            <div className="space-y-3 mb-10 text-left">
              {STEP_ORDER.map((stepType, index) => {
                const section = card.sections.find(s => s.type === stepType);
                return (
                  <motion.div
                    key={stepType}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {sectionTypeLabels[stepType]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {stepType === 'opening' && t('card_view.step_opening_desc')}
                        {stepType === 'reflective' && t('card_view.step_reflective_desc')}
                        {stepType === 'scenario' && t('card_view.step_scenario_desc')}
                        {stepType === 'exercise' && t('card_view.step_exercise_desc')}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Button
              onClick={handleStartFromOverview}
              size="lg"
              className="w-full md:w-auto gap-2"
            >
              {t('card_view.overview_start')}
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full md:w-auto gap-2 mt-3"
              onClick={() => navigate(`/card/${card.id}?revisit=true`)}
            >
              Förhandskolla själv
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // ─── Active conversation view ───
  return (
    <div className="min-h-screen page-bg">
      <Header
        title={category?.title}
        showBack
        backTo={category ? `/category/${category.id}` : '/'}
      />

      {/* Progress indicator */}
      <div className="px-4 pt-6 pb-4 border-b border-divider">
        <StepProgressIndicator
          currentStepIndex={currentStepIndex}
          completedSteps={myCompletedSteps}
        />
      </div>

      <div className="px-6 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-serif text-foreground text-center md:text-left"
        >
          {card.title}
        </motion.h1>
        {isRevisitMode && (
          <div className="mt-2 text-center md:text-left space-y-0.5">
            <p className="text-xs text-muted-foreground/60 tracking-wide">Förhandskoll</p>
            <p className="text-xs text-muted-foreground/50">För dig. Du kan föreslå kortet när det passar.</p>
          </div>
        )}
        {card.subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-sm text-gentle italic mt-1 text-center md:text-left"
          >
            {card.subtitle}
          </motion.p>
        )}
      </div>

      {/* Transition moment */}
      <AnimatePresence>
        {transitionMessage && (
          <motion.div
            key="transition"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="px-6 py-14 flex items-center justify-center"
          >
            <p className="text-sm text-muted-foreground/80 text-center max-w-xs leading-relaxed">
              {transitionMessage}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section content */}
      <div className="px-6">
        <AnimatePresence mode="wait">
          {currentSection && !transitionMessage && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SectionView ref={sectionViewRef} section={currentSection} card={card} />

              {/* Takeaways on final step (exercise), before completing — card-level reflection */}
              {currentSection.type === 'exercise' && !userCompletedCurrentStep && (
                <div className="mt-8 border-t border-border/40 pt-6 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground/70 tracking-wide">Takeaways</p>
                  <p className="text-[13px] text-muted-foreground/50 leading-relaxed">
                    För hela samtalet på det här kortet. Skriv vad ni vill minnas, prova eller ta med er vidare.
                  </p>
                  <div className="pt-2">
                    <CardTakeaways cardId={card.id} />
                  </div>
                </div>
              )}

              {/* Navigation / waiting state */}
              {userCompletedCurrentStep ? (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  role="status"
                  aria-live="polite"
                  className="my-8 py-8 px-5 rounded-2xl bg-card/40 border border-border/30 text-center space-y-4"
                >
                  <p className="text-sm font-serif text-foreground">
                    En paus
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    Ni fortsätter här när ni båda är redo.
                  </p>
                  <p className="text-[13px] text-muted-foreground/60 leading-relaxed max-w-xs mx-auto">
                    Under tiden kan du läsa igenom eller skriva något du vill bära med dig.
                  </p>

                  {memberCount >= 2 && (
                    <p className="text-xs text-muted-foreground/60 text-center">
                      Samtalet vilar här en stund.
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground"
                      onClick={() => setReviewOpen(true)}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Granska
                    </Button>

                    <button
                      onClick={() => sectionViewRef.current?.openNoteForCurrent()}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      Skriv en tanke
                    </button>
                  </div>

                  {/* Takeaways accessible during waiting */}
                  <div className="text-left pt-3 space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground/70 tracking-wide">Takeaways</p>
                    <p className="text-[13px] text-muted-foreground/50 leading-relaxed">
                      För hela samtalet på det här kortet — skriv ner det ni vill ta med er.
                    </p>
                    <div className="pt-1">
                      <CardTakeaways cardId={card.id} compact />
                    </div>
                  </div>

                  <div className="pt-2">
                    <PauseDialog onConfirm={() => { pauseSession(); navigate('/'); }} />
                  </div>
                </motion.div>
              ) : (
                <div className="py-8 border-t border-divider space-y-3">
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3">
                      {currentStepIndex > 0 && (
                        <Button
                          variant="outline"
                          size="lg"
                          className="gap-2"
                          onClick={() => setReviewOpen(true)}
                        >
                          <BookOpen className="w-4 h-4" />
                          {t('card_view.review_edit', 'Se era svar')}
                        </Button>
                      )}
                      <Button
                        onClick={handleNextStep}
                        size="lg"
                        className="gap-2"
                      >
                        {t(STEP_CTA_KEYS[STEP_ORDER[currentStepIndex]])}
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed text-center md:text-left">
                      Svara i er egen takt. Ni fortsätter när båda är klara.
                    </p>
                  </div>
                  <div className="flex justify-center md:justify-start">
                    <PauseDialog onConfirm={() => { pauseSession(); navigate('/'); }} />
                  </div>
                </div>
              )}

              {/* Review drawer */}
              <ReviewDrawer open={reviewOpen} onClose={() => setReviewOpen(false)} card={card} />
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
    </div>
  );
}
