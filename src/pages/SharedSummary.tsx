import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { useReflectionResponses } from '@/hooks/useReflectionResponses';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import SharedTimelineItem from '@/components/SharedTimelineItem';
import InvitePartner from '@/components/InvitePartner';
import { Search, Filter, X, Clock, MessageCircle, BookOpen } from 'lucide-react';
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
  const { categories, backgroundColor, getCardById, getCategoryById } = useApp();
  const { user } = useAuth();
  const { space, memberCount, userRole } = useCoupleSpace();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFind, setShowFind] = useState(false);
  const [sharedNotes, setSharedNotes] = useState<SharedNoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllHighlights, setShowAllHighlights] = useState(false);
  const pendingSaves = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

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
    // Update local state immediately
    setSharedNotes(prev =>
      prev.map(n => n.id === noteId ? { ...n, content: newContent, updated_at: new Date().toISOString() } : n)
    );

    // Debounced save to DB
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

        // Find prompt text
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
        // Category filter
        if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) return false;
        // Search filter
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

  // Split into recent (last 3) and older, then group older by month+card
  const { recentItems, olderGrouped } = useMemo(() => {
    type TimelineItem = typeof timelineItems[number];
    type CardGroup = { cardId: string; cardTitle: string; categoryTitle: string; items: TimelineItem[] };
    type MonthGroup = { key: string; label: string; cardGroups: CardGroup[] };

    const RECENT_COUNT = 3;
    const recent = timelineItems.slice(0, RECENT_COUNT);
    const older = timelineItems.slice(RECENT_COUNT);

    // Group older items by month then card
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

  return (
    <div className="min-h-screen page-bg">
      <Header showBack backTo="/" />

      <div className="px-6 pt-6 pb-8 max-w-2xl mx-auto">
        {/* Room header — hidden during filtering */}
        {!showFind && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-8 pt-2"
          >
            <h2 className="font-serif text-xl text-foreground">Vårt utrymme</h2>
            <p className="text-sm text-muted-foreground mt-1.5">
              Det ni väljer att dela med varandra hamnar här.
            </p>
          </motion.div>
        )}

        {/* Partner invite — only when solo */}
        {space && memberCount < 2 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <InvitePartner
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
            />
          </motion.div>
        )}

        {/* Browse cards module — top position only when empty */}
        {!hasContent && !hasActiveFilter && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8"
          >
            <div className="p-4 rounded-2xl bg-card/20 border border-border/20">
              <p className="font-serif text-base text-foreground">Bläddra bland kort</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">I er egen takt.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
              >
                Utforska
              </Button>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="py-8 space-y-4 animate-fade-in">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-lg bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Empty-state placeholder when no shared reflections */}
            {!hasContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="my-12"
              >
                <div className="p-5 rounded-xl border border-border/40 bg-card/30">
                  <div className="flex flex-col items-center text-center gap-3">
                    <MessageCircle className="w-8 h-8 text-muted-foreground/30" />
                    <p className="text-gentle text-sm font-serif">Här växer det ni delar.</p>
                    <p className="text-xs text-muted-foreground">I er egen takt.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {hasContent && (<>
            {/* Highlights */}
            {highlights.length > 0 && !hasActiveFilter && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <p className="text-sm font-serif font-medium text-foreground mb-1">
                  {t('shared.highlights_title')}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Det ni valt att lyfta fram.
                </p>
                <div className="p-5 rounded-2xl bg-card/50 border border-border/50">
                  <div className="space-y-4">
                    {(showAllHighlights ? highlights : highlights.slice(0, 3)).map((h) => (
                      <div key={`hl-${h.id}`}>
                        <p className="text-xs text-muted-foreground/70 mb-1">
                          {h.categoryTitle} · {h.cardTitle}
                        </p>
                        <p className="text-base text-foreground whitespace-pre-wrap leading-relaxed">{h.content}</p>
                      </div>
                    ))}
                  </div>
                  {highlights.length > 3 && (
                    <button
                      onClick={() => setShowAllHighlights(!showAllHighlights)}
                      className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showAllHighlights ? 'Visa färre' : 'Visa fler'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Find toggle */}
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground gap-1.5"
                onClick={() => {
                  if (showFind) {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }
                  setShowFind(!showFind);
                }}
              >
                {showFind ? <X className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5" />}
                {showFind ? 'Stäng' : 'Hitta'}
              </Button>
            </div>

            {/* Search + Filter row */}
            {showFind && (
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('shared.search_placeholder')}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-3 h-3 mr-1" />
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

            {/* Recent shared moments — prominent */}
            {recentItems.length > 0 && !hasActiveFilter && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <p className="text-sm font-serif font-medium text-foreground mb-1">
                  {t('shared.recent_title', 'Senaste som delats')}
                </p>
                <p className="text-xs text-muted-foreground mb-5 max-w-xs">
                  Det ni valt att dela med varandra.
                </p>
                <div className="space-y-3">
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

            {/* When filtering, show all results flat */}
            {hasActiveFilter && timelineItems.length > 0 && (
              <div className="space-y-3 mb-8">
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

            {/* Older reflections — grouped by month, visually secondary */}
            {olderGrouped.length > 0 && !hasActiveFilter && (
              <div>
                {olderGrouped.map((group) => (
                  <div key={group.key} className="mb-6">
                     <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                      {group.label}
                    </p>
                    <div className="space-y-4">
                      {group.cardGroups.map((cardGroup) => (
                        <div key={cardGroup.cardId}>
                          <p className="text-xs text-muted-foreground/70 mb-2">
                            {cardGroup.categoryTitle} · {cardGroup.cardTitle}
                          </p>
                          <div className="space-y-3">
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
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No results */}
            {timelineItems.length === 0 && hasActiveFilter && (
              <p className="text-center text-gentle py-8 text-sm">
                {t('shared.no_results')}
              </p>
            )}

            {/* Browse cards module — bottom position when has content */}
            {!hasActiveFilter && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-10 mb-8"
              >
                <div className="p-4 rounded-2xl bg-card/20 border border-border/20">
                  <p className="font-serif text-base text-foreground">Bläddra bland kort</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">I er egen takt.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/')}
                  >
                    Utforska
                  </Button>
                </div>
              </motion.div>
            )}
            </>)}

            {/* "Er resa" section — always visible */}
            {!hasContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen className="w-3 h-3" />
                  {t('shared.journey_title')}
                </p>
                <div className="p-5 rounded-lg border border-border/50 bg-card/30">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t('shared.journey_empty')}
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
