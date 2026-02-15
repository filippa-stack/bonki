import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Pause } from 'lucide-react';

interface PauseDialogProps {
  onConfirm: () => void;
}

export default function PauseDialog({ onConfirm }: PauseDialogProps) {
  const { t } = useTranslation();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="gap-2 text-muted-foreground"
      onClick={onConfirm}
    >
      <Pause className="w-4 h-4" />
      {t('general.pause_for_now')}
    </Button>
  );
}
