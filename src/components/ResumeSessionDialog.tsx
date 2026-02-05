 import { motion, AnimatePresence } from 'framer-motion';
 import { Button } from '@/components/ui/button';
 import { ArrowRight, Home } from 'lucide-react';
 
 interface ResumeSessionDialogProps {
   isOpen: boolean;
   categoryName: string;
   cardTitle: string;
   stepName: string;
   onResume: () => void;
   onBackToCategories: () => void;
 }
 
 export default function ResumeSessionDialog({
   isOpen,
   categoryName,
   cardTitle,
   stepName,
   onResume,
   onBackToCategories,
 }: ResumeSessionDialogProps) {
   if (!isOpen) return null;
 
   return (
     <AnimatePresence>
       <motion.div
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         exit={{ opacity: 0 }}
         className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm"
       >
         <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           exit={{ opacity: 0, scale: 0.95, y: 20 }}
           transition={{ duration: 0.3 }}
           className="w-full max-w-md bg-card rounded-2xl shadow-xl border border-border p-8"
         >
           <div className="text-center mb-8">
             <h2 className="text-2xl font-serif text-foreground mb-3">
               Välkommen tillbaka
             </h2>
             <p className="text-gentle text-sm leading-relaxed">
               Ni pausade mitt i ett samtal. Vill ni fortsätta där ni slutade?
             </p>
           </div>
 
           <div className="bg-muted/50 rounded-xl p-4 mb-8">
             <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
               Senaste samtalet
             </p>
             <p className="font-serif text-lg text-foreground mb-1">{cardTitle}</p>
             <p className="text-sm text-gentle">
               {categoryName} • {stepName}
             </p>
           </div>
 
           <div className="space-y-3">
             <Button
               onClick={onResume}
               className="w-full h-12 gap-2"
               size="lg"
             >
               Fortsätt där ni slutade
               <ArrowRight className="w-4 h-4" />
             </Button>
             <Button
               onClick={onBackToCategories}
               variant="ghost"
               className="w-full h-12 gap-2 text-muted-foreground hover:text-foreground"
               size="lg"
             >
               <Home className="w-4 h-4" />
               Tillbaka till kategorier
             </Button>
           </div>
         </motion.div>
       </motion.div>
     </AnimatePresence>
   );
 }