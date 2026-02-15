import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';

interface ProposalSheetProps {
  open: boolean;
  onClose: () => void;
  cardTitle: string;
  categoryTitle: string;
  onSend: (message?: string) => Promise<void>;
}

export default function ProposalSheet({
  open,
  onClose,
  cardTitle,
  categoryTitle,
  onSend,
}: ProposalSheetProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      await onSend(message.trim() || undefined);
      setMessage('');
      onClose();
    } finally {
      setSending(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <div className="mx-auto w-full max-w-md px-6 pb-8">
          <DrawerHeader className="text-center px-0">
            <DrawerTitle className="font-serif text-lg text-foreground">
              Föreslå det här samtalet
            </DrawerTitle>
            <DrawerDescription className="text-sm text-muted-foreground mt-2">
              Ett förslag som din partner kan välja att ta upp — när det passar.
            </DrawerDescription>
          </DrawerHeader>

          {/* Card preview */}
          <div className="rounded-xl bg-muted/30 p-4 space-y-1 mb-6">
            <p className="font-serif text-base text-foreground">{cardTitle}</p>
            <p className="text-xs text-muted-foreground/60">{categoryTitle}</p>
          </div>

          {/* Optional message */}
          <div className="space-y-2 mb-6">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Vill du skriva något till din partner?"
              className="w-full min-h-[80px] px-4 py-3 rounded-xl bg-background border border-border/30 resize-none focus:outline-none focus:ring-0 focus:border-primary/20 font-sans text-sm text-foreground placeholder:text-muted-foreground/30 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleSend}
              disabled={sending}
              className="w-full gap-2 h-12 rounded-xl"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Skickar...' : 'Skicka förslag'}
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full text-muted-foreground"
            >
              Avbryt
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
