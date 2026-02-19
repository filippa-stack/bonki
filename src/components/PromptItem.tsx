import { useState } from 'react';
import { motion } from 'framer-motion';
import { BEAT_1 } from '@/lib/motion';
import { ChevronDown, CheckCircle2 } from 'lucide-react';
import { Prompt } from '@/types';
import { PromptNote } from '@/hooks/usePromptNotes';

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
  const [internalExpanded, setInternalExpanded] = useState(sectionType === 'scenario' || sectionType === 'exercise');
  const isControlled = expanded !== undefined;
  const isExpanded = isControlled ? expanded : internalExpanded;
  const toggleExpanded = () => {
    const next = !isExpanded;
    if (onExpandChange) onExpandChange(next);
    else setInternalExpanded(next);
  };
  const showCollapsedLabel = isControlled && !isExpanded;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * BEAT_1, duration: 0.15 }}
      className="rounded-card overflow-hidden"
      style={{ backgroundColor: 'var(--color-surface-primary)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Collapsed label row (accordion mode only) */}
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
        /* Question body — prompt text only, no expandable sub-area */
        <div className="px-7 py-10">
          {preamble && (
            <p className="text-[18px] leading-[1.8] text-center font-serif mb-6" style={{ color: 'var(--color-text-primary)' }}>
              {preamble}
            </p>
          )}
          <p className="text-[18px] leading-[1.8] w-full min-h-[24px] text-center font-serif" style={{ color: 'var(--color-text-primary)' }}>
            {prompt.text}
          </p>
        </div>
      )}
    </motion.div>
  );
}
