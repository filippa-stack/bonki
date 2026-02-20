import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface ReturnOverlayProps {
  onResume: () => void;
  onStartNew: () => void;
  onBrowse: () => void;
}

export default function ReturnOverlay({ onResume, onStartNew, onBrowse }: ReturnOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-6"
    >
      <div className="text-center max-w-sm space-y-6">
        <h2 className="text-xl font-serif text-foreground">
          Vill ni ta upp tråden igen?
        </h2>
          <div className="flex flex-col items-center space-y-3 pt-2">
            <button className="cta-primary" onClick={onResume}>
              Fortsätt där vi var
            </button>
            <button className="cta-primary" style={{ backgroundColor: 'transparent', color: 'var(--color-text-primary)', border: '1px solid hsl(var(--border))' }} onClick={onStartNew}>
              Börja något nytt
            </button>
          </div>
        <button
          onClick={onBrowse}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Bläddra bland kort
        </button>
      </div>
    </motion.div>
  );
}
