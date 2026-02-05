 import { motion } from 'framer-motion';
 import { cn } from '@/lib/utils';
 
 const STEPS = [
   { id: 'opening', label: 'Öppnare', shortLabel: 'Ö' },
   { id: 'reflective', label: 'Tankeväckare', shortLabel: 'T' },
   { id: 'scenario', label: 'Scenario', shortLabel: 'S' },
   { id: 'exercise', label: 'Teamwork', shortLabel: 'TW' },
 ];
 
 interface StepProgressIndicatorProps {
   currentStepIndex: number;
   completedSteps: number[];
   className?: string;
 }
 
 export default function StepProgressIndicator({
   currentStepIndex,
   completedSteps,
   className,
 }: StepProgressIndicatorProps) {
   return (
     <div className={cn('flex items-center justify-center gap-2 md:gap-3', className)}>
       {STEPS.map((step, index) => {
         const isCompleted = completedSteps.includes(index);
         const isCurrent = index === currentStepIndex;
         const isPast = index < currentStepIndex;
         const isFuture = index > currentStepIndex;
 
         return (
           <div key={step.id} className="flex items-center gap-2 md:gap-3">
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: index * 0.1 }}
               className="flex flex-col items-center gap-1"
             >
               {/* Step indicator circle */}
               <div
                 className={cn(
                   'w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-medium transition-all duration-300',
                   isCurrent && 'bg-primary text-primary-foreground shadow-md',
                   isCompleted && !isCurrent && 'bg-primary/20 text-primary',
                   isPast && !isCompleted && 'bg-muted text-muted-foreground',
                   isFuture && 'bg-muted/50 text-muted-foreground/50'
                 )}
               >
                 {isCompleted && !isCurrent ? (
                   <svg
                     className="w-4 h-4"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                   >
                     <path
                       strokeLinecap="round"
                       strokeLinejoin="round"
                       strokeWidth={2}
                       d="M5 13l4 4L19 7"
                     />
                   </svg>
                 ) : (
                   <span className="hidden md:block">{index + 1}</span>
                 )}
                 <span className="md:hidden">{step.shortLabel}</span>
               </div>
               {/* Step label - hidden on very small screens */}
               <span
                 className={cn(
                   'text-[10px] md:text-xs text-center max-w-[60px] md:max-w-none hidden sm:block',
                   isCurrent && 'text-primary font-medium',
                   (isPast || isCompleted) && !isCurrent && 'text-muted-foreground',
                   isFuture && 'text-muted-foreground/50'
                 )}
               >
                 {step.label}
               </span>
             </motion.div>
 
             {/* Connector line */}
             {index < STEPS.length - 1 && (
               <div
                 className={cn(
                   'w-4 md:w-8 h-0.5 transition-colors duration-300',
                   index < currentStepIndex ? 'bg-primary/40' : 'bg-muted'
                 )}
               />
             )}
           </div>
         );
       })}
     </div>
   );
 }