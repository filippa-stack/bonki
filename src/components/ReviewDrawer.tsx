import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, ArrowRight, FileText } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StepReflection from '@/components/StepReflection';
import { usePromptNotes } from '@/hooks/usePromptNotes';
import CardTakeaways from '@/components/CardTakeaways';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import type { Card } from '@/types';

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;
const STEP_LABELS: Record<string, string> = {
  opening: 'Öppnare',
  reflective: 'Tankeväckare',
  scenario: 'Scenario',
  exercise: 'Teamwork',
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
  activeStepIndex?: number;
}

export default function ReviewDrawer({ open, onClose, card, activeStepIndex = 0 }: ReviewDrawerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const [cardNotes, setCardNotes] = useState<CardNote[]>([]);
  const [noteFilter, setNoteFilter] = useState<'all' | 'private' | 'shared'>('all');
  const [stepFilter, setStepFilter] = useState<'all' | 'private' | 'shared'>('all');
  const activeStepRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to active step when drawer opens
  useEffect(() => {
    if (!open || activeStepIndex <= 0) return;
    // Wait for drawer open animation + content render
    const timer = setTimeout(() => {
      const el = activeStepRef.current;
      if (!el) return;
      // Try multiple scroll strategies
      const viewport = el.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null;
      if (viewport) {
        const viewportRect = viewport.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const scrollOffset = elRect.top - viewportRect.top + viewport.scrollTop - 16;
        viewport.scrollTo({ top: scrollOffset, behavior: 'smooth' });
      }
      // Fallback
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
    return () => clearTimeout(timer);
  }, [open, activeStepIndex]);

  const filteredNotes = noteFilter === 'all'
    ? cardNotes
    : noteFilter === 'shared'
      ? cardNotes.filter(n => n.visibility === 'shared' || n.hasShared || n.hasPartnerShared)
      : cardNotes.filter(n => n.visibility === 'private' && !n.hasShared);

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

    const fetchAllNotes = async () => {
      // Fetch my notes
      const { data: myData } = await supabase
        .from('prompt_notes')
        .select('*')
        .eq('couple_space_id', space.id)
        .eq('card_id', card.id)
        .eq('user_id', user.id);

      // Fetch partner's shared notes
      const { data: partnerData } = await supabase
        .from('prompt_notes')
        .select('section_id, prompt_id')
        .eq('couple_space_id', space.id)
        .eq('card_id', card.id)
        .eq('visibility', 'shared')
        .neq('user_id', user.id);

      if (!myData) return;

      const sharedSet = new Set(
        myData.filter(n => n.visibility === 'shared').map(n => `${n.section_id}:${n.prompt_id}`)
      );
      const partnerSharedSet = new Set(
        (partnerData || []).map(n => `${n.section_id}:${n.prompt_id}`)
      );

      const notes: CardNote[] = myData
        .filter(n => n.content.trim())
        .map(n => {
          const section = card.sections.find(s => s.id === n.section_id);
          const sectionType = section?.type || 'opening';
          const promptIndex = section?.prompts
            ? section.prompts.findIndex((_, i) => {
                const pid = `prompt-${i}`;
                return pid === n.prompt_id;
              })
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
            updatedAt: n.updated_at,
          };
        })
        // Deduplicate: if both private+shared exist for same prompt, keep shared
        .reduce<CardNote[]>((acc, note) => {
          const existing = acc.findIndex(n => n.sectionId === note.sectionId && n.promptId === note.promptId);
          if (existing >= 0) {
            // Keep the shared one, or the most recently updated
            if (note.visibility === 'shared') acc[existing] = note;
          } else {
            acc.push(note);
          }
          return acc;
        }, [])
        .sort((a, b) => {
          const aStep = STEP_ORDER.indexOf(a.sectionType as any);
          const bStep = STEP_ORDER.indexOf(b.sectionType as any);
          if (aStep !== bStep) return aStep - bStep;
          return a.promptIndex - b.promptIndex;
        });

      setCardNotes(notes);
    };

    fetchAllNotes();
  }, [open, user, space, card]);

  const handleNoteClick = (note: CardNote) => {
    onClose();
    const stepIndex = STEP_ORDER.indexOf(note.sectionType as any);
    navigate(`/card/${card.id}?revisit=true&step=${stepIndex}&focusNote=${note.promptIndex}`);
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-divider pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-serif text-lg text-foreground">
              {t('review_drawer.title', 'Se tillbaka')}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('review_drawer.hint', 'Se vad ni skrev — och fortsätt när det passar. Det här påverkar inte var ni är i samtalet.')}
          </p>
        </DrawerHeader>

        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-3 mb-0 grid grid-cols-2 w-auto">
            <TabsTrigger value="overview" className="text-xs">
              Översikt
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs gap-1">
              <FileText className="w-3 h-3" />
              Mina anteckningar
              {cardNotes.length > 0 && (
                <span className="ml-1 text-[10px] bg-primary/15 text-primary rounded-full px-1.5 py-0.5 leading-none">
                  {cardNotes.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Overview tab — existing content */}
          <TabsContent value="overview" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-6 py-4" style={{ maxHeight: 'calc(85vh - 160px)' }}>
              <div className="space-y-6 pb-8">
                {/* Step filter chips */}
                <div className="flex gap-1.5">
                  {(['all', 'private', 'shared'] as const).map((f) => {
                    const label = f === 'all' ? 'Alla' : f === 'private' ? 'Privat' : 'Delat';
                    return (
                      <button
                        key={f}
                        onClick={() => setStepFilter(f)}
                        className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                          stepFilter === f
                            ? 'bg-primary/15 text-primary'
                            : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {STEP_ORDER.map((stepType, index) => {
                  const section = card.sections.find((s) => s.type === stepType);
                  if (!section) return null;

                  // Filters only affect note indicators, not step visibility
                  const status = sectionNoteStatus[section.id];
                  const showNoteStatus = stepFilter === 'all'
                    || (stepFilter === 'private' && status?.hasPrivate)
                    || (stepFilter === 'shared' && (status?.hasShared || status?.hasPartnerShared));

                  return (
                    <motion.div
                      key={stepType}
                      ref={index === activeStepIndex ? activeStepRef : undefined}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                            {index + 1}
                          </div>
                          <h3 className="font-serif text-base text-foreground">
                            {STEP_LABELS[stepType]}
                          </h3>
                        </div>
                        {showNoteStatus && <StepNoteStatus cardId={card.id} sectionId={section.id} />}
                      </div>

                      <div className="pl-9 space-y-2">
                        {section.content && (
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {section.content}
                          </p>
                        )}
                        {section.prompts && section.prompts.length > 0 && (
                          <ul className="space-y-1.5">
                            {section.prompts.map((prompt, pi) => (
                              <li key={pi} className="text-sm text-foreground/80 leading-relaxed">
                                {typeof prompt === 'string' ? prompt : prompt.text}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="pl-9">
                        <StepReflection section={section} card={card} defaultExpanded={false} />
                      </div>
                    </motion.div>
                  );
                })}

                <div className="border-t border-divider pt-6">
                  <CardTakeaways cardId={card.id} compact />
                  <p className="text-xs text-muted-foreground/50 not-italic text-center mt-3">
                    Det här påverkar inte er takt.
                  </p>
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
                  <p className="text-xs text-muted-foreground/50 not-italic text-center">
                    Det här påverkar inte ert gemensamma tempo.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Notes tab */}
          <TabsContent value="notes" className="flex-1 overflow-hidden mt-0">
            <ScrollArea className="h-full px-6 py-4" style={{ maxHeight: 'calc(85vh - 160px)' }}>
              {cardNotes.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Inga anteckningar än
                  </p>
                  <p className="text-xs text-muted-foreground/60">
                    Dina privata reflektioner visas här
                  </p>
                </div>
              ) : (
                <div className="space-y-3 pb-8">
                  {/* Filter chips */}
                  <div className="flex gap-1.5">
                    {(['all', 'private', 'shared'] as const).map((f) => {
                      const label = f === 'all' ? 'Alla' : f === 'private' ? 'Privata' : 'Delade';
                      const count = f === 'all'
                        ? cardNotes.length
                        : f === 'shared'
                          ? cardNotes.filter(n => n.hasShared || n.hasPartnerShared).length
                          : cardNotes.filter(n => !n.hasShared && !n.hasPartnerShared).length;
                      return (
                        <button
                          key={f}
                          onClick={() => setNoteFilter(f)}
                          className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                            noteFilter === f
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
                    <motion.button
                      key={`${note.sectionId}-${note.promptId}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.2 }}
                      onClick={() => handleNoteClick(note)}
                      className={`w-full text-left rounded-xl bg-white border border-border/40 hover:border-primary/30 hover:shadow-sm transition-all group flex overflow-hidden`}
                    >
                      {/* Left accent bar */}
                      <div className={`w-1 shrink-0 ${note.hasShared ? 'bg-primary/50' : note.hasPartnerShared ? 'bg-primary/30' : 'bg-muted-foreground/15'}`} />
                      <div className="p-3 flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5 mb-1">
                          <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
                            {STEP_LABELS[note.sectionType]}
                          </span>
                          <span className="text-[10px] text-muted-foreground/50">
                            Fråga {note.promptIndex + 1}
                          </span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] leading-none ${
                            note.hasShared
                              ? 'bg-primary/10 text-primary/80 font-medium'
                              : 'bg-muted/50 text-muted-foreground/50'
                          }`}>
                            {note.hasShared ? 'Delad' : 'Privat'}
                          </span>
                          {note.hasPartnerShared && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] leading-none bg-muted/40 text-muted-foreground/60">
                              Från din partner
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">
                          {note.content}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
