import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDevState } from '@/contexts/DevStateContext';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Only render in non-production builds
const IS_DEV_BUILD =
  import.meta.env.DEV ||
  (typeof window !== 'undefined' && window.location.hostname.includes('preview'));

const DEV_STATES = [
  { value: 'solo', label: 'Solo' },
  { value: 'pairedIdle', label: 'Paired Idle' },
  { value: 'pairedActive', label: 'Paired Active' },
  { value: 'proposalIncoming', label: 'Proposal Incoming' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'completed', label: 'Completed' },
  { value: 'archiveEmpty', label: 'Archive Empty' },
  { value: 'archiveWithHistory', label: 'Archive w/ History' },
  { value: 'browse', label: 'Browse (all unlocked)' },
];

const PAGES = [
  { path: '/', label: '🏠 Home' },
  { path: '/login', label: '🔐 Login' },
  { path: '/saved', label: '💾 Saved Conversations' },
  { path: '/shared', label: '🤝 Shared Summary' },
  { path: '/category/emotional-intimacy', label: '📂 Emotional Intimacy' },
  { path: '/category/communication', label: '📂 Communication' },
  { path: '/category/daily-life', label: '📂 Daily Life' },
  { path: '/category/parenting-together', label: '📂 Parenting Together' },
  { path: '/category/individual-needs', label: '📂 Individual Needs' },
  { path: '/category/category-6', label: '📂 Category 6' },
  { path: '/category/category-7', label: '📂 Category 7' },
  { path: '/category/category-8', label: '📂 Category 8' },
  { path: '/category/category-9', label: '📂 Category 9' },
  { path: '/category/category-10', label: '📂 Category 10' },
  { path: '/card/smallest-we', label: '🃏 Card: smallest-we' },
  { path: '/card/listening-presence', label: '🃏 Card: listening-presence' },
];

export default function DevModeBadge() {
  const devState = useDevState();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  if (!IS_DEV_BUILD) return null;

  const currentDevState = devState ?? 'solo';

  function navigateTo(path: string) {
    navigate(`${path}${path.includes('?') ? '&' : '?'}devState=${currentDevState}`);
    setOpen(false);
  }

  function switchState(state: string) {
    const currentPath = location.pathname;
    navigate(`${currentPath}?devState=${state}`);
    setOpen(false);
  }

  return (
    <div className="fixed bottom-3 left-3 z-[9999] select-none">
      {open && (
        <div className="mb-2 w-64 rounded-xl overflow-hidden bg-black/80 backdrop-blur-md text-white/90 shadow-2xl border border-white/10 text-[11px] font-mono">
          <div className="px-3 py-2 text-white/40 uppercase tracking-widest text-[9px]">Dev State</div>
          {DEV_STATES.map((s) => (
            <button
              key={s.value}
              onClick={() => switchState(s.value)}
              className={`w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors ${s.value === currentDevState ? 'text-white font-bold' : 'text-white/70'}`}
            >
              {s.value === currentDevState ? '▶ ' : '  '}{s.label}
            </button>
          ))}

          <div className="border-t border-white/10 mt-1 px-3 py-2 text-white/40 uppercase tracking-widest text-[9px]">Pages</div>
          {PAGES.map((p) => (
            <button
              key={p.path}
              onClick={() => navigateTo(p.path)}
              className={`w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors ${location.pathname === p.path ? 'text-white font-bold' : 'text-white/70'}`}
            >
              {location.pathname === p.path ? '▶ ' : '  '}{p.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-black/60 text-white/80 backdrop-blur-sm hover:bg-black/80 transition-colors"
      >
        DEV MODE · {devState}
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>
    </div>
  );
}
