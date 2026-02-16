import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Share2, PenLine } from 'lucide-react';
import { usePromptNotes } from '@/hooks/usePromptNotes';
import { Button } from '@/components/ui/button';

interface WaitingStepNoteProps {
  cardId: string;
  sectionId: string;
}

const STEP_PROMPT_ID = 'step-note';

export default function WaitingStepNote({ cardId, sectionId }: WaitingStepNoteProps) {
  const { saveNote, shareNote, getPrivateNote, getSharedNote } = usePromptNotes(cardId, sectionId);

  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInit = useRef(false);

  const privateNote = getPrivateNote(STEP_PROMPT_ID);
  const sharedNote = getSharedNote(STEP_PROMPT_ID);

  useEffect(() => {
    if (!hasInit.current && privateNote?.content) {
      setText(privateNote.content);
      hasInit.current = true;
    }
  }, [privateNote?.content]);

  const [justSaved, setJustSaved] = useState<'private' | 'shared' | null>(null);

  const handleSavePrivate = useCallback(() => {
    if (!text.trim()) return;
    saveNote(STEP_PROMPT_ID, text, 'private');
    setJustSaved('private');
    setTimeout(() => setJustSaved(null), 2000);
  }, [text, saveNote]);

  const handleShare = useCallback(() => {
    if (!text.trim() && !privateNote?.content) return;
    const content = text.trim() || privateNote?.content || '';
    saveNote(STEP_PROMPT_ID, content, 'private');
    setTimeout(() => shareNote(STEP_PROMPT_ID), 100);
    setJustSaved('shared');
    setTimeout(() => setJustSaved(null), 2000);
  }, [text, privateNote, saveNote, shareNote]);

  if (!open) {
    return (
      <button
        onClick={() => {
          setOpen(true);
          setTimeout(() => textareaRef.current?.focus(), 100);
        }}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <PenLine className="w-3.5 h-3.5" />
        Egen tanke
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-3"
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Skriv något du vill komma ihåg…"
          className="w-full min-h-[64px] p-3 bg-transparent resize-none focus:outline-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/60"
        />
        <p className="px-3 pb-1 text-xs text-muted-foreground/65">Du väljer alltid själv vad som delas.</p>
        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <div>
            <AnimatePresence mode="wait">
              {justSaved === 'private' && (
                <motion.span
                  key="private"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-muted-foreground/60 not-italic flex items-center gap-1"
                >
                   <Lock className="w-3 h-3" /> Sparat för dig
                </motion.span>
              )}
              {justSaved === 'shared' && (
                <motion.span
                  key="shared"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-muted-foreground/60 not-italic flex items-center gap-1"
                >
                  <Share2 className="w-3 h-3" /> Delat med din partner
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSavePrivate}
              disabled={!text.trim()}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              Spara
            </button>
            <button
              onClick={handleShare}
              disabled={!text.trim() && !privateNote?.content}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-40"
            >
              Dela
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
      >
        Stäng
      </button>
    </motion.div>
  );
}
