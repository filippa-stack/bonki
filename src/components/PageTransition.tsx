import { motion } from 'framer-motion';
import { ReactNode, forwardRef } from 'react';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, className }, ref) => {
    const location = useLocation();
    const isCardRoute = location.pathname.startsWith('/card/');

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onAnimationComplete={(definition) => {
          if (definition === 'animate') window.scrollTo(0, 0);
        }}
        transition={{
          duration: isCardRoute ? 0.35 : 0.22,
          ease: isCardRoute ? [0.22, 1, 0.36, 1] : 'easeInOut',
        }}
        style={{ width: '100%', minHeight: '100vh' }}
        className={`page-transition ${className || ''}`}
      >
        {children}
      </motion.div>
    );
  }
);

PageTransition.displayName = 'PageTransition';

export default PageTransition;
