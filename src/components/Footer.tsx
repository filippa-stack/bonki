import { useTranslation } from 'react-i18next';
import bonkiLogo from '@/assets/bonki-logo.png';

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t border-primary/20 px-6 py-6"
      style={{ backgroundColor: 'hsl(var(--surface-chrome))' }}
    >
      <div className="flex flex-col items-center gap-3">
        <img src={bonkiLogo} alt="Still Us" className="h-6 w-6 object-contain opacity-60" />
        <p className="text-xs text-muted-foreground">
          © {year} Still Us
        </p>
      </div>
    </footer>
  );
}
