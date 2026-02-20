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
 * Depth gravity — subtle typographic shifts per layer.
 * No layout changes, only weight/tone/rhythm.
 */
const DEPTH_GRAVITY: Record<string, React.CSSProperties> = {
  opening:    { fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.55 },
  reflective: { fontWeight: 500, color: 'hsl(30, 3%, 8%)',          lineHeight: 1.55 },
  scenario:   { fontWeight: 500, color: 'hsl(30, 3%, 6%)',          lineHeight: 1.45 },
  exercise:   { fontWeight: 500, color: 'hsl(30, 3%, 4%)',          lineHeight: 1.45 },
};

/**
 * Renders a single prompt card — flat, read-only question text.
 * No accordion, no inline reflection input (SessionStepReflection owns that).
 */
export default function PromptItem({ prompt, index, sectionType, preamble }: PromptItemProps) {
  const gravity = DEPTH_GRAVITY[sectionType || 'opening'] || DEPTH_GRAVITY.opening;

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
            className="text-subheading text-center mb-12"
            style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}
          >
            {preamble}
          </p>
        )}
        <div className="w-full text-center space-y-5">
          {prompt.text.split('\n').filter(p => p.trim() !== '').map((para, i) => (
            <p
              key={i}
              className="text-subheading"
              style={gravity}
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
