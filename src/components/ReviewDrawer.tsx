import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, FileText, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StepReflection from '@/components/StepReflection';
import { usePromptNotes } from '@/hooks/usePromptNotes';
import CardTakeaways from '@/components/CardTakeaways';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
import type { Card } from '@/types';

const EASE_OUT = [0.4, 0.0, 0.2, 1] as const;
const EASE_IN  = [0.4, 0.0, 1.0, 1] as const;
import { BEAT_1 } from '@/lib/motion';

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;
const STEP_LABELS: Record<string, string> = {
  opening: 'Början',
  reflective: 'Fördjupning',
  scenario: 'I vardagen',
  exercise: 'Tillsammans',
};

interface CardNote {
  promptId: string;
  sectionId: string;
  sectionType: string;
  promptIndex: number;
  content: string;
  visibility: 'private' | 'shared';
  hasShared: boolean;
  hasPartnerShared: boolean;
  isPartnerNote: boolean;
  updatedAt: string;
}

/** Small component to show note status pills per step (uses hook internally) */
function StepNoteStatus({ cardId, sectionId }: { cardId: string; sectionId: string }) {
  const { notes } = usePromptNotes(cardId, sectionId);

  const status = useMemo(() => {
    let hasMyPrivate = false;
    let hasMyShared = false;
    let hasPartnerShared = false;
    notes.forEach((note, key) => {
      if (!note.content.trim()) return;
      if (key.startsWith('partner:')) {
        hasPartnerShared = true;
      } else if (note.visibility === 'shared') {
        hasMyShared = true;
      } else if (note.visibility === 'private') {
        hasMyPrivate = true;
      }
    });
    return { hasMyPrivate, hasMyShared, hasPartnerShared };
  }, [notes]);

  if (!status.hasMyPrivate && !status.hasMyShared && !status.hasPartnerShared) return null;

  return (
    <div className="flex items-center gap-1.5">
      {status.hasMyShared ? (
        <span className="px-2 py-0.5 rounded-full text-xs leading-none border border-border/60 bg-muted/20 text-muted-foreground">
          Delad
        </span>
      ) : status.hasMyPrivate ? (
        <span className="px-2 py-0.5 rounded-full text-xs leading-none border border-border/60 bg-muted/20 text-muted-foreground/60">
          Privat
        </span>
      ) : null}
      {status.hasPartnerShared && (
        <span className="px-2 py-0.5 rounded-full text-xs leading-none border border-border/60 bg-muted/20 text-muted-foreground/60">
          Från den andra
        </span>
      )}
    </div>
  );
}

interface ReviewDrawerProps {
  open: boolean;
  onClose: () => void;
  card: Card;
}

