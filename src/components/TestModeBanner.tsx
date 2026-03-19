/**
 * TestModeBanner — Fixed top banner showing "TESTLÄGE" in Deep Saffron.
 * Only renders when test mode is active. REMOVE BEFORE LAUNCH.
 */
import { isTestMode } from '@/lib/testMode';

export default function TestModeBanner() {
  if (!isTestMode()) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2E2233',
        borderBottom: '1px solid #E8913A44',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 700,
          color: '#E8913A',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}
      >
        TESTLÄGE
      </span>
    </div>
  );
}
