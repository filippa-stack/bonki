import { motion } from 'framer-motion';
import { ReactNode, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const doorwayVariants = {
  initial: { opacity: 0, scale: 0.97, transformOrigin: 'center top' },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
};

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export default function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();
  const isCardRoute = location.pathname.startsWith('/card/');

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const variants = isCardRoute ? doorwayVariants : fadeVariants;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={{ duration: isCardRoute ? 0.3 : 0.15, ease: [0.4, 0.0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
