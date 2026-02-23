import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';

import bonkiLogo from '@/assets/bonki-logo.png';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  showSharedLink?: boolean;
  showSettings?: boolean;
  minimal?: boolean;
  variant?: 'default' | 'immersive';
  onImmersiveBack?: () => void;
  onLeaveSession?: () => void;
  isDarkSurface?: boolean;
}

export default function Header({
  title,
  showBack = false,
  backTo,
  showSharedLink = false,
  showSettings = false,
  minimal = false,
  variant = 'default',
  onImmersiveBack,
  onLeaveSession,
  isDarkSurface = false,
}: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const normalizedSession = useNormalizedSessionContext();
  const hasActiveSession = !normalizedSession.loading && !!normalizedSession.sessionId;
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isImmersive = variant === 'immersive';

  return (
    <header
      className={`sticky top-0 z-10`}
      style={{
        backgroundColor: isImmersive
          ? (isDarkSurface ? 'transparent' : 'hsl(36, 22%, 92%)')
          : 'hsl(158, 32%, 14%)',
        boxShadow: 'none',
        borderBottom: isImmersive
          ? (isDarkSurface ? '1px solid hsl(158, 25%, 20%)' : 'none')
          : 'none',
      }}
    >
      {isImmersive ? (
        /* ── Immersive: proper three-column grid ── */
        <div className="flex items-center px-4" style={{ height: '2.5rem' }}>
          {/* LEFT: back arrow */}
          <div className="flex items-center justify-start" style={{ minWidth: '64px' }}>
            {onImmersiveBack && (
              <button
                onClick={onImmersiveBack}
                className="flex items-center justify-center shrink-0"
                style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
                aria-label="Tillbaka"
              >
                <ArrowLeft
                  className="w-5 h-5"
                  style={{
                    color: isDarkSurface ? 'hsl(36, 20%, 88%)' : 'var(--color-text-secondary)',
                    opacity: isDarkSurface ? 0.7 : 1,
                  }}
                />
              </button>
            )}
          </div>

          {/* CENTER: category title */}
          <div className="flex-1 min-w-0 flex items-center justify-center">
            {title && (
              <h1
                className="font-sans font-normal pointer-events-none"
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: isDarkSurface ? 'hsl(36, 20%, 70%)' : 'var(--color-text-tertiary)',
                  maxWidth: '55%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {title}
              </h1>
            )}
          </div>

          {/* RIGHT: leave session */}
          <div className="flex items-center justify-end" style={{ minWidth: '80px' }}>
            {onLeaveSession && (
              <div style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={onLeaveSession}
                  className="font-sans whitespace-nowrap shrink-0"
                  style={{
                    fontSize: '13px',
                    color: isDarkSurface ? 'hsl(36, 20%, 88%)' : 'var(--color-text-secondary)',
                    opacity: 0.50,
                    fontWeight: 400,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'opacity 150ms ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.50'; }}
                >
                  Lämna samtalet
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── Default header layout (unchanged) ── */
        <div className="header-textured relative flex items-center justify-between px-6" style={{ height: '2.5rem' }}>
          {/* Left */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {showBack && (
              <button
                onClick={() => navigate(backTo || '/')}
                className="flex items-center justify-center shrink-0"
                style={{ width: '44px', height: '44px', marginLeft: '-10px' }}
                aria-label="Tillbaka"
                onPointerDown={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.opacity = '1'; }}
                onPointerUp={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.opacity = '0.75'; }}
                onPointerLeave={(e) => { const svg = e.currentTarget.querySelector('svg'); if (svg) svg.style.opacity = '0.75'; }}
              >
                <ArrowLeft className="w-5 h-5" style={{ color: 'white', opacity: 0.75, transition: 'opacity 150ms ease' }} />
              </button>
            )}
            {!showBack && (
              <img
                src={bonkiLogo}
                alt="Still Us"
                className={`object-contain cursor-pointer ${minimal ? 'h-6 w-6 opacity-45' : 'h-7 w-7 opacity-75'}`}
                style={{ filter: 'brightness(0) invert(1)', cursor: 'pointer' }}
                onClick={() => navigate('/', { replace: false })}
                aria-label="Tillbaka till startsidan"
              />
            )}
          </div>

          {/* Center title */}
          {title && (
            <h1
              className="font-serif text-lg font-medium truncate absolute left-1/2 -translate-x-1/2 max-w-[50%] text-center pointer-events-none"
              style={{ color: 'white', opacity: 0.90 }}
            >
              {title}
            </h1>
          )}

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
            {showSharedLink && (
              <button
                onClick={() => navigate('/shared')}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '12px',
                  letterSpacing: '0.04em',
                  color: 'white',
                  opacity: 0.85,
                  cursor: 'pointer',
                  padding: '8px 4px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  transition: 'opacity 150ms ease',
                }}
                aria-label={t('header.shared_space')}
                onPointerDown={(e) => { e.currentTarget.style.opacity = '1'; }}
                onPointerUp={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onPointerLeave={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              >
                Era samtal
              </button>
            )}
            {showSettings && (
              <button
                onClick={handleSignOut}
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  letterSpacing: '0.04em',
                  color: 'white',
                  opacity: 0.55,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: '8px 4px',
                  minHeight: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'opacity 150ms ease',
                }}
                onPointerDown={(e) => { e.currentTarget.style.opacity = '0.85'; }}
                onPointerUp={(e) => { e.currentTarget.style.opacity = '0.55'; }}
                onPointerLeave={(e) => { e.currentTarget.style.opacity = '0.55'; }}
              >
                {t('header.sign_out')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

