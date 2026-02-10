import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Share2, X, Star, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Prompt } from '@/types';
import { PromptNote } from '@/hooks/usePromptNotes';
import ColorPicker from '@/components/ColorPicker';

interface PromptItemProps {
  prompt: Prompt;
  promptId: string;
  index: number;
  label?: string;
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
}

export default function PromptItem({
  prompt,
  promptId,
  index,
  label,
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
}: PromptItemProps) {
  const { t } = useTranslation();
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  // Support both controlled and uncontrolled expansion
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;
  const toggleExpanded = () => {
    const next = !isExpanded;
    if (onExpandChange) onExpandChange(next);
    else setInternalExpanded(next);
  };
  // For controlled accordion items that are collapsed, show only the label
  const showCollapsedLabel = isControlled && !isExpanded && !!label;
  const [privateText, setPrivateText] = useState(privateNote?.content || '');

  // Sync incoming note changes
  const displayPrivateText = privateNote?.content ?? privateText;

  const handlePrivateChange = (value: string) => {
    setPrivateText(value);
    onSaveNote(promptId, value, 'private');
  };

  const hasNote = !!(privateNote?.content || sharedNote?.content);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-lg border-l-2 border-primary/30 overflow-hidden"
      style={{ backgroundColor: prompt.color || 'hsl(var(--surface-warm))' }}
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
              <textarea
                value={prompt.text}
                onChange={(e) => {
                  e.stopPropagation();
                  onPromptChange(index, e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                ref={(el) => {
                  if (el) {
                    el.style.height = 'auto';
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
                className="text-body w-full bg-transparent border-none outline-none focus:ring-0 resize-none placeholder:text-muted-foreground min-h-[24px] text-center md:text-left"
                placeholder="Skriv en fråga..."
                style={{ color: prompt.textColor || 'hsl(var(--foreground))' }}
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {hasNote && (
                <div className="w-2 h-2 rounded-full bg-primary/50" />
              )}
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              />
            </div>

            {/* Edit controls on hover */}
            <div
              className="absolute top-2 right-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <ColorPicker
                currentColor={prompt.color}
                onColorChange={(color) => onPromptColorChange(index, color)}
                currentTextColor={prompt.textColor}
                onTextColorChange={(textColor) => onPromptTextColorChange(index, textColor)}
                showTextColor
              />
              <button
                onClick={() => onRemovePrompt(index)}
                className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                      {t('reflections.private_notes_title', 'Privat anteckning')}
                    </p>
                    <textarea
                      value={displayPrivateText}
                      onChange={(e) => handlePrivateChange(e.target.value)}
                      placeholder={t('reflections.prompt_note_placeholder', 'Skriv dina tankar här... (sparas automatiskt)')}
                      className="w-full min-h-[80px] p-3 rounded-lg bg-background/50 border border-input/50 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans text-sm"
                    />
                  </div>

                  {/* Share action */}
                  {privateNote?.content && !sharedNote && (
                    <button
                      onClick={() => onShareNote(promptId)}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      {t('reflections.create_shared_from_private', 'Skapa delad version')}
                    </button>
                  )}

                  {/* Shared note display */}
                  {sharedNote && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {t('reflections.shared_notes_title', 'Delad reflektion')}
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
