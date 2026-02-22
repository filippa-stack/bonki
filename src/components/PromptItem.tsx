import { motion } from 'framer-motion';
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
    const subQuestions = hasIntro ? items.slice(1) : items;

    return (
      <div>
        {intro && (
          <p
            className="font-serif"
            style={{ fontSize: '20px', lineHeight: 1.4, color: '#1C1B1A' }}
          >
            {intro}
          </p>
        )}
        {subQuestions.map((item, i) => (
          <p
            key={i}
            className="font-serif"
            style={{
              fontSize: '17px',
              fontWeight: 400,
              lineHeight: 1.5,
              color: 'var(--color-text-secondary)',
              marginTop: '12px',
            }}
          >
            {item}
          </p>
        ))}
      </div>
    );
  };

  const enterEase = [0.25, 0.1, 0.25, 1.0] as const;

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
              color: 'var(--color-text-secondary)',
              opacity: 0.80,
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '15px',
              lineHeight: 1.65,
              textAlign: 'left',
              paddingLeft: '4px',
              paddingRight: '4px',
              marginBottom: '32px',
            }}
          >
            {preamble}
          </motion.p>
        )}

        {isExercise ? (
          /* ── Teamwork: assignment block ── */
          <motion.div
            key={`exercise-${index}-${prompt.text.slice(0, 20)}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: enterEase }}
            className={preamble ? 'mt-8' : ''}
            style={{
              backgroundColor: 'hsl(38, 40%, 97%)',
              border: '1px solid hsl(38, 30%, 90%)',
              borderLeft: '4px solid #C4821D',
              borderRadius: '0 12px 12px 0',
              padding: '20px 20px 20px 24px',
              margin: '24px 0',
              marginTop: !preamble ? '48px' : '24px',
              width: '100%',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans, Inter, sans-serif)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: 'var(--accent-text)',
                marginBottom: '8px',
              }}
            >
              Gör tillsammans
            </p>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '20px', fontWeight: 600, lineHeight: 1.4, color: 'var(--color-text-primary)' }}>
              {renderAssignmentText(prompt.text)}
            </div>
          </motion.div>
        ) : (
          /* ── Default: centered question text ── */
          <motion.div
            key={`question-${index}-${prompt.text.slice(0, 20)}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: enterEase }}
            className={`w-full text-center space-y-5 ${preamble ? 'mt-8' : ''}`}
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
        )}
      </div>
    </div>
  );
}
