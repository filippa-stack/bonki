import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink, Pencil, MessageCircle, Star } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { SharedNoteRow } from '@/pages/SharedSummary';
import type { ReflectionResponse } from '@/hooks/useReflectionResponses';

interface SharedTimelineItemProps {
  note: SharedNoteRow & {
    cardTitle: string;
    categoryTitle: string;
    categoryId: string;
    promptText: string;
  };
  isOwnNote: boolean;
  myResponse?: ReflectionResponse;
  partnerResponse?: ReflectionResponse;
  onUpdate: (noteId: string, content: string) => void;
  onSaveResponse: (reflectionId: string, content: string) => void;
  onOpenInContext: (cardId: string, sectionId: string, promptId: string) => void;
}

const STEP_LABELS: Record<string, string> = {
  opening: 'Öppnare',
  reflective: 'Tankeväckare',
  scenario: 'Scenario',
  exercise: 'Teamwork',
};

function getStepLabel(sectionId: string): string | null {
  for (const [key, label] of Object.entries(STEP_LABELS)) {
    if (sectionId.includes(key)) return label;
  }
  return null;
}

export default function SharedTimelineItem({
  note,
  isOwnNote,
  myResponse,
  partnerResponse,
  onUpdate,
  onSaveResponse,
  onOpenInContext,
}: SharedTimelineItemProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [localContent, setLocalContent] = useState(note.content);
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [responseContent, setResponseContent] = useState(myResponse?.content || '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const responseRef = useRef<HTMLTextAreaElement>(null);

  // Sync external content changes
  useEffect(() => {
    if (!editing) {
      setLocalContent(note.content);
    }
  }, [note.content, editing]);

  // Sync response content from prop
  useEffect(() => {
    if (myResponse && !showResponseInput) {
      setResponseContent(myResponse.content);
    }
  }, [myResponse?.content]);

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [editing]);

  useEffect(() => {
    if (showResponseInput && responseRef.current) {
      responseRef.current.focus();
    }
  }, [showResponseInput]);

  const handleChange = (value: string) => {
    setLocalContent(value);
    onUpdate(note.id, value);
  };

  const handleResponseChange = (value: string) => {
    setResponseContent(value);
    onSaveResponse(note.id, value);
  };

  const createdDate = note.shared_at || note.created_at;
  const wasEdited = note.updated_at !== note.created_at &&
    new Date(note.updated_at).getTime() - new Date(note.created_at).getTime() > 2000;

  const hasMyResponse = myResponse && myResponse.content.trim().length > 0;
  const stepLabel = getStepLabel(note.section_id);

  // Contextual time label
  const ageMs = Date.now() - new Date(createdDate).getTime();
  const isOlderThan24h = ageMs > 24 * 60 * 60 * 1000;
  const isOlderThan1h = ageMs > 60 * 60 * 1000;
  const timeLabel = isOlderThan24h
    ? 'Skrevs för en tid sedan.'
    : isOlderThan1h
      ? 'Skrevs tidigare idag.'
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-5 border-b border-border/20 last:border-b-0"
    >
      {/* Metadata — card title, step, date */}
      <div className="mb-2 space-y-0.5">
        <p className="text-[11px] text-muted-foreground/60">
          {note.cardTitle}
          {stepLabel && <span> · {stepLabel}</span>}
        </p>
        <p className="text-[10px] text-muted-foreground/40">
          {new Date(createdDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}
          {wasEdited && ' · uppdaterad'}
          {!isOwnNote && note.author_label && ` · ${note.author_label}`}
        </p>
      </div>

      {/* Prompt text (question) — subtle context */}
      {note.promptText && (
        <p className="text-xs text-foreground/50 italic mb-2 leading-relaxed">{note.promptText}</p>
      )}

      {/* Contextual time label */}
      {timeLabel && (
        <div className="mb-2 space-y-1">
          {isOlderThan24h && (
            <p className="text-[11px] text-muted-foreground/40">Läs i lugn och närvaro.</p>
          )}
          <p className="text-[11px] text-muted-foreground/50">{timeLabel}</p>
        </div>
      )}

      {/* Reflection content — primary element */}
      {editing ? (
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={localContent}
            onChange={(e) => handleChange(e.target.value)}
            className="text-sm min-h-[60px] resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground/60">Sparas automatiskt.</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => setEditing(false)}
            >
              Klar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-[15px] leading-relaxed text-foreground whitespace-pre-wrap font-serif">{note.content}</p>
      )}

      {/* Partner response — inline, soft */}
      {partnerResponse && partnerResponse.content.trim().length > 0 && (
        <div className="mt-3 pl-4 border-l-2 border-border/30">
          <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">{partnerResponse.content}</p>
        </div>
      )}

      {/* Controls — small icon row below content */}
      <div className="flex items-center gap-3 mt-3">
        {isOwnNote && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
        {!isOwnNote && !hasMyResponse && !showResponseInput && (
          <button
            onClick={() => setShowResponseInput(true)}
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
          >
            <MessageCircle className="w-3 h-3" />
          </button>
        )}
        <button
          onClick={() => onOpenInContext(note.card_id, note.section_id, note.prompt_id)}
          className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
        </button>
        {note.is_highlight && (
          <Star className="w-3 h-3 text-primary fill-primary/30" />
        )}
      </div>

      {/* My response — show/edit */}
      {!isOwnNote && (hasMyResponse || showResponseInput) && (
        <div className="mt-3 pl-4 border-l-2 border-border/30">
          {hasMyResponse && !showResponseInput ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-muted-foreground/50">Dina ord</p>
                <button
                  onClick={() => setShowResponseInput(true)}
                  className="text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm text-foreground/70 whitespace-pre-wrap leading-relaxed">{myResponse!.content}</p>
            </div>
          ) : showResponseInput ? (
            <div className="space-y-2">
              <Textarea
                ref={responseRef}
                value={responseContent}
                onChange={(e) => handleResponseChange(e.target.value)}
                placeholder="Skriv något du vill att den andra ska se…"
                className="text-sm min-h-[50px] resize-none"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground/60">Sparas automatiskt.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={() => setShowResponseInput(false)}
                >
                  Klar
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
