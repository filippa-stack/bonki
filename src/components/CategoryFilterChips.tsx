/**
 * CategoryFilterChips — typographic section-nav row for product home filters.
 *
 * Visual: plain text labels, no pills/borders/backgrounds. Selection is
 * signaled by a single 2px underline that slides between labels on change.
 *
 * Behavior is unchanged from the previous pill version: "Alla" is exclusive,
 * multi-select within categories, snap back to {'all'} when emptied.
 */

import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { LANTERN_GLOW, BONKI_ORANGE } from '@/lib/palette';

interface CategoryFilterChipsProps {
  categories: { id: string; title: string }[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  /** @deprecated Retained for call-site compatibility; no longer used. */
  accentHex?: string;
  /** Number of cards currently visible — used for the aria-live announcement */
  totalVisible: number;
  /** @deprecated Retained for call-site compatibility; no longer used. */
  variant?: 'kids' | 'adult';
  /** Color of the sliding underline. Defaults to BONKI_ORANGE. */
  underlineColor?: string;
  /**
   * Selection paradigm. 'multi' (default) toggles chips into a set;
   * 'single' replaces selection on each tap (radio-like). Tapping the
   * active chip in 'single' mode snaps back to 'Alla'.
   */
  selectionMode?: 'multi' | 'single';
}

export const ALL_FILTER_KEY = 'all';

export default function CategoryFilterChips({
  categories,
  selected,
  onChange,
  totalVisible,
  underlineColor = BONKI_ORANGE,
  selectionMode = 'multi',
}: CategoryFilterChipsProps) {
  const liveRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hasMountedRef = useRef(false);

  const chips = useMemo(
    () => [
      { id: ALL_FILTER_KEY, title: 'Alla' },
      ...categories.map((c) => ({ id: c.id, title: c.title })),
    ],
    [categories],
  );

  // The underline tracks the first selected chip in display order. If "Alla"
  // is selected it always wins (it's the first chip and is exclusive).
  const activeId = useMemo(() => {
    if (selected.has(ALL_FILTER_KEY)) return ALL_FILTER_KEY;
    const first = chips.find((c) => selected.has(c.id));
    return first?.id ?? ALL_FILTER_KEY;
  }, [selected, chips]);

  const [pos, setPos] = useState<{ left: number; width: number } | null>(null);

  const measure = () => {
    const el = labelRefs.current[activeId];
    if (!el) return;
    setPos({ left: el.offsetLeft, width: el.offsetWidth });
  };

  useLayoutEffect(() => {
    measure();
    // After first synchronous measurement, future updates can animate.
    // Using rAF so motion picks up the new value as an animation target.
    const id = requestAnimationFrame(() => {
      hasMountedRef.current = true;
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Re-measure on container resize (rotate, font load, viewport change).
  useEffect(() => {
    if (!rowRef.current) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(rowRef.current);
    Object.values(labelRefs.current).forEach((el) => el && ro.observe(el));
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chips.length]);

  // Re-measure once webfonts finish loading (label widths can shift).
  useEffect(() => {
    const fonts = (document as any).fonts;
    if (fonts?.ready) {
      fonts.ready.then(() => measure()).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Announce filter state to screen readers
  useEffect(() => {
    if (!liveRef.current) return;
    const isAll = selected.has(ALL_FILTER_KEY);
    const catCount = isAll ? categories.length : selected.size;
    const message = isAll
      ? `Visar ${totalVisible} samtal i alla kategorier`
      : `Visar ${totalVisible} samtal i ${catCount} ${catCount === 1 ? 'kategori' : 'kategorier'}`;
    liveRef.current.textContent = message;
  }, [selected, totalVisible, categories.length]);

  const handleToggle = (id: string) => {
    if (id === ALL_FILTER_KEY) {
      onChange(new Set([ALL_FILTER_KEY]));
      return;
    }
    if (selectionMode === 'single') {
      // Tapping the active chip snaps back to Alla; otherwise replace.
      if (selected.has(id) && selected.size === 1) {
        onChange(new Set([ALL_FILTER_KEY]));
      } else {
        onChange(new Set([id]));
      }
      return;
    }
    const next = new Set(selected);
    next.delete(ALL_FILTER_KEY);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    if (next.size === 0) onChange(new Set([ALL_FILTER_KEY]));
    else onChange(next);
  };

  const fadeMask =
    'linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)';

  return (
    <div role="group" aria-label="Filtrera samtal efter kategori" style={{ position: 'relative' }}>
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          maskImage: fadeMask,
          WebkitMaskImage: fadeMask,
          paddingRight: '24px',
        }}
      >
        <div
          ref={rowRef}
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'flex-end',
            gap: '24px',
            padding: '12px 4px 16px',
            whiteSpace: 'nowrap',
          }}
        >
          {chips.map((chip) => {
            const isSelected = selected.has(chip.id);
            return (
              <button
                key={chip.id}
                ref={(el) => {
                  labelRefs.current[chip.id] = el;
                }}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleToggle(chip.id)}
                style={{
                  flex: '0 0 auto',
                  background: 'transparent',
                  border: 0,
                  padding: '2px 0',
                  margin: 0,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                  color: LANTERN_GLOW,
                  opacity: isSelected ? 1 : 0.78,
                  WebkitTapHighlightColor: 'transparent',
                  outlineOffset: '4px',
                  transition: 'opacity 180ms ease-out',
                }}
              >
                {chip.title}
              </button>
            );
          })}

          {pos && (
            <motion.div
              aria-hidden="true"
              initial={false}
              animate={{ left: pos.left, width: pos.width }}
              transition={
                hasMountedRef.current
                  ? { duration: 0.22, ease: [0.32, 0.72, 0, 1] }
                  : { duration: 0 }
              }
              style={{
                position: 'absolute',
                bottom: '10px',
                height: '2px',
                borderRadius: '1px',
                background: underlineColor,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* Visually hidden live region */}
      <div
        ref={liveRef}
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
    </div>
  );
}
