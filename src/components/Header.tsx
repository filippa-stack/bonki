import { ArrowLeft, LogOut, Plus, Settings, BookText } from 'lucide-react';
import { useTogetherMode } from '@/hooks/useTogetherMode';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import bonkiLogo from '@/assets/bonki-logo.png';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

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
}: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { switchToNewSpace } = useApp();
  const { togetherMode, setTogetherMode } = useTogetherMode();
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
      className={`sticky top-0 z-10 ${isImmersive ? '' : minimal ? '' : 'backdrop-blur-md border-b border-black/[0.04]'}`}
      style={{
        backgroundColor: isImmersive
          ? 'var(--session-header-bg)'
          : minimal
            ? 'transparent'
            : 'hsl(var(--surface-chrome) / 0.85)',
        filter: isImmersive ? 'saturate(0.75) brightness(0.9)' : undefined,
        boxShadow: 'none',
      }}
    >
      <div className="relative flex items-center justify-between px-6" style={{ height: isImmersive ? '1.5rem' : '3.75rem' }}>
        {/* ── Left ── */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isImmersive && onImmersiveBack && (
            <button
              onClick={onImmersiveBack}
              className="text-[14px] transition-opacity hover:opacity-70"
              style={{ color: 'hsl(0 0% 100% / 0.6)' }}
            >
              Tillbaka
            </button>
          )}
          {!isImmersive && showBack && (
            <button
              onClick={() => navigate(backTo || '/')}
              className="flex items-center justify-center shrink-0"
              style={{ width: '44px', height: '44px', marginLeft: '-10px' }}
              aria-label="Tillbaka"
            >
              <ArrowLeft className="w-5 h-5" style={{ color: 'var(--color-text-primary)', opacity: 0.55 }} />
            </button>
          )}
          {/* Logo — show on home (minimal, no back) or default pages with back */}
          {!(isImmersive && onImmersiveBack) && !showBack && (
            <img
              src={bonkiLogo}
              alt="Still Us"
              className={`object-contain cursor-pointer ${minimal ? 'h-6 w-6 opacity-45' : 'h-7 w-7 opacity-75'}`}
              onClick={() => navigate('/', { replace: false })}
            />
          )}
        </div>

        {/* ── Center: title ── */}
        {isImmersive && title && (
          <h1 className="font-serif text-[11px] font-normal truncate text-white/35 absolute left-1/2 -translate-x-1/2 max-w-[50%] text-center pointer-events-none">
            {title}
          </h1>
        )}
        {!isImmersive && title && (
          <h1 className="font-serif text-lg font-medium truncate text-foreground absolute left-1/2 -translate-x-1/2 max-w-[50%] text-center pointer-events-none">
            {title}
          </h1>
        )}

        {/* ── Right ── */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
          {/* Journal icon */}
          {!isImmersive && showSharedLink && (
            <button
              onClick={() => navigate('/shared')}
              className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label={t('header.shared_space')}
            >
              <BookText className="w-[18px] h-[18px]" />
            </button>
          )}

          {/* Leave session (immersive only) */}
          {isImmersive && onLeaveSession && (
            <button
              onClick={onLeaveSession}
              className="text-[9px] font-sans whitespace-nowrap shrink-0 ml-5 mr-2"
              style={{
                color: 'hsl(0 0% 100%)',
                opacity: 0.25,
                fontWeight: 400,
                transition: 'opacity 150ms ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.45'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.25'; }}
            >
              Lämna samtalet
            </button>
          )}

          {/* Settings popover */}
          {showSettings && !isImmersive && (
            <SettingsPopover
              hasActiveSession={hasActiveSession}
              togetherMode={togetherMode}
              setTogetherMode={setTogetherMode}
              switchToNewSpace={switchToNewSpace}
              handleSignOut={handleSignOut}
              navigate={navigate}
              t={t}
            />
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── Settings popover (extracted) ─── */
function SettingsPopover({
  hasActiveSession,
  togetherMode,
  setTogetherMode,
  switchToNewSpace,
  handleSignOut,
  navigate,
  t,
}: {
  hasActiveSession: boolean;
  togetherMode: string;
  setTogetherMode: (m: 'together' | 'solo') => void;
  switchToNewSpace: () => Promise<{ ok: boolean }>;
  handleSignOut: () => void;
  navigate: (path: string) => void;
  t: (key: string) => string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground/60 hover:text-muted-foreground">
          <Settings className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="end">

        {/* ── Space actions ── */}
        <div className="space-y-0.5">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs gap-1.5"
                disabled={hasActiveSession}
              >
                <Plus className="w-3.5 h-3.5" />
                Nytt kapitel
              </Button>
            </AlertDialogTrigger>
            {!hasActiveSession && (
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-lg">Nytt kapitel?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
                    Skapar ett nytt tomt utrymme med samma partner.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    const result = await switchToNewSpace();
                    if (result.ok) {
                      toast.success('Nytt utrymme skapat.');
                      navigate('/');
                    } else {
                      toast.error('Kunde inte skapa nytt utrymme.');
                    }
                  }}>
                    Nytt kapitel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            )}
          </AlertDialog>
          {hasActiveSession && (
            <p className="text-[11px] text-muted-foreground/50 px-2 pb-1 leading-snug">
              Ni är mitt i ett samtal. Avsluta det först.
            </p>
          )}
        </div>

        {/* ── Samtalsläge ── */}
        <div className="border-t border-border/30 mt-2 pt-2 px-2 pb-1">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider mb-1.5">Samtalsläge</p>
          <div className="flex gap-1">
            <Button
              variant={togetherMode === 'together' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => setTogetherMode('together')}
            >
              Tillsammans
            </Button>
            <Button
              variant={togetherMode === 'solo' ? 'default' : 'ghost'}
              size="sm"
              className="flex-1 text-xs h-7"
              onClick={() => setTogetherMode('solo')}
            >
              Själv
            </Button>
          </div>
        </div>

        {/* ── Account ── */}
        <div className="border-t border-border/30 mt-2 pt-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('header.sign_out')}
          </Button>
        </div>

      </PopoverContent>
    </Popover>
  );
}
