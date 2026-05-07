import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { House, LayoutGrid, BookOpen } from 'lucide-react';
import { BONKI_ORANGE } from '@/lib/palette';

type NavItem = {
  id: string;
  label: string;
  icon: typeof House;
  path: string;
  match: (pathname: string, search: string) => boolean;
};

const items: NavItem[] = [
  {
    id: 'library',
    label: 'Biblioteket',
    icon: LayoutGrid,
    path: '/',
    match: (p, s) => {
      if (p === '/' && !s.includes('product=still-us')) return true;
      return false;
    },
  },
  {
    id: 'hem',
    label: 'Hem',
    icon: House,
    path: '/',
    match: (p, _s) => {
      if (p.startsWith('/product/')) return true;
      if (p.startsWith('/still-us/')) return true;
      if (p.startsWith('/preview/')) return true;
      if (p.startsWith('/category/')) return true;
      return false;
    },
  },
  {
    id: 'journal',
    label: 'Era samtal',
    icon: BookOpen,
    path: '/journal',
    match: (p) => p.startsWith('/journal') || p.startsWith('/diary'),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  // Hide during active sessions (card sessions, Still Us sessions)
  // Show on /card/ when viewing archive or completed session
  const params = new URLSearchParams(search);
  const isOnboarding = params.get('devState') === 'onboarding';
  if (isOnboarding) return null;
  if (pathname === '/onboarding-mock') return null;
  const isCardArchiveOrComplete = params.get('from') === 'archive' || params.get('view') === 'completed';
  if (pathname.startsWith('/card/') && !isCardArchiveOrComplete) return null;
  if (pathname.startsWith('/check-in/')) return null;
  if (pathname.startsWith('/session/')) return null;
  if (pathname === '/share') return null;
  if (pathname === '/tier2-setup') return null;
  if (pathname === '/format-preview') return null;
  if (pathname.startsWith('/solo-reflect/')) return null;
  if (pathname === '/ceremony') return null;
  if (pathname === '/journey-preview') return null;
  // Show bottom nav on /unlock so user doesn't feel trapped
  if (pathname.startsWith('/settings/')) return null;

  return (
    <nav
      className="z-40"
      style={{
        position: 'fixed',
        bottom: '0px',
        left: '0px',
        right: '0px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(26, 26, 46, 0.92)',
        borderTop: '1px solid rgba(245, 232, 204, 0.10)',
        boxShadow: 'none',
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
      }}
    >
      <div className="flex items-stretch justify-around" style={{ paddingTop: 8, paddingBottom: 12 }}>
        {items.map((item) => {
          const active = item.match(pathname, search);
          const Icon = item.icon;
          const color = active ? BONKI_ORANGE : 'rgba(245, 232, 204, 0.55)';

          return (
            <motion.button
              key={item.id}
              onClick={() => {
                if (item.id === 'library') {
                  sessionStorage.setItem('bonki-navigating-to-library', '1');
                  navigate('/');
                  return;
                }
                if (item.id === 'hem') {
                  let productSlug: string | null = null;
                  const productMatch = pathname.match(/^\/product\/([^/]+)/);
                  if (productMatch) productSlug = productMatch[1];
                  else if (pathname.startsWith('/still-us/')) productSlug = 'still-us';
                  else if (pathname.startsWith('/category/')) productSlug = localStorage.getItem('bonki-last-active-product');
                  else if (pathname.startsWith('/preview/')) productSlug = localStorage.getItem('bonki-last-active-product');
                  if (!productSlug) productSlug = localStorage.getItem('bonki-last-active-product');
                  if (!productSlug) { navigate('/'); return; }
                  navigate(`/product/${productSlug}`);
                  return;
                }
                navigate(item.path);
              }}
              whileTap={{ scale: 0.97, opacity: 0.7 }}
              transition={{ duration: 0.1 }}
              className="relative flex flex-1 flex-col items-center justify-center"
              style={{
                color,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                gap: '3px',
                minHeight: 44,
              }}
            >
              <Icon
                style={{
                  width: '20px',
                  height: '20px',
                  strokeWidth: active ? 2 : 1.5,
                }}
              />
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '10px',
                  fontWeight: active ? 500 : 400,
                  letterSpacing: '0.02em',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

