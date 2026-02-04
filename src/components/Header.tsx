import { ArrowLeft, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import ColorPicker from '@/components/ColorPicker';
import SaveIndicator from '@/components/SaveIndicator';
import BackupManager from '@/components/BackupManager';
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
  showBackupManager = true
}: HeaderProps) {
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
        <div className="flex items-center">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          {title && (
            <h1 className="font-serif text-lg text-foreground ml-2 truncate">
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
          {showBackgroundPicker && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden sm:inline">Bakgrund</span>
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
                Logga ut
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
