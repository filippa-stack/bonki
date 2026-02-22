import { motion, useAnimation } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useQuestionBookmark } from '@/hooks/useQuestionBookmark';

interface BookmarkButtonProps {
  coupleSpaceId: string | null;
  sessionId: string | null;
  cardId: string | null;
  stageIndex: number;
  promptIndex: number;
  questionText: string;
  isDarkBackground?: boolean;
}

export default function BookmarkButton({
  coupleSpaceId,
  sessionId,
  cardId,
  stageIndex,
  promptIndex,
  questionText,
  isDarkBackground = false,
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

  const handleTap = async () => {
    await toggle();
    if (!isBookmarked) {
      // Animate on bookmark (not on un-bookmark)
      controls.start({
        scale: [1, 1.3, 1],
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      });
    }
  };

  const inactiveColor = isDarkBackground ? 'hsl(36, 14%, 70%)' : 'var(--color-text-ghost)';
  const inactiveOpacity = 0.35;
  const activeColor = '#C4821D';
  const activeOpacity = isDarkBackground ? 0.9 : 1.0;

  return (
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
          opacity: isBookmarked ? activeOpacity : inactiveOpacity,
          transition: 'color 0.2s ease, opacity 0.2s ease',
        }}
      />
    </motion.button>
  );
}
