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
  const isExercise = sectionType === 'exercise';
  const enterEase = [...EASE] as [number, number, number, number];

  const renderAssignmentText = (text: string) => {
    const paragraphs = text.split('\n').filter(p => p.trim() !== '');
    const fullText = paragraphs.join(' ');

    if (!fullText.includes('•')) {
      return paragraphs.map((para, i) => (
        <p
          key={i}
          className="font-serif"
          style={{ fontSize: '20px', fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.4 }}
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
            style={{ fontSize: '20px', lineHeight: 1.4, color: 'var(--text-primary)' }}
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
              color: 'var(--text-secondary)',
              marginTop: '12px',
            }}
          >
            {item}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div
      className="rounded-card overflow-hidden"
      style={{ backgroundColor: 'transparent' }}
    >
      <div className="px-8 py-8">
        {preamble && (
          <motion.div
            key={`preamble-${index}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05, ease: enterEase }}
            className="w-full text-center space-y-5"
            style={{ marginBottom: '40px' }}
          >
            {preamble.split('\n').filter(p => p.trim() !== '').map((para, i) => (
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

        {isExercise ? (
          /* ── Teamwork: assignment block with same question typography ── */
          <motion.div
            key={`exercise-${index}-${prompt.text.slice(0, 20)}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={preamble ? 'mt-10' : ''}
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: 'none',
              borderLeft: '3px solid var(--accent-saffron)',
              borderRadius: '0 10px 10px 0',
              padding: '24px 24px 24px 28px',
              margin: '24px 0',
              marginTop: !preamble ? '48px' : '24px',
              width: '100%',
              boxShadow: '0 1px 2px hsla(30, 15%, 25%, 0.04), 0 4px 16px -4px hsla(30, 18%, 28%, 0.06)',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                color: 'var(--accent-text)',
                marginBottom: '16px',
              }}
            >
              Gör tillsammans
            </p>
            <div className="space-y-5">
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
            </div>
          </motion.div>
        ) : (
          /* ── Default: centered question text ── */
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
        )}
      </div>
    </div>
  );
}
