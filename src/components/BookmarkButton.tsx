import { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useQuestionBookmark } from '@/hooks/useQuestionBookmark';
import { toast } from 'sonner';

const TOAST_KEY = 'bookmark_toast_shown';

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
  const hasShownToast = useRef(
    localStorage.getItem(TOAST_KEY) === 'true'
  );

  const handleTap = async () => {
    const wasBookmarked = isBookmarked;
    await toggle();

    if (!wasBookmarked) {
      controls.start({
        scale: [1, 1.3, 1],
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      });

      // First-time educational toast
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        localStorage.setItem(TOAST_KEY, 'true');
        toast('Sparad! Hitta den under Era samtal.', {
          duration: 3000,
          style: {
            background: 'var(--surface-base)',
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '14px',
          },
        });
      }
    }
  };

  const inactiveColor = 'hsl(36, 12%, 68%)';
  const activeColor = '#8B5E1A';

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
          opacity: isBookmarked ? 1 : 0.45,
          transition: 'color 0.2s ease',
        }}
      />
    </motion.button>
  );
}
