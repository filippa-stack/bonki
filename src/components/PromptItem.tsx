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
  opening:    { fontWeight: 700, color: 'var(--color-text-primary)', lineHeight: 1.35 },
  reflective: { fontWeight: 700, color: 'hsl(30, 3%, 8%)',          lineHeight: 1.35 },
  scenario:   { fontWeight: 700, color: 'hsl(30, 3%, 6%)',          lineHeight: 1.35 },
  exercise:   { fontWeight: 700, color: 'hsl(30, 3%, 4%)',          lineHeight: 1.35 },
};

/**
 * Renders a single prompt card — flat, read-only question text.
 * No accordion, no inline reflection input (SessionStepReflection owns that).
 */
export default function PromptItem({ prompt, index, sectionType, preamble }: PromptItemProps) {
  const gravity = DEPTH_GRAVITY[sectionType || 'opening'] || DEPTH_GRAVITY.opening;
  const isExercise = sectionType === 'exercise';

  const renderAssignmentText = (text: string) => {
    // Split on newlines first, then handle bullets within each paragraph
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const fullText = paragraphs.join(' ');

    if (!fullText.includes('•')) {
      return paragraphs.map((para, i) => (
        <p
          key={i}
          className="font-serif"
          style={{ fontSize: '20px', fontWeight: 400, color: '#1C1B1A', lineHeight: 1.4 }}
        >
          {para}
        </p>
      ));
    }

    const items = fullText.split('•').map(s => s.trim()).filter(Boolean);
    const hasIntro = !fullText.startsWith('•');
    const intro = hasIntro ? items[0] : null;
    const listItems = hasIntro ? items.slice(1) : items;

    return (
      <div>
        {intro && (
          <p
            className="font-serif"
            style={{ fontSize: '20px', lineHeight: 1.4, color: '#1C1B1A', marginBottom: '12px' }}
          >
            {intro}
          </p>
        )}
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {listItems.map((item, i) => (
            <li
              key={i}
              className="font-serif"
              style={{
                fontSize: '18px',
                lineHeight: 1.5,
                color: '#1C1B1A',
                paddingLeft: '16px',
                marginBottom: '6px',
                borderLeft: '2px solid rgba(196, 130, 45, 0.40)',
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };

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

        {isExercise ? (
          /* ── Teamwork: assignment block ── */
          <div
            className={preamble ? 'mt-8' : ''}
            style={{
              background: 'var(--surface-raised)',
              border: '1px solid hsl(var(--border) / 0.18)',
              borderLeft: '3px solid var(--accent-saffron)',
              borderRadius: '0 12px 12px 0',
              padding: '16px 20px',
              margin: '24px 0',
              marginTop: !preamble ? '48px' : '24px',
              width: '100%',
            }}
          >
            <p
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: 'var(--accent-saffron)',
                marginBottom: '8px',
              }}
            >
              Gör tillsammans
            </p>
            {renderAssignmentText(prompt.text)}
          </div>
        ) : (
          /* ── Default: centered question text ── */
          <div className={`w-full text-center space-y-5 ${preamble ? 'mt-8' : ''}`}>
            {prompt.text.split('\n').filter(p => p.trim() !== '').map((para, i) => (
              <p
                key={i}
                className="font-serif"
                style={{ fontSize: '26px', ...gravity }}
              >
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
