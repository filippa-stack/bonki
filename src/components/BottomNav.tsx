import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Home, BookOpen, MessageCircle } from 'lucide-react';
import { useCurrentProduct } from '@/hooks/useCurrentProduct';
import { useMemo } from 'react';
import { getCategoryById } from '@/data/content';

type NavItem = {
  id: string;
  label: string;
  icon: typeof LayoutGrid;
  path: string;
  match: (pathname: string) => boolean;
};

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const product = useCurrentProduct();

  // Detect Still Us context from route
  const isStillUsContext = useMemo(() => {
    if (product) return false;
    // On legacy home with devState
    if (pathname === '/' && search.includes('devState=')) return true;
    // On a Still Us card (cards not in allProducts)
    const cardMatch = pathname.match(/^\/card\/([^/]+)/);
    if (cardMatch) return true;
    // On a Still Us category
    const catMatch = pathname.match(/^\/category\/([^/]+)/);
    if (catMatch) {
      const cat = getCategoryById(catMatch[1]);
      return !!cat; // Still Us categories are in content.ts
    }
    // On /shared
    if (pathname.startsWith('/shared')) return true;
    return false;
  }, [product, pathname, search]);

  const isChildProduct = product?.pronounMode === 'du';

  const productHomePath = product
    ? `/product/${product.slug}`
    : isStillUsContext
      ? '/?devState=solo'
      : '/';

  const productHomeLabel = product?.name ?? (isStillUsContext ? 'Still Us' : 'Produkt');

  const items: NavItem[] = [
    {
      id: 'library',
      label: 'Biblioteket',
      icon: LayoutGrid,
      path: '/',
      match: (p) => p === '/' && !search.includes('devState='),
    },
    {
      id: 'product-home',
      label: productHomeLabel,
      icon: Home,
      path: productHomePath,
      match: (p) =>
        (!!product && p.startsWith(`/product/${product.slug}`)) ||
        (isStillUsContext && p === '/' && search.includes('devState=')),
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
          backgroundColor: 'hsla(var(--background) / 0.65)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
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
                    strokeWidth: 1.5,
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
