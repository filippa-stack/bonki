/**
 * MANUAL CONFIDENCE CHECK — TWO DEVICES
 *
 * 1) Device A (partner_a) proposes → Device B (partner_b) accepts → Device A sees Home switch to active without refresh.
 * 2) Device A completes step 1 → Device B sees waiting/progress update.
 * 3) Device B taps "Inte nu" on incoming proposal → saved_for_later persists; "SPARAT FÖRSLAG" visible (realtime or after refresh).
 * 4) Device B taps "Ta bort" → it disappears with no console warnings.
 */

// SESSION MODEL LOCK:
// Do NOT use couple_progress.current_session.
// The JSON session model is deprecated.
// All session state must come from normalized tables.

// Recommended category order for future UI highlighting — does not affect rendering.
// IDs must match content.ts category ids exactly.
const RECOMMENDED_CATEGORY_ORDER = [
  "emotional-intimacy",   // Paridentitet vs föräldraidentitet
  "communication",        // Arbetsfördelning & mentala lasset
  "category-8",           // Kommunikation & stöd
  "category-7",           // Motståndskraft innan det brister
  "parenting-together",   // Uppfostringsstilar
  "individual-needs",     // Släkt & kultur
  "category-9",           // Värderingar & framtid
  "category-6",           // Pengar & föräldraskap
  "daily-life",           // Närhet & Intimitet
  "category-10",          // Uthållighet
];

// Recommended card order per category (by card position/index) — unused for now, for future UI highlighting.
// Keys use slug-style names that map to RECOMMENDED_CATEGORY_ORDER intent.
const RECOMMENDED_TOPIC_ORDER: Record<string, number[]> = {
  "paridentitet-vs-foraldraidentitet": [7, 8],
  "arbetsfordelning-mentalt-ansvar":   [1, 3, 2],
  "kommunikation-stod":                [17, 18],
  "motstandskraft-innan-det-brister":  [16, 15],
  "uppfostringsstilar":                [4, 6, 5],
  "slakt-kultur":                      [11, 12],
  "varderingar-framtid":               [19, 20],
  "pengar-foraldraskap":               [14, 13],
  "narhet-intimitet":                  [10, 9],
  "uthallighet":                       [21, 22],
};

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import CategoryCard from '@/components/CategoryCard';

import Header from '@/components/Header';
import SoloInviteSection from '@/components/SoloInviteSection';
import { ArrowRight, Bookmark, Share2, ChevronDown, X } from 'lucide-react';
import NotificationSettings from '@/components/NotificationSettings';
import RelationSettings from '@/components/RelationSettings';
import RelationshipMemory from '@/components/RelationshipMemory';
import Footer from '@/components/Footer';
import PartnerConnectedBanner from '@/components/PartnerConnectedBanner';
import PartnerLeftBanner from '@/components/PartnerLeftBanner';
import NewChapterBanner from '@/components/NewChapterBanner';

import ReturnOverlay from '@/components/ReturnOverlay';
import ConfidenceCheckPanel from '@/components/ConfidenceCheckPanel';
import { Button } from '@/components/ui/button';
import bonkiLogo from '@/assets/bonki-logo.png';
import { useThemeVars } from '@/hooks/useThemeVars';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useProposalsContext } from '@/contexts/ProposalsContext';
import { DEV_MOCK } from '@/hooks/useDevState';
import { useDevState } from '@/contexts/DevStateContext';
import { useAppMode } from '@/hooks/useAppMode';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';

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

