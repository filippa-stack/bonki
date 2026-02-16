import { useNavigate } from 'react-router-dom';
// getCatchUpState no longer needed on Home — ACTIVE state uses session data directly
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import CategoryCard from '@/components/CategoryCard';

import Header from '@/components/Header';
// ResumeSessionDialog removed — ACTIVE macro state handles resume via single CTA
// AttachPartner import removed — not used in simplified macro state view
import SoloInviteSection from '@/components/SoloInviteSection';
import { ArrowRight, Bookmark, Share2, ChevronDown } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';
import RelationshipMemory from '@/components/RelationshipMemory';
import Footer from '@/components/Footer';
// RecentSharedReflection removed from connected Home — archive remains intact
import PartnerConnectedBanner from '@/components/PartnerConnectedBanner';

import ReturnOverlay from '@/components/ReturnOverlay';
import { Button } from '@/components/ui/button';
import bonkiLogo from '@/assets/bonki-logo.png';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProposals } from '@/hooks/useProposals';
import { useDevState, DEV_MOCK } from '@/hooks/useDevState';

const STEP_LABELS = ['Öppnare', 'Tankeväckare', 'Scenario', 'Teamwork'];

/** Collapsed "Notiser" row for connected Home — expands inline on tap */
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
    mostRecentConversation, 
    savedConversations, 
    categories, 
    backgroundColor,
    currentSession,
    hasActiveSession,
    getCardById,
    getCategoryById,
    // dismissSession removed — no competing resume surfaces
    journeyState,
    cards,
    startSession,
    getCategoryStatus,
  } = useApp();
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const { space, displayMemberCount, userRole, fetchInviteInfo } = useCoupleSpace();
  const { incomingProposals, sendProposal: sendDbProposal, updateProposalStatus, activateSession } = useProposals();
  const devState = useDevState();

  // Track dismissed proposals so they don't reappear in the same session
  const [dismissedProposalIds, setDismissedProposalIds] = useState<Set<string>>(new Set());
  const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(null);

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

  // Resume variation is now only the return overlay (ResumeSessionDialog removed)
  // ACTIVE state's single CTA replaces all mid-session resume surfaces.

  // Track whether user has already navigated away during this browser session
  const [hasNavigatedThisVisit] = useState(() => sessionStorage.getItem('home_navigated') === '1');
  const markNavigated = () => sessionStorage.setItem('home_navigated', '1');

  // ═══ 3 MACRO STATES (paired only) ═══
  // IDLE:        paired, no active session
  // ACTIVE:      currentSession != null
  // INTEGRATION: transient post-completion (handled in CardView)
  //
  // Proposals, resume dialogs, return overlays are internal UI variations
  // within IDLE or ACTIVE — never separate modes.
  type MacroState = 'idle' | 'active';
  const macroState: MacroState = hasActiveSession ? 'active' : 'idle';

  // UI variation: return overlay is the only overlay surface now
  // ACTIVE state's single CTA handles all resume — no competing dialogs.
  type ResumeVariation = 'returnOverlay' | 'none';
  const resumeVariation: ResumeVariation = useMemo(() => {
    if (isSoloMode) return 'none';
    if (showReturnOverlay) return 'returnOverlay';
    return 'none';
  }, [isSoloMode, showReturnOverlay]);

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
        {resumeVariation === 'returnOverlay' && (
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
      {/* Header with Logo — compact when active session */}




      {/* Partner connected banner */}
      <PartnerConnectedBanner />

      {/* ═══ PRIMARY ACTION ZONE ═══
           3 macro states: SOLO → IDLE → ACTIVE
           Proposals & resume are UI variations within IDLE/ACTIVE, not separate modes.
           devState overrides rendering only — no DB/edge calls.
      */}
      {(() => {
        // Compute effective state variables, with dev overrides
        const effectiveSoloMode = devState === 'solo' ? true
          : devState === 'pairedIdle' || devState === 'pairedActive' || devState === 'proposalIncoming' ? false
          : isSoloMode;
        const effectiveSession = devState === 'pairedActive' ? DEV_MOCK.mockSession
          : devState === 'solo' || devState === 'pairedIdle' || devState === 'proposalIncoming' ? null
          : currentSession;
        const effectiveProposals = devState === 'proposalIncoming' ? [DEV_MOCK.mockProposal]
          : devState ? []
          : incomingProposals;

        // ── HIGHEST PRIORITY GATE: Solo mode ──
        // displayMemberCount < 2 overrides ALL resume/session/proposal logic
        if (effectiveSoloMode) {
          if (space) {
            return (
              <SoloInviteSection
                fetchInviteInfo={fetchInviteInfo}
                onJoinedSpace={() => window.location.reload()}
              />
            );
          }
          // No space yet — show nothing (edge case during initialization)
          return null;
        }

        // ── Below here: paired only (displayMemberCount >= 2) ──

        // ── IDLE variation: incoming proposal REPLACES Home intent ──
        // Full-screen decision ritual — no background navigation until resolved.
        const visibleProposals = effectiveProposals.filter(p => !dismissedProposalIds.has(p.id));
        if (visibleProposals.length > 0 && !effectiveSession) {
          const proposal = visibleProposals[0];
          const proposalCard = getCardById(proposal.card_id) || (devState ? { title: DEV_MOCK.mockCard.title, subtitle: DEV_MOCK.mockCard.subtitle } as any : null);
          const isAccepting = acceptingProposalId === proposal.id;
          return (
            <motion.div
              key={`proposal-ritual-${proposal.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-background"
            >
              <div className="w-full max-w-sm space-y-10 text-center">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground/60 uppercase tracking-wide">
                    Förslag från din partner
                  </p>
                  <h1 className="text-2xl font-serif text-foreground leading-snug">
                    {proposalCard?.title || 'Samtal'}
                  </h1>
                  {proposal.message && (
                    <p className="text-sm text-muted-foreground italic">"{proposal.message}"</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full h-14 rounded-2xl gap-2 font-normal"
                    disabled={isAccepting}
                    onClick={devState ? undefined : async () => {
                      setAcceptingProposalId(proposal.id);
                      await updateProposalStatus(proposal.id, 'accepted');
                      const result = await activateSession(proposal.id);
                      setAcceptingProposalId(null);
                      if (result.success) {
                        navigate(`/card/${proposal.card_id}`);
                      } else {
                        toast.error('Kunde inte starta samtalet. Försök igen.');
                      }
                    }}
                  >
                    {isAccepting ? 'Startar...' : 'Acceptera'}
                    {!isAccepting && <ArrowRight className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="lg"
                    className="w-full h-12 text-muted-foreground hover:text-foreground font-normal"
                    disabled={isAccepting}
                    onClick={() => {
                      setDismissedProposalIds(prev => new Set([...prev, proposal.id]));
                    }}
                  >
                    Avvakta
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        }

        // ── MACRO STATE: ACTIVE — singular focus ──
        if (effectiveSession) {
          const activeCard = getCardById(effectiveSession.cardId) || (devState ? { title: DEV_MOCK.mockCard.title, categoryId: DEV_MOCK.mockCategory.id } as any : null);
          const activeCategory = activeCard ? (getCategoryById(activeCard.categoryId) || (devState ? { title: DEV_MOCK.mockCategory.title } as any : null)) : null;
          // Step indicator (subtle)
          const stepLabel = STEP_LABELS[effectiveSession.currentStepIndex] || '';
          const stepProgress = `${Math.min(effectiveSession.currentStepIndex + 1, 4)} / 4`;
          if (activeCard && activeCategory) {
            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="px-6 pt-[12px] mb-10"
              >
                <p className="text-xs text-muted-foreground/30 uppercase tracking-wide mb-[6px] text-center">Pågående samtal</p>
                <div className="text-center mb-[16px]">
                  <p className="font-serif text-lg text-foreground mb-[6px]">{activeCard.title}</p>
                  <p className="text-xs text-muted-foreground mb-[6px]">{activeCategory.title}</p>
                  {stepLabel && (
                    <p className="text-xs text-muted-foreground/40">{stepLabel} · {stepProgress}</p>
                  )}
                </div>
                <Button
                  onClick={devState ? undefined : () => { markNavigated(); navigate(`/card/${effectiveSession.cardId}`); }}
                  size="lg"
                  className="w-full h-14 rounded-2xl gap-2 font-normal"
                >
                  Fortsätt samtalet
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          }
        }

        // ── MACRO STATE: IDLE — single question: "What are we doing now?" ──
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="px-6 mb-10"
          >
            <div className="text-center">
              <Button
                size="lg"
                onClick={handleEnterProposalMode}
                className="w-full h-14 rounded-2xl gap-2 font-normal"
              >
                Välj samtalsämne
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        );
      })()}

      {/* ═══ BELOW FOLD — secondary content (IDLE only, hidden when ACTIVE) ═══ */}

      {/* Proposal mode (opened by primary CTA for paired IDLE users) */}
      <AnimatePresence>
        {isProposalMode && !isSoloMode && !hasActiveSession && (
           <motion.div
            id="proposal-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background overflow-y-auto px-6 pt-6 pb-8"
          >
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
              <div className="w-16" />
            </div>

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

      {/* Categories — solo: demoted preview with label */}
      {!isProposalMode && isSoloMode && (
        <div id="category-section" className="px-6 pb-12 mt-4">
          <p className="text-xs text-muted-foreground/40 uppercase tracking-wide mb-4 text-center">
            Tillgängligt när ni är två
          </p>
          <div className="space-y-4 opacity-50 pointer-events-none">
            {categories.map((category, index) => {
              const catStatus = getCategoryStatus(category.id);
              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => {}}
                  index={index}
                  highlighted={false}
                  isCompleted={catStatus === 'explored'}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Relationship Memory — solo only */}
      {isSoloMode && (() => {
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

      {/* Navigation links — solo only, hidden during active session */}
      {isSoloMode && !hasActiveSession && (
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
      )}

      {/* Notification preferences — connected: collapsed "Notiser" row; solo: inline */}
      {isSoloMode ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="px-6 py-6 border-t border-divider"
        >
          <NotificationSettings />
        </motion.div>
      ) : (
        <NotiserSection />
      )}

      {/* ResumeSessionDialog removed — ACTIVE state's single CTA handles resume */}
      </div>
      <Footer />
    </div>
  );
}
