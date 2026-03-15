import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { House, MessageCircle } from 'lucide-react';
import { MIDNIGHT_INK, LANTERN_GLOW, DRIFTWOOD } from '@/lib/palette';

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
    icon: House,
    path: '/',
    match: (p, s) => !p.startsWith('/shared') && !p.startsWith('/diary'),
  },
  {
    id: 'journal',
    label: 'Era samtal',
    icon: MessageCircle,
    path: '/shared',
    match: (p) => p.startsWith('/shared') || p.startsWith('/diary'),
  },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  // Hide during card sessions (threshold → completion)
  if (pathname.startsWith('/card/')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div style={{ backgroundColor: MIDNIGHT_INK }}>
        <div className="flex items-stretch justify-around" style={{ height: '56px' }}>
          {items.map((item) => {
            const active = item.match(pathname, search);
            const Icon = item.icon;
            const color = active ? LANTERN_GLOW : DRIFTWOOD;

            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
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
                <Icon
                  style={{
                    width: '22px',
                    height: '22px',
                    strokeWidth: 1.5,
                  }}
                />
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
