import { motion } from 'framer-motion';
import { ReactNode, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PAGE, EASE } from '@/lib/motion';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/* Card/conversation routes scale in from slightly above (1.02 → 1.0) */
const cardEnterVariants = {
  initial: { opacity: 0, scale: 1.02, transformOrigin: 'center top' },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

/* Non-card routes use a subtle fade; exit scales down when yielding to a card */
const defaultVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export default function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();
  const isCardRoute = location.pathname.startsWith('/card/');

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const variants = isCardRoute ? cardEnterVariants : defaultVariants;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{
        duration: PAGE,
        ease: [...EASE],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
