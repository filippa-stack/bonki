import { LANTERN_GLOW, BONKI_ORANGE } from '@/lib/palette';

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
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '1px',
        textTransform: 'uppercase',
        color: LANTERN_GLOW,
        backgroundColor: BONKI_ORANGE,
        padding: '4px 10px',
        borderRadius: '8px',
        lineHeight: 1,
      }}
    >
      GRATIS
    </span>
  );
}
