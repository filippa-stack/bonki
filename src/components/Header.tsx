import { ArrowLeft, Settings } from 'lucide-react';
import { useState } from 'react';
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
  const [showLogoutSheet, setShowLogoutSheet] = useState(false);

  const handleSignOut = async () => {
    setShowLogoutSheet(false);
    await signOut();
    navigate('/login');
  };

  const isImmersive = variant === 'immersive';

  return (
    <>
      <header
        className={`sticky top-0 z-10`}
        style={{
          backgroundColor: isImmersive
            ? (isDarkSurface ? 'transparent' : 'var(--surface-base)')
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
            {/* LEFT: back arrow or spacer */}
            <div className="flex items-center justify-start" style={{ minWidth: '64px' }}>
              {onImmersiveBack && (
                <button
                  onClick={onImmersiveBack}
                  aria-label="Tillbaka"
                  style={{
                    minHeight: '44px',
                    minWidth: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginLeft: '-12px',
                  }}
                >
                  <ArrowLeft
                    size={20}
                    style={{
                      color: isDarkSurface ? 'hsl(36, 20%, 88%)' : 'var(--color-text-tertiary)',
                      opacity: 0.45,
                      transition: 'opacity 150ms ease',
                    }}
                  />
                </button>
              )}
            </div>

            {/* CENTER: card title */}
            {title && (
              <div className="flex-1 min-w-0 text-center">
                <h1
                  className="font-serif truncate"
                  style={{
                    fontSize: '13px',
                    letterSpacing: '0.02em',
                    textTransform: 'none',
                    color: isDarkSurface ? 'hsl(36, 20%, 88%)' : 'var(--color-text-primary)',
                    opacity: 0.90,
                    fontWeight: 400,
                  }}
                >
                  {title}
                </h1>
              </div>
            )}
            {!title && <div className="flex-1 min-w-0" />}

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
          /* ── Default header layout ── */
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
                <span
                  className="cursor-pointer"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'white',
                    opacity: 1.0,
                    letterSpacing: '0.04em',
                  }}
                  onClick={() => navigate('/', { replace: false })}
                  aria-label="Tillbaka till startsidan"
                >
                  BONKI
                </span>
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
                  onClick={() => setShowLogoutSheet(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 4px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'opacity 150ms ease',
                  }}
                  aria-label="Inställningar"
                  onPointerDown={(e) => { e.currentTarget.style.opacity = '1'; }}
                  onPointerUp={(e) => { e.currentTarget.style.opacity = '0.70'; }}
                  onPointerLeave={(e) => { e.currentTarget.style.opacity = '0.70'; }}
                >
                  <Settings size={18} style={{ color: 'white', opacity: 0.70 }} />
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Logout bottom sheet */}
      {showLogoutSheet && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowLogoutSheet(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'hsla(0, 0%, 0%, 0.25)' }}
          />
          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              backgroundColor: 'var(--surface-raised)',
              borderRadius: '16px 16px 0 0',
              paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '24px 24px 8px' }}>
              <button
                onClick={handleSignOut}
                className="w-full text-left font-sans"
                style={{
                  fontSize: '15px',
                  color: '#8B3A3A',
                  padding: '14px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Logga ut
              </button>
              <div style={{ height: '1px', background: 'hsl(var(--divider))' }} />
              <button
                onClick={() => setShowLogoutSheet(false)}
                className="w-full text-center font-sans"
                style={{
                  fontSize: '15px',
                  color: 'var(--color-text-secondary)',
                  padding: '14px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: '4px',
                }}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
