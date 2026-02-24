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
        {/* ── Scenario preamble — same monumental serif, fades in first ── */}
        {preamble && (
          <motion.div
            key={`preamble-${index}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.0, ease: enterEase }}
            className="w-full text-center"
            style={{ marginBottom: '48px' }}
          >
            {preamble.split('\n').filter(p => p.trim() !== '').map((para, i) => (
              <p
                key={i}
                className="font-serif"
                style={{
                  fontSize: 'clamp(22px, 5.5vw, 30px)',
                  textWrap: 'balance',
                  textAlign: 'center',
                  fontWeight: 400,
                  color: 'var(--text-primary)',
                  lineHeight: 1.45,
                  opacity: 0.78,
                  marginBottom: i < preamble.split('\n').filter(p => p.trim() !== '').length - 1 ? '16px' : 0,
                }}
              >
                {para}
              </p>
            ))}
          </motion.div>
        )}

        {isExercise ? (
          /* ── Teamwork: left-aligned assignment block ── */
          <motion.div
            key={`exercise-${index}-${prompt.text.slice(0, 20)}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: enterEase }}
            className={preamble ? 'mt-10' : ''}
            style={{
              backgroundColor: 'var(--surface-raised)',
              border: 'none',
              borderLeft: '3px solid var(--accent-saffron)',
              borderRadius: '0 12px 12px 0',
              padding: '28px 28px 28px 32px',
              margin: '24px 0',
              marginTop: !preamble ? '48px' : '24px',
              width: '100%',
              boxShadow:
                '0 1px 3px hsla(30, 15%, 25%, 0.04), ' +
                '0 6px 20px -6px hsla(30, 18%, 28%, 0.07)',
            }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.15, ease: enterEase }}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                color: 'var(--accent-text)',
                marginBottom: '20px',
              }}
            >
              Gör tillsammans
            </motion.p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {prompt.text.split('\n').filter(p => p.trim() !== '').map((para, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: enterEase }}
                  className="font-serif"
                  style={{
                    fontSize: 'clamp(22px, 5.5vw, 30px)',
                    textWrap: 'pretty',
                    textAlign: 'left',
                    ...gravity,
                    lineHeight: 1.4,
                  }}
                >
                  {para}
                </motion.p>
              ))}
            </div>
          </motion.div>
        ) : (
          /* ── Default: centered question text with staggered entrance ── */
          <motion.div
            key={`question-${index}-${prompt.text.slice(0, 20)}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: preamble ? 0.25 : 0,
              ease: enterEase,
            }}
            className={`w-full text-center ${preamble ? 'mt-10' : ''}`}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
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
