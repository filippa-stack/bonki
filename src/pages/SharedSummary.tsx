import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BEAT_1, BEAT_2, BEAT_3 } from '@/lib/motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useSpaceSnapshot } from '@/hooks/useSpaceSnapshot';
import { selectExploredCardIds } from '@/selectors/spaceSnapshotSelectors';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useReflectionResponses } from '@/hooks/useReflectionResponses';
import { supabase } from '@/integrations/supabase/client';
import { useDevState } from '@/contexts/DevStateContext';
import Header from '@/components/Header';
import SharedTimelineItem from '@/components/SharedTimelineItem';
import ReflectionMemoryCard from '@/components/ReflectionMemoryCard';
import { Search, Filter, ChevronDown, Share2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { toastSuccessOnce, toastErrorOnce } from '@/lib/toastOnce';

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

export default function SharedSummary() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { categories, getCardById, getCategoryById, cards } = useApp();
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();
  const { snapshot } = useSpaceSnapshot(user?.id ?? null, space?.id ?? null);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFind, setShowFind] = useState(false);
  const [sharedNotes, setSharedNotes] = useState<SharedNoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllHighlights, setShowAllHighlights] = useState(false);

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
  const { getPartnerResponse } = useReflectionResponses(reflectionIds);

  const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;

  const handleOpenInContext = (cardId: string, sectionId: string, promptId: string) => {
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
  };

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

  const devState = useDevState();
  const hasContent = devState === 'archiveEmpty' ? false
    : devState === 'archiveWithHistory' ? true
    : sharedNotes.length > 0;
  const effectiveLoading = devState ? false : loading;
  const hasActiveFilter = categoryFilter !== 'all' || searchQuery.length > 0;

  const exploredIds = selectExploredCardIds(snapshot);
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

      <div className="px-6 pt-[80px] pb-10 mx-auto" style={{ maxWidth: 540 }}>

        {/* ─── Title ─── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="mb-10 text-center"
        >
          <h1 className="font-serif text-xl font-medium text-foreground tracking-tight">Vårt utrymme</h1>
          <p className="text-sm text-muted-foreground/50 mt-2">En överblick över det du redan har utforskat.</p>
        </motion.div>

        {/* ─── Empty state ─── */}
        {!hasContent && !hasActiveFilter && !effectiveLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="pt-8 pb-24 text-center"
          >
            <p className="text-[17px] font-medium text-foreground/70 leading-relaxed mt-6">
              Här växer det ni delar.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground/57 mt-7">
              När ni har haft ert första samtal, börjar rummet ta form.
            </p>
          </motion.div>
        )}

        {effectiveLoading ? (
          <div className="py-12 space-y-6 animate-fade-in">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-4 w-3/4 mx-auto rounded bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {hasContent && (<>

              {/* ═══════════════════════════════════════════
                  SECTION 1: "Nyligen delat" — Memory cards
                  ═══════════════════════════════════════════ */}
               {recentItems.length > 0 && !hasActiveFilter && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: BEAT_1, duration: 0.15 }}
                   className="mb-12 rounded-2xl border border-border/15 bg-card/40 p-5"
                 >
                   <SectionLabel>Nyligen delat</SectionLabel>
                   <div className="space-y-3 -mx-5 -mb-5 px-5 pb-5">
                    {recentItems.map((item) => {
                      const partnerResp = getPartnerResponse(item.id);
                      const responseCount = partnerResp && partnerResp.content.trim().length > 0 ? 1 : 0;

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
                  SECTION 1.5: Highlights (takeaways)
                  ═══════════════════════════════════════════ */}
               {highlights.length > 0 && !hasActiveFilter && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: BEAT_2, duration: 0.15 }}
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
                  SECTION 2: "Er resa tillsammans" — Progress
                  ═══════════════════════════════════════════ */}
               {!hasActiveFilter && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: BEAT_3, duration: 0.15 }}
                   className="mb-16 mt-[88px]"
                 >

                   <SectionLabel>Er resa tillsammans</SectionLabel>
                   <p className="text-[12px] text-foreground/60 text-center mb-8">Så här har ni rört er hittills.</p>
                   <div className="space-y-4">
                    <p className="text-xs text-muted-foreground/50 text-center">
                      {exploredCount === 0
                        ? 'Ni har inte börjat ännu.'
                        : `${exploredCount} samtal tillsammans.`}
                    </p>
                    <div className="space-y-[26px]">
                      {categoryProgress.map((cat) => (
                        <div key={cat.id}>
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-[11px] font-medium text-foreground/60">{cat.title}</p>
                            <p className="text-[9px] text-muted-foreground/35">{cat.explored}/{cat.total}</p>
                          </div>
                          <div className="flex gap-[3px]">
                            {Array.from({ length: cat.total }).map((_, i) => (
                              <div
                                key={i}
                                className={`h-[2px] flex-1 ${
                                  i < cat.explored
                                    ? 'bg-primary/20'
                                    : 'bg-foreground/[0.10]'
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
                  SECTION 2.5: "Besökta samtal" — explored cards list
                  ═══════════════════════════════════════════ */}
               {!hasActiveFilter && exploredIds.length > 0 && (
                 <motion.div
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: BEAT_3, duration: 0.15 }}
                   className="mb-12"
                 >
                   <SectionLabel>Besökta samtal</SectionLabel>
                   <div className="divide-y divide-foreground/[0.08] [&>*:nth-child(2)]:border-t-[hsl(var(--foreground)/0.14)]">
                     {cards
                       .filter(c => exploredIds.includes(c.id))
                       .map((card, index) => {
                         const category = getCategoryById(card.categoryId);
                         const isFirst = index === 0;
                         return (
                           <button
                             key={card.id}
                             onClick={() => navigate(`/card/${card.id}?revisit=true`)}
                             className={`w-full text-left group ${isFirst ? 'pt-0 pb-6' : 'py-5'}`}
                             style={!isFirst ? { borderTopColor: 'hsl(var(--foreground) / 0.08)' } : undefined}
                           >
                             {category && (
                               <p className="text-[12px] text-foreground/60 mb-2 leading-none">
                                 {category.title}
                               </p>
                             )}
                             <div className="flex items-baseline justify-between gap-3">
                               <p className={`font-serif text-[17px] leading-snug transition-colors group-hover:text-foreground ${isFirst ? 'font-semibold text-foreground/90' : 'text-foreground/80'}`}>
                                 {card.title}
                               </p>
                               <span className="text-muted-foreground opacity-55 group-hover:opacity-80 transition-opacity flex-shrink-0 text-sm">→</span>
                             </div>
                             {card.subtitle && (
                               <p className="text-sm text-muted-foreground/55 mt-1.5 leading-relaxed">
                                 {card.subtitle}
                               </p>
                             )}
                           </button>
                         );
                       })
                     }
                   </div>
                 </motion.div>
               )}

              {/* ═══════════════════════════════════════════
                  SECTION 3: "Er historia" — Archive timeline
                  ═══════════════════════════════════════════ */}
               {(olderGrouped.length > 0 || hasActiveFilter) && (
                 <div className="mb-12">
                   <SectionLabel>Tidslinje</SectionLabel>

                  {/* Search — inline */}
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
                          partnerResponseContent={getPartnerResponse(item.id)?.content}
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

                      <div className="space-y-6">
                        {group.cardGroups.map((cardGroup) => (
                          <div key={cardGroup.cardId} className="rounded-[20px] border border-border/15 bg-card/40 p-6">
                            <div className="relative pl-8 mb-3">
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
                                  partnerResponseContent={getPartnerResponse(item.id)?.content}
                                  onOpenInContext={handleOpenInContext}
                                  variant="journey"
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
    <p className="text-sm font-medium text-foreground/75 mb-6 text-center tracking-normal normal-case">
      {children}
    </p>
  );
}
