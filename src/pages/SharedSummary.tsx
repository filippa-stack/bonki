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
import AttachPartner from '@/components/AttachPartner';
import IncomingProposal from '@/components/IncomingProposal';
import { Search, Filter, X, ChevronDown, MessageCircle } from 'lucide-react';
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
  const { categories, backgroundColor, getCardById, getCategoryById, startSession, journeyState, cards, getTakeawayShared } = useApp();
  const { user } = useAuth();
  const { space, displayMemberCount, userRole, fetchInviteInfo } = useCoupleSpace();
  const { incomingProposals, ownPendingProposals, savedProposals, updateProposalStatus } = useProposals();

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

  const exploredIds = journeyState?.exploredCardIds || [];
  const totalCards = cards.length;
  const exploredCount = exploredIds.length;

  return (
    <div className="min-h-screen page-bg">
      <Header showBack backTo="/" />

      <div className="px-6 pt-20 pb-24 mx-auto" style={{ maxWidth: 540 }}>

        {/* ─── Header ─── */}
        {!showFind && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-14 text-center"
          >
            <h1 className="font-serif text-2xl font-semibold text-foreground tracking-tight">Vårt utrymme</h1>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Här samlas det ni bygger tillsammans.
            </p>
          </motion.div>
        )}

        {/* ─── Surfaced takeaway ─── */}
        {!showFind && surfacedTakeaway && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="mb-16 text-center"
          >
            <div className="px-8 py-10">
              <p className="text-[11px] text-muted-foreground/50 uppercase tracking-[0.12em] mb-5">Att minnas</p>
              <p className="text-[15px] font-serif text-foreground/75 leading-[1.9] max-w-sm mx-auto italic">
                "{surfacedTakeaway.text}"
              </p>
            </div>
          </motion.div>
        )}

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

        {/* ─── Proposals section ─── */}
        {(incomingProposals.length > 0 || ownPendingProposals.length > 0 || savedProposals.length > 0 || displayMemberCount >= 2) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-14"
          >
            {/* Incoming proposals */}
            {incomingProposals.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 text-center">
                  Föreslaget till er
                </p>
                <div className="space-y-3 text-left">
                  {incomingProposals.map((proposal) => {
                    const proposalCard = getCardById(proposal.card_id);
                    const proposalCategory = getCategoryById(proposal.category_id);
                    if (!proposalCard || !proposalCategory) return null;

                    // Show the OTHER partner's name (the one who proposed)
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
                          startSession(proposal.category_id, proposal.card_id, { force: true, fromBeginning: true });
                          toast('Samtalet startade', { duration: 2000 });
                          navigate(`/card/${proposal.card_id}`);
                        }}
                        onSaveForLater={async () => {
                          await updateProposalStatus(proposal.id, 'saved_for_later');
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Own pending proposals — waiting for partner */}
            {ownPendingProposals.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4 text-center">
                  Väntar på svar
                </p>
                <div className="space-y-2 text-left">
                  {ownPendingProposals.map((proposal) => {
                    const proposalCard = getCardById(proposal.card_id);
                    const proposalCategory = getCategoryById(proposal.category_id);
                    if (!proposalCard || !proposalCategory) return null;

                    return (
                      <div
                        key={proposal.id}
                        className="rounded-xl border border-border/30 bg-card/40 px-5 py-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-serif text-sm text-foreground">{proposalCard.title}</p>
                            <p className="text-[11px] text-muted-foreground/60 mt-0.5">{proposalCategory.title}</p>
                          </div>
                          <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-muted/50 text-muted-foreground">
                            Föreslagen
                          </span>
                        </div>
                        {proposal.message && (
                          <p className="text-xs text-muted-foreground/50 italic mt-2 leading-relaxed">"{proposal.message}"</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Saved proposals — collapsed */}
            {savedProposals.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowSavedProposals(!showSavedProposals)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
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
                            <div
                              key={proposal.id}
                              className="py-3 flex items-center justify-between"
                            >
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
                                  startSession(proposal.category_id, proposal.card_id, { force: true, fromBeginning: true });
                                  toast('Samtalet startade', { duration: 2000 });
                                  navigate(`/card/${proposal.card_id}`);
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

            {/* Propose button — always visible when paired */}
            {displayMemberCount >= 2 && (
              <div className="text-center mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-2 text-muted-foreground/70 hover:text-foreground"
                  onClick={() => navigate('/')}
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  Föreslå ett samtal
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── Empty state ─── */}
        {!hasContent && !hasActiveFilter && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-16 text-center"
          >
            <div className="py-12">
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

        {loading ? (
          <div className="py-12 space-y-6 animate-fade-in">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 w-3/4 mx-auto rounded bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {hasContent && (<>

              {/* ─── Era Takeaways (highlights) ─── */}
              {highlights.length > 0 && !hasActiveFilter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.15 }}
                  className="mb-16"
                >
                  <SectionDivider />
                  <SectionHeader>Era Takeaways</SectionHeader>
                  <div className="space-y-8">
                    {(showAllHighlights ? highlights : highlights.slice(0, 3)).map((h) => (
                      <div key={`hl-${h.id}`} className="text-center">
                        <p className="text-[15px] font-serif leading-[1.9] text-foreground/80 whitespace-pre-wrap">{h.content}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {h.cardTitle}
                        </p>
                      </div>
                    ))}
                  </div>
                  {highlights.length > 3 && (
                    <button
                      onClick={() => setShowAllHighlights(!showAllHighlights)}
                      className="mt-8 text-xs text-muted-foreground hover:text-foreground transition-colors block mx-auto"
                    >
                      {showAllHighlights ? 'Visa färre' : `Visa alla ${highlights.length}`}
                    </button>
                  )}
                </motion.div>
              )}

              {/* ─── Er resa — journey progress visualization ─── */}
              {!hasActiveFilter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.15 }}
                  className="mb-16"
                >
                  <SectionDivider />
                  <SectionHeader>Er resa</SectionHeader>
                  <p className="text-[11px] text-muted-foreground/40 text-center mb-8">
                    {exploredCount === 0
                      ? 'Ni har inte utforskat något ännu.'
                      : exploredCount === 1
                        ? 'Första steget är taget.'
                        : `${exploredCount} samtal tillsammans.`}
                  </p>
                  <div className="flex items-center justify-center gap-[3px]">
                    {Array.from({ length: totalCards }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-700 ease-out ${
                          i < exploredCount
                            ? 'w-3.5 bg-primary/30'
                            : 'w-1 bg-border/20'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Search + Filter — shown when active */}
              {showFind && (
                <div className="flex gap-2 mb-10 text-left">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Sök på ord eller tema…"
                      className="pl-10 border-border/30"
                      autoFocus
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px] border-border/30">
                      <Filter className="w-3 h-3 mr-1 opacity-50" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla</SelectItem>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasActiveFilter && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setSearchQuery(''); setCategoryFilter('all'); }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* ─── Recent reflections ─── */}
              {recentItems.length > 0 && !hasActiveFilter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.15 }}
                  className="mb-16 text-left"
                >
                  <SectionDivider />
                  <SectionHeader>Nyligen delat</SectionHeader>
                  <div className="space-y-1">
                    {recentItems.map((item) => (
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
                </motion.div>
              )}

              {/* Filtered results */}
              {hasActiveFilter && timelineItems.length > 0 && (
                <div className="space-y-1 mb-10 text-left">
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

              {/* ─── Journey timeline — older reflections ─── */}
              {olderGrouped.length > 0 && !hasActiveFilter && (
                <div className="mb-16">
                  <SectionDivider />
                  <SectionHeader>Er gemensamma tidslinje</SectionHeader>
                  <p className="text-[11px] text-muted-foreground/40 text-center mb-10 leading-relaxed">
                    Tankar ni delat med varandra, ordnade efter tid.
                  </p>

                  {olderGrouped.map((group, groupIdx) => (
                    <div key={group.key} className="mb-12">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-border/20" />
                        <span className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-[0.15em] whitespace-nowrap">
                          {group.label}
                        </span>
                        <div className="h-px flex-1 bg-border/20" />
                      </div>

                      {group.cardGroups.map((cardGroup) => (
                        <div key={cardGroup.cardId} className="mb-8 last:mb-0">
                          <div className="relative pl-8 mb-1">
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-border/20" />
                            <div className="absolute left-[-4px] top-1 w-[9px] h-[9px] rounded-full bg-primary/20 border-2 border-primary/30" />
                            <p className="font-serif text-sm text-foreground/70 pt-0.5">{cardGroup.cardTitle}</p>
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

              {/* No results */}
              {timelineItems.length === 0 && hasActiveFilter && (
                <p className="text-muted-foreground py-12 text-sm text-center">
                  {t('shared.no_results')}
                </p>
              )}

              {/* Bottom — browse + search toggle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="mt-8 mb-6 text-center space-y-2"
              >
                {!hasActiveFilter && (
                  <button
                    onClick={() => navigate('/')}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors block mx-auto"
                  >
                    Bläddra bland kort →
                  </button>
                )}
                <button
                  onClick={() => {
                    if (showFind) {
                      setSearchQuery('');
                      setCategoryFilter('all');
                    }
                    setShowFind(!showFind);
                    if (!showFind) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground transition-colors block mx-auto"
                >
                  {showFind ? 'Stäng sök' : 'Hitta'}
                </button>
              </motion.div>
            </>)}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Shared sub-components ─── */

function SectionDivider() {
  return <div className="h-px bg-border/15 mb-12 mx-auto" style={{ maxWidth: 60 }} />;
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-[0.2em] mb-8 text-center">
      {children}
    </p>
  );
}
