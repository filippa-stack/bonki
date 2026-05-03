/**
 * LibraryMock — sandboxed design playground for a new lobby layout.
 *
 * Mirrors the Index/ProductLibrary shell but renders ProductLibraryMock so
 * the live lobby is never affected. Disposable: when a mock design wins,
 * port it into ProductLibrary.tsx and delete this file + the route.
 *
 * Direct URL only: /library-mock (not linked from any nav).
 */

import { Link } from 'react-router-dom';
import { usePartnerNotifications } from '@/hooks/usePartnerNotifications';
import { useThemeSwitcher } from '@/hooks/useThemeSwitcher';
import ProductLibraryMock from '@/components/ProductLibraryMock';

export default function LibraryMock() {
  useThemeSwitcher();
  usePartnerNotifications();

  return (
    <>
      <ProductLibraryMock />

      {/* Dev badge — never confuse the mock with the real lobby */}
      <Link
        to="/"
        aria-label="Gå till riktig library"
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
          right: 12,
          zIndex: 9999,
          padding: '6px 10px',
          borderRadius: 999,
          background: 'rgba(232, 93, 44, 0.95)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.04em',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          transform: 'translateZ(0)',
        }}
      >
        MOCK · /library-mock → /
      </Link>
    </>
  );
}
