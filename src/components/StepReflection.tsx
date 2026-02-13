import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Lock, Share2, ChevronDown, Users } from 'lucide-react';
import { usePromptNotes } from '@/hooks/usePromptNotes';
import { Section, Card } from '@/types';

interface StepReflectionProps {
  section: Section;
  card: Card;
  /** Steps 1–2 (opening/reflective) default to compact; 3–4 default to expanded */
  defaultExpanded?: boolean;
}

const STEP_PROMPT_ID = 'step-note';

export default function StepReflection({ section, card, defaultExpanded = false }: StepReflectionProps) {
  const { t } = useTranslation();
  const {
    saveNote,
    shareNote,
    getPrivateNote,
    getSharedNote,
    notes,
  } = usePromptNotes(card.id, section.id);

  const [expanded, setExpanded] = useState(defaultExpanded);
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasInitialized = useRef(false);

  const privateNote = getPrivateNote(STEP_PROMPT_ID);
  const sharedNote = getSharedNote(STEP_PROMPT_ID);

  // Find partner's shared note
  const partnerNote = Array.from(notes.values()).find(
    n => n.promptId === STEP_PROMPT_ID && n.visibility === 'shared' && notes.has(`partner:${STEP_PROMPT_ID}:shared`)
  );
  const partnerSharedNote = notes.get(`partner:${STEP_PROMPT_ID}:shared`);

  // Sync text from DB on first load
  useEffect(() => {
    if (!hasInitialized.current && privateNote?.content) {
      setText(privateNote.content);
      hasInitialized.current = true;
    }
  }, [privateNote?.content]);

  const [showPartnerNote, setShowPartnerNote] = useState(false);

  const handleChange = useCallback((value: string) => {
    setText(value);
    saveNote(STEP_PROMPT_ID, value, 'private');
  }, [saveNote]);

  const handleShare = useCallback(() => {
    if (!text.trim() && !privateNote?.content) return;
    const content = text.trim() || privateNote?.content || '';
    saveNote(STEP_PROMPT_ID, content, 'private');
    // Small delay to ensure private note is saved first
    setTimeout(() => shareNote(STEP_PROMPT_ID), 100);
  }, [text, privateNote, saveNote, shareNote]);

  const handleFocus = useCallback(() => {
    if (!expanded) setExpanded(true);
    setTimeout(() => {
      textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, [expanded]);

  const isSaved = !!privateNote?.content;
  const isShared = !!sharedNote;

  // Compact mode: show just the placeholder row
  if (!expanded && !defaultExpanded) {
    return (
      <div className="mt-6 mb-2">
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/50 text-muted-foreground hover:border-primary/20 hover:bg-card transition-all text-left group"
        >
          <Lock className="w-3.5 h-3.5 shrink-0 opacity-60" />
          <span className="text-sm flex-1">
            {isSaved ? privateNote!.content.slice(0, 60) + (privateNote!.content.length > 60 ? '…' : '') : 'Skriv en tanke…'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-70 transition-opacity" />
        </button>

        {/* Status labels */}
        <div className="flex items-center gap-3 mt-1.5 px-1">
          {isSaved && !isShared && (
            <span className="text-xs text-muted-foreground/60 not-italic">Sparat privat</span>
          )}
          {isShared && sharedNote?.sharedAt && (
            <span className="text-xs text-muted-foreground/60 not-italic">
              Delat {new Date(sharedNote.sharedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>

        {/* Partner note teaser */}
        {partnerSharedNote && (
          <button
            onClick={() => { setExpanded(true); setShowPartnerNote(true); }}
            className="flex items-center gap-2 mt-2 px-1 text-xs text-primary/70 hover:text-primary transition-colors"
          >
            <Users className="w-3 h-3" />
            Din partner har delat en tanke
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 mb-2 space-y-3"
    >
      {/* Input area */}
      <div className="rounded-xl border border-border/60 bg-card/50 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={handleFocus}
          placeholder="Skriv en tanke…"
          className="w-full min-h-[72px] p-3 bg-transparent resize-none focus:outline-none text-sm text-foreground placeholder:text-muted-foreground/60"
        />

        {/* Actions bar */}
        <div className="flex items-center justify-between gap-2 px-3 pb-3">
          <div className="flex items-center gap-1.5">
            {isSaved && !isShared && (
              <span className="text-xs text-muted-foreground/60 not-italic flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Sparat privat
              </span>
            )}
            {isShared && sharedNote?.sharedAt && (
              <span className="text-xs text-muted-foreground/60 not-italic flex items-center gap-1">
                <Share2 className="w-3 h-3" />
                Delat {new Date(sharedNote.sharedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isShared && (
              <>
                <button
                  onClick={() => saveNote(STEP_PROMPT_ID, text, 'private')}
                  disabled={!text.trim()}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors disabled:opacity-40"
                >
                  Spara privat
                </button>
                <button
                  onClick={handleShare}
                  disabled={!text.trim() && !privateNote?.content}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
                >
                  Dela
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Collapse button for steps 1–2 */}
      {!defaultExpanded && (
        <button
          onClick={() => setExpanded(false)}
          className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
        >
          Stäng
        </button>
      )}

      {/* Partner's shared note */}
      {partnerSharedNote && (
        <div className="rounded-xl border border-primary/10 bg-primary/5 overflow-hidden">
          <button
            onClick={() => setShowPartnerNote(!showPartnerNote)}
            className="w-full flex items-center justify-between gap-2 p-3 text-left"
          >
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              {partnerSharedNote.authorLabel
                ? `${partnerSharedNote.authorLabel} har delat en tanke`
                : 'Din partner har delat en tanke'}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showPartnerNote ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showPartnerNote && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {partnerSharedNote.content}
                  </p>
                  {partnerSharedNote.sharedAt && (
                    <p className="text-xs text-muted-foreground/50 mt-1.5">
                      {new Date(partnerSharedNote.sharedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
