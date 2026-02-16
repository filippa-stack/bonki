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
import { Search, Filter, X, ChevronDown } from 'lucide-react';
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
  const { space, displayMemberCount, userRole } = useCoupleSpace();
  const { incomingProposals, savedProposals, updateProposalStatus } = useProposals();

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
    // Pick one deterministically per day so it doesn't change on re-render
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return withTakeaway[dayIndex % withTakeaway.length];
  }, [journeyState?.exploredCardIds, getTakeawayShared]);

  // Mark as shown on mount
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

  // Reflection responses hook
  const reflectionIds = useMemo(() => sharedNotes.map(n => n.id), [sharedNotes]);
  const { saveResponse, getMyResponse, getPartnerResponse } = useReflectionResponses(reflectionIds);

  // Cleanup pending saves on unmount
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

  // Enrich notes with card/category info and apply filters
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

  // Journey progress data
  const exploredIds = journeyState?.exploredCardIds || [];
  const totalCards = cards.length;
  const exploredCount = exploredIds.length;

  return (
    <div className="min-h-screen page-bg">
      <Header showBack backTo="/" />

      <div className="px-6 pt-20 pb-24 mx-auto text-center" style={{ maxWidth: 540 }}>

        {/* ─── 1. Header ─── */}
        {!showFind && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-8"
          >
            <h2 className="font-serif text-2xl font-semibold text-foreground">Vårt utrymme</h2>
          </motion.div>
        )}

        {/* ─── 2. Subtext ─── */}
        {!showFind && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15, delay: 0.05 }}
            className="text-xs text-muted-foreground/50 mb-24 leading-relaxed"
          >
            Här samlas det ni bygger tillsammans.
          </motion.p>
        )}
        {/* ─── Surfaced takeaway ─── */}
        {!showFind && surfacedTakeaway && (
          <div className="mb-16 text-center">
            <p className="text-[11px] text-muted-foreground/40 mb-3">För en tid sedan skrev ni:</p>
            <p className="text-sm font-serif text-foreground/70 leading-relaxed max-w-sm mx-auto">
              {surfacedTakeaway.text}
            </p>
          </div>
        )}

        {/* Partner invite — only when solo */}
        {space && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-left"
          >
            <AttachPartner
              inviteCode={space.invite_code}
              inviteToken={space.invite_token}
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

        {/* Incoming proposals */}
        {incomingProposals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <p className="text-sm font-serif text-foreground/70 mb-5">
              Föreslaget till er
            </p>
            <div className="space-y-3 text-left">
              {incomingProposals.map((proposal) => {
                const proposalCard = getCardById(proposal.card_id);
                const proposalCategory = getCategoryById(proposal.category_id);
                if (!proposalCard || !proposalCategory) return null;

                const proposerName = space?.partner_a_name || space?.partner_b_name || undefined;

                return (
                  <IncomingProposal
                    key={proposal.id}
                    proposal={proposal}
                    cardTitle={proposalCard.title}
                    categoryTitle={proposalCategory.title}
                    proposerName={proposerName}
                    onAccept={async () => {
                      // Race-safe: update status first, proceed regardless
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
          </motion.div>
        )}

        {/* Saved proposals — collapsed */}
        {savedProposals.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-10"
          >
            <button
              onClick={() => setShowSavedProposals(!showSavedProposals)}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors py-2"
            >
              <span>Visa sparade förslag ({savedProposals.length})</span>
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
                            <p className="text-xs text-muted-foreground/50">{proposalCategory.title}</p>
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
          </motion.div>
        )}

        {/* ─── Empty state ─── */}
        {!hasContent && !hasActiveFilter && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="mb-16 space-y-10"
          >
            <button
              onClick={() => navigate('/')}
              className="text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              Bläddra bland kort →
            </button>
            <p className="text-xs text-muted-foreground/40">
              När ni delar en reflektion till en fråga visas den här.
            </p>
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

               {/* ─── 3. Era Takeaways (highlights) ─── */}
              {highlights.length > 0 && !hasActiveFilter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.05, duration: 0.15 }}
                  className="mb-24"
                >
                  <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] mb-12">
                    Era Takeaways
                  </p>
                  <div className="space-y-10">
                    {(showAllHighlights ? highlights : highlights.slice(0, 3)).map((h) => (
                      <div key={`hl-${h.id}`}>
                        <p className="text-[15px] font-serif leading-[1.9] text-foreground/80 whitespace-pre-wrap">{h.content}</p>
                        <p className="text-[10px] text-muted-foreground/30 mt-2">
                          {h.cardTitle}
                        </p>
                      </div>
                    ))}
                  </div>
                  {highlights.length > 3 && (
                    <button
                      onClick={() => setShowAllHighlights(!showAllHighlights)}
                      className="mt-10 text-[11px] text-muted-foreground/35 hover:text-muted-foreground/50 transition-colors"
                    >
                      {showAllHighlights ? 'Visa färre' : `Visa alla ${highlights.length}`}
                    </button>
                  )}
                </motion.div>
              )}

              {/* ─── 4. Er resa — minimal progress ─── */}
              {!hasActiveFilter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08, duration: 0.15 }}
                  className="mb-24"
                >
                  <div className="h-px bg-border/20 mb-14 mx-auto" style={{ maxWidth: 120 }} />
                  <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] mb-10">
                    Er resa
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex gap-2">
                      {Array.from({ length: totalCards }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            i < exploredCount
                              ? 'bg-foreground/20'
                              : 'bg-muted/20'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground/30">
                      {exploredCount} av {totalCards}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* ─── Search toggle ─── */}
              <div className="flex justify-center mb-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground/50 gap-1.5"
                  onClick={() => {
                    if (showFind) {
                      setSearchQuery('');
                      setCategoryFilter('all');
                    }
                    setShowFind(!showFind);
                  }}
                >
                  {showFind ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
                  {showFind ? 'Stäng' : 'Sök'}
                </Button>
              </div>

              {/* Search + Filter row */}
              {showFind && (
                <div className="flex gap-2 mb-10 text-left">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Sök på ord eller tema…"
                      className="pl-10 border-border/20"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[140px] border-border/20">
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
                  className="mb-24 text-left"
                >
                  <div className="h-px bg-border/20 mb-12 mx-auto" style={{ maxWidth: 120 }} />
                  {(() => {
                    const newest = recentItems[0];
                    const sharedDate = new Date(newest.shared_at || newest.created_at);
                    const ageMs = Date.now() - sharedDate.getTime();
                    const ONE_HOUR = 60 * 60 * 1000;
                    const ONE_DAY = 24 * ONE_HOUR;
                    const contextLabel = ageMs > ONE_DAY
                      ? 'Skrevs för en tid sedan.'
                      : ageMs > ONE_HOUR
                        ? 'Skrevs tidigare idag.'
                        : null;
                    return contextLabel ? (
                      <p className="text-[11px] text-muted-foreground/40 text-center mb-8">
                        {contextLabel}
                      </p>
                    ) : null;
                  })()}
                  <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] mb-8 text-center">
                    Nyligen delat
                  </p>
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

              {/* ─── Older reflections ─── */}
              {olderGrouped.length > 0 && !hasActiveFilter && (
                <div className="mb-20 text-left">
                  <div className="h-px bg-border/20 mb-12 mx-auto" style={{ maxWidth: 120 }} />
                  <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] mb-8 text-center">Tidigare</p>
                  {olderGrouped.map((group) => (
                    <div key={group.key} className="mb-8">
                      <p className="text-[10px] text-muted-foreground/30 uppercase tracking-wide mb-4 text-center">
                        {group.label}
                      </p>
                      <div className="space-y-1">
                        {group.cardGroups.flatMap((cardGroup) => cardGroup.items).map((item) => (
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
                    </div>
                  ))}
                </div>
              )}

              {/* No results */}
              {timelineItems.length === 0 && hasActiveFilter && (
                <p className="text-muted-foreground/40 py-12 text-sm">
                  {t('shared.no_results')}
                </p>
              )}

              {/* Browse — bottom, subtle */}
              {!hasActiveFilter && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.15 }}
                  className="mt-8 mb-6"
                >
                  <button
                    onClick={() => navigate('/')}
                    className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                  >
                    Bläddra bland kort →
                  </button>
                </motion.div>
              )}
            </>)}
          </>
        )}
      </div>
    </div>
  );
}
