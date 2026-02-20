import { LogOut, Plus, Settings, Users } from 'lucide-react';
import { useTogetherMode } from '@/hooks/useTogetherMode';
import { useCoupleSpaceContext } from '@/contexts/CoupleSpaceContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import { toast } from 'sonner';
import ColorPicker from '@/components/ColorPicker';
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
import SaveIndicator from '@/components/SaveIndicator';

import BackupManager from '@/components/BackupManager';

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
  showBackgroundPicker?: boolean;
  showSaveIndicator?: boolean;
  showBackupManager?: boolean;
  variant?: 'default' | 'immersive';
  onImmersiveBack?: () => void;
}

export default function Header({
  title,
  showBack = false,
  backTo,
  showBackgroundPicker = false,
  showSaveIndicator = true,
  showBackupManager = true,
  variant = 'default',
  onImmersiveBack,
}: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { backgroundColor, setBackgroundColor, saveStatus, lastSavedAt, saveError, switchToNewSpace } = useApp();
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
      className={`sticky top-0 z-10 ${isImmersive ? '' : 'backdrop-blur-md border-b border-black/[0.04]'}`}
      style={{
        backgroundColor: isImmersive ? 'var(--session-header-bg)' : 'hsl(var(--surface-chrome) / 0.85)',
        boxShadow: 'none',
      }}
    >
      <div className="flex items-center justify-between px-6" style={{ height: isImmersive ? '2.25rem' : '3.5rem' }}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {isImmersive && onImmersiveBack && (
            <button
              onClick={onImmersiveBack}
              className="text-[14px] transition-opacity hover:opacity-70"
              style={{ color: 'hsl(0 0% 100% / 0.6)' }}
            >
              Tillbaka
            </button>
          )}
          {!(isImmersive && onImmersiveBack) && (
            <img
              src={bonkiLogo}
              alt="Still Us"
              className={`h-7 w-7 object-contain cursor-pointer opacity-75 ${isImmersive ? 'brightness-0 invert' : ''}`}
              onClick={() => navigate('/', { replace: false })}
            />
          )}
          {title && (
            <h1 className={`font-serif text-lg font-medium truncate ${isImmersive ? 'text-white' : 'text-foreground'}`}>
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1 justify-end">
          {showSaveIndicator && (
            <div className="flex items-center gap-2 min-h-[20px]">
              <SaveIndicator
                status={saveStatus}
                error={saveError}
                lastSavedAt={lastSavedAt}
              />
            </div>
          )}
          {showBackupManager && <BackupManager />}

          {showBackgroundPicker && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">{t('header.background')}</span>
              <ColorPicker
                currentColor={backgroundColor}
                onColorChange={setBackgroundColor}
              />
            </div>
          )}
          <SharedSpaceLink isImmersive={isImmersive} />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className={isImmersive ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-muted-foreground/60 hover:text-muted-foreground'}>
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">

              {/* ── SECTION 1: Space actions ── */}
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

              {/* ── SECTION 1b: Samtalsläge ── */}
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

              {/* ── SECTION 2: Account ── */}
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
        </div>
      </div>
    </header>
  );
}

function SharedSpaceLink({ isImmersive }: { isImmersive: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/shared')}
      className="text-[13px] font-sans font-medium transition-all hover:underline underline-offset-4"
      style={{
        color: isImmersive ? 'hsl(0 0% 100%)' : 'var(--color-text-primary)',
        opacity: isImmersive ? 0.6 : 0.8,
        textDecorationColor: isImmersive ? 'hsl(0 0% 100% / 0.3)' : 'hsl(var(--foreground) / 0.3)',
        textDecorationThickness: '1px',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = isImmersive ? '0.85' : '1'; }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = isImmersive ? '0.6' : '0.8'; }}
    >
      {t('header.shared_space')}
    </button>
  );
}
