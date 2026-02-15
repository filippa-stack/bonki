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
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 px-6"
    >
      <div className="text-center max-w-sm space-y-6">
        <h2 className="text-xl font-serif text-foreground">
          Vill ni ta upp tråden igen?
        </h2>
        <div className="space-y-3 pt-2">
          <Button size="lg" className="w-full gap-2" onClick={onResume}>
            Fortsätt där vi var
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={onStartNew}>
            Börja något nytt
          </Button>
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
