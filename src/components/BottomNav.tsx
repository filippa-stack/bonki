import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { House, LayoutGrid, BookOpen } from 'lucide-react';
import { MIDNIGHT_INK, BONKI_ORANGE, DRIFTWOOD } from '@/lib/palette';
import { isDemoMode } from '@/lib/demoMode';
import { useApp } from '@/contexts/AppContext';

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
  const { hasCompletedOnboarding } = useApp();

  // Hide during onboarding (mirror Index.tsx bypass logic)
  const demoActive = isDemoMode();
  const devBypass = new URLSearchParams(search).get('devState');
  if (!hasCompletedOnboarding && !demoActive && !devBypass) return null;

  // Hide during active sessions (card sessions, Still Us sessions)
  // Show on /card/ when viewing archive or completed session
  const params = new URLSearchParams(search);
  const isOnboarding = params.get('devState') === 'onboarding';
  if (isOnboarding) return null;
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
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: 'none',
        boxShadow: 'none',
      }}
    >
      <div style={{ background: 'transparent' }}>
        <div className="flex items-stretch justify-around" style={{ height: '56px' }}>
          {items.map((item) => {
            const active = item.match(pathname, search);
            const Icon = item.icon;
            const color = active ? BONKI_ORANGE : '#FDF6E3';

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  if (item.id === 'library') {
                    localStorage.removeItem('bonki-last-active-product');
                  }
                  navigate(item.path);
                }}
                whileTap={{ scale: 0.92 }}
                transition={{ duration: 0.1 }}
                className="relative flex flex-1 flex-col items-center justify-center"
                style={{
                  color,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                  gap: '2px',
                }}
              >
                {item.customIcon ? (
                  <item.customIcon
                    style={{
                      width: '22px',
                      height: '22px',
                    }}
                  />
                ) : Icon ? (
                  <Icon
                    style={{
                      width: '22px',
                      height: '22px',
                      strokeWidth: 1.5,
                    }}
                  />
                ) : null}
                <span
                  style={{
                    fontSize: '10px',
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
