

## Fix Journal Filter Chips — Select Instead of Deselect

**Problem:** Tapping "Barn" deselects it (toggle-off model), showing the opposite content.

**File:** `src/pages/Journal.tsx`

### Change 1: Update `toggleFilter` (line ~924)

Replace with exclusive-select logic: tapping a chip selects only that category; tapping the already-selected chip returns to showing all.

```tsx
const toggleFilter = (chip: FilterChip) => {
  setActiveFilters(prev => {
    if (prev.has(chip) && prev.size === 1) return new Set<FilterChip>(['barn', 'par']);
    return new Set<FilterChip>([chip]);
  });
};
```

### Change 2: Add "Alla" pill + `bothActive` variable (line ~961-986)

Define `bothActive` as a const **before** the JSX, right after the `{!isEmpty && !loading && (` guard opens. Then render an "Alla" button before the existing chip `.map()`.

```tsx
{!isEmpty && !loading && (() => {
  const bothActive = activeFilters.has('barn') && activeFilters.has('par');
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
      <button
        onClick={() => setActiveFilters(new Set<FilterChip>(['barn', 'par']))}
        style={{
          height: '30px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '10px',
          border: `1px solid ${bothActive ? DEEP_SAFFRON : DRIFTWOOD}44`,
          background: bothActive ? `${DEEP_SAFFRON}18` : 'transparent',
          color: bothActive ? LANTERN_GLOW : `${DRIFTWOOD}aa`,
          fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'all 200ms ease',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        Alla
      </button>
      {(['barn', 'par'] as const).map(chip => {
        const active = activeFilters.has(chip) && activeFilters.size === 1;
        return (
          <button key={chip} onClick={() => toggleFilter(chip)}
            style={{
              height: '30px', paddingLeft: '16px', paddingRight: '16px', borderRadius: '10px',
              border: `1px solid ${active ? DEEP_SAFFRON : DRIFTWOOD}44`,
              backgroundColor: active ? `${DEEP_SAFFRON}18` : 'transparent',
              color: active ? LANTERN_GLOW : `${DRIFTWOOD}aa`,
              fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 200ms ease',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {chip === 'barn' ? 'Barn' : 'Föräldrar'}
          </button>
        );
      })}
    </div>
  );
})()}
```

Key detail: the individual chip `active` check uses `activeFilters.size === 1` so a chip only highlights when it's the exclusive selection, not when "Alla" is active.

Alternatively, `bothActive` can be a simple `const` defined above the return JSX (near line 930) to avoid the IIFE pattern — cleaner and more readable. Either approach works; the const-before-JSX approach is preferred.

### Not changed
- Data fetching, timeline filtering conditions, Still Us privacy toggle, any other file.

