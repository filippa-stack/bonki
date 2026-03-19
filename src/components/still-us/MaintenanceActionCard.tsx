/**
 * MaintenanceActionCard — Home screen card for maintenance mode.
 */

import { motion } from 'framer-motion';
import { EASE, PRESS } from '@/lib/motion';
import { COLORS } from '@/lib/stillUsTokens';

interface MaintenanceActionCardProps {
  tillbakaIndex: number;
  tillbakaTitle: string;
  available: boolean;
  daysUntilNext?: number;
  onStart: () => void;
}

export default function MaintenanceActionCard({
  tillbakaIndex,
  tillbakaTitle,
  available,
  daysUntilNext,
  onStart,
}: MaintenanceActionCardProps) {
  return (
    <motion.div
      whileTap={available ? { scale: 0.98 } : undefined}
      transition={{ duration: PRESS, ease: [...EASE] }}
      onClick={available ? onStart : undefined}
      style={{
        width: '100%',
        padding: '20px',
        borderRadius: '16px',
        backgroundColor: available ? `${COLORS.deepSaffron}15` : `${COLORS.emberGlow}08`,
        border: `1px solid ${available ? `${COLORS.deepSaffron}30` : `${COLORS.emberGlow}15`}`,
        cursor: available ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        fontWeight: 600,
        color: COLORS.driftwood,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        Tillbaka-kort {tillbakaIndex + 1}
      </p>

      <p style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '18px',
        fontWeight: 500,
        color: COLORS.emberGlow,
      }}>
        {available ? tillbakaTitle : `Nästa kort om ${daysUntilNext ?? '?'} dagar`}
      </p>

      {available && (
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '14px',
          color: COLORS.deepSaffron,
          fontWeight: 600,
        }}>
          Starta →
        </p>
      )}
    </motion.div>
  );
}
