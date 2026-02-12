import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { toast } from 'sonner';
import Header from '@/components/Header';
import SectionView from '@/components/SectionView';
import CardReflections from '@/components/CardReflections';
import StepProgressIndicator from '@/components/StepProgressIndicator';
import PauseDialog from '@/components/PauseDialog';
import SyncPrompt from '@/components/SyncPrompt';
import WaitingForPartner from '@/components/WaitingForPartner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Check, Heart, Home, RotateCcw } from 'lucide-react';

const sectionTypeLabels: Record<string, string> = {
  opening: 'Öppnare',
  reflective: 'Tankeväckare',
  scenario: 'Scenario',
  exercise: 'Team Work',
};

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;
const STEP_LABELS = ['Öppnare', 'Tankeväckare', 'Scenario', 'Team Work'];

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
    backgroundColor,
    currentSession,
    startSession,
    updateSessionStep,
    completeSessionStep,
    endSession,
    pauseSession,
    journeyState,
    proposeCard,
  } = useApp();
  const { user } = useAuth();
  const { memberCount } = useCoupleSpace();



  const card = cardId ? getCardById(cardId) : undefined;
  const category = card ? getCategoryById(card.categoryId) : undefined;
  const existingConversation = cardId ? getConversationForCard(cardId) : undefined;

  // Determine initial step from session or saved conversation
  // Uses per-user completions when available (couple mode), falls back to shared completedSteps
  // Returns -1 if all steps are completed (signals "route out")
  const getInitialStepIndex = () => {
    let completed: number[] = [];

    if (currentSession?.cardId === cardId) {
      // In couple mode, use this user's own completions to determine resume point
      const myCompletions = user?.id && currentSession.userCompletions?.[user.id];
      completed = myCompletions || currentSession.completedSteps;
    } else if (existingConversation && card) {
      completed = existingConversation.completedSteps ?? [];
    }

    // Find the first step NOT in completed
    const nextIncomplete = STEP_ORDER.findIndex((_, i) => !completed.includes(i));
    return nextIncomplete; // -1 if all completed
  };

  const getInitialCompletedSteps = () => {
    if (currentSession?.cardId === cardId) {
      // Return shared completedSteps (mutually confirmed) for progress display
      return currentSession.completedSteps;
    }
    if (existingConversation) {
      return existingConversation.completedSteps ?? [];
    }
    return [];
  };

  const isFullyExplored = cardId ? (journeyState?.exploredCardIds?.includes(cardId) ?? false) : false;
  const initialCompleted = getInitialCompletedSteps();
  const allStepsCompleted = STEP_ORDER.every((_, i) => initialCompleted.includes(i));
  const initialStep = getInitialStepIndex(); // -1 if all completed
  const isReturningUser = !!(currentSession?.cardId === cardId || existingConversation);
  const [currentStepIndex, setCurrentStepIndex] = useState(isRevisitMode ? 0 : Math.max(0, initialStep));
  const [completedSteps, setCompletedSteps] = useState<number[]>(initialCompleted);
  // Revisit mode: skip all gates, go straight to step view
  const [showOverview, setShowOverview] = useState(!isRevisitMode && !isReturningUser);
  const [showReentry, setShowReentry] = useState(!isRevisitMode && isReturningUser && !isFullyExplored && !allStepsCompleted && initialStep >= 0);
  // If all steps completed or fully explored, go straight to completion (unless revisiting)
  const [showCompletion, setShowCompletion] = useState(!isRevisitMode && isReturningUser && (isFullyExplored || allStepsCompleted || initialStep < 0));
  const [transitionMessage, setTransitionMessage] = useState<string | null>(null);

  // Determine if current user completed this step but shared session hasn't advanced yet
  const userCompletedCurrentStep = (() => {
    if (!user?.id || !currentSession || memberCount < 2) return false;
    const myCompletions = currentSession.userCompletions?.[user.id] || [];
    return myCompletions.includes(currentStepIndex) && !completedSteps.includes(currentStepIndex);
  })();

  // Catch-up mode state: sequential progression toward partner's position
  const [catchUpTarget, setCatchUpTarget] = useState<number | null>(null);
  const [syncOffer, setSyncOffer] = useState<number | null>(null);
  const localStepRef = useRef(currentStepIndex);

  // Track user's own step changes (user-initiated)
  useEffect(() => {
    localStepRef.current = currentStepIndex;
    // Auto-end catch-up when user reaches the target
    if (catchUpTarget !== null && currentStepIndex >= catchUpTarget) {
      setCatchUpTarget(null);
    }
  }, [currentStepIndex, catchUpTarget]);

  // Detect when shared session advances beyond user's local position
  useEffect(() => {
    if (!currentSession || currentSession.cardId !== cardId) return;
    const sharedStep = currentSession.currentStepIndex;
    // Only offer catch-up if shared position is ahead of where the user is
    if (sharedStep > localStepRef.current && sharedStep !== currentStepIndex) {
      setSyncOffer(sharedStep);
    }
  }, [currentSession?.currentStepIndex, cardId]);

  const handleCatchUp = () => {
    if (syncOffer !== null) {
      setCatchUpTarget(syncOffer);
      setSyncOffer(null);
    }
  };

  const handleSyncStay = () => {
    setSyncOffer(null);
  };

  // Start or resume session when entering card (skip in revisit mode and completed cards)
  useEffect(() => {
    if (isRevisitMode) return;
    if (allStepsCompleted || isFullyExplored) return; // Don't restart a completed conversation
    if (card && category) {
      if (!currentSession || currentSession.cardId !== cardId) {
        startSession(category.id, card.id);
      }
    }
  }, [cardId]);

  useEffect(() => {
    if (isRevisitMode) return;
    if (card && currentStepIndex >= 0) {
      const currentSection = card.sections.find(s => s.type === STEP_ORDER[currentStepIndex]);
      if (currentSection) {
        saveConversation(card.id, currentSection.id, currentStepIndex, completedSteps);
      }
    }
  }, [currentStepIndex, completedSteps, card]);

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

  const TRANSITION_KEYS: Record<string, string> = {
    opening: 'card_view.transition_opening',
    reflective: 'card_view.transition_reflective',
    scenario: 'card_view.transition_scenario',
  };

  const handleNextStep = () => {
    // In revisit mode, don't track progress
    const updatedCompleted = isRevisitMode
      ? completedSteps
      : completedSteps.includes(currentStepIndex)
        ? completedSteps
        : [...completedSteps, currentStepIndex];

    if (!isRevisitMode && !completedSteps.includes(currentStepIndex)) {
      setCompletedSteps(updatedCompleted);
      completeSessionStep(currentStepIndex);
      // Advance shared session forward by exactly +1 (forward-only)
      updateSessionStep(currentStepIndex + 1);
    }

    // Find the next incomplete step after the current one
    const findNextIncomplete = (afterIndex: number): number => {
      for (let i = afterIndex + 1; i < STEP_ORDER.length; i++) {
        if (!updatedCompleted.includes(i)) return i;
      }
      return -1; // all remaining steps are completed
    };

    const nextStep = isRevisitMode
      ? (currentStepIndex < STEP_ORDER.length - 1 ? currentStepIndex + 1 : -1)
      : findNextIncomplete(currentStepIndex);

    if (nextStep >= 0) {
      const currentType = STEP_ORDER[currentStepIndex];
      const msgKey = TRANSITION_KEYS[currentType];
      if (msgKey && !isRevisitMode) {
        setTransitionMessage(t(msgKey));
        setTimeout(() => {
          setTransitionMessage(null);
          setCurrentStepIndex(nextStep);
        }, 1800);
      } else {
        setCurrentStepIndex(nextStep);
      }
    } else if (isRevisitMode) {
      navigate(category ? `/category/${category.id}` : '/');
    } else {
      endSession();
      setShowCompletion(true);
    }
  };

  const handleStartFromOverview = () => {
    setShowOverview(false);
  };

  // Completion screen
  if (showCompletion) {
    const suggestedCardId = journeyState?.suggestedNextCardId;
    const suggestedCard = suggestedCardId ? getCardById(suggestedCardId) : null;
    const suggestedCategory = suggestedCard ? getCategoryById(suggestedCard.categoryId) : null;

    // Partner-aware messaging: check if partner has also reached the final step
    const partnerAlsoCompleted = memberCount >= 2
      && currentSession === undefined
      && isFullyExplored;
    // If we're in a couple and the card is fully explored by both, show "together" copy
    // Otherwise show "solo pause" copy
    const completionMessageKey = memberCount >= 2
      ? (allStepsCompleted && partnerAlsoCompleted
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
            className="text-center max-w-md mx-auto space-y-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Heart className="w-6 h-6 text-primary/60 mx-auto mb-4" />
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

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.5 }}
              className="pt-4 space-y-3"
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
                  {t('card_view.completion_next')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : suggestedCard && suggestedCategory ? (
                <Button
                  onClick={() => navigate(`/card/${suggestedCard.id}`)}
                  size="lg"
                  className="w-full gap-2"
                >
                  {t('card_view.completion_next')}
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
                {t('card_view.completion_home')}
              </Button>
              <Button
                onClick={() => navigate(`/card/${card.id}?revisit=true`)}
                variant="ghost"
                size="sm"
                className="w-full gap-2 text-muted-foreground"
              >
                <RotateCcw className="w-4 h-4" />
                {t('card_view.completion_revisit')}
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

  // Re-entry screen for returning users
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

  // Overview screen
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
              Fyra steg som hjälper er att hitta varandra. Gå i er egen takt.
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
                        {stepType === 'opening' && 'Hitta in i samtalet tillsammans.'}
                        {stepType === 'reflective' && 'Lyssna djupare på varandra.'}
                        {stepType === 'scenario' && 'Känn igen er i varandras vardag.'}
                        {stepType === 'exercise' && 'Gör något av det ni upptäckt.'}
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
              Börja med Öppnare
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

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
          completedSteps={completedSteps}
        />
      </div>

      {/* Sync prompt when partner is ahead */}
      {syncOffer !== null && (
        <SyncPrompt
          partnerStepIndex={syncOffer}
          stepLabels={STEP_LABELS}
          onCatchUp={handleCatchUp}
          onStay={handleSyncStay}
        />
      )}
      <div className="px-6 pt-6 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl md:text-2xl font-serif text-foreground text-center md:text-left"
        >
          {card.title}
        </motion.h1>
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="px-6 py-16 flex items-center justify-center"
          >
            <p className="text-sm text-muted-foreground italic text-center max-w-xs leading-relaxed">
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
              <SectionView section={currentSection} card={card} />
              
              {/* Waiting state or Navigation Buttons */}
              {userCompletedCurrentStep ? (
                <WaitingForPartner />
              ) : (
                <div className="py-8 border-t border-divider space-y-4">
                  <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-3">
                    {currentStepIndex > 0 && (
                      <Button
                        onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                        variant="outline"
                        size="lg"
                        className="gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        Tillbaka
                      </Button>
                    )}
                    <Button
                      onClick={handleNextStep}
                      size="lg"
                      className="gap-2"
                    >
                      {currentStepIndex === STEP_ORDER.length - 1 ? (
                        <>
                          <Check className="w-4 h-4" />
                          {t('card_view.finish_conversation')}
                        </>
                      ) : (
                        <>
                          {t(STEP_CTA_KEYS[STEP_ORDER[currentStepIndex]])}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="flex justify-center md:justify-start">
                    <PauseDialog onConfirm={() => { pauseSession(); navigate('/'); }} />
                  </div>
                </div>
              )}

              {/* Reflections (private → shared) */}
              <CardReflections cardId={card.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
