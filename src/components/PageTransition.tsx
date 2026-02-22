import { motion } from 'framer-motion';
import { ReactNode, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();
  const isCardRoute = location.pathname.startsWith('/card/');

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: isCardRoute ? 0.35 : 0.22,
        ease: isCardRoute ? [0.22, 1, 0.36, 1] : 'easeInOut',
      }}
      style={{ width: '100%', minHeight: '100%' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
