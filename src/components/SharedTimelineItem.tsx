import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Pencil } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import type { SharedNoteRow } from '@/pages/SharedSummary';

interface SharedTimelineItemProps {
  note: SharedNoteRow & {
    cardTitle: string;
    categoryTitle: string;
    categoryId: string;
    promptText: string;
  };
  isOwnNote: boolean;
  onUpdate: (noteId: string, content: string) => void;
  onOpenInContext: (cardId: string, sectionId: string, promptId: string) => void;
}

export default function SharedTimelineItem({
  note,
  isOwnNote,
  onUpdate,
  onOpenInContext,
}: SharedTimelineItemProps) {
  const [editing, setEditing] = useState(false);
  const [localContent, setLocalContent] = useState(note.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync external content changes
  useEffect(() => {
    if (!editing) {
      setLocalContent(note.content);
    }
  }, [note.content, editing]);

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

  const handleChange = (value: string) => {
    setLocalContent(value);
    onUpdate(note.id, value);
  };

  const handleBlur = () => {
    setEditing(false);
  };

  const createdDate = note.shared_at || note.created_at;
  const wasEdited = note.updated_at !== note.created_at &&
    new Date(note.updated_at).getTime() - new Date(note.created_at).getTime() > 2000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-card border border-border"
    >
      {/* Context label */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-muted-foreground">
          {note.categoryTitle} · {note.cardTitle}
        </p>
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
    </motion.div>
  );
}
