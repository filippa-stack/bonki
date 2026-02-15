import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Share2, X, Star, Heart, ArrowRight, Home, Lock, Users, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Prompt } from '@/types';
import { PromptNote } from '@/hooks/usePromptNotes';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';

interface PromptItemProps {
  prompt: Prompt;
  promptId: string;
  index: number;
  label?: string;
  sectionType?: 'opening' | 'reflective' | 'scenario' | 'exercise';
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
  /** When true, auto-expand and focus the note textarea */
  autoFocusNote?: boolean;
  /** When true, hide share/unshare UI (revisit mode) */
  disableShare?: boolean;
}

export default function PromptItem({
  prompt,
  promptId,
  index,
  label,
  sectionType,
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
}: PromptItemProps) {
  const { t } = useTranslation();
  const { settings } = useSiteSettings();
  const { memberCount } = useCoupleSpace();
  const isPaired = memberCount >= 2;
  // Share is disabled if explicitly set OR if user is solo (not paired)
  const shareDisabled = disableShare || !isPaired;
  const navigate = useNavigate();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [sharePreviewText, setSharePreviewText] = useState('');
  // Support both controlled and uncontrolled expansion
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;
  const toggleExpanded = () => {
    const next = !isExpanded;
    if (onExpandChange) onExpandChange(next);
    else setInternalExpanded(next);
  };
  // For controlled accordion items that are collapsed, show only the label
  const showCollapsedLabel = isControlled && !isExpanded;
  const [privateText, setPrivateText] = useState(privateNote?.content || '');
  const privateTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand and focus when triggered externally
  useEffect(() => {
    if (autoFocusNote) {
      if (!isControlled) setInternalExpanded(true);
      setTimeout(() => privateTextareaRef.current?.focus(), 150);
    }
  }, [autoFocusNote, isControlled]);

  // Sync incoming note changes (only when not actively editing)
  const displayPrivateText = privateNote?.content ?? privateText;

  // Scroll textarea into view when focused (prevents keyboard from hiding it)
  const handleFocus = useCallback((e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Small delay to let mobile keyboard appear first
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  }, []);

  // Allow easy keyboard dismissal on mobile via Enter on empty line or Done
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Blur on Escape to dismiss keyboard
    if (e.key === 'Escape') {
      e.currentTarget.blur();
    }
  }, []);

  const handlePrivateChange = (value: string) => {
    setPrivateText(value);
    onSaveNote(promptId, value, 'private');
  };

  const hasNote = !!(privateNote?.content || sharedNote?.content);
  const isDeepSection = sectionType === 'scenario' || sectionType === 'exercise';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-lg border-l-2 border-primary/30 overflow-hidden prompt-colors"
      style={{ '--prompt-bg': prompt.color || undefined } as React.CSSProperties}
    >
      {/* Collapsed label-only header (for Q2/Q3 when collapsed) */}
      {showCollapsedLabel ? (
        <div
          className="p-5 cursor-pointer flex items-center justify-between"
          onClick={toggleExpanded}
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Question header - clickable to expand/collapse */}
          <div
            className="p-5 cursor-pointer flex items-start gap-3 group relative"
            onClick={toggleExpanded}
          >
            <div className="flex-1 min-w-0">
              <p
                className="text-body w-full min-h-[24px] text-center prompt-text"
                style={{ '--prompt-text': prompt.textColor || undefined } as React.CSSProperties}
              >
                {prompt.text}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {hasNote && (
                <div className="w-2 h-2 rounded-full bg-primary/50" />
              )}
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
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
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-4">
                  <div className="border-t border-primary/10" />

                  {/* Private note */}
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3 text-center">
                      {t('reflections.private_notes_title', 'Din reflektion')}
                    </p>
                    <textarea
                      ref={privateTextareaRef}
                      value={displayPrivateText}
                      onChange={(e) => handlePrivateChange(e.target.value)}
                      onFocus={handleFocus}
                      onKeyDown={handleKeyDown}
                      placeholder={t('reflections.prompt_note_placeholder', 'Vad väcker detta hos dig?')}
                      className={`w-full p-3 rounded-xl bg-white border border-slate-200 resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-400 font-sans text-sm text-foreground ${isDeepSection ? 'min-h-[148px]' : 'min-h-[80px]'}`}
                    />
                    {/* Privacy indicator + last updated */}
                    {!sharedNote && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground/60 italic">
                          <Lock className="w-3 h-3" />
                          {isPaired
                            ? t('reflections.private_indicator', 'Bara du kan se det här')
                            : t('reflections.solo_private_indicator', 'Din privata anteckning')}
                        </p>
                        {privateNote?.content && privateNote.updatedAt && (
                          <p className="text-xs text-muted-foreground/60">
                            {t('reflections.last_updated', { date: new Date(privateNote.updatedAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' }) })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Share action / preview */}
                  {!shareDisabled && privateNote?.content && !sharedNote && !showSharePreview && (
                    <button
                      onClick={() => {
                        setSharePreviewText(privateNote.content);
                        setShowSharePreview(true);
                      }}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {t('reflections.create_shared_from_private', 'Dela om du vill')}
                    </button>
                  )}
                  {!shareDisabled && !privateNote?.content && !sharedNote && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground/60 italic">
                      <Lock className="w-3 h-3" />
                      {t('reflections.private_empty_hint', 'Privat — du kan dela senare om du vill')}
                    </p>
                  )}
                  {/* Solo hint: show disabled share with tooltip */}
                  {!disableShare && !isPaired && privateNote?.content && !sharedNote && (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground/50 italic">
                      <Link2 className="w-3 h-3" />
                      {t('reflections.solo_share_hint', 'Koppla ihop er för att dela')}
                    </p>
                  )}

                  {/* Pre-share review */}
                  {!shareDisabled && (
                    <AnimatePresence>
                      {showSharePreview && !sharedNote && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-3"
                        >
                          <p className="text-xs text-muted-foreground uppercase tracking-wider">
                            {t('reflections.share_preview_title', 'Granska innan du delar')}
                          </p>
                          <p className="text-xs text-muted-foreground/70 italic">
                            {t('reflections.share_preview_hint', 'Du kan justera texten. Din privata anteckning påverkas inte.')}
                          </p>
                          <textarea
                            value={sharePreviewText}
                            onChange={(e) => setSharePreviewText(e.target.value)}
                            className="w-full min-h-[60px] p-3 rounded-lg bg-background border border-input resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans text-sm text-foreground"
                            autoFocus
                          />
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                onSaveNote(promptId, sharePreviewText, 'shared');
                                onShareNote(promptId);
                                setShowSharePreview(false);
                                setJustShared(true);
                              }}
                              disabled={!sharePreviewText.trim()}
                              className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors disabled:opacity-40"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                              {t('reflections.share_confirm', 'Dela')}
                            </button>
                            <button
                              onClick={() => setShowSharePreview(false)}
                              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {t('reflections.share_cancel', 'Inte just nu')}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Post-share confirmation */}
                  {!shareDisabled && sharedNote && justShared && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-primary/5 border border-primary/10 space-y-3"
                    >
                      <p className="text-sm text-foreground flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-primary" />
                        {t('reflections.shared_confirmation')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setJustShared(false)}
                          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
                        >
                          <ArrowRight className="w-3.5 h-3.5" />
                          {t('reflections.continue_conversation')}
                        </button>
                        <button
                          onClick={() => navigate('/')}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Home className="w-3.5 h-3.5" />
                          {t('reflections.go_home')}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Shared note display (after dismissing confirmation) */}
                  {!shareDisabled && sharedNote && !justShared && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        {t('reflections.shared_notes_title', 'Delad med din partner')}
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {sharedNote.content}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => onUnshareNote(promptId)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                          {t('reflections.unshare', 'Ta bort delning')}
                        </button>
                        <button
                          onClick={() => onToggleHighlight(promptId)}
                          disabled={!sharedNote.isHighlight && highlightCount >= 3}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                        >
                          <Star className={`w-3 h-3 ${sharedNote.isHighlight ? 'fill-current text-primary' : ''}`} />
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
