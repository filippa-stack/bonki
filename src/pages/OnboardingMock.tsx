/**
 * OnboardingMock page — sandboxed playground at /onboarding-mock.
 * The real Onboarding.tsx remains untouched and continues to serve users.
 */

import { Link } from 'react-router-dom';
import OnboardingMock from '@/components/OnboardingMock';

export default function OnboardingMockPage() {
  return (
    <>
      <OnboardingMock />

      {/* Dev badge — never confuse the mock with the real onboarding */}
      <Link
        to="/"
        aria-label="Gå till riktig app"
        style={{
          position: 'fixed',
          bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
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
        MOCK · /onboarding-mock → /
      </Link>
    </>
  );
}
