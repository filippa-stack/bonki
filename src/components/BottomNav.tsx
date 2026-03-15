import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Home, BookOpen, MessageCircle, User } from 'lucide-react';
import { useCurrentProduct } from '@/hooks/useCurrentProduct';
import { useMemo, useEffect } from 'react';
import { getCategoryById } from '@/data/content';
import { allProducts } from '@/data/products';

const LAST_PRODUCT_KEY = 'bonki_last_product_slug';

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

  // Persist last visited product
  useEffect(() => {
    if (product) {
      try { localStorage.setItem(LAST_PRODUCT_KEY, product.slug); } catch {}
    }
  }, [product]);

  // Detect Still Us context from route
  const isStillUsContext = useMemo(() => {
    if (product) return false;
    if (pathname.startsWith('/product/still-us')) return true;
    if (pathname === '/' && (search.includes('devState=') || search.includes('product=still-us'))) return true;
    const cardMatch = pathname.match(/^\/card\/([^/]+)/);
    if (cardMatch) return true;
    const catMatch = pathname.match(/^\/category\/([^/]+)/);
    if (catMatch) {
      const cat = getCategoryById(catMatch[1]);
      return !!cat;
    }
    if (pathname.startsWith('/shared')) return true;
    return false;
  }, [product, pathname, search]);

  const isChildProduct = product?.pronounMode === 'du';

  // Resolve last product from localStorage when no current product context
  const lastProduct = useMemo(() => {
    if (product || isStillUsContext) return null;
    try {
      const slug = localStorage.getItem(LAST_PRODUCT_KEY);
      if (!slug) return null;
      return allProducts.find(p => p.slug === slug) ?? null;
    } catch {
      return null;
    }
  }, [product, isStillUsContext]);

  const productHomePath = product
    ? `/product/${product.slug}`
    : isStillUsContext
      ? '/?devState=solo'
      : lastProduct
        ? `/product/${lastProduct.slug}`
        : null;

  const productHomeLabel = product?.name
    ?? (isStillUsContext ? 'Still Us' : lastProduct?.name ?? null);

  // On the library page with no product context
  const isOnLibrary = pathname === '/' && !search.includes('devState=');
  const isInsideProduct = !!product || isStillUsContext;

  // Build items based on context
  const items: NavItem[] = useMemo(() => {
    if (isInsideProduct) {
      // Inside a product: Biblioteket | Product | Dagbok/Era samtal
      const result: NavItem[] = [
        {
          id: 'library',
          label: 'Biblioteket',
          icon: LayoutGrid,
          path: '/',
          match: (p) => p === '/' && !search.includes('devState='),
        },
      ];

      if (productHomePath && productHomeLabel) {
        result.push({
          id: 'product-home',
          label: productHomeLabel,
          icon: Home,
          path: productHomePath,
          match: (p: string) =>
            (!!product && p.startsWith(`/product/${product.slug}`)) ||
            (isStillUsContext && p === '/' && search.includes('devState=')) ||
            (!product && !isStillUsContext && !!lastProduct && p.startsWith(`/product/${lastProduct.slug}`)),
        });
      }

      result.push({
        id: 'contextual',
        label: isChildProduct ? 'Dagbok' : 'Era samtal',
        icon: isChildProduct ? BookOpen : MessageCircle,
        path: isChildProduct && product ? `/diary/${product.id}` : '/shared',
        match: (p: string) =>
          isChildProduct ? p.startsWith('/diary') : p.startsWith('/shared'),
      });

      return result;
    }

    // Library view: Biblioteket | Dagbok | Profil
    return [
      {
        id: 'library',
        label: 'Biblioteket',
        icon: LayoutGrid,
        path: '/',
        match: (p) => p === '/' && !search.includes('devState='),
      },
      {
        id: 'diary',
        label: 'Dagbok',
        icon: BookOpen,
        path: '/diary/jag_i_mig',
        match: (p) => p.startsWith('/diary'),
      },
      {
        id: 'profile',
        label: 'Profil',
        icon: User,
        path: '/login',
        match: (p) => p === '/login',
      },
    ];
  }, [isInsideProduct, isOnLibrary, product, isStillUsContext, lastProduct, productHomePath, productHomeLabel, isChildProduct, search]);

  // Hide BottomNav during card session flow (intro + session + completion)
  const isInCardSession = pathname.startsWith('/card/');
  if (isInCardSession) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Subtle top edge */}
      <div
        style={{
          height: '1px',
          background: isStillUsContext
            ? 'linear-gradient(90deg, transparent 8%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.08) 70%, transparent 92%)'
            : 'linear-gradient(90deg, transparent 8%, hsl(var(--border) / 0.35) 30%, hsl(var(--border) / 0.35) 70%, transparent 92%)',
        }}
      />

      <div
        style={{
          backgroundColor: isStillUsContext ? '#2E2233' : 'color-mix(in srgb, var(--surface-base, hsl(var(--background))) 75%, transparent)',
          backdropFilter: isStillUsContext ? 'none' : 'blur(20px)',
          WebkitBackdropFilter: isStillUsContext ? 'none' : 'blur(20px)',
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
