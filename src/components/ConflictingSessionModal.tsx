import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ConflictingSessionModalProps {
  open: boolean;
  onClose: () => void;
  currentSessionCardTitle: string;
  currentSessionCardId: string;
  onSwitchToThisCard?: () => void; // kept for API compat but no longer shown
}

export default function ConflictingSessionModal({
  open,
  onClose,
  currentSessionCardTitle,
  currentSessionCardId,
  onSwitchToThisCard,
}: ConflictingSessionModalProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">
            Ni är mitt i ett annat samtal
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed mt-2">
            Ni håller just nu på med:
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-xl bg-card border border-border my-2">
          <p className="text-sm font-medium text-foreground">
            {currentSessionCardTitle}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <Button
            onClick={() => {
              onClose();
              navigate(`/card/${currentSessionCardId}`);
            }}
            className="w-full gap-2 justify-start"
          >
            <ArrowRight className="w-4 h-4" />
            Gå till pågående samtalet
          </Button>

          <Button
            onClick={onClose}
            variant="ghost"
            className="w-full gap-2 justify-start text-muted-foreground"
          >
            <X className="w-4 h-4" />
            Avbryt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
