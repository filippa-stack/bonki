import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ExternalLink, Pencil, MessageCircle } from 'lucide-react';
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

  const handleBlur = () => {
    setEditing(false);
  };

  const handleResponseChange = (value: string) => {
    setResponseContent(value);
    onSaveResponse(note.id, value);
  };

  const createdDate = note.shared_at || note.created_at;
  const wasEdited = note.updated_at !== note.created_at &&
    new Date(note.updated_at).getTime() - new Date(note.created_at).getTime() > 2000;

  const hasMyResponse = myResponse && myResponse.content.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-card border border-border"
    >
      {/* Context label */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">
            {note.categoryTitle} · {note.cardTitle}
          </p>
          {note.author_label && (
            <span className="text-xs text-muted-foreground/60">
              · {note.author_label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isOwnNote && !editing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setEditing(true)}
            >
              <Pencil className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onOpenInContext(note.card_id, note.section_id, note.prompt_id)}
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Prompt text (question) */}
      {note.promptText && (
        <p className="text-xs text-foreground/60 italic mb-2">{note.promptText}</p>
      )}

      {/* Content — editable or read-only */}
      {editing ? (
        <Textarea
          ref={textareaRef}
          value={localContent}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          className="text-sm min-h-[60px] resize-none"
        />
      ) : (
        <p className="text-body text-foreground whitespace-pre-wrap">{note.content}</p>
      )}

      {/* Date + edited indicator */}
      <div className="flex items-center gap-2 mt-2">
        <p className="text-xs text-muted-foreground">
          {new Date(createdDate).toLocaleDateString('sv-SE')}
        </p>
        {wasEdited && (
          <span className="text-xs text-muted-foreground/60">· redigerad</span>
        )}
      </div>

      {/* Partner response (read-only) */}
      {partnerResponse && partnerResponse.content.trim().length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground mb-1">{t('shared.partner_response')}</p>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap">{partnerResponse.content}</p>
        </div>
      )}

      {/* My response — show/edit */}
      {!isOwnNote && (
        <div className="mt-3 pt-3 border-t border-border/50">
          {hasMyResponse && !showResponseInput ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{t('shared.add_response')}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowResponseInput(true)}
                >
                  <Pencil className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{myResponse!.content}</p>
            </div>
          ) : showResponseInput || !hasMyResponse ? (
            <div>
              {!showResponseInput && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground gap-1 px-0 h-auto py-1"
                  onClick={() => setShowResponseInput(true)}
                >
                  <MessageCircle className="w-3 h-3" />
                  {t('shared.add_response')}
                </Button>
              )}
              {showResponseInput && (
                <Textarea
                  ref={responseRef}
                  value={responseContent}
                  onChange={(e) => handleResponseChange(e.target.value)}
                  onBlur={() => {
                    if (responseContent.trim().length > 0) {
                      setShowResponseInput(false);
                    }
                  }}
                  placeholder={t('shared.response_placeholder')}
                  className="text-sm min-h-[50px] resize-none mt-1"
                />
              )}
            </div>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
