/**
 * ProductIntroMock page — sandboxed playground at /intro-mock/:productId.
 * Live ProductIntro.tsx is untouched.
 */

import { Link, useParams } from 'react-router-dom';
import ProductIntroMock from '@/components/ProductIntroMock';

export default function ProductIntroMockPage() {
  const { productId } = useParams<{ productId: string }>();

  return (
    <>
      <ProductIntroMock productId={productId ?? 'jag_i_varlden'} />

      {/* Dev badge — never confuse the mock with the real intro */}
      <Link
        to="/library-mock"
        aria-label="Tillbaka till library mock"
        style={{
          position: 'fixed',
          top: 'calc(env(safe-area-inset-top, 0px) + 50px)',
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
        MOCK · /intro-mock → /library-mock
      </Link>
    </>
  );
}
