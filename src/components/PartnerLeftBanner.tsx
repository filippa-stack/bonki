import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BEAT_2, EASE } from '@/lib/motion';

interface Props {
  eventType?: string | null;
  visible: boolean;
  onDismiss: () => void;
  onInvite: () => void;
}

/**
 * Presentational-only component — no async effects.
 * Detection is handled by usePartnerLeftDetector in Home.
 */
export default function PartnerLeftBanner({ eventType, visible, onDismiss, onInvite }: Props) {
  const isSwitched = eventType === 'partner_switched';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: BEAT_2, ease: EASE }}
          className="overflow-hidden mx-6"
        >
          <div className="rounded-[20px] border border-border bg-card p-6 space-y-3 shadow-[0_1px_4px_0_hsl(0_0%_0%/0.04)]">
            <p className="font-serif text-foreground text-base">
              {isSwitched ? 'Kopplingen avslutades.' : 'Det här utrymmet är nu bara ditt.'}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isSwitched
                ? 'Din partner har bytt utrymme. Du kan fortsätta här själv eller bjuda in någon ny.'
                : 'Din partner har lämnat. Du kan fortsätta själv eller bjuda in någon ny.'}
            </p>
            <div className="flex gap-3 pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 text-muted-foreground"
                onClick={onDismiss}
              >
                Stäng
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => {
                  onDismiss();
                  onInvite();
                }}
              >
                Bjud in partner
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
