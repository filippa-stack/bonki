import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home } from 'lucide-react';

interface StageTransitionChoiceProps {
  onContinue: () => void;
  onStop: () => void;
}

export default function StageTransitionChoice({ onContinue, onStop }: StageTransitionChoiceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="my-10 py-10 px-6 text-center max-w-sm mx-auto space-y-6"
    >
      <h2 className="text-lg font-serif text-foreground">
        Vill ni fortsätta?
      </h2>
      <div className="space-y-3 pt-2">
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full gap-2"
        >
          Ja, gå vidare
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          onClick={onStop}
          variant="outline"
          size="lg"
          className="w-full gap-2"
        >
          <Home className="w-4 h-4" />
          Vi stannar här för idag
        </Button>
      </div>
    </motion.div>
  );
}
