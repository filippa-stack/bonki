import { useTranslation } from 'react-i18next';
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
import { Button } from '@/components/ui/button';
import { Pause } from 'lucide-react';

interface PauseDialogProps {
  onConfirm: () => void;
}

export default function PauseDialog({ onConfirm }: PauseDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
          <Pause className="w-4 h-4" />
          {t('general.pause_for_now')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl">
            {t('general.pause_title')}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm leading-relaxed text-gentle">
            {t('general.pause_closing_text')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('general.pause_cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {t('general.pause_confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
