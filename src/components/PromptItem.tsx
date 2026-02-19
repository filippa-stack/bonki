import { motion } from 'framer-motion';
import { BEAT_1 } from '@/lib/motion';
import { Prompt } from '@/types';

interface PromptItemProps {
  prompt: Prompt;
  promptId: string;
  index: number;
  sectionType?: 'opening' | 'reflective' | 'scenario' | 'exercise';
  preamble?: string;
  highlightCount: number;
  // Kept for interface compat — not rendered
  label?: string;
  expanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
  privateNote?: unknown;
  sharedNote?: unknown;
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

/**
 * Renders a single prompt card — flat, read-only question text.
 * No accordion, no inline reflection input (SessionStepReflection owns that).
 */
export default function PromptItem({ prompt, index, sectionType, preamble }: PromptItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * BEAT_1, duration: 0.15 }}
      className="rounded-card overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="px-8 py-8">
        {preamble && (
          <p
            className="text-[18px] leading-[1.8] text-center font-serif mb-8"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {preamble}
          </p>
        )}
        <p
          className="text-[18px] leading-[2] w-full text-center font-serif"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {prompt.text}
        </p>
      </div>
    </motion.div>
  );
}
