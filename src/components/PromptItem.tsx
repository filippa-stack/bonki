import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BEAT_1 } from '@/lib/motion';
import { ChevronDown, Send, X, Star, Heart, Lock, Users, Link2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Prompt } from '@/types';
import { PromptNote } from '@/hooks/usePromptNotes';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';

interface PromptItemProps {
  prompt: Prompt;
  promptId: string;
  index: number;
  label?: string;
  sectionType?: 'opening' | 'reflective' | 'scenario' | 'exercise';
  preamble?: string;
  privateNote?: PromptNote;
  sharedNote?: PromptNote;
  highlightCount: number;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  onPromptChange: (index: number, value: string) => void;
  onPromptColorChange: (index: number, color: string) => void;
  onPromptTextColorChange: (index: number, textColor: string) => void;
  onRemovePrompt: (index: number) => void;
  onSaveNote: (promptId: string, content: string, visibility?: 'private' | 'shared') => void;
  onShareNote: (promptId: string) => void;
  onUnshareNote: (promptId: string) => void;
  onToggleHighlight: (promptId: string) => void;
  autoFocusNote?: boolean;
  disableShare?: boolean;
  isCompleted?: boolean;
}

export default function PromptItem({
  prompt,
  promptId,
  index,
  label,
  sectionType,
  preamble,
  privateNote,
  sharedNote,
  highlightCount,
  expanded,
  onExpandChange,
  onPromptChange,
  onPromptColorChange,
  onPromptTextColorChange,
  onRemovePrompt,
  onSaveNote,
  onShareNote,
  onUnshareNote,
  onToggleHighlight,
  autoFocusNote,
  disableShare,
  isCompleted = false,
}: PromptItemProps) {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const shareDisabled = disableShare;
  const [internalExpanded, setInternalExpanded] = useState(sectionType === 'scenario' || sectionType === 'exercise');
  const [justShared, setJustShared] = useState(false);
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;
  const toggleExpanded = () => {
    const next = !isExpanded;
    if (onExpandChange) onExpandChange(next);
    else setInternalExpanded(next);
  };
  const showCollapsedLabel = isControlled && !isExpanded;
  const [privateText, setPrivateText] = useState(privateNote?.content || '');
  const privateTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocusNote) {
      if (!isControlled) setInternalExpanded(true);
      setTimeout(() => privateTextareaRef.current?.focus(), 150);
    }
  }, [autoFocusNote, isControlled]);

  const displayPrivateText = privateNote?.content ?? privateText;

  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  }, []);

  // Autosave status
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const handlePrivateChange = (value: string) => {
    setPrivateText(value);
    onSaveNote(promptId, value, 'private');
    setSaveStatus('idle');
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 1500);
    }, 800);
  };

  useEffect(() => () => clearTimeout(saveTimerRef.current), []);

  const hasNote = !!(privateNote?.content || sharedNote?.content);
  const isDeepSection = sectionType === 'scenario' || sectionType === 'exercise';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * BEAT_1, duration: 0.15 }}
      className="rounded-card overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-primary)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Collapsed label-only header */}
      {showCollapsedLabel ? (
        <div
          className="px-6 py-3 cursor-pointer flex items-center justify-between rounded-card"
          style={{ backgroundColor: 'var(--color-surface-primary)' }}
          onClick={toggleExpanded}
        >
          <p className="text-xs tracking-wide font-medium" style={{ color: isCompleted ? 'var(--color-text-secondary)' : 'var(--color-text-primary)', opacity: isCompleted ? 0.5 : 1 }}>
            {label}
          </p>
          {isCompleted ? (
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }} />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }} />
          )}
        </div>
      ) : (
        <>
          {/* Question header */}
          <div
            className="px-7 py-10 cursor-pointer flex items-start gap-3 group relative"
            onClick={toggleExpanded}
          >
            <div className="flex-1 min-w-0">
              {preamble && (
                <p className="text-[18px] leading-[1.8] text-center font-serif mb-6" style={{ color: 'var(--color-text-primary)' }}>
                  {preamble}
                </p>
              )}
              <p className="text-[18px] leading-[1.8] w-full min-h-[24px] text-center font-serif" style={{ color: 'var(--color-text-primary)' }}>
                {prompt.text}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {hasNote && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-text-secondary)', opacity: 0.3 }} />
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                style={{ color: 'var(--color-text-secondary)', opacity: 0.3 }}
              />
            </div>
          </div>

          {/* Expandable reflection area */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="px-7 pb-12 space-y-8">

                  {/* Private note */}
                  <div className="pt-4">
                    <p className="text-[11px] tracking-normal font-normal mb-8 text-center" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}>
                      Din reflektion
                    </p>
                    <textarea
                      ref={privateTextareaRef}
                      value={displayPrivateText}
                      onChange={(e) => handlePrivateChange(e.target.value)}
                      onFocus={handleFocus}
                      onKeyDown={handleKeyDown}
                      placeholder={t('reflections.prompt_note_placeholder', 'Det du skriver här är bara för dig.')}
                      className="w-full px-5 py-5 rounded-card resize-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/25 font-sans text-sm leading-relaxed min-h-[140px] transition-colors duration-200"
                      style={{
                        backgroundColor: 'var(--color-surface-primary)',
                        border: '1px solid #E3E1DC',
                        color: 'var(--color-text-primary)',
                      }}
                      onFocusCapture={(e) => {
                        e.currentTarget.style.borderColor = '#CFCBC4';
                        handleFocus(e as unknown as React.FocusEvent<HTMLTextAreaElement>);
                      }}
                      onBlurCapture={(e) => {
                        e.currentTarget.style.borderColor = '#E3E1DC';
                      }}
                    />
                    {/* Autosave status */}
                    <AnimatePresence>
                      {saveStatus === 'saved' && displayPrivateText && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-[11px] text-right mt-2 flex items-center justify-end gap-1"
                          style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }}
                        >
                          <Lock className="w-2.5 h-2.5" />
                          Sparad
                        </motion.p>
                      )}
                    </AnimatePresence>
                    {/* Privacy note */}
                    {!sharedNote && (
                      <div className="flex items-center justify-between mt-3">
                        <p className="flex items-center gap-1.5 text-[11px] italic" style={{ color: 'var(--color-text-secondary)', opacity: 0.35 }}>
                          <Lock className="w-3 h-3" />
                          Privat
                        </p>
                        {privateNote?.content && privateNote.updatedAt && (
                          <p className="text-[11px]" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }}>
                            {t('reflections.last_updated', { date: new Date(privateNote.updatedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }) })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Share action */}
                  {!shareDisabled && privateNote?.content && !sharedNote && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          onShareNote(promptId);
                          setJustShared(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-70"
                        style={{ backgroundColor: '#F0EFEC', color: 'var(--color-text-primary)' }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        {t('reflections.create_shared_from_private', 'Dela med din partner')}
                      </button>
                    </div>
                  )}

                  {/* Post-share confirmation */}
                  {!shareDisabled && sharedNote && justShared && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                      className="flex justify-end"
                    >
                      <p className="text-[11px] flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        {t('reflections.shared_confirmation')}
                      </p>
                    </motion.div>
                  )}

                  {/* Shared note display */}
                  {!shareDisabled && sharedNote && !justShared && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor: '#F0EFEC', border: '1px solid #E3E1DC' }}>
                      <p className="text-[11px] tracking-wide mb-1.5 flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)', opacity: 0.6 }}>
                        <Users className="w-3 h-3" />
                        {t('reflections.shared_notes_title', 'Delad med din partner')}
                      </p>
                      <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--color-text-primary)' }}>
                        {sharedNote.content}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => onUnshareNote(promptId)}
                          className="flex items-center gap-1 text-[11px] transition-colors hover:opacity-70"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <X className="w-3 h-3" />
                          {t('reflections.unshare', 'Ta bort delning')}
                        </button>
                        <button
                          onClick={() => onToggleHighlight(promptId)}
                          disabled={!sharedNote.isHighlight && highlightCount >= 3}
                          className="flex items-center gap-1 text-[11px] transition-colors disabled:opacity-40 hover:opacity-70"
                          style={{ color: 'var(--color-text-secondary)' }}
                        >
                          <Star className={`w-3 h-3 ${sharedNote.isHighlight ? 'fill-current' : ''}`} />
                          {t('reflections.mark_important', 'Viktigt för oss')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}
