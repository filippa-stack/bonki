import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Share2, X, Star, Heart, ArrowRight, Home, Lock, Users, Link2, CheckCircle2 } from 'lucide-react';
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
  const { memberCount } = useCoupleSpace();
  const isPaired = memberCount >= 2;
  const shareDisabled = disableShare || !isPaired;
  const navigate = useNavigate();
  const [internalExpanded, setInternalExpanded] = useState(sectionType === 'scenario' || sectionType === 'exercise');
  const [justShared, setJustShared] = useState(false);
  const [showSharePreview, setShowSharePreview] = useState(false);
  const [sharePreviewText, setSharePreviewText] = useState('');
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
      transition={{ delay: index * 0.03, duration: 0.15 }}
      className={`rounded-2xl overflow-hidden prompt-colors card-interaction ${showCollapsedLabel ? 'shadow-none' : ''}`}
      style={{ '--prompt-bg': prompt.color || undefined } as React.CSSProperties}
    >
      {/* Collapsed label-only header (for Q2/Q3 when collapsed) */}
      {showCollapsedLabel ? (
        <div
          className="px-6 py-3 cursor-pointer flex items-center justify-between bg-card/50 border border-[hsl(36_30%_82%)] rounded-2xl shadow-sm"
          onClick={toggleExpanded}
        >
          <p className={`text-xs tracking-wide font-medium ${isCompleted ? 'text-slate-400' : 'text-primary'}`}>
            {label}
          </p>
          {isCompleted ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-[#497575]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-primary/60" />
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
                <p
                  className="text-[18px] leading-[1.8] text-center font-serif mb-6 prompt-text"
                  style={{ '--prompt-text': prompt.textColor || undefined } as React.CSSProperties}
                >
                  {preamble}
                </p>
              )}
              <p
                className="text-[18px] leading-[1.8] w-full min-h-[24px] text-center prompt-text font-serif"
                style={{ '--prompt-text': prompt.textColor || undefined } as React.CSSProperties}
              >
                {prompt.text}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {hasNote && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary/30" />
              )}
              <ChevronDown
                className={`w-3.5 h-3.5 text-muted-foreground/30 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
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
                    <p className="text-[11px] tracking-normal text-muted-foreground/40 font-normal mb-8 text-center">
                      Din reflektion
                    </p>
                    <textarea
                      ref={privateTextareaRef}
                      value={displayPrivateText}
                      onChange={(e) => handlePrivateChange(e.target.value)}
                      onFocus={handleFocus}
                      onKeyDown={handleKeyDown}
                      placeholder={t('reflections.prompt_note_placeholder', 'Skriv ned dina tankar. Du väljer själv om du vill dela med din partner, nu eller senare. Annars sparas dina svar här enbart för dig')}
                      className="w-full px-5 py-5 rounded-2xl bg-white border border-slate-200 resize-none focus:outline-none focus:border-[#497575] focus:ring-0 placeholder:text-muted-foreground/25 font-sans text-sm text-foreground leading-relaxed transition-colors duration-300 min-h-[140px]"
                    />
                    {/* Autosave status */}
                    <AnimatePresence>
                      {saveStatus === 'saved' && displayPrivateText && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="text-[11px] text-muted-foreground/30 text-right mt-2"
                        >
                          Sparad
                        </motion.p>
                      )}
                    </AnimatePresence>
                    {/* Privacy indicator */}
                    {!sharedNote && (
                      <div className="flex items-center justify-between mt-3">
                        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/35 italic">
                          <Lock className="w-3 h-3" />
                          Bara du kan se detta.
                        </p>
                        {privateNote?.content && privateNote.updatedAt && (
                          <p className="text-[11px] text-muted-foreground/40">
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
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 italic">
                      <Lock className="w-3 h-3" />
                      {t('reflections.private_empty_hint', 'Privat — du kan dela senare om du vill')}
                    </p>
                  )}
                  {!disableShare && !isPaired && privateNote?.content && !sharedNote && (
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground/40 italic">
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
                          className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3"
                        >
                          <p className="text-[11px] text-muted-foreground/60 tracking-wide">
                            {t('reflections.share_preview_title', 'Granska innan du delar')}
                          </p>
                          <p className="text-[11px] text-muted-foreground/50 italic">
                            {t('reflections.share_preview_hint', 'Du kan justera texten. Din privata anteckning påverkas inte.')}
                          </p>
                          <textarea
                            value={sharePreviewText}
                            onChange={(e) => setSharePreviewText(e.target.value)}
                            className="w-full min-h-[60px] px-4 py-3 rounded-xl bg-white border border-slate-200 resize-none focus:outline-none focus:ring-0 focus:border-[#497575] font-sans text-sm text-foreground"
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
                      className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3"
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

                  {/* Shared note display */}
                  {!shareDisabled && sharedNote && !justShared && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                      <p className="text-[11px] text-muted-foreground/60 tracking-wide mb-1.5 flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        {t('reflections.shared_notes_title', 'Delad med din partner')}
                      </p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {sharedNote.content}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => onUnshareNote(promptId)}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-3 h-3" />
                          {t('reflections.unshare', 'Ta bort delning')}
                        </button>
                        <button
                          onClick={() => onToggleHighlight(promptId)}
                          disabled={!sharedNote.isHighlight && highlightCount >= 3}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
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
