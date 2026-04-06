/**
 * Small pill badge showing "GRATIS" on the free card in category views.
 * Only render when the card is the product's free card AND not yet completed.
 */
export default function FreeCardBadge() {
  return (
    <span
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        zIndex: 5,
        fontFamily: 'var(--font-sans)',
        fontSize: '10px',
        fontWeight: 500,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: 'rgba(255, 255, 255, 0.9)',
        background: 'rgba(255, 255, 255, 0.18)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '0.5px solid rgba(255, 255, 255, 0.15)',
        padding: '5px 14px',
        borderRadius: '20px',
        lineHeight: 1,
      }}
    >
      GRATIS
    </span>
  );
}
