import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useQuestionBookmark } from '@/hooks/useQuestionBookmark';

const TOOLTIP_KEY = 'bookmark_tooltip_shown';

interface BookmarkButtonProps {
  coupleSpaceId: string | null;
  sessionId: string | null;
  cardId: string | null;
  stageIndex: number;
  promptIndex: number;
  questionText: string;
  isDarkBackground?: boolean;
  /** Show the one-time tooltip on this instance (first question of first session) */
  showTooltipHint?: boolean;
}

export default function BookmarkButton({
  coupleSpaceId,
  sessionId,
  cardId,
  stageIndex,
  promptIndex,
  questionText,
  isDarkBackground = false,
  showTooltipHint = false,
}: BookmarkButtonProps) {
  const { isBookmarked, toggle } = useQuestionBookmark({
    coupleSpaceId,
    sessionId,
    cardId,
    stageIndex,
    promptIndex,
    questionText,
  });

  const controls = useAnimation();

  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    if (!showTooltipHint) return;
    const alreadyShown = localStorage.getItem(TOOLTIP_KEY) === 'true';
    if (!alreadyShown) {
      setShowLabel(true);
      localStorage.setItem(TOOLTIP_KEY, 'true');
    }
  }, [showTooltipHint]);

  const handleTap = async () => {
    setShowLabel(false);
    await toggle();
    if (!isBookmarked) {
      controls.start({
        scale: [1, 1.3, 1],
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      });
    }
  };

  const inactiveColor = 'hsl(36, 12%, 68%)';
  const activeColor = '#8B5E1A';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.button
        onClick={handleTap}
        animate={controls}
        aria-label={isBookmarked ? 'Ta bort bokmärke' : 'Bokmärk fråga'}
        style={{
          minHeight: '44px',
          minWidth: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '12px',
        }}
      >
        <Bookmark
          size={20}
          fill={isBookmarked ? activeColor : 'none'}
          style={{
            color: isBookmarked ? activeColor : inactiveColor,
            opacity: 1,
            transition: 'color 0.2s ease',
          }}
        />
      </motion.button>
      {showLabel && (
        <span
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: '9px',
            color: 'var(--color-text-tertiary)',
            opacity: 0.5,
            marginTop: '-4px',
            whiteSpace: 'nowrap',
          }}
        >
          Spara fråga
        </span>
      )}
    </div>
  );
}
