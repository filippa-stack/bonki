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
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Subtle top edge — replaces hard border */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 8%, hsl(var(--border) / 0.35) 30%, hsl(var(--border) / 0.35) 70%, transparent 92%)',
        }}
      />

      <div
        style={{
          backgroundColor: 'hsl(var(--background) / 0.82)',
          backdropFilter: 'saturate(1.4) blur(24px)',
          WebkitBackdropFilter: 'saturate(1.4) blur(24px)',
        }}
      >
        <div className="flex items-stretch justify-around" style={{ height: '48px' }}>
          {items.map((item) => {
            const active = item.match(pathname);
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.1 }}
                className="relative flex flex-1 flex-col items-center justify-center gap-[3px]"
                style={{
                  color: active
                    ? 'hsl(var(--foreground))'
                    : 'hsl(var(--muted-foreground))',
                  opacity: active ? 0.85 : 0.38,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  transition: 'opacity 300ms ease',
                }}
              >
                <Icon
                  style={{
                    width: '18px',
                    height: '18px',
                    strokeWidth: active ? 1.8 : 1.4,
                  }}
                />
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '9px',
                    fontWeight: active ? 600 : 400,
                    letterSpacing: '0.04em',
                    lineHeight: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
