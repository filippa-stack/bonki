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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="my-6 py-6 px-6 text-center max-w-sm mx-auto space-y-4"
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
          Vidare
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          onClick={onStop}
          variant="outline"
          size="lg"
          className="w-full gap-2"
        >
          <Home className="w-4 h-4" />
          Stanna här
        </Button>
      </div>
    </motion.div>
  );
}