/** Collapsed disclosure for locked categories in solo mode */
function LockedCategoriesDisclosure({ categories, getCategoryStatus }: {
  categories: Array<{ id: string; title: string; description: string; cardCount: number; [k: string]: any }>;
  getCategoryStatus: (id: string) => string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        <span className="uppercase tracking-wide">Tillgängligt när ni är två</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-4 mt-2 opacity-50 pointer-events-none">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              onClick={() => {}}
              index={index}
              highlighted={false}
              isCompleted={getCategoryStatus(category.id) === 'explored'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** One-time "Du är nu ansluten" banner for User B after join */
function JustJoinedBanner() {
  const [visible, setVisible] = useState(() => {
    if (localStorage.getItem('still-us-just-joined') === 'true') {
      localStorage.removeItem('still-us-just-joined');
      return true;
    }
    return false;
  });

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-3 mb-4 px-6">
      <p className="text-[13px] text-muted-foreground/50 text-center">
        🤍 Du är nu ansluten.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
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
    getCardById,
    getCategoryById,
    journeyState,
    cards,
    getCategoryStatus,
    clearForPartnerLeave,
    switchToNewSpace,
  } = useApp();
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const { space, displayMemberCount, userRole, fetchInviteInfo } = useCoupleSpaceContext();
  const { incomingProposals: _rawProposals, ownPendingProposals, savedProposals, sendProposal: sendDbProposal, updateProposalStatus, activateSession } = useProposalsContext();
  const devState = useDevState();
  const appModeState = useAppMode();
  const normalizedSession = useNormalizedSessionContext();
  const { mode } = appModeState;

  const [acceptingProposalId, setAcceptingProposalId] = useState<string | null>(null);
  const [viewingSavedProposalId, setViewingSavedProposalId] = useState<string | null>(null);

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
      const currentKey = normalizedSession.cardId || journeyState?.lastOpenedCardId || '';
      if (sessionKey && currentKey && sessionKey !== currentKey) return false;
      return true;
    } catch { return false; }
  });

  const dismissReturnOverlay = () => {
    const currentKey = normalizedSession.cardId || journeyState?.lastOpenedCardId || '';
    localStorage.setItem(RETURN_OVERLAY_KEY, JSON.stringify({ timestamp: Date.now(), sessionKey: currentKey }));
    setReturnOverlayDismissed(true);
  };

  const lastActivityElapsed = useMemo(() => {
    const lastActivity = journeyState?.updatedAt;
    if (!lastActivity) return 0;
    return Date.now() - new Date(lastActivity).getTime();
  }, [journeyState]);

  const isSoloMode = appModeState.isSolo;

  // Track if partner was ever connected during this app session
  const hadPartnerBeforeRef = useRef(false);
  if (displayMemberCount >= 2) hadPartnerBeforeRef.current = true;
  const hadPartnerBefore = hadPartnerBeforeRef.current && isSoloMode;

  // 7+ day overlay: only if there's a session to resume AND partner is connected
  const showReturnOverlay = useMemo(() => {
    if (isSoloMode) return false;
    if (returnOverlayDismissed) return false;
    if (lastActivityElapsed < SEVEN_DAYS_MS) return false;
    return !!(mode === 'active' || journeyState?.lastCompletedCardId || journeyState?.lastOpenedCardId);
  }, [isSoloMode, returnOverlayDismissed, lastActivityElapsed, mode, journeyState]);

  const returnResumeCardId = normalizedSession.cardId || journeyState?.lastOpenedCardId || journeyState?.lastCompletedCardId || null;

  // Clear proposal picker state when an incoming proposal arrives
  useEffect(() => {
    if (mode === 'proposal') {
      setIsProposalMode(false);
      setProposalCandidate(null);
    }
  }, [mode]);

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

  const highlightedCategoryId = normalizedSession.categoryId || suggestedContext.suggestedCategory?.id || null;

  // Recommended category pill: first category in order that has at least one unexplored card.
  // Falls back to first item in list if no signal available.
  const recommendedCategoryId = useMemo(() => {
    for (const catId of RECOMMENDED_CATEGORY_ORDER) {
      const catCards = cards.filter((c) => c.categoryId === catId);
      if (catCards.length === 0) continue;
      const allExplored = catCards.every((c) => exploredIds.includes(c.id));
      if (!allExplored) return catId;
    }
    return RECOMMENDED_CATEGORY_ORDER[0];
  }, [cards, exploredIds]);

  // Track whether user has already navigated away during this browser session
  const [hasNavigatedThisVisit] = useState(() => sessionStorage.getItem('home_navigated') === '1');
  const markNavigated = () => sessionStorage.setItem('home_navigated', '1');

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
      <Header showBackgroundPicker={false} showBackupManager={false} showSaveIndicator={mode === 'active'} />
      <ConfidenceCheckPanel />
      {/* Header with Logo — compact when active session */}




      {/* ── Banner stack ── */}
      <div className="mt-6 space-y-4 mb-8">
        {/* Partner connected banner (for partner_a seeing partner_b join) */}
        <PartnerConnectedBanner />

        {/* Just-joined banner (for partner_b after completing join flow) */}
        <JustJoinedBanner />

        {/* Partner left banner — shown when partner_left_space event detected */}
        <PartnerLeftBanner
          onPartnerLeft={clearForPartnerLeave}
          onInvite={() => {
            setTimeout(() => {
              document.getElementById('solo-invite')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
        />

        {/* New chapter banner — shown when partner started a new chapter (new_space_created event) */}
        <NewChapterBanner />
      </div>

      {/* ═══ PRIMARY ACTION ZONE — driven by centralized useAppMode() ═══ */}
      {mode === 'loading' && (
        <div className="px-6 pt-8 pb-10">
          <div className="h-14 rounded-2xl bg-muted/20 animate-pulse" />
        </div>
      )}

      {mode === 'solo' && space && (
        <SoloInviteSection
          fetchInviteInfo={fetchInviteInfo}
          onJoinedSpace={() => { /* no-op — realtime providers handle state update */ }}
          hadPartnerBefore={hadPartnerBefore}
        />
      )}

      <AnimatePresence>
        {mode === 'proposal' && appModeState.incomingProposals[0] && (() => {
          const proposal = appModeState.incomingProposals[0];
          const proposalCard = getCardById(proposal.card_id) || (devState ? { title: DEV_MOCK.mockCard.title, subtitle: DEV_MOCK.mockCard.subtitle } as any : null);
          const isAccepting = acceptingProposalId === proposal.id;
          return (
            <>
              {/* Backdrop — fades out over 180ms */}
              <motion.div
                key={`proposal-backdrop-${proposal.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: [0.4, 0.0, 0.2, 1] }}
                className="fixed inset-0 z-40 bg-background"
              />

              {/* Modal — slides up 8px and fades on exit */}
              <motion.div
                key={`proposal-modal-${proposal.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18, ease: [0.4, 0.0, 0.2, 1] }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8"
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
                      onClick={devState ? () => navigate(`/card/${DEV_MOCK.mockCard.id}`) : async () => {
                        setAcceptingProposalId(proposal.id);
                        await updateProposalStatus(proposal.id, 'accepted');
                        const result = await activateSession(proposal.id);
                        setAcceptingProposalId(null);
                        if (result.success) {
                          navigate(`/card/${proposal.card_id}`);
                        } else {
                          const errMsg = (result as any).errorMessage || 'Unknown error';
                          console.error('[DIAG] Activation failed in Home:', errMsg);
                          toast.error(`[DIAG] ${errMsg}`);
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
                      onClick={() => updateProposalStatus(proposal.id, 'saved_for_later')}
                    >
                      Inte nu
                    </Button>
                    {!isAccepting && <p className="text-xs text-muted-foreground/50 mt-1">Du kan välja det senare från startsidan.</p>}
                  </div>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {mode === 'active' && normalizedSession.cardId && (() => {
        const activeCard = getCardById(normalizedSession.cardId!) || (devState ? { title: DEV_MOCK.mockCard.title, categoryId: DEV_MOCK.mockCategory.id } as any : null);
        const activeCategory = activeCard ? (getCategoryById(activeCard.categoryId) || (devState ? { title: DEV_MOCK.mockCategory.title } as any : null)) : null;
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
              onClick={() => {
                if (!devState) markNavigated();
                navigate(`/card/${normalizedSession.cardId}`);
              }}
              size="lg"
              className="w-full h-14 rounded-2xl gap-2 font-normal"
            >
              Fortsätt samtalet
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        );
      })()}

      {mode === 'idle' && (() => {
        const outgoingPendingProposal = ownPendingProposals[0] ?? null;
        const outgoingCard = outgoingPendingProposal ? getCardById(outgoingPendingProposal.card_id) : null;
        const savedFromPartner = savedProposals.filter(p => p.proposed_by !== user?.id);
        const savedProposal = savedFromPartner[0] ?? null;
        const savedCard = savedProposal ? getCardById(savedProposal.card_id) : null;
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="px-6 mb-10"
          >
            {outgoingPendingProposal && (
              <div className="rounded-2xl border border-border bg-card p-5 mb-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wide">Förslag skickat</p>
                <p className="font-serif text-base text-foreground">{outgoingCard?.title ?? 'Samtal'}</p>
                <p className="text-sm text-muted-foreground">Väntar på att din partner svarar.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-1 text-muted-foreground hover:text-foreground font-normal"
                  onClick={() => {
                    setProposalCandidate({ cardId: outgoingPendingProposal.card_id, categoryId: outgoingPendingProposal.category_id });
                    handleEnterProposalMode();
                  }}
                >
                  Ändra förslag
                </Button>
              </div>
            )}
            {savedProposal && savedCard && (
              <div className="rounded-2xl border border-border bg-card p-5 mb-4 text-center space-y-2">
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wide">Sparat förslag</p>
                <p className="font-serif text-base text-foreground">{savedCard.title}</p>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <Button
                    size="sm"
                    className="font-normal"
                    onClick={() => setViewingSavedProposalId(savedProposal.id)}
                  >
                    Öppna
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground font-normal"
                    onClick={() => updateProposalStatus(savedProposal.id, 'declined')}
                  >
                    Ta bort
                  </Button>
                </div>
              </div>
            )}
            <div className="text-center">
              {!outgoingPendingProposal && (
                <p className="text-xs text-muted-foreground/50 mb-4">Vill ni börja här?</p>
              )}
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
        {isProposalMode && !isSoloMode && mode === 'idle' && (
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
        {mode === 'idle' && proposalCandidate && candidateCard && candidateCategory && (
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

      {/* Saved proposal overlay (re-opens IncomingProposal-style UI) */}
      <AnimatePresence>
        {viewingSavedProposalId && (() => {
          const sp = savedProposals.find(p => p.id === viewingSavedProposalId);
          if (!sp) return null;
          const spCard = getCardById(sp.card_id);
          const isAccepting = acceptingProposalId === sp.id;
          return (
            <motion.div
              key={`saved-proposal-${sp.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-background"
            >
              <div className="w-full max-w-sm space-y-10 text-center">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground/60 uppercase tracking-wide">
                    Sparat förslag
                  </p>
                  <h1 className="text-2xl font-serif text-foreground leading-snug">
                    {spCard?.title || 'Samtal'}
                  </h1>
                  {sp.message && (
                    <p className="text-sm text-muted-foreground italic">"{sp.message}"</p>
                  )}
                </div>
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full h-14 rounded-2xl gap-2 font-normal"
                    disabled={isAccepting}
                    onClick={async () => {
                      setAcceptingProposalId(sp.id);
                      await updateProposalStatus(sp.id, 'accepted');
                      const result = await activateSession(sp.id);
                      setAcceptingProposalId(null);
                      setViewingSavedProposalId(null);
                      if (result.success) {
                        navigate(`/card/${sp.card_id}`);
                      } else {
                        toast.error('Kunde inte starta samtalet.');
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
                    onClick={() => setViewingSavedProposalId(null)}
                  >
                    Stäng
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Categories — solo: locked in disclosure; browse: fully unlocked */}
      {!isProposalMode && (isSoloMode || devState === 'browse') && (
        <div id="category-section" className="px-6 pb-12 mt-4">
          {devState === 'browse' ? (
            <div className="space-y-6">
              {categories.map((category, index) => {
                const catStatus = getCategoryStatus(category.id);
                // In browse mode all cards are visually equal — no featured styling.
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
          ) : (
            <LockedCategoriesDisclosure
              categories={categories}
              getCategoryStatus={getCategoryStatus}
            />
          )}
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
      {isSoloMode && mode !== 'active' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="px-6 pt-8 pb-10 mt-8 space-y-2"
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
          className="px-6 py-6 border-t border-divider mt-8"
        >
          <NotificationSettings />
        </motion.div>
      ) : (
        <NotiserSection />
      )}

      {/* Relation & space settings — only shown when paired */}
      {!isSoloMode && (
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
              // leave-and-create-new-space: leaves old space AND provisions a fresh
              // solo space for the actor, so they can invite again immediately.
              const res = await supabase.functions.invoke('leave-and-create-new-space', {
                headers: { Authorization: `Bearer ${accessToken}` },
                body: {},
              });
              if (res.error) {
                toast.error('Något gick fel. Försök igen.');
                return;
              }
              clearForPartnerLeave();
              toast.success('Kopplingen till din partner är avslutad.');
              navigate('/', { replace: true });
            } catch {
              toast.error('Något gick fel. Försök igen.');
            }
          }}
        />
      )}

      {/* ResumeSessionDialog removed — ACTIVE state's single CTA handles resume */}
      </div>
      <Footer />
    </div>
  );
}
