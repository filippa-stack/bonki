import { useState } from 'react';
import { LogOut, Plus, Settings, Users, User, ChevronRight, Heart } from 'lucide-react';
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
import SyncStatus from '@/components/SyncStatus';
import BackupManager from '@/components/BackupManager';
import LeaveCoupleSpace from '@/components/LeaveCoupleSpace';
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
}

export default function Header({
  title,
  showBack = false,
  backTo,
  showBackgroundPicker = false,
  showSaveIndicator = true,
  showBackupManager = true,
}: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { backgroundColor, setBackgroundColor, saveStatus, lastSavedAt, saveError, sharedSyncStatus, sharedSyncError, retrySharedSync, switchToNewSpace } = useApp();
  const normalizedSession = useNormalizedSessionContext();
  const hasActiveSession = !normalizedSession.loading && !!normalizedSession.sessionId;
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-primary/20 backdrop-blur-md" style={{ backgroundColor: 'hsl(var(--surface-chrome) / 0.92)' }}>
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-2">
          <img
            src={bonkiLogo}
            alt="Still Us"
            className="h-8 w-8 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
          {title && (
            <h1 className="font-serif text-lg text-foreground truncate">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {showSaveIndicator && (
            <div className="flex items-center gap-2 min-h-[20px]">
              {sharedSyncStatus !== 'error' && !(sharedSyncStatus === 'syncing') && (
                <SaveIndicator
                  status={saveStatus}
                  error={saveError}
                  lastSavedAt={lastSavedAt}
                />
              )}
              <SyncStatus
                status={sharedSyncStatus}
                error={sharedSyncError}
                onRetry={retrySharedSync}
              />
            </div>
          )}
          {showBackupManager && <BackupManager />}
          {/* DOUBLE-GUARD (intentional): Hiding this link during an active session is the first layer
              of "sacred session" enforcement. The second layer is ActiveSessionGuard, which redirects
              disallowed routes. Both exist deliberately — this prevents casual discovery of navigation
              escape routes, while the guard catches direct URLs and browser back/forward. */}
          {!hasActiveSession && (
            <SharedSpaceLink />
          )}
          {showBackgroundPicker && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">{t('header.background')}</span>
              <ColorPicker
                currentColor={backgroundColor}
                onColorChange={setBackgroundColor}
              />
            </div>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Settings className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 space-y-1" align="end">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Skapa nytt utrymme
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif">Skapa ett nytt utrymme?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Du får ett nytt gemensamt utrymme. Er tidigare historik följer inte med.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
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
                      Skapa nytt utrymme
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <RelationSubMenu />

              <div className="border-t border-border/40 my-1" />

              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('header.sign_out')}
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}

function RelationSubMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between text-xs gap-1.5"
        onClick={() => setOpen(v => !v)}
      >
        <span className="flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5" />
          Relation
        </span>
        <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${open ? 'rotate-90' : ''}`} />
      </Button>

      {open && (
        <div className="ml-4 mt-1 border-l border-border/30 pl-3 space-y-1">
          <LeaveCoupleSpace />
        </div>
      )}
    </div>
  );
}

function SharedSpaceLink() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { displayMemberCount } = useCoupleSpaceContext();
  const isSolo = displayMemberCount < 2;
  const Icon = isSolo ? User : Users;

  return (
    <button
      onClick={() => navigate('/shared')}
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/15 hover:bg-primary/25 text-primary text-xs font-medium transition-colors"
    >
      <Icon className="w-3.5 h-3.5" />
      {isSolo ? 'Ditt utrymme' : t('header.shared_space')}
    </button>
  );
}
