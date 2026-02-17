import { ArrowLeft, LogOut, Settings, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import ColorPicker from '@/components/ColorPicker';
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
  const { backgroundColor, setBackgroundColor, saveStatus, lastSavedAt, saveError, sharedSyncStatus, sharedSyncError, retrySharedSync, currentSession } = useApp();
  const { signOut } = useAuth();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-10 border-b border-primary/20 backdrop-blur-md" style={{ backgroundColor: 'hsl(var(--surface-chrome) / 0.92)' }}>
      <div className="flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={t('header.go_back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <img
            src={bonkiLogo}
            alt="Still Us"
            className="h-8 w-8 object-contain cursor-pointer"
            onClick={() => navigate('/')}
          />
          {title && (
            <h1 className="font-serif text-lg text-slate-800 truncate">
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
          {!currentSession && (
            <button
              onClick={() => navigate('/shared')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/15 hover:bg-primary/25 text-primary text-xs font-medium transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              {t('header.shared_space')}
            </button>
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
            <PopoverContent className="w-52 p-2 space-y-1" align="end">
              <LeaveCoupleSpace />
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
