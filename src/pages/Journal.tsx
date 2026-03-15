import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { supabase } from '@/integrations/supabase/client';
import {
  MIDNIGHT_INK,
  LANTERN_GLOW,
  DRIFTWOOD,
  DEEP_DUSK,
} from '@/lib/palette';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type FilterChip = 'barn' | 'par';

export default function Journal() {
  const { user } = useAuth();
  const { space } = useCoupleSpaceContext();

  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<FilterChip>>(
    new Set(['barn', 'par']),
  );

  // Fetch completed session count to determine empty state
  useEffect(() => {
    if (!space?.id) {
      setCompletedCount(0);
      return;
    }
    let cancelled = false;
    supabase
      .from('couple_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('couple_space_id', space.id)
      .eq('status', 'completed')
      .then(({ count }) => {
        if (!cancelled) setCompletedCount(count ?? 0);
      });
    return () => { cancelled = true; };
  }, [space?.id]);

  const isEmpty = completedCount === 0;
  const loading = completedCount === null;

  const toggleFilter = (chip: FilterChip) => {
    setActiveFilters((prev) => {
      // Don't allow deactivating the last chip
      if (prev.has(chip) && prev.size === 1) return prev;
      const next = new Set(prev);
      if (next.has(chip)) {
        next.delete(chip);
      } else {
        next.add(chip);
      }
      return next;
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: MIDNIGHT_INK,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header area */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 60px)',
          textAlign: 'center',
          paddingLeft: '24px',
          paddingRight: '24px',
        }}
      >
        <h1
          style={{
            fontFamily: "'DM Serif Display', var(--font-serif)",
            fontSize: '28px',
            fontWeight: 600,
            color: LANTERN_GLOW,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Era samtal
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '14px',
            fontStyle: 'italic',
            color: DRIFTWOOD,
            marginTop: '8px',
            lineHeight: 1.4,
          }}
        >
          Vad ni burit med er.
        </p>
      </motion.div>

      {/* Filter chips — hidden when empty */}
      {!isEmpty && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4, ease: EASE }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginTop: '20px',
          }}
        >
          {(['barn', 'par'] as const).map((chip) => {
            const active = activeFilters.has(chip);
            return (
              <button
                key={chip}
                onClick={() => toggleFilter(chip)}
                style={{
                  height: '32px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${DRIFTWOOD}`,
                  backgroundColor: active ? DEEP_DUSK : 'transparent',
                  color: active ? LANTERN_GLOW : DRIFTWOOD,
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  fontWeight: 500,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {chip === 'barn' ? 'Barn' : 'Par'}
              </button>
            );
          })}
        </motion.div>
      )}

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: `${DRIFTWOOD}33`,
                margin: '0 auto',
              }}
              className="animate-pulse"
            />
          </div>
        ) : isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
            style={{ textAlign: 'center', padding: '0 32px' }}
          >
            <p
              style={{
                fontFamily: "'DM Serif Display', var(--font-serif)",
                fontSize: '20px',
                color: LANTERN_GLOW,
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              Det finns inget här ännu.
            </p>
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '15px',
                fontStyle: 'italic',
                color: DRIFTWOOD,
                marginTop: '16px',
                lineHeight: 1.4,
              }}
            >
              Varje samtal ni har lämnar ett spår.
            </p>
          </motion.div>
        ) : (
          /* Placeholder for populated journal — future prompts */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE }}
            style={{ textAlign: 'center', padding: '0 32px' }}
          >
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '15px',
                fontStyle: 'italic',
                color: DRIFTWOOD,
                lineHeight: 1.4,
              }}
            >
              Journal-innehåll byggs i nästa steg.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
