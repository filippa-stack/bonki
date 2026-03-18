/**
 * BreathingDot — Pulsing Deep Saffron circle.
 * Used on handoff/waiting screens. Respects prefers-reduced-motion.
 */

import { motion } from 'framer-motion';
import { COLORS } from '@/lib/stillUsTokens';

interface BreathingDotProps {
  size?: number;
}

export default function BreathingDot({ size = 12 }: BreathingDotProps) {
  return (
    <motion.div
      animate={{ opacity: [0.3, 0.5, 0.3] }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      // prefers-reduced-motion: CSS rule sets animation-duration to 0.01ms,
      // so this becomes a static dot at opacity 0.3
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: COLORS.deepSaffron,
      }}
    />
  );
}
