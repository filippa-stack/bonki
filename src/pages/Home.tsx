import { useNavigate } from 'react-router-dom';
import { getCatchUpState } from '@/lib/catchUpState';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import CategoryCard from '@/components/CategoryCard';
import ContinueModule from '@/components/ContinueModule';
import Header from '@/components/Header';
import ResumeSessionDialog from '@/components/ResumeSessionDialog';
import AttachPartner from '@/components/AttachPartner';
import { Bookmark, Share2 } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';
import RelationshipMemory from '@/components/RelationshipMemory';
import Footer from '@/components/Footer';
import RecentSharedReflection from '@/components/RecentSharedReflection';
import PartnerConnectedBanner from '@/components/PartnerConnectedBanner';

import ReturnOverlay from '@/components/ReturnOverlay';
import { Button } from '@/components/ui/button';
import bonkiLogo from '@/assets/bonki-logo.png';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProposals } from '@/hooks/useProposals';

const STEP_LABELS = ['Öppnare', 'Tankeväckare', 'Scenario', 'Teamwork'];

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useThemeVars();
  const { 
    mostRecentConversation, 
    savedConversations, 
    categories, 
    backgroundColor,
    currentSession,
    hasActiveSession,
    getCardById,
    getCategoryById,
    dismissSession,
    journeyState,
    cards,
    startSession,
    getCategoryStatus,
  } = useApp();
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const { space, displayMemberCount, userRole, fetchInviteInfo } = useCoupleSpace();
  const { incomingProposals, sendProposal: sendDbProposal } = useProposals();
  const prevIncomingCountRef = useRef(incomingProposals.length);

  // Toast when a new incoming proposal arrives
  useEffect(() => {
    if (incomingProposals.length > prevIncomingCountRef.current) {
      toast('Ni har fått ett nytt samtalsförslag', {
        description: 'Öppna Vårt utrymme för att se det',
        duration: 4000,
        action: {
          label: 'Visa',
          onClick: () => navigate('/shared'),
        },
      });
    }
    prevIncomingCountRef.current = incomingProposals.length;
  }, [incomingProposals.length, navigate]);

  // Proposal mode state
  const [isProposalMode, setIsProposalMode] = useState(false);
  const [proposalFilter, setProposalFilter] = useState<'unexplored' | 'started' | 'all'>('unexplored');
  const [proposalCandidate, setProposalCandidate] = useState<null | { cardId: string; categoryId: string }>(null);
  const [isSendingProposal, setIsSendingProposal] = useState(false);

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

  // Persist return-overlay dismissal so it doesn't reappear for 7 days
  const RETURN_OVERLAY_KEY = 'return_overlay_dismissed';
  const [returnOverlayDismissed, setReturnOverlayDismissed] = useState(() => {
    try {
      const stored = localStorage.getItem(RETURN_OVERLAY_KEY);
      if (!stored) return false;
      const { timestamp, sessionKey } = JSON.parse(stored);
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      // Expired → allow again
      if (timestamp < sevenDaysAgo) return false;
      // New session started since dismissal → allow again
      const currentKey = currentSession?.cardId || journeyState?.lastOpenedCardId || '';
      if (sessionKey && currentKey && sessionKey !== currentKey) return false;
      return true;
    } catch { return false; }
  });

  const dismissReturnOverlay = () => {
    const currentKey = currentSession?.cardId || journeyState?.lastOpenedCardId || '';
    localStorage.setItem(RETURN_OVERLAY_KEY, JSON.stringify({ timestamp: Date.now(), sessionKey: currentKey }));
    setReturnOverlayDismissed(true);
  };

  const lastActivityElapsed = useMemo(() => {
    const lastActivity = journeyState?.updatedAt;
    if (!lastActivity) return 0;
    return Date.now() - new Date(lastActivity).getTime();
  }, [journeyState]);

  const isSoloMode = displayMemberCount < 2;

  // 7+ day overlay: only if there's a session to resume AND partner is connected
  const showReturnOverlay = useMemo(() => {
    if (isSoloMode) return false;
    if (returnOverlayDismissed) return false;
    if (lastActivityElapsed < SEVEN_DAYS_MS) return false;
    return !!(currentSession || journeyState?.lastCompletedCardId || journeyState?.lastOpenedCardId);
  }, [isSoloMode, returnOverlayDismissed, lastActivityElapsed, currentSession, journeyState]);

  const returnResumeCardId = currentSession?.cardId || journeyState?.lastOpenedCardId || journeyState?.lastCompletedCardId || null;


  // Computed helpers for proposal mode & highlighted category
  const exploredIds = journeyState?.exploredCardIds || [];
  const sessionProgress = journeyState?.sessionProgress || {};

  const suggestedContext = useMemo(() => {
    const suggestedCardId = journeyState?.suggestedNextCardId
      || (journeyState?.lastOpenedCardId && !exploredIds.includes(journeyState.lastOpenedCardId) ? journeyState.lastOpenedCardId : null);
    const suggestedCard = suggestedCardId ? getCardById(suggestedCardId) : null;
    const suggestedCategory = suggestedCard ? getCategoryById(suggestedCard.categoryId) : null;
    return { suggestedCardId, suggestedCard, suggestedCategory };
  }, [journeyState, exploredIds, getCardById, getCategoryById]);

  const highlightedCategoryId = currentSession?.categoryId || suggestedContext.suggestedCategory?.id || null;

  // Get session details for resume dialog
  const sessionCard = currentSession ? getCardById(currentSession.cardId) : null;
  const sessionCategory = currentSession ? getCategoryById(currentSession.categoryId) : null;
  const sessionCatchUp = (() => {
    if (!currentSession || !user?.id) return null;
    const mySteps: number[] = journeyState?.sessionProgress?.[currentSession.cardId]?.perUser?.[user.id]?.completedSteps || [];
    return getCatchUpState(mySteps, currentSession.currentStepIndex, true);
  })();
  const sessionStepName = sessionCatchUp ? (STEP_LABELS[sessionCatchUp.effectiveStep] || '') : '';

  // Only show ResumeSessionDialog when user is truly mid-step (not at a boundary / waiting)
  const isMidCard = (() => {
    if (!sessionCatchUp) return false;
    const { effectiveStep, myFirstUncompletedStep } = sessionCatchUp;
    // All steps done → not mid-card
    if (effectiveStep >= 4) return false;
    // User completed the current shared step (waiting for partner or at boundary) → not mid-card
    if (myFirstUncompletedStep > (currentSession?.currentStepIndex ?? 0)) return false;
    // Otherwise user is genuinely mid-step
    return true;
  })();

  // Dismiss-once logic: keyed by cardId + stepIndex so it resets when session changes
  const resumeSessionKey = currentSession
    ? `resume_dismissed_${currentSession.cardId}_${currentSession.currentStepIndex}`
    : null;
  const [resumeDismissed, setResumeDismissed] = useState(() => {
    if (!resumeSessionKey) return false;
    return localStorage.getItem(resumeSessionKey) === '1';
  });
  // Reset dismissed state when the session key changes
  useEffect(() => {
    if (!resumeSessionKey) { setResumeDismissed(false); return; }
    setResumeDismissed(localStorage.getItem(resumeSessionKey) === '1');
  }, [resumeSessionKey]);

  const markResumeDismissed = () => {
    if (resumeSessionKey) localStorage.setItem(resumeSessionKey, '1');
    setResumeDismissed(true);
  };

  const handleResumeSession = () => {
    if (currentSession) {
      markResumeDismissed();
      markNavigated();
      navigate(`/card/${currentSession.cardId}`);
    }
  };

  const handleDismissSession = () => {
    markResumeDismissed();
    dismissSession();
  };

  // Track whether user has already navigated away during this browser session
  const [hasNavigatedThisVisit] = useState(() => sessionStorage.getItem('home_navigated') === '1');
  const markNavigated = () => sessionStorage.setItem('home_navigated', '1');

  // Single derived variable: at most ONE resume surface at a time
  type ResumeSurface = 'returnOverlay' | 'resumeDialog' | 'continueModule' | 'none';
  const resumeSurface: ResumeSurface = useMemo(() => {
    if (showReturnOverlay) return 'returnOverlay';
    if (hasActiveSession && !!sessionCard && !!sessionCategory && !resumeDismissed && isMidCard && !isSoloMode) return 'resumeDialog';
    // ContinueModule: suppress if too long inactive
    if (lastActivityElapsed >= FOURTEEN_DAYS_MS) return 'none';
    // Always show ContinueModule for active sessions (even if user already navigated this visit)
    if (currentSession) return 'continueModule';
    if (hasNavigatedThisVisit) return 'none';
    if (journeyState?.lastCompletedCardId || journeyState?.suggestedNextCardId) return 'continueModule';
    return 'none';
  }, [showReturnOverlay, hasActiveSession, sessionCard, sessionCategory, resumeDismissed, isMidCard, isSoloMode, currentSession, journeyState, lastActivityElapsed]);

  const handleEnterProposalMode = () => {
    setIsProposalMode(true);
    setProposalFilter('unexplored');
    setTimeout(() => {
      document.getElementById('proposal-mode')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendProposal = async () => {
    if (!proposalCandidate) return;
    setIsSendingProposal(true);
    try {
      const result = await sendDbProposal(proposalCandidate.cardId, proposalCandidate.categoryId);
      if (result.ok) {
        setProposalCandidate(null);
        setIsProposalMode(false);
        toast.success('Förslag skickat');
      } else {
        toast.error('Kunde inte skicka förslaget. Försök igen.');
      }
    } finally {
      setIsSendingProposal(false);
    }
  };

  // Build proposal candidates grouped by category
  const proposalGroups = useMemo(() => {
    if (!isProposalMode) return [];
    return categories
      .map((cat) => {
        const catCards = cards
          .filter((c) => c.categoryId === cat.id)
          .filter((card) => {
            const finished = exploredIds.includes(card.id);
            const started = !!sessionProgress[card.id] && !finished;
            if (proposalFilter === 'unexplored') return !finished;
            if (proposalFilter === 'started') return started;
            return true; // 'all'
          });
        return { category: cat, cards: catCards };
      })
      .filter((g) => g.cards.length > 0);
  }, [isProposalMode, categories, cards, exploredIds, sessionProgress, proposalFilter]);

  const candidateCard = proposalCandidate ? getCardById(proposalCandidate.cardId) : null;
  const candidateCategory = proposalCandidate ? getCategoryById(proposalCandidate.categoryId) : null;

  return (
    <div className="min-h-screen flex flex-col page-bg">
      {/* 7+ day return overlay */}
      <AnimatePresence>
        {resumeSurface === 'returnOverlay' && (
          <ReturnOverlay
            onResume={() => {
              dismissReturnOverlay();
              if (returnResumeCardId) { markNavigated(); navigate(`/card/${returnResumeCardId}`); }
            }}
            onStartNew={() => {
              dismissReturnOverlay();
            }}
            onBrowse={() => {
              dismissReturnOverlay();
            }}
          />
        )}
      </AnimatePresence>
      <div className="flex-1">
      <Header showBackgroundPicker={false} showBackupManager={false} />
      {/* Header with Logo */}
      <div className="px-6 pt-14 pb-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="mb-8 flex justify-center"
        >
          <img 
            src={bonkiLogo} 
            alt="Still Us" 
            className="h-14 w-auto"
          />
        </motion.div>
        
        <div className="text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-display font-serif hero-title-color"
            >
              STILL US — So we stay us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15, delay: 0.05 }}
              className="text-body mt-3 font-sans hero-subtitle-color"
            >
              Förbli ett vi medan vi uppfostrar dem
            </motion.p>
        </div>
      </div>


      {/* Partner connected banner */}
      <PartnerConnectedBanner />

      {/* Compact proposal indicator */}
      {incomingProposals.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="px-6 mb-6"
        >
          <div className="rounded-2xl border border-border bg-card/50 px-5 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Ni har ett föreslaget samtal</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground text-xs"
              onClick={() => navigate('/shared')}
            >
              Öppna i Vårt utrymme
            </Button>
          </div>
        </motion.div>
      )}

      {/* Journey continue module — only when it wins priority */}
      {resumeSurface === 'continueModule' && (() => {
        // Priority 1: Active shared session — always show ContinueModule for it
        if (currentSession) {
          const activeCard = getCardById(currentSession.cardId);
          const activeCategory = activeCard ? getCategoryById(activeCard.categoryId) : null;
          if (activeCard && activeCategory) {
            const activeMySteps: number[] = user?.id && journeyState?.sessionProgress?.[currentSession.cardId]?.perUser?.[user.id]?.completedSteps || [];
            const { isCatchingUp: activeCatchingUp } = getCatchUpState(activeMySteps, currentSession.currentStepIndex, true);
            return (
              <div className="space-y-2">
                <ContinueModule
                  cardTitle={activeCard.title}
                  categoryTitle={activeCategory.title}
                  lastActiveAt={journeyState?.updatedAt}
                  isCatchingUp={activeCatchingUp}
                  onContinue={() => { markNavigated(); navigate(`/card/${currentSession.cardId}`); }}
                />
              </div>
            );
          }
        }

        const lastCompletedId = journeyState?.lastCompletedCardId;
        const lastCompletedCard = lastCompletedId ? getCardById(lastCompletedId) : null;
        const lastCompletedCategory = lastCompletedCard ? getCategoryById(lastCompletedCard.categoryId) : null;
        const isPostCompletion = lastCompletedId && suggestedContext.suggestedCardId && lastCompletedId !== suggestedContext.suggestedCardId
          && exploredIds.includes(lastCompletedId);

        // Post-completion: show the completed card context
        if (isPostCompletion && lastCompletedCard && lastCompletedCategory) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="px-6 mb-10"
            >
                <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
                <p className="font-serif text-lg text-foreground">{lastCompletedCard.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t('card_view.completion_message')}
                </p>
                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      const el = document.getElementById('category-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {t('general.choose_another')}
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        }
        
        if (suggestedContext.suggestedCard && suggestedContext.suggestedCategory) {
          const suggestedCardId = suggestedContext.suggestedCard.id;
          const suggestedMySteps: number[] = user?.id && suggestedCardId && journeyState?.sessionProgress?.[suggestedCardId]?.perUser?.[user.id]?.completedSteps || [];
          const suggestedSharedStep = currentSession?.cardId === suggestedCardId ? currentSession.currentStepIndex : 0;
          const suggestedHasSession = !!(currentSession?.cardId === suggestedCardId);
          const { isCatchingUp: suggestedCatchingUp } = getCatchUpState(suggestedMySteps, suggestedSharedStep, suggestedHasSession);

          return (
            <div className="space-y-2">
              <ContinueModule
                cardTitle={suggestedContext.suggestedCard.title}
                categoryTitle={suggestedContext.suggestedCategory.title}
                lastActiveAt={journeyState?.updatedAt}
                isCatchingUp={suggestedCatchingUp}
                onContinue={() => { markNavigated(); navigate(`/card/${suggestedContext.suggestedCard!.id}`); }}
              />
            </div>
          );
        }
        
        // Fallback to most recent conversation
        if (mostRecentConversation) {
          const recentCard = getCardById(mostRecentConversation.cardId);
          const recentCategory = recentCard ? getCategoryById(recentCard.categoryId) : null;
          if (recentCard && recentCategory) {
            const recentMySteps: number[] = user?.id && mostRecentConversation.cardId && journeyState?.sessionProgress?.[mostRecentConversation.cardId]?.perUser?.[user.id]?.completedSteps || [];
            const recentSharedStep = currentSession?.cardId === mostRecentConversation.cardId ? currentSession.currentStepIndex : 0;
            const recentHasSession = !!(currentSession?.cardId === mostRecentConversation.cardId);
            const { isCatchingUp: recentCatchingUp } = getCatchUpState(recentMySteps, recentSharedStep, recentHasSession);

            return (
              <div className="space-y-2">
                <ContinueModule
                  cardTitle={recentCard.title}
                  categoryTitle={recentCategory.title}
                  lastActiveAt={mostRecentConversation.lastActivityAt instanceof Date ? mostRecentConversation.lastActivityAt.toISOString() : String(mostRecentConversation.lastActivityAt)}
                  isCatchingUp={recentCatchingUp}
                  onContinue={() => { markNavigated(); navigate(`/card/${mostRecentConversation.cardId}`); }}
                />
              </div>
            );
          }
        }

        // No conversations yet — guide to recommended first card
        const firstCategory = categories[0];
        const firstCard = firstCategory ? cards.find(c => c.categoryId === firstCategory.id) : null;
        if (firstCard && firstCategory) {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="px-6 py-6"
            >
              <div className="rounded-2xl border border-border bg-card p-6 text-center space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {isSoloMode
                    ? t('home.first_conversation_hint')
                    : t('home.first_conversation_hint_paired', 'Ni har inte startat något samtal ännu. Föreslå ett ämne så börjar ni tillsammans.')}
                </p>
                {isSoloMode ? (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => navigate(`/card/${firstCard.id}`)}
                  >
                    {t('home.start_first_conversation')}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={handleEnterProposalMode}
                  >
                    Föreslå ert första samtal
                  </Button>
                )}
              </div>
            </motion.div>
          );
        }
        
        return null;
      })()}

      {/* Explore together — integrated into categories for paired users */}

      {/* One-time hint: explain proposal system when first paired */}
      {displayMemberCount >= 2 && !isProposalMode && (() => {
        const PROPOSAL_HINT_KEY = 'still-us-proposal-hint-shown';
        const alreadyShown = localStorage.getItem(PROPOSAL_HINT_KEY) === 'true';
        if (alreadyShown) return null;
        // Mark as shown after render
        setTimeout(() => localStorage.setItem(PROPOSAL_HINT_KEY, 'true'), 0);
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="px-6 mb-6"
          >
            <div className="rounded-2xl border border-primary/20 bg-card/60 px-5 py-4 text-center space-y-1">
              <p className="text-sm text-foreground font-serif">Så fungerar det</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ni väljer samtalsämne tillsammans. En av er föreslår ett kort, den andra accepterar — sedan börjar ni.
              </p>
            </div>
          </motion.div>
        );
      })()}

      {/* Solo-user hint: app works best together */}
      {space && displayMemberCount < 2 && !isProposalMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="px-6 mb-4"
        >
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Appen är gjord för er båda. Bjud in din partner för att få ut det mesta av era samtal.
          </p>
        </motion.div>
      )}

      {/* Partner status — only before connection */}
      {space && displayMemberCount < 2 && (
         <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="px-6 pb-6"
        >
          <AttachPartner
            fetchInviteInfo={fetchInviteInfo}
            partnerName={userRole === 'partner_b' ? space.partner_b_name : space.partner_a_name}
            onUpdateName={async (name) => {
              const role = userRole === 'partner_b' ? 'partner_b_name' : 'partner_a_name';
              await supabase
                .from('couple_spaces')
                .update({ [role]: name })
                .eq('id', space.id);
            }}
            memberCount={displayMemberCount}
            onJoinedSpace={() => window.location.reload()}
          />
        </motion.div>
      )}

      {/* Proposal Mode */}
      <AnimatePresence>
        {isProposalMode && (
           <motion.div
            id="proposal-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-6 pb-8"
          >
            {/* Mode header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => { setIsProposalMode(false); setProposalCandidate(null); }}
              >
                Avbryt
              </Button>
              <span className="text-sm font-serif text-muted-foreground">Föreslå ett samtal</span>
              <div className="w-16" /> {/* spacer for centering */}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6">
              {([
                { key: 'unexplored' as const, label: 'Ej utforskade' },
                { key: 'started' as const, label: 'Påbörjade' },
                { key: 'all' as const, label: 'Alla' },
              ]).map((tab) => (
                <Button
                  key={tab.key}
                  variant={proposalFilter === tab.key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setProposalFilter(tab.key)}
                  className="flex-1"
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Candidate list grouped by category */}
            <div className="space-y-6">
              {proposalGroups.map((group) => (
                <div key={group.category.id}>
                  <p className="text-xs tracking-wide text-muted-foreground/60 uppercase mb-3">
                    {group.category.title}
                  </p>
                  <div className="space-y-2">
                    {group.cards.map((card) => (
                      <motion.button
                        key={card.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setProposalCandidate({ cardId: card.id, categoryId: card.categoryId })}
                        className={`w-full text-left rounded-2xl border p-5 transition-colors ${
                          proposalCandidate?.cardId === card.id
                            ? 'border-primary/40 bg-primary/5'
                            : 'border-border bg-card hover:bg-accent/30'
                        }`}
                      >
                        <p className="font-serif text-foreground">{card.title}</p>
                        {card.subtitle && (
                          <p className="text-sm text-muted-foreground mt-1">{card.subtitle}</p>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ))}
              {proposalGroups.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Inga samtal matchar filtret.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Proposal confirmation sheet */}
      <AnimatePresence>
        {proposalCandidate && candidateCard && candidateCategory && (
           <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-0 bottom-0 z-50 p-4"
          >
            <div className="rounded-2xl border border-border bg-card p-6 max-w-md mx-auto space-y-4">
              <p className="font-serif text-foreground text-center">Föreslå detta samtal?</p>
              <div className="text-center">
                <p className="text-sm text-foreground">{candidateCard.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{candidateCategory.title}</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  className="flex-1 text-muted-foreground"
                  onClick={() => setProposalCandidate(null)}
                >
                  Avbryt
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSendProposal}
                  disabled={isSendingProposal}
                >
                  {isSendingProposal ? 'Skickar...' : 'Skicka förslag'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories — solo users see all; paired users browse via proposal mode */}
      {!isProposalMode && isSoloMode && (
        <div id="category-section" className="px-6 pb-12 mt-10">
          <p className="text-sm text-muted-foreground/60 mb-8 font-serif not-italic">
            {t('home.choose_category')}
          </p>
          <div className="space-y-4">
            {categories.map((category, index) => {
              const catStatus = getCategoryStatus(category.id);
              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => navigate(`/category/${category.id}`)}
                  index={index}
                  highlighted={category.id === highlightedCategoryId}
                  isCompleted={catStatus === 'explored'}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Paired users: gentle entry into proposal mode */}
      {!isProposalMode && !isSoloMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="px-6 pb-12 mt-10"
        >
          <div className="text-center space-y-6">
            <p className="text-sm text-muted-foreground/60 font-serif">
              Vad vill ni prata om?
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={handleEnterProposalMode}
              className="rounded-full px-8 border-border/60 text-foreground hover:bg-card/70 font-serif text-base"
            >
              Välj samtalsämne
            </Button>
          </div>
        </motion.div>
      )}

      {/* Relationship Memory */}
      {(() => {
        const lastCompletedId = journeyState?.lastCompletedCardId;
        const lastCard = lastCompletedId ? getCardById(lastCompletedId) : null;
        const lastCategory = lastCard ? getCategoryById(lastCard.categoryId) : null;
        if (lastCard && lastCategory && journeyState?.updatedAt) {
          return (
            <RelationshipMemory
              cardTitle={lastCard.title}
              categoryTitle={lastCategory.title}
              completedAt={journeyState.updatedAt}
            />
          );
        }
        return null;
      })()}

      {/* Recent shared reflection preview */}
      <RecentSharedReflection />

      {/* Navigation links — grouped */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="px-6 pt-8 pb-6 mt-4 space-y-1"
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

      {/* Notification preferences */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="px-6 py-6 border-t border-divider"
      >
        <NotificationSettings />
      </motion.div>

      {/* Resume session dialog */}
      <ResumeSessionDialog
        isOpen={resumeSurface === 'resumeDialog'}
        categoryName={sessionCategory?.title || ''}
        cardTitle={sessionCard?.title || ''}
        stepName={sessionStepName}
        onResume={handleResumeSession}
        onBackToCategories={handleDismissSession}
      />
      </div>
      <Footer />
    </div>
  );
}
