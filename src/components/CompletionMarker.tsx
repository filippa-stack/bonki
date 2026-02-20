/**
 * CompletionMarker — single source of truth for the "covered" indicator.
 *
 * Usage: place right-aligned next to a title in a flex items-baseline row.
 * Renders nothing if `completed` is false — callers need no conditional logic.
 */
export default function CompletionMarker({ completed }: { completed: boolean }) {
  if (!completed) return null;

  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      role="img"
      aria-label="Avklarad"
      style={{
        flexShrink: 0,
        opacity: 0.3,
        color: 'var(--color-text-secondary)',
        marginBottom: '2px',
        /* Expand tappable area without growing visual size */
        padding: '6px',
        margin: '-6px -6px -4px -6px',
        boxSizing: 'content-box',
      }}
    >
      <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M3.5 6l1.8 1.8 3.2-3.2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
