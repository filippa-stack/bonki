import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useQuestionBookmark } from '@/hooks/useQuestionBookmark';
import { toast } from 'sonner';

const TOAST_KEY = 'bookmark_toast_shown';
const TOOLTIP_KEY = 'bookmark_tooltip_shown';

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
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Tooltip only shows on first bookmark tap, not auto


  const handleTap = async () => {
    setShowTooltip(false);
    const wasBookmarked = isBookmarked;
    await toggle();

    if (!wasBookmarked) {
      controls.start({
        scale: [1, 1.3, 1],
        transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
      });

      toast('Sparad till er dagbok', {
        duration: 2000,
        style: {
          background: 'var(--surface-base)',
          color: 'var(--color-text-primary)',
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
        },
      });
    }
  };

  const inactiveColor = isDarkBackground ? 'hsl(36, 20%, 75%)' : 'hsl(36, 12%, 68%)';
  const activeColor = 'var(--cta-button-color, #8B5E1A)';

  return (
    <div style={{ position: 'relative' }}>
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
            transition: 'color 0.2s ease, opacity 0.2s ease',
          }}
        />
      </motion.button>

      {/* One-time tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              marginTop: '4px',
              whiteSpace: 'nowrap',
              background: 'var(--color-text-primary)',
              color: 'var(--surface-base)',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
              padding: '6px 12px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px -2px hsla(30, 15%, 15%, 0.20)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            Spara frågan till er dagbok
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
