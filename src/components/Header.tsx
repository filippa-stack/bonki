import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import ColorPicker from '@/components/ColorPicker';
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
  const { backgroundColor, setBackgroundColor, saveStatus, lastSavedAt, saveError } = useApp();
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
    <header className="sticky top-0 z-10 bg-card border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
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
            <h1 className="font-serif text-lg text-foreground truncate">
              {title}
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          {showSaveIndicator && (
            <SaveIndicator
              status={saveStatus}
              error={saveError}
              lastSavedAt={lastSavedAt}
            />
          )}
          {showBackupManager && <BackupManager />}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/shared')}
            className="text-foreground/80 hover:text-foreground border-border/60 hover:border-border text-xs gap-1.5 font-medium"
          >
            <span className="text-sm leading-none">❤️</span>
            Vårt utrymme
          </Button>
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
                <LogOut className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="end">
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
