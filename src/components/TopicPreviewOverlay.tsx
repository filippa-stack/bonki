import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, Category } from '@/types';

const EASE = [0.22, 1, 0.36, 1] as const;

interface TopicPreviewOverlayProps {
  card: Card | null;
  category: Category | null;
  categoryColor: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Two-phase transition from topic selection to session start:
 * Phase 1: Glassmorphism preview overlay with topic info + "Starta samtal"
 * Phase 2: Full-screen instruction bridge with 1-2-3 steps + "Vi är redo"
 */
export default function TopicPreviewOverlay({
  card,
  category,
  categoryColor,
  open,
  onClose,
}: TopicPreviewOverlayProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'preview' | 'instructions'>('preview');

  const handleStartConversation = () => {
    setPhase('instructions');
  };

  const handleReady = () => {
    if (card) {
      navigate(`/card/${card.id}`);
    }
    onClose();
    setPhase('preview');
  };

  const handleClose = () => {
    onClose();
    // Reset phase after exit animation
    setTimeout(() => setPhase('preview'), 350);
  };

  return (
    <AnimatePresence>
      {open && card && (
        <motion.div
          key="topic-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          onClick={phase === 'preview' ? handleClose : undefined}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          {/* Backdrop */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'hsla(194, 24%, 18%, 0.75)',
              backdropFilter: 'blur(20px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(20px) saturate(1.2)',
            }}
          />

          <AnimatePresence mode="wait">
            {phase === 'preview' ? (
              /* ── Phase 1: Preview card ── */
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, y: -10 }}
                transition={{ duration: 0.4, ease: [...EASE] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  maxWidth: '340px',
                  borderRadius: '20px',
                  padding: '40px 32px 36px',
                  background: 'hsla(194, 20%, 28%, 0.65)',
                  backdropFilter: 'blur(40px) saturate(1.4)',
                  WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
                  border: '1px solid hsla(194, 16%, 52%, 0.15)',
                  boxShadow:
                    '0 8px 32px -8px hsla(194, 30%, 8%, 0.40), ' +
                    '0 24px 64px -16px hsla(194, 24%, 6%, 0.30)',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  textAlign: 'center' as const,
                  gap: '16px',
                }}
              >
                {/* Category label */}
                {category && (
                  <p
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '10px',
                      fontWeight: 500,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase' as const,
                      color: categoryColor,
                      opacity: 0.8,
                    }}
                  >
                    {category.title}
                  </p>
                )}

                {/* Topic title */}
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '26px',
                    fontWeight: 600,
                    lineHeight: 1.25,
                    color: categoryColor,
                    textWrap: 'balance' as any,
                  }}
                >
                  {card.title}
                </h2>

                {/* Description */}
                {card.subtitle && (
                  <p
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: '15px',
                      fontWeight: 400,
                      lineHeight: 1.5,
                      color: 'hsl(42, 20%, 88%)',
                      opacity: 0.7,
                      maxWidth: '280px',
                    }}
                  >
                    {card.subtitle}
                  </p>
                )}

                {/* Ghost button: Starta samtal */}
                <motion.button
                  onClick={handleStartConversation}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    marginTop: '12px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '14px',
                    fontWeight: 500,
                    letterSpacing: '0.02em',
                    color: categoryColor,
                    background: 'transparent',
                    border: `1.5px solid ${categoryColor}50`,
                    borderRadius: '24px',
                    padding: '12px 36px',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease, background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${categoryColor}80`;
                    e.currentTarget.style.backgroundColor = `${categoryColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${categoryColor}50`;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Starta samtal
                </motion.button>

                {/* Close hint */}
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '11px',
                    color: 'hsl(194, 12%, 60%)',
                    opacity: 0.4,
                    marginTop: '4px',
                  }}
                >
                  Tryck utanför för att stänga
                </p>
              </motion.div>
            ) : (
              /* ── Phase 2: Instruction bridge ── */
              <motion.div
                key="instructions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '48px 32px',
                }}
              >
                {/* Light-leak glow — category-colored */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-15%',
                    width: '65%',
                    height: '55%',
                    background: `radial-gradient(ellipse at 30% 30%, ${categoryColor}30 0%, transparent 70%)`,
                    filter: 'blur(50px)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Content */}
                <div
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    alignItems: 'center',
                    gap: '48px',
                    maxWidth: '320px',
                  }}
                >
                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.6, ease: [...EASE] }}
                    style={{ textAlign: 'center' }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '10px',
                        fontWeight: 500,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase' as const,
                        color: categoryColor,
                        opacity: 0.7,
                        marginBottom: '12px',
                      }}
                    >
                      Förbered er
                    </p>
                    <h2
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '24px',
                        fontWeight: 600,
                        lineHeight: 1.3,
                        color: 'hsl(42, 20%, 92%)',
                        textWrap: 'balance' as any,
                      }}
                    >
                      {card.title}
                    </h2>
                  </motion.div>

                  {/* 1-2-3 Preparation steps */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: [...EASE] }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: '28px',
                      width: '100%',
                    }}
                  >
                    {[
                      { num: '1', text: 'Sitt ner tillsammans, utan distraktioner.' },
                      { num: '2', text: 'Läs frågorna högt, en i taget.' },
                      { num: '3', text: 'Lyssna — utan att lösa.' },
                    ].map((step, i) => (
                      <motion.div
                        key={step.num}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.4 + i * 0.1,
                          duration: 0.5,
                          ease: [...EASE],
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '16px',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '28px',
                            fontWeight: 300,
                            lineHeight: 1,
                            color: categoryColor,
                            opacity: 0.5,
                            flexShrink: 0,
                            width: '24px',
                            textAlign: 'right' as const,
                          }}
                        >
                          {step.num}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-serif)',
                            fontSize: '17px',
                            fontWeight: 400,
                            lineHeight: 1.5,
                            color: 'hsl(42, 20%, 88%)',
                            opacity: 0.85,
                            paddingTop: '4px',
                          }}
                        >
                          {step.text}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Heritage Gold CTA: Vi är redo */}
                  <motion.button
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5, ease: [...EASE] }}
                    onClick={handleReady}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '15px',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                      color: 'hsl(194, 30%, 12%)',
                      backgroundColor: 'hsl(41, 78%, 48%)',
                      border: 'none',
                      borderRadius: '28px',
                      padding: '16px 52px',
                      cursor: 'pointer',
                      boxShadow:
                        '0 4px 20px -4px hsla(41, 60%, 30%, 0.35), ' +
                        '0 12px 40px -12px hsla(41, 50%, 25%, 0.20)',
                      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'hsl(41, 82%, 54%)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'hsl(41, 78%, 48%)';
                    }}
                  >
                    Vi är redo
                  </motion.button>

                  {/* Back link */}
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.4 }}
                    onClick={handleClose}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '12px',
                      color: 'hsl(194, 12%, 60%)',
                      opacity: 0.35,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                    }}
                  >
                    Tillbaka
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
