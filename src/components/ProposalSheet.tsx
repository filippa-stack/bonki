import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { BEAT_1, BEAT_2, BEAT_3, EASE } from '@/lib/motion';
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
          {/* Title — entrance baseline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: BEAT_3, ease: EASE }}
          >
            <DrawerHeader className="text-center px-0">
              <DrawerTitle className="font-serif text-lg text-foreground">
                Föreslå det här samtalet
              </DrawerTitle>
            </DrawerHeader>
          </motion.div>

          {/* Description + card preview — BEAT_1 after title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_1, duration: BEAT_3, ease: EASE }}
            className="space-y-4"
          >
            <DrawerDescription className="text-sm text-muted-foreground text-center -mt-2">
              Ett förslag som din partner kan välja att ta upp — när det passar.
            </DrawerDescription>

            <div className="rounded-xl bg-muted/30 p-4 space-y-1">
              <p className="font-serif text-base text-foreground">{cardTitle}</p>
              <p className="text-xs text-muted-foreground/60">{categoryTitle}</p>
            </div>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Vill du skriva något till din partner?"
              className="w-full min-h-[80px] px-4 py-3 rounded-xl bg-background border border-border/30 resize-none focus:outline-none focus:ring-0 focus:border-primary/20 font-sans text-sm text-foreground placeholder:text-muted-foreground/30 leading-relaxed"
            />
          </motion.div>

          {/* Buttons — BEAT_2 after description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: BEAT_2, duration: BEAT_3, ease: EASE }}
            className="space-y-3 mt-6"
          >
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
          </motion.div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
