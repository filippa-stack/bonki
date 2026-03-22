/**
 * PortalBrowseSheet — Bottom sheet showing all cards in a category.
 * Used by KidsCardPortal for the "Utforska alla samtal" feature.
 */

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useCardImage } from '@/hooks/useCardImage';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  SAFFRON_FLAME,
} from '@/lib/palette';

const DEEP_DUSK = '#2A2D3A';

interface BrowseCard {
  id: string;
  title: string;
}

interface PortalBrowseSheetProps {
  open: boolean;
  onClose: () => void;
  cards: BrowseCard[];
  currentCardId: string;
  completedCardIds: Set<string>;
  tileLight: string;
  onSelectCard: (index: number) => void;
}

/* ── Thumbnail wrapper to satisfy hook rules ── */
function CardThumbnail({ cardId }: { cardId: string }) {
  const src = useCardImage(cardId);
  if (!src) return <div style={{ width: 44, height: 44, borderRadius: 8, background: MIDNIGHT_INK }} />;
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      style={{
        width: 44,
        height: 44,
        borderRadius: 8,
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
  );
}

export default function PortalBrowseSheet({
  open,
  onClose,
  cards,
  currentCardId,
  completedCardIds,
  tileLight,
  onSelectCard,
}: PortalBrowseSheetProps) {
  const handleSelect = useCallback(
    (index: number) => {
      onSelectCard(index);
      onClose();
    },
    [onSelectCard, onClose],
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 100,
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.1}
            onDragEnd={(_e, info) => {
              if (info.offset.y > 100) onClose();
            }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '60vh',
              background: DEEP_DUSK,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
              <div
                style={{
                  width: 40,
                  height: 4,
                  borderRadius: 2,
                  background: DRIFTWOOD,
                  opacity: 0.5,
                }}
              />
            </div>

            {/* Card list */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0 12px 16px',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {cards.map((card, index) => {
                const isCurrent = card.id === currentCardId;
                const isCompleted = completedCardIds.has(card.id);

                return (
                  <button
                    key={card.id}
                    onClick={() => handleSelect(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      height: 60,
                      padding: '0 12px',
                      marginBottom: 8,
                      background: 'none',
                      border: 'none',
                      borderLeft: isCurrent ? `2px solid ${SAFFRON_FLAME}` : '2px solid transparent',
                      borderRadius: 8,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <CardThumbnail cardId={card.id} />
                    <span
                      style={{
                        flex: 1,
                        fontFamily: 'var(--font-sans)',
                        fontSize: 15,
                        color: LANTERN_GLOW,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {card.title}
                    </span>
                    {isCompleted && (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: tileLight,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Check size={10} strokeWidth={2.5} color={LANTERN_GLOW} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