export default function ReviewDrawer({ open, onClose, card }: ReviewDrawerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const [cardNotes, setCardNotes] = useState<CardNote[]>([]);
  const [completedStepIndices, setCompletedStepIndices] = useState<Set<number>>(new Set());
  const [noteFilter, setNoteFilter] = useState<'all' | 'my_private' | 'my_shared' | 'partner'>('all');
  

  const filteredNotes = noteFilter === 'all'
    ? cardNotes
    : noteFilter === 'my_private'
      ? cardNotes.filter(n => !n.isPartnerNote && n.visibility === 'private')
      : noteFilter === 'my_shared'
        ? cardNotes.filter(n => !n.isPartnerNote && n.visibility === 'shared')
        : cardNotes.filter(n => n.isPartnerNote);

  // Per-section note status derived from cardNotes
  const sectionNoteStatus = useMemo(() => {
    const status: Record<string, { hasPrivate: boolean; hasShared: boolean; hasPartnerShared: boolean }> = {};
    for (const note of cardNotes) {
      if (!status[note.sectionId]) {
        status[note.sectionId] = { hasPrivate: false, hasShared: false, hasPartnerShared: false };
      }
      if (note.visibility === 'shared' || note.hasShared) status[note.sectionId].hasShared = true;
      if (note.visibility === 'private' && !note.hasShared) status[note.sectionId].hasPrivate = true;
      if (note.hasPartnerShared) status[note.sectionId].hasPartnerShared = true;
    }
    return status;
  }, [cardNotes]);

  // Fetch all notes for this card when drawer opens
  useEffect(() => {
    if (!open || !user || !space) return;

    const fetchAllData = async () => {
      // Fetch the most recently completed session for this card
      const { data: sessionData } = await supabase
        .from('couple_sessions')
        .select('id')
        .eq('couple_space_id', space.id)
        .eq('card_id', card.id)
        .eq('status', 'completed')
        .order('ended_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fetch step_reflections for that session to determine which stages were visited
      if (sessionData?.id) {
        const { data: reflections } = await supabase
          .from('step_reflections')
          .select('step_index')
          .eq('session_id', sessionData.id);
        
        const indices = new Set((reflections || []).map(r => r.step_index));
        setCompletedStepIndices(indices);
      } else {
        setCompletedStepIndices(new Set());
      }

      // Fetch my notes
      const { data: myData } = await supabase
        .from('prompt_notes')
        .select('*')
        .eq('couple_space_id', space.id)
        .eq('card_id', card.id)
        .eq('user_id', user.id);

      // Fetch partner's shared notes (with content)
      const { data: partnerData } = await supabase
        .from('prompt_notes')
        .select('*')
        .eq('couple_space_id', space.id)
        .eq('card_id', card.id)
        .eq('visibility', 'shared')
        .neq('user_id', user.id);

      if (!myData && !partnerData) return;

      const sharedSet = new Set(
        (myData || []).filter(n => n.visibility === 'shared').map(n => `${n.section_id}:${n.prompt_id}`)
      );
      const partnerSharedSet = new Set(
        (partnerData || []).map(n => `${n.section_id}:${n.prompt_id}`)
      );

      const mapNote = (n: any, isPartner: boolean): CardNote => {
        const section = card.sections.find(s => s.id === n.section_id);
        const sectionType = section?.type || 'opening';
        const promptIndex = section?.prompts
          ? section.prompts.findIndex((_, i) => `prompt-${i}` === n.prompt_id)
          : -1;
        const key = `${n.section_id}:${n.prompt_id}`;
        return {
          promptId: n.prompt_id,
          sectionId: n.section_id,
          sectionType,
          promptIndex: promptIndex >= 0 ? promptIndex : 0,
          content: n.content,
          visibility: n.visibility as 'private' | 'shared',
          hasShared: sharedSet.has(key),
          hasPartnerShared: partnerSharedSet.has(key),
          isPartnerNote: isPartner,
          updatedAt: n.updated_at,
        };
      };

      const myNotes = (myData || [])
        .filter(n => n.content.trim())
        .map(n => mapNote(n, false))
        .reduce<CardNote[]>((acc, note) => {
          const existing = acc.findIndex(n => n.sectionId === note.sectionId && n.promptId === note.promptId);
          if (existing >= 0) {
            if (note.visibility === 'shared') acc[existing] = note;
          } else {
            acc.push(note);
          }
          return acc;
        }, []);

      const partnerNotes = (partnerData || [])
        .filter(n => n.content.trim())
        .map(n => mapNote(n, true));

      const allNotes = [...myNotes, ...partnerNotes].sort((a, b) => {
        const aStep = STEP_ORDER.indexOf(a.sectionType as any);
        const bStep = STEP_ORDER.indexOf(b.sectionType as any);
        if (aStep !== bStep) return aStep - bStep;
        if (a.isPartnerNote !== b.isPartnerNote) return a.isPartnerNote ? 1 : -1;
        return a.promptIndex - b.promptIndex;
      });

      setCardNotes(allNotes);
    };

    fetchAllData();
  }, [open, user, space, card]);

  const handleNoteClick = (note: CardNote) => {
    onClose();
    const stepIndex = STEP_ORDER.indexOf(note.sectionType as any);
    navigate(`/card/${card.id}?revisit=true&step=${stepIndex}&focusNote=${note.promptIndex}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            key="drawer"
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-[10px] border bg-background max-h-[85vh]"
            initial={{ y: '100%' }}
            animate={{ y: 0, transition: { duration: 0.26, ease: EASE_OUT } }}
            exit={{ y: '100%', transition: { duration: 0.20, ease: EASE_IN } }}
          >
            <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted shrink-0" />

            {/* Header */}
            <div className="grid gap-1.5 p-4 text-left border-b border-divider pb-4 shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-lg text-foreground">
                  {t('review_drawer.title', 'Era svar')}
                </h2>
                <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              {/* Hint removed */}
            </div>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-3 mb-0 grid grid-cols-2 w-auto">
            <TabsTrigger value="overview" className="text-xs">
              Frågor
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs gap-1">
              <FileText className="w-3 h-3" />
              Era svar
              {cardNotes.length > 0 && (
                <span className="ml-1 text-[10px] bg-primary/15 text-primary rounded-full px-1.5 py-0.5 leading-none">
                  {cardNotes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview tab — existing content */}
          <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="px-6 py-4" style={{ height: 'calc(85vh - 180px)' }}>
              <div className="space-y-6 pb-8">
                {STEP_ORDER.map((stepType, index) => {
                  const section = card.sections.find((s) => s.type === stepType);
                  if (!section) return null;

                  const status = sectionNoteStatus[section.id];
                  const hasAnyNotes = status?.hasPrivate || status?.hasShared || status?.hasPartnerShared;

                  // A step is unlocked if it has notes, step_reflections, or is the first step.
                  const hasReflectionForStep = completedStepIndices.has(index);
                  const isUnlocked = index === 0 || !!hasAnyNotes || hasReflectionForStep;

                  return (
                    <motion.div
                      key={stepType}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * BEAT_1, duration: 0.15 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                            isUnlocked ? 'bg-muted text-muted-foreground' : 'bg-muted/50 text-muted-foreground/40'
                          }`}>
                            {index + 1}
                          </div>
                          <h3 className={`font-serif text-base ${isUnlocked ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                            {STEP_LABELS[stepType]}
                          </h3>
                        </div>
                        {isUnlocked && hasAnyNotes && <StepNoteStatus cardId={card.id} sectionId={section.id} />}
                      </div>

                      {isUnlocked ? (
                        <>
                          <div className="pl-9">
                            {(stepType === 'scenario' || stepType === 'exercise') ? (
                              /* Scenario/Teamwork: unified block — content flows into prompts */
                              <div className="space-y-2">
                                {section.content && (
                                  <p className="text-sm text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">
                                    {section.content}
                                  </p>
                                )}
                                {section.prompts && section.prompts.length > 0 && section.prompts.map((prompt, pi) => (
                                  <p key={pi} className="text-sm font-medium text-foreground/85 leading-relaxed">
                                    {typeof prompt === 'string' ? prompt : prompt.text}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              /* Början/Fördjupning: subtext + question list */
                              <div className="space-y-3">
                                {section.content && (
                                  <p className="text-xs text-muted-foreground/70 leading-relaxed whitespace-pre-wrap mb-1">
                                    {section.content}
                                  </p>
                                )}
                                {section.prompts && section.prompts.length > 0 && (
                                  <ul className="space-y-2.5">
                                    {section.prompts.map((prompt, pi) => (
                                      <li key={pi} className="text-sm font-medium text-foreground/85 leading-relaxed">
                                        {typeof prompt === 'string' ? prompt : prompt.text}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="pl-9">
                            <StepReflection section={section} card={card} defaultExpanded={false} />
                          </div>
                        </>
                      ) : (
                        <p className="pl-9 text-sm text-muted-foreground/50 italic">
                          Inte öppnad än.
                        </p>
                      )}
                    </motion.div>
                  );
                })}

                <div className="border-t border-divider pt-6">
                  <CardTakeaways cardId={card.id} compact />
                  {/* Removed pace disclaimer */}
                </div>

                <div className="border-t border-divider pt-6 space-y-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Gå igenom i din takt
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {STEP_ORDER.map((stepType, idx) => (
                      <Button
                        key={stepType}
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs justify-start"
                        onClick={() => {
                          onClose();
                          navigate(`/card/${card.id}?revisit=true&step=${idx}`);
                        }}
                      >
                        <ArrowRight className="w-3 h-3" />
                        {STEP_LABELS[stepType]}
                      </Button>
                    ))}
                  </div>
                  {/* Removed tempo disclaimer */}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Notes tab */}
          <TabsContent value="notes" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="px-6 py-4" style={{ height: 'calc(85vh - 180px)' }}>
              {cardNotes.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Inga anteckningar än
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Era reflektioner visas här
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pb-8">
                  {/* Filter chips */}
                  <div className="flex gap-1.5 flex-wrap">
                    {([
                      { key: 'all', label: 'Alla' },
                      { key: 'my_private', label: 'Mina privata' },
                      { key: 'my_shared', label: 'Mina delade' },
                      { key: 'partner', label: 'Från min partner' },
                    ] as const).map(({ key, label }) => {
                      const count = key === 'all'
                        ? cardNotes.length
                        : key === 'my_private'
                          ? cardNotes.filter(n => !n.isPartnerNote && n.visibility === 'private').length
                          : key === 'my_shared'
                            ? cardNotes.filter(n => !n.isPartnerNote && n.visibility === 'shared').length
                            : cardNotes.filter(n => n.isPartnerNote).length;
                      return (
                        <button
                          key={key}
                          onClick={() => setNoteFilter(key)}
                          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                            noteFilter === key
                              ? 'bg-primary/15 text-primary'
                              : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                          }`}
                        >
                          {label} ({count})
                        </button>
                      );
                    })}
                  </div>

                  {/* Note items */}
                  {filteredNotes.map((note, i) => (
                    <motion.div
                      key={`${note.sectionId}-${note.promptId}-${note.isPartnerNote ? 'p' : 'm'}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * BEAT_1, duration: 0.18 }}
                      onClick={() => !note.isPartnerNote && handleNoteClick(note)}
                      className={`w-full text-left rounded-xl border border-border/40 transition-all flex overflow-hidden ${
                        note.isPartnerNote
                          ? 'bg-muted/20 cursor-default'
                          : 'bg-white hover:border-primary/30 hover:shadow-sm cursor-pointer'
                      }`}
                    >
                      {/* Left accent bar */}
                      <div className={`w-1 shrink-0 ${
                        note.isPartnerNote ? 'bg-primary/25' : note.visibility === 'shared' ? 'bg-primary/50' : 'bg-muted-foreground/15'
                      }`} />
                      <div className="p-3 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5 mb-1">
                          <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                            {STEP_LABELS[note.sectionType]}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50">
                            Fråga {note.promptIndex + 1}
                          </span>
                          {note.isPartnerNote ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] leading-none bg-primary/10 text-primary/70 font-medium">
                              Från din partner
                            </span>
                          ) : (
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                              note.visibility === 'shared'
                                ? 'bg-primary/10 text-primary/80 font-medium'
                                : 'bg-muted/50 text-muted-foreground/50'
                            }`}>
                              {note.visibility === 'shared' ? 'Delad' : 'Privat'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                          {note.content}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
