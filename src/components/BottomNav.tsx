import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { House, BookOpen } from 'lucide-react';
import { MIDNIGHT_INK, BONKI_ORANGE, DRIFTWOOD } from '@/lib/palette';
import { useApp } from '@/contexts/AppContext';

/** Two small circles leaning toward each other — Still Us icon */
function StillUsIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <circle cx="9" cy="12" r="4.5" />
      <circle cx="15" cy="12" r="4.5" />
    </svg>
  );
}

type NavItem = {
  id: string;
  label: string;
  icon?: typeof House;
  customIcon?: React.FC<{ style?: React.CSSProperties }>;
  path: string;
  match: (pathname: string, search: string) => boolean;
};

const items: NavItem[] = [
  {
    id: 'library',
    label: 'Biblioteket',
    icon: House,
    path: '/',
    match: (p, s) => {
      // Only root library page (not product home screens)
      if (p === '/' && !s.includes('product=still-us')) return true;
      return false;
    },
  },
  {
    id: 'still-us',
    label: 'Still Us',
    customIcon: StillUsIcon,
    path: '/product/still-us',
    match: (p, _s) =>
      p === '/product/still-us' ||
      p.startsWith('/still-us') ||
      p.startsWith('/check-in') ||
      p.startsWith('/session/') ||
      p === '/share' ||
      p === '/journey' ||
      p === '/ceremony',
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
        background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
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
