import { motion } from 'framer-motion';
import { Prompt } from '@/types';
import { EASE } from '@/lib/motion';

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
  opening:    { fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 },
  reflective: { fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 },
  scenario:   { fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.30 },
  exercise:   { fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.30 },
};

/**
 * Renders a single prompt — flat, read-only question text.
 * Unified presentation: all section types use centered question style.
 */
export default function PromptItem({ prompt, index, sectionType, preamble }: PromptItemProps) {
  const gravity = DEPTH_GRAVITY[sectionType || 'opening'] || DEPTH_GRAVITY.opening;
  const enterEase = [...EASE] as [number, number, number, number];

  return (
    <div
      className="rounded-card overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="px-8 py-8">
        {preamble && (
          <motion.p
            key={`preamble-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: enterEase }}
            style={{
              color: 'var(--text-secondary)',
              opacity: 0.65,
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '14px',
              lineHeight: 1.7,
              textAlign: 'center',
              marginBottom: '40px',
            }}
          >
            {preamble}
          </motion.p>
        )}

        <motion.div
          key={`question-${index}-${prompt.text.slice(0, 20)}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`w-full text-center space-y-5 ${preamble ? 'mt-10' : ''}`}
        >
          {prompt.text.split('\n').filter(p => p.trim() !== '').map((para, i) => (
            <p
              key={i}
              className="font-serif"
              style={{
                fontSize: 'clamp(24px, 6vw, 32px)',
                textWrap: 'balance',
                textAlign: 'center',
                ...gravity,
              }}
            >
              {para}
            </p>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
