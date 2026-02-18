import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BEAT_2, EASE } from '@/lib/motion';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Presentational-only component — no async effects.
 * Detection is handled by useNewChapterDetector in Home.
 */
export default function NewChapterBanner({ visible, onDismiss }: Props) {
  const navigate = useNavigate();

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
              Ett nytt kapitel startades.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Din partner skapade ett nytt utrymme. Ni fortsätter där.
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
                  navigate('/', { replace: true });
                }}
              >
                Gå till hem
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
