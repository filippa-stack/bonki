/**
 * CategoryFilterChips — horizontal multi-select pill row for product home.
 *
 * "Alla" is exclusive: tapping a category clears 'all' and adds the category.
 * Toggling all categories off snaps back to {'all'}. Tapping "Alla" resets.
 *
 * Visual: glassy pill tinted with the product's accent color via color-mix.
 * Selected: more opaque tint + 1px tinted border. No new color tokens.
 */

import { useEffect, useRef } from 'react';
import { LANTERN_GLOW } from '@/lib/palette';

interface CategoryFilterChipsProps {
  categories: { id: string; title: string }[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  /** Product accent hex (e.g. tileLight) used to tint the chips */
  accentHex: string;
  /** Number of cards currently visible — used for the aria-live announcement */
  totalVisible: number;
  /** Visual variant — 'adult' uses outline-only unselected chips */
  variant?: 'kids' | 'adult';
}

export const ALL_FILTER_KEY = 'all';

export default function CategoryFilterChips({
  categories,
  selected,
  onChange,
  accentHex,
  totalVisible,
  variant = 'kids',
}: CategoryFilterChipsProps) {
  const liveRef = useRef<HTMLDivElement | null>(null);

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
    const next = new Set(selected);
    next.delete(ALL_FILTER_KEY);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    if (next.size === 0) onChange(new Set([ALL_FILTER_KEY]));
    else onChange(next);
  };

  const chips = [
    { id: ALL_FILTER_KEY, title: 'Alla' },
    ...categories.map((c) => ({ id: c.id, title: c.title })),
  ];

  // Right-edge fade is implemented as an alpha mask on the scroll container
  // itself — the chip pixels fade to transparent at the edge. A previous
  // approach used an absolute overlay div with a black-tinted gradient
  // (`linear-gradient(to right, transparent, rgba(0,0,0,0.35))`) painted on
  // top of the chips at zIndex 1; against bright pixels in the hero
  // illustration that overlay read as a dark rectangular plate. Do not
  // re-introduce a black-on-content overlay — use the mask approach below.
  const fadeMask =
    'linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)';

  return (
    <div style={{ position: 'relative' }}>
      <div
        role="group"
        aria-label="Filtrera samtal efter kategori"
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: '4px 24px 4px 4px',
          scrollbarWidth: 'none',
          maskImage: fadeMask,
          WebkitMaskImage: fadeMask,
        }}
      >
        {chips.map((chip) => {
          const isSelected = selected.has(chip.id);
          const bg = isSelected
            ? `color-mix(in srgb, ${accentHex} 28%, rgba(255,255,255,0.06))`
            : `color-mix(in srgb, ${accentHex} 14%, rgba(255,255,255,0.06))`;
          const border = isSelected
            ? `1px solid color-mix(in srgb, ${accentHex} 55%, rgba(255,255,255,0.18))`
            : `1px solid color-mix(in srgb, ${accentHex} 25%, rgba(255,255,255,0.12))`;
          return (
            <button
              key={chip.id}
              type="button"
              className="category-filter-chip"
              aria-pressed={isSelected}
              onClick={() => handleToggle(chip.id)}
              style={{
                flex: '0 0 auto',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 500,
                color: LANTERN_GLOW,
                background: bg,
                border,
                borderRadius: '999px',
                padding: '7px 10px',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {chip.title}
            </button>
          );
        })}
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
