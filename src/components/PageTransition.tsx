import { ReactNode, forwardRef } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const PageTransition = forwardRef<HTMLDivElement, PageTransitionProps>(
  ({ children, className }, ref) => (
    <div ref={ref} style={{ width: '100%', minHeight: '100vh' }} className={className || ''}>
      {children}
    </div>
  )
);

PageTransition.displayName = 'PageTransition';
export default PageTransition;
