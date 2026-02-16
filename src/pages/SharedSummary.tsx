import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { useReflectionResponses } from '@/hooks/useReflectionResponses';
import { useProposals } from '@/hooks/useProposals';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import SharedTimelineItem from '@/components/SharedTimelineItem';
import ReflectionMemoryCard from '@/components/ReflectionMemoryCard';
import AttachPartner from '@/components/AttachPartner';
import IncomingProposal from '@/components/IncomingProposal';
import { Search, Filter, X, ChevronDown, MessageCircle, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SharedNoteRow {
  id: string;
  card_id: string;
  section_id: string;
  prompt_id: string;
  content: string;
  is_highlight: boolean;
  author_label: string | null;
  shared_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const AUTOSAVE_DELAY = 800;

export default function SharedSummary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories, backgroundColor, getCardById, getCategoryById, journeyState, cards, getTakeawayShared, currentSession } = useApp();
  const { user } = useAuth();
  const { space, displayMemberCount, userRole, fetchInviteInfo } = useCoupleSpace();
  const { proposals, incomingProposals, ownPendingProposals, savedProposals, updateProposalStatus, activateSession } = useProposals();

  const acceptedProposals = useMemo(() =>
    proposals.filter(p => p.status === 'accepted' && p.card_id !== currentSession?.cardId),
    [proposals, currentSession?.cardId]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFind, setShowFind] = useState(false);
  const [sharedNotes, setSharedNotes] = useState<SharedNoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const [showSavedProposals, setShowSavedProposals] = useState(false);
  const pendingSaves = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Surface a random previous takeaway — once per session
  const surfacedTakeaway = useMemo(() => {
    const dismissed = sessionStorage.getItem('shared-takeaway-surfaced');
    if (dismissed) return null;
    const exploredIds = journeyState?.exploredCardIds || [];
    const withTakeaway = exploredIds
      .map(id => {
        const note = getTakeawayShared(id);
        return note?.text ? { cardId: id, text: note.text } : null;
      })
      .filter(Boolean) as { cardId: string; text: string }[];
    if (withTakeaway.length === 0) return null;
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return withTakeaway[dayIndex % withTakeaway.length];
  }, [journeyState?.exploredCardIds, getTakeawayShared]);

  useEffect(() => {
    if (surfacedTakeaway) {
      sessionStorage.setItem('shared-takeaway-surfaced', '1');
    }
  }, [surfacedTakeaway]);

  // Fetch all shared notes in the couple space
  useEffect(() => {
    if (!user || !space) {
      setLoading(false);
      return;
    }

    const fetchSharedNotes = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('prompt_notes')
        .select('*')
        .eq('couple_space_id', space.id)
        .eq('visibility', 'shared')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch shared notes:', error);
      } else {
        setSharedNotes(data || []);
      }
      setLoading(false);
    };

    fetchSharedNotes();
  }, [user, space]);

  const reflectionIds = useMemo(() => sharedNotes.map(n => n.id), [sharedNotes]);
  const { saveResponse, getMyResponse, getPartnerResponse } = useReflectionResponses(reflectionIds);

  useEffect(() => {
    return () => {
      pendingSaves.current.forEach(timer => clearTimeout(timer));
    };
  }, []);

  const handleUpdateNote = useCallback((noteId: string, newContent: string) => {
    setSharedNotes(prev =>
      prev.map(n => n.id === noteId ? { ...n, content: newContent, updated_at: new Date().toISOString() } : n)
    );

    const existingTimer = pendingSaves.current.get(noteId);
    if (existingTimer) clearTimeout(existingTimer);

    pendingSaves.current.set(noteId, setTimeout(async () => {
      const { error } = await supabase
        .from('prompt_notes')
        .update({ content: newContent })
        .eq('id', noteId);
      if (error) console.error('Failed to update shared note:', error);
      pendingSaves.current.delete(noteId);
    }, AUTOSAVE_DELAY));
  }, []);

  const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

  const handleOpenInContext = useCallback((cardId: string, sectionId: string, promptId: string) => {
    const card = getCardById(cardId);
    if (!card) {
      navigate(`/card/${cardId}?revisit=true`);
      return;
    }

    const section = card.sections.find(s => s.id === sectionId);
    const stepIndex = section ? STEP_ORDER.indexOf(section.type as typeof STEP_ORDER[number]) : -1;
    const promptIndex = parseInt(promptId.replace('prompt-', ''), 10);

    if (stepIndex >= 0 && !isNaN(promptIndex) && promptIndex >= 0) {
      navigate(`/card/${cardId}?revisit=true&step=${stepIndex}&prompt=${promptIndex}`);
    } else {
      navigate(`/card/${cardId}?revisit=true`);
    }
  }, [navigate, getCardById]);

  const timelineItems = useMemo(() => {
    return sharedNotes
      .map(note => {
        const card = getCardById(note.card_id);
        if (!card) return null;
        const category = getCategoryById(card.categoryId);
        if (!category) return null;

        const section = card.sections.find(s => s.id === note.section_id);
        const promptIndex = parseInt(note.prompt_id.replace('prompt-', ''), 10);
        const rawPrompt = section?.prompts?.[promptIndex];
        const promptText = typeof rawPrompt === 'string' ? rawPrompt : rawPrompt?.text || '';

        return {
          ...note,
          cardTitle: card.title,
          categoryTitle: category.title,
          categoryId: category.id,
          promptText,
        };
      })
      .filter(Boolean)
      .filter(item => {
        if (!item) return false;
        if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return (
            item.content.toLowerCase().includes(q) ||
            item.cardTitle.toLowerCase().includes(q) ||
            item.promptText.toLowerCase().includes(q)
          );
        }
        return true;
      }) as (SharedNoteRow & { cardTitle: string; categoryTitle: string; categoryId: string; promptText: string })[];
  }, [sharedNotes, searchQuery, categoryFilter, getCardById, getCategoryById]);

  const { recentItems, olderGrouped } = useMemo(() => {
    type TimelineItem = typeof timelineItems[number];
    type CardGroup = { cardId: string; cardTitle: string; categoryTitle: string; items: TimelineItem[] };
    type MonthGroup = { key: string; label: string; cardGroups: CardGroup[] };

    const RECENT_COUNT = 3;
    const recent = timelineItems.slice(0, RECENT_COUNT);
    const older = timelineItems.slice(RECENT_COUNT);

    const monthMap = new Map<string, { label: string; cardMap: Map<string, { cardTitle: string; categoryTitle: string; items: TimelineItem[] }> }>();

    for (const item of older) {
      const d = new Date(item.shared_at || item.created_at);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long' });

      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, { label: monthLabel, cardMap: new Map() });
      }
      const month = monthMap.get(monthKey)!;

      if (!month.cardMap.has(item.card_id)) {
        month.cardMap.set(item.card_id, { cardTitle: item.cardTitle, categoryTitle: item.categoryTitle, items: [] });
      }
      month.cardMap.get(item.card_id)!.items.push(item);
    }

    const grouped: MonthGroup[] = Array.from(monthMap.entries())
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, { label, cardMap }]) => ({
        key,
        label,
        cardGroups: Array.from(cardMap.entries()).map(([cardId, group]) => ({
          cardId,
          ...group,
        })),
      }));

    return { recentItems: recent, olderGrouped: grouped };
  }, [timelineItems]);

  const highlights = useMemo(() => {
    return timelineItems.filter(n => n.is_highlight);
  }, [timelineItems]);

  const hasContent = sharedNotes.length > 0;
  const hasActiveFilter = categoryFilter !== 'all' || searchQuery.length > 0;
  // During an active session, hide shared notes surfaces to enforce single conversation surface
  const hideSharedNotes = !!currentSession;

  const exploredIds = journeyState?.exploredCardIds || [];
  const totalCards = cards.length;
  const exploredCount = exploredIds.length;

  // Journey progress per category
  const categoryProgress = useMemo(() => {
    return categories.map(cat => {
      const catCards = cards.filter(c => c.categoryId === cat.id);
      const explored = catCards.filter(c => exploredIds.includes(c.id)).length;
      return { id: cat.id, title: cat.title, explored, total: catCards.length };
    }).filter(c => c.total > 0);
  }, [categories, cards, exploredIds]);

  return (
    <div className="min-h-screen page-bg">
      <Header showBack backTo="/" />

      <div className="px-6 pt-20 pb-24 mx-auto" style={{ maxWidth: 540 }}>

        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="mb-10 text-center"
        >
          <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">Här möts vi</h1>
        </motion.div>

        {/* Partner invite — only when solo */}
        {space && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10 text-left"
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

        {/* ═══════════════════════════════════════════
            SECTION 1: "Er resa just nu" — Status hero
            ═══════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="mb-12"
        >
          <SectionLabel>Er resa just nu</SectionLabel>

          {/* Active session — hero card */}
          {currentSession && displayMemberCount >= 2 && (() => {
            const sessionCard = getCardById(currentSession.cardId);
            const sessionCategory = getCategoryById(currentSession.categoryId);
            if (!sessionCard || !sessionCategory) return null;
            return (
               <button
                 onClick={() => navigate(`/card/${currentSession.cardId}`)}
                 className="w-full rounded-2xl bg-primary px-6 py-6 text-left transition-all hover:bg-primary/90 active:scale-[0.98] shadow-md"
               >
                 <p className="text-[11px] text-primary-foreground/60 mb-1.5">Pågående samtal</p>
                 <p className="font-serif text-lg text-primary-foreground">{sessionCard.title}</p>
                 <p className="text-[11px] text-primary-foreground/50 mt-1">{sessionCategory.title}</p>
                 <div className="flex items-center gap-2 mt-4 text-primary-foreground">
                   <span className="text-sm font-medium">Återgå till samtalet</span>
                   <ArrowRight className="w-4 h-4" />
                 </div>
               </button>
            );
          })()}

          {/* Incoming proposals */}
          {incomingProposals.length > 0 && (
            <div className={currentSession ? 'mt-4' : ''}>
              {incomingProposals.map((proposal) => {
                const proposalCard = getCardById(proposal.card_id);
                const proposalCategory = getCategoryById(proposal.category_id);
                if (!proposalCard || !proposalCategory) return null;

                const proposerName = userRole === 'partner_a'
                  ? space?.partner_b_name || undefined
                  : space?.partner_a_name || undefined;

                return (
                  <IncomingProposal
                    key={proposal.id}
                    proposal={proposal}
                    cardTitle={proposalCard.title}
                    categoryTitle={proposalCategory.title}
                    proposerName={proposerName}
                    onAccept={async () => {
                      await updateProposalStatus(proposal.id, 'accepted');
                      const result = await activateSession(proposal.id);
                      if (result.success) {
                        toast('Samtalet startade', { duration: 2000 });
                        navigate(`/card/${proposal.card_id}`);
                      } else {
                        toast.error('Kunde inte starta samtalet');
                      }
                    }}
                    onSaveForLater={async () => {
                      await updateProposalStatus(proposal.id, 'saved_for_later');
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Accepted proposals — ready to start */}
          {acceptedProposals.length > 0 && (
            <div className={currentSession || incomingProposals.length > 0 ? 'mt-4' : ''}>
              <div className="space-y-3 text-left">
                {acceptedProposals.map((proposal) => {
                  const proposalCard = getCardById(proposal.card_id);
                  const proposalCategory = getCategoryById(proposal.category_id);
                  if (!proposalCard || !proposalCategory) return null;

                  return (
                    <div
                      key={proposal.id}
                      className="rounded-2xl border border-border/30 bg-card/60 px-5 py-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[11px] text-muted-foreground/50 mb-1">
                            {currentSession ? 'Nästa samtal' : 'Redo att börja'}
                          </p>
                          <p className="font-serif text-sm text-foreground">{proposalCard.title}</p>
                          <p className="text-[11px] text-muted-foreground/60 mt-0.5">{proposalCategory.title}</p>
                        </div>
                         {!currentSession && (
                           <Button
                             size="default"
                             className="shrink-0 text-sm gap-2 shadow-sm active:scale-[0.97] transition-all"
                             onClick={async () => {
                               const result = await activateSession(proposal.id);
                               if (result.success) {
                                 navigate(`/card/${proposal.card_id}`);
                               } else {
                                 toast.error('Kunde inte starta samtalet');
                               }
                             }}
                           >
                             Börja
                             <ArrowRight className="w-4 h-4" />
                           </Button>
                         )}
                      </div>
                      {currentSession && (
                        <p className="text-[11px] text-muted-foreground/40 mt-2">
                          Avsluta ert pågående samtal först
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Own pending — waiting for partner */}
          {ownPendingProposals.length > 0 && (
            <div className="mt-4 space-y-2 text-left">
              {ownPendingProposals.map((proposal) => {
                const proposalCard = getCardById(proposal.card_id);
                const proposalCategory = getCategoryById(proposal.category_id);
                if (!proposalCard || !proposalCategory) return null;

                return (
                  <div
                    key={proposal.id}
                    className="rounded-xl border border-border/20 bg-card/30 px-5 py-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-serif text-sm text-foreground/70">{proposalCard.title}</p>
                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">{proposalCategory.title}</p>
                      </div>
                      <span className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[10px] bg-muted/40 text-muted-foreground">
                        Väntar
                      </span>
                    </div>
                    {proposal.message && (
                      <p className="text-xs text-muted-foreground/50 italic mt-2 leading-relaxed">"{proposal.message}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Saved proposals — collapsed */}
          {savedProposals.length > 0 && (
            <div className="mt-4">
              <button
                onClick={() => setShowSavedProposals(!showSavedProposals)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-foreground transition-colors py-2"
              >
                <span>Sparade förslag ({savedProposals.length})</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showSavedProposals ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showSavedProposals && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-2 text-left">
                      {savedProposals.map((proposal) => {
                        const proposalCard = getCardById(proposal.card_id);
                        const proposalCategory = getCategoryById(proposal.category_id);
                        if (!proposalCard || !proposalCategory) return null;

                        return (
                          <div key={proposal.id} className="py-3 flex items-center justify-between">
                            <div>
                              <p className="font-serif text-sm text-foreground">{proposalCard.title}</p>
                              <p className="text-xs text-muted-foreground">{proposalCategory.title}</p>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground text-xs"
                              onClick={async () => {
                                await updateProposalStatus(proposal.id, 'accepted');
                                const result = await activateSession(proposal.id);
                                if (result.success) {
                                  toast('Samtalet startade', { duration: 2000 });
                                  navigate(`/card/${proposal.card_id}`);
                                } else {
                                  toast.error('Kunde inte starta samtalet');
                                }
                              }}
                            >
                              Starta samtalet
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

           {/* No active session, no proposals — CTA to propose */}
           {!currentSession && incomingProposals.length === 0 && acceptedProposals.length === 0 && displayMemberCount >= 2 && (
             <div className="rounded-2xl border border-primary/15 bg-primary/5 p-8 text-center">
               <p className="font-serif text-lg text-foreground mb-1.5">Redo att mötas?</p>
               <p className="text-sm text-muted-foreground/70 mb-5">Välj ett samtal att utforska tillsammans.</p>
               <Button
                 size="lg"
                 className="gap-2.5 px-8 shadow-sm active:scale-[0.97] transition-all"
                 onClick={() => navigate('/')}
               >
                 <MessageCircle className="w-4 h-4" />
                 Föreslå ett samtal
               </Button>
             </div>
           )}
        </motion.div>

        {/* ─── Surfaced takeaway ─── */}
        {surfacedTakeaway && !hasActiveFilter && !hideSharedNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="mb-12 text-center"
          >
            <div className="px-6 py-8 rounded-2xl border border-border/20 bg-card/50">
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-[0.12em] mb-4">Att minnas</p>
              <p className="text-[15px] font-serif text-foreground/75 leading-[1.9] max-w-sm mx-auto italic">
                "{surfacedTakeaway.text}"
              </p>
            </div>
          </motion.div>
        )}

        {/* ─── Empty state ─── */}
        {!hasContent && !hasActiveFilter && !loading && !hideSharedNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-10 text-center"
          >
            <div className="py-10">
              <p className="text-sm text-muted-foreground/60 leading-relaxed mb-6">
                När ni delar en reflektion visas den här.
              </p>
              <button
                onClick={() => navigate('/')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Bläddra bland kort →
              </button>
            </div>
          </motion.div>
        )}

        {/* Active session notice — shared notes hidden */}
        {hideSharedNotes && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-10 text-center"
          >
            <div className="py-8 rounded-2xl border border-border/15 bg-card/40">
              <p className="text-sm text-muted-foreground/70 leading-relaxed">
                Era delade reflektioner visas här efter att samtalet är klart.
              </p>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="py-12 space-y-6 animate-fade-in">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 w-3/4 mx-auto rounded bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {hasContent && !hideSharedNotes && (<>

              {/* ═══════════════════════════════════════════
                  SECTION 2: "Nyligen delat" — Memory cards
                  ═══════════════════════════════════════════ */}
               {recentItems.length > 0 && !hasActiveFilter && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.05, duration: 0.15 }}
                   className="mb-12 rounded-2xl border border-border/15 bg-card/40 p-5"
                 >
                   <SectionLabel>Nyligen delat</SectionLabel>
                   <div className="space-y-3 -mx-5 -mb-5 px-5 pb-5">
                    {recentItems.map((item) => {
                      const myResp = getMyResponse(item.id);
                      const partnerResp = getPartnerResponse(item.id);
                      const responseCount = [myResp, partnerResp].filter(r => r && r.content.trim().length > 0).length;

                      return (
                        <ReflectionMemoryCard
                          key={item.id}
                          content={item.content}
                          cardTitle={item.cardTitle}
                          categoryTitle={item.categoryTitle}
                          authorLabel={item.user_id !== user?.id ? item.author_label : null}
                          date={item.shared_at || item.created_at}
                          responseCount={responseCount}
                          onClick={() => handleOpenInContext(item.card_id, item.section_id, item.prompt_id)}
                        />
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════
                  SECTION 2.5: Highlights (takeaways)
                  ═══════════════════════════════════════════ */}
               {highlights.length > 0 && !hasActiveFilter && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.08, duration: 0.15 }}
                   className="mb-12 rounded-2xl border border-border/15 bg-card/40 p-5"
                 >
                   <SectionLabel>Era Takeaways</SectionLabel>
                   <div className="space-y-5">
                     {(showAllHighlights ? highlights : highlights.slice(0, 3)).map((h) => (
                       <div key={`hl-${h.id}`} className="text-center">
                         <p className="text-[15px] font-serif leading-[1.9] text-foreground/80 whitespace-pre-wrap">{h.content}</p>
                         <p className="text-[11px] text-muted-foreground/50 mt-2">{h.cardTitle}</p>
                       </div>
                     ))}
                   </div>
                   {highlights.length > 3 && (
                     <button
                       onClick={() => setShowAllHighlights(!showAllHighlights)}
                       className="mt-5 text-xs text-muted-foreground hover:text-foreground transition-colors block mx-auto"
                     >
                       {showAllHighlights ? 'Visa färre' : `Visa alla ${highlights.length}`}
                     </button>
                   )}
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════
                  SECTION 3: "Er resa tillsammans" — Progress
                  ═══════════════════════════════════════════ */}
               {!hasActiveFilter && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 0.1, duration: 0.15 }}
                   className="mb-12 rounded-2xl border border-border/15 bg-card/40 p-5"
                 >
                   <SectionLabel>Er resa tillsammans</SectionLabel>
                   <div className="space-y-4">
                    <p className="text-xs text-muted-foreground/70 text-center">
                      {exploredCount === 0
                        ? 'Ni har inte börjat ännu.'
                        : `${exploredCount} samtal tillsammans.`}
                    </p>
                    <div className="space-y-3">
                      {categoryProgress.map((cat) => (
                        <div key={cat.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[11px] text-foreground/70">{cat.title}</p>
                            <p className="text-[10px] text-muted-foreground/50">{cat.explored}/{cat.total}</p>
                          </div>
                          <div className="flex gap-[3px]">
                            {Array.from({ length: cat.total }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-1.5 flex-1 rounded-full ${
                                  i < cat.explored
                                    ? 'bg-primary/40'
                                    : 'bg-border/20'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════════
                  SECTION 4: "Er historia" — Archive timeline
                  ═══════════════════════════════════════════ */}
               {(olderGrouped.length > 0 || hasActiveFilter) && (
                 <div className="mb-12">
                   <SectionLabel>Er historia</SectionLabel>

                  {/* Search — inline, not disruptive */}
                  <div className="flex items-center justify-center mb-6">
                    {!showFind ? (
                      <button
                        onClick={() => setShowFind(true)}
                        className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                      >
                        <Search className="w-3 h-3" />
                        <span>Hitta</span>
                      </button>
                    ) : (
                      <div className="w-full space-y-3">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                            <Input
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Sök på ord eller tema…"
                              className="pl-9 text-sm border-border/20 bg-transparent h-9"
                              autoFocus
                            />
                          </div>
                          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[120px] border-border/20 bg-transparent h-9 text-xs">
                              <Filter className="w-3 h-3 mr-1 opacity-40" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Alla</SelectItem>
                              {categories.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-center">
                          <button
                            onClick={() => {
                              setShowFind(false);
                              setSearchQuery('');
                              setCategoryFilter('all');
                            }}
                            className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                          >
                            Stäng
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Filtered results */}
                  {hasActiveFilter && timelineItems.length > 0 && (
                    <div className="space-y-1 text-left">
                      {timelineItems.map((item) => (
                        <SharedTimelineItem
                          key={item.id}
                          note={item}
                          isOwnNote={item.user_id === user?.id}
                          myResponse={getMyResponse(item.id)}
                          partnerResponse={getPartnerResponse(item.id)}
                          onUpdate={handleUpdateNote}
                          onSaveResponse={saveResponse}
                          onOpenInContext={handleOpenInContext}
                        />
                      ))}
                    </div>
                  )}

                  {/* No results */}
                  {timelineItems.length === 0 && hasActiveFilter && (
                    <p className="text-muted-foreground/50 py-8 text-sm text-center">
                      {t('shared.no_results')}
                    </p>
                  )}

                  {/* Chronological archive */}
                  {!hasActiveFilter && olderGrouped.map((group) => (
                    <div key={group.key} className="mb-10">
                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-px flex-1 bg-border/15" />
                        <span className="text-[11px] text-muted-foreground/50 uppercase tracking-[0.12em] whitespace-nowrap">
                          {group.label}
                        </span>
                        <div className="h-px flex-1 bg-border/15" />
                      </div>

                      {group.cardGroups.map((cardGroup) => (
                        <div key={cardGroup.cardId} className="mb-6 last:mb-0">
                          <div className="relative pl-8 mb-1">
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-border/15" />
                            <div className="absolute left-[-4px] top-1 w-[9px] h-[9px] rounded-full bg-primary/20 border-2 border-primary/30" />
                            <p className="font-serif text-sm text-foreground/60 pt-0.5">{cardGroup.cardTitle}</p>
                            <p className="text-[10px] text-muted-foreground/40 mt-0.5">{cardGroup.categoryTitle}</p>
                          </div>

                          <div className="space-y-0">
                            {cardGroup.items.map((item) => (
                              <SharedTimelineItem
                                key={item.id}
                                note={item}
                                isOwnNote={item.user_id === user?.id}
                                myResponse={getMyResponse(item.id)}
                                partnerResponse={getPartnerResponse(item.id)}
                                onUpdate={handleUpdateNote}
                                onSaveResponse={saveResponse}
                                onOpenInContext={handleOpenInContext}
                                variant="journey"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* ─── Bottom: Explore more ─── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="mt-2 mb-6 text-center"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground/60 hover:text-foreground gap-1.5"
                  onClick={() => navigate('/')}
                >
                  Utforska fler samtal
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </motion.div>
            </>)}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Shared sub-components ─── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-semibold text-foreground/70 uppercase tracking-[0.12em] mb-6 text-center">
      {children}
    </p>
  );
}
