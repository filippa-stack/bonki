import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { X, RotateCcw, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import StepReflection from '@/components/StepReflection';
import CardTakeaways from '@/components/CardTakeaways';
import type { Card } from '@/types';

const STEP_ORDER = ['opening', 'reflective', 'scenario', 'exercise'] as const;
const STEP_LABELS: Record<string, string> = {
  opening: 'Öppnare',
  reflective: 'Tankeväckare',
  scenario: 'Scenario',
  exercise: 'Team Work',
};

interface ReviewDrawerProps {
  open: boolean;
  onClose: () => void;
  card: Card;
}

export default function ReviewDrawer({ open, onClose, card }: ReviewDrawerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-divider pb-4">
          <div className="flex items-center justify-between">
            <DrawerTitle className="font-serif text-lg text-foreground">
              {t('review_drawer.title', 'Granska & redigera')}
            </DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <X className="w-4 h-4" />
              </Button>
            </DrawerClose>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('review_drawer.hint', 'Läs tillbaka och redigera era anteckningar. Ingenting här påverkar ert gemensamma steg.')}
          </p>
        </DrawerHeader>

        <ScrollArea className="flex-1 overflow-y-auto px-6 py-4" style={{ maxHeight: 'calc(85vh - 100px)' }}>
          <div className="space-y-8 pb-8">
            {STEP_ORDER.map((stepType, index) => {
              const section = card.sections.find((s) => s.type === stepType);
              if (!section) return null;

              return (
                <motion.div
                  key={stepType}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="space-y-3"
                >
                  {/* Step header */}
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                      {index + 1}
                    </div>
                    <h3 className="font-serif text-base text-foreground">
                      {STEP_LABELS[stepType]}
                    </h3>
                  </div>

                  {/* Read-only content */}
                  <div className="pl-9 space-y-2">
                    {section.content && (
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {section.content}
                      </p>
                    )}
                    {section.prompts && section.prompts.length > 0 && (
                      <ul className="space-y-1.5">
                        {section.prompts.map((prompt, pi) => (
                          <li key={pi} className="text-sm text-foreground/80 leading-relaxed">
                            {typeof prompt === 'string' ? prompt : prompt.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Per-step reflection inline */}
                  <div className="pl-9">
                    <StepReflection section={section} card={card} defaultExpanded={false} />
                  </div>
                </motion.div>
              );
            })}

            {/* Takeaways */}
            <div className="border-t border-divider pt-6">
              <CardTakeaways cardId={card.id} compact />
              <p className="text-xs text-muted-foreground/50 italic text-center mt-3">
                Det här påverkar inte er takt.
              </p>
            </div>

            {/* Revisit earlier steps */}
            <div className="border-t border-divider pt-6 space-y-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">
                Återbesök tidigare steg
              </p>
              <div className="grid grid-cols-2 gap-2">
                {STEP_ORDER.map((stepType, idx) => (
                  <Button
                    key={stepType}
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs justify-start"
                    onClick={() => {
                      onClose();
                      navigate(`/card/${card.id}?revisit=true&step=${idx}`);
                    }}
                  >
                    <ArrowRight className="w-3 h-3" />
                    {STEP_LABELS[stepType]}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground/50 italic text-center">
                Det här påverkar inte ert gemensamma tempo.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
}
