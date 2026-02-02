import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import ColorPicker from '@/components/ColorPicker';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backTo?: string;
  showBackgroundPicker?: boolean;
}

export default function Header({ title, showBack = false, backTo, showBackgroundPicker = false }: HeaderProps) {
  const navigate = useNavigate();
  const { backgroundColor, setBackgroundColor } = useApp();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-divider">
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
        {showBackgroundPicker && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Bakgrund</span>
            <ColorPicker
              currentColor={backgroundColor}
              onColorChange={setBackgroundColor}
            />
          </div>
        )}
      </div>
    </header>
  );
}
