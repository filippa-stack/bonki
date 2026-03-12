import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Home, BookOpen, MessageCircle } from 'lucide-react';
import { useCurrentProduct } from '@/hooks/useCurrentProduct';

type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutGrid;
  path: string;
  match: (pathname: string) => boolean;
};

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const product = useCurrentProduct();

  const isChildProduct = product?.pronounMode === 'du';

  const items: NavItem[] = [
    {
      id: 'library',
      label: 'Biblioteket',
      icon: LayoutGrid,
      path: '/',
      match: (p) => p === '/' || p === '',
    },
    {
      id: 'product-home',
      label: product?.name ?? 'Produkt',
      icon: Home,
      path: product ? `/product/${product.slug}` : '/',
      match: (p) => !!product && p.startsWith(`/product/${product.slug}`),
    },
    {
      id: 'contextual',
      label: isChildProduct ? 'Dagbok' : 'Era samtal',
      icon: isChildProduct ? BookOpen : MessageCircle,
      path: isChildProduct && product ? `/diary/${product.id}` : '/shared',
      match: (p) =>
        isChildProduct
          ? p.startsWith('/diary')
          : p.startsWith('/shared'),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{
        backgroundColor: 'hsl(var(--background) / 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'hsl(var(--border))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch justify-around" style={{ height: '56px' }}>
        {items.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors"
              style={{
                color: active
                  ? 'hsl(var(--primary))'
                  : 'hsl(var(--muted-foreground))',
                opacity: active ? 1 : 0.6,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {active && (
                <motion.span
                  layoutId="bottomnav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                  style={{
                    width: '24px',
                    height: '2.5px',
                    borderRadius: '2px',
                    backgroundColor: 'hsl(var(--primary))',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon style={{ width: '20px', height: '20px' }} />
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: active ? 600 : 500,
                  letterSpacing: '0.01em',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
