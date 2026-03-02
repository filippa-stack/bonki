import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDevState } from '@/contexts/DevStateContext';
import { isDevToolsEnabled } from '@/lib/devTools';
import { VALID_THEMES, VALID_SURFACES } from '@/hooks/useThemeSwitcher';
import { ChevronUp, ChevronDown } from 'lucide-react';

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
  { value: 'library', label: '📚 Product Library' },
];

const THEME_OPTIONS = [
  { value: '', label: '🌿 Default (Forest)', color: '#1E3F32' },
  { value: 'fired-earth', label: '🏺 Fired Earth', color: '#5A3214' },
  { value: 'burgundy', label: '🍷 Burgundy', color: '#5C1A2A' },
  { value: 'ink', label: '✒️ Jordat Bläck', color: '#3A2E24' },
  { value: 'stilla', label: '🌊 Stilla Djup', color: '#1E2D3F' },
  { value: 'berry', label: '🫐 Bold Berry', color: '#5C1A4A' },
  { value: 'midnight', label: '✨ Midnight Gold', color: '#1E2230' },
  { value: 'terracotta', label: '🧱 Terracotta', color: '#6B3020' },
  { value: 'umber', label: '🪵 Umber', color: '#4A3225' },
  { value: 'ochre', label: '🌾 Ochre', color: '#5C4018' },
  { value: 'olive', label: '🫒 Olive', color: '#3A4428' },
  { value: 'indigo-earth', label: '💎 Indigo Earth', color: '#282050' },
  { value: 'oxblood', label: '🩸 Oxblood', color: '#4A1218' },
  { value: 'plum', label: '🍇 Plum', color: '#3E1850' },
  { value: 'teal-noir', label: '🦚 Teal Noir', color: '#143840' },
  { value: 'deep-fig', label: '🫐 Deep Fig', color: '#3A1830' },
];

const SURFACE_OPTIONS = [
  { value: '', label: '⬜ Default' },
  { value: 'lift', label: '🔲 Lift' },
  { value: 'sculpt', label: '🏛️ Sculpt' },
  { value: 'paper', label: '📄 Paper' },
  { value: 'invite', label: '✨ Invite' },
  { value: 'invite-white', label: '⬜ Invite White' },
  { value: 'invite-ivory', label: '🥛 Invite Ivory' },
  { value: 'invite-tinted', label: '🌿 Invite Tinted' },
];

const PAGES = [
  { path: '/', label: '🏠 Home' },
  { path: '/analytics', label: '📊 Analytics Dashboard' },
  { path: '/login', label: '🔐 Login' },
  { path: '/saved', label: '💾 Saved Conversations' },
  { path: '/shared', label: '🤝 Shared Summary' },
  { path: '/shared?devState=archiveWithHistory', label: '📚 Shared w/ History' },
  { path: '/shared?devState=archiveEmpty', label: '🫙 Shared (empty)' },
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
  { path: '/product/jag-i-mig', label: '🎴 Jag i Mig' },
  { path: '/product/jag-med-andra', label: '🎴 Jag med Andra' },
  { path: '/product/jag-i-varlden', label: '🎴 Jag i Världen' },
  { path: '/product/vardagskort', label: '🎴 Vardagskort' },
  { path: '/product/syskonkort', label: '🎴 Syskonkort' },
  { path: '/product/sexualitetskort', label: '🎴 Sexualitetskort' },
];

export default function DevModeBadge() {
  const devState = useDevState();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [open, setOpen] = useState(false);

  // Hide during screenshot capture
  if (!isDevToolsEnabled() || searchParams.has('__sc_step')) return null;

  const currentDevState = devState ?? 'solo';
  const currentTheme = searchParams.get('theme') ?? '';
  const currentSurface = searchParams.get('surface') ?? '';

  function navigateTo(path: string) {
    if (path.includes('devState=')) {
      navigate(path);
    } else {
      navigate(`${path}${path.includes('?') ? '&' : '?'}devState=${currentDevState}`);
    }
    setOpen(false);
  }

  function switchState(state: string) {
    const currentPath = location.pathname;
    const params = new URLSearchParams(searchParams);
    params.set('devState', state);
    navigate(`${currentPath}?${params.toString()}`);
    setOpen(false);
  }

  function switchTheme(theme: string) {
    const currentPath = location.pathname;
    const params = new URLSearchParams(searchParams);
    if (theme) { params.set('theme', theme); } else { params.delete('theme'); }
    navigate(`${currentPath}?${params.toString()}`);
  }

  function switchSurface(surface: string) {
    const currentPath = location.pathname;
    const params = new URLSearchParams(searchParams);
    if (surface) { params.set('surface', surface); } else { params.delete('surface'); }
    navigate(`${currentPath}?${params.toString()}`);
  }

  return (
    <div className="fixed bottom-3 left-3 z-[9999] select-none">
      {open && (
        <div className="mb-2 w-64 max-h-[80vh] overflow-y-auto rounded-xl bg-black/80 backdrop-blur-md text-white/90 shadow-2xl border border-white/10 text-[11px] font-mono">
          {/* Theme Picker */}
          <div className="px-3 py-2 text-white/40 uppercase tracking-widest text-[9px]">Theme</div>
          <div className="px-2 pb-2 flex flex-wrap gap-1">
            {THEME_OPTIONS.map((t) => (
              <button
                key={t.value}
                onClick={() => switchTheme(t.value)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] transition-colors ${
                  currentTheme === t.value ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10 text-white/70'
                }`}
                title={t.label}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: t.color }}
                />
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>

          {/* Surface Modifier */}
          <div className="border-t border-white/10 px-3 py-2 text-white/40 uppercase tracking-widest text-[9px]">Surface</div>
          <div className="px-2 pb-2 flex flex-wrap gap-1">
            {SURFACE_OPTIONS.map((s) => (
              <button
                key={s.value}
                onClick={() => switchSurface(s.value)}
                className={`px-2 py-1 rounded-md text-[10px] transition-colors ${
                  currentSurface === s.value ? 'bg-white/20 text-white font-bold' : 'hover:bg-white/10 text-white/70'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="border-t border-white/10 px-3 py-2 text-white/40 uppercase tracking-widest text-[9px]">Dev State</div>
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

          <div className="border-t border-white/10 mt-1">
            <button
              onClick={() => {
                try { localStorage.removeItem('devToolsEnabled'); } catch {}
                const url = new URL(window.location.href);
                url.searchParams.delete('dev');
                url.searchParams.delete('devState');
                url.searchParams.delete('theme');
                window.location.href = url.toString();
              }}
              className="w-full text-left px-3 py-2 text-red-400/70 hover:text-red-400 hover:bg-white/10 transition-colors"
            >
              ✕ Disable Dev Tools
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider bg-black/60 text-white/80 backdrop-blur-sm hover:bg-black/80 transition-colors"
      >
        DEV TOOLS{devState ? ` · ${devState}` : ''}{currentTheme ? ` · ${currentTheme}` : ''}
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>
    </div>
  );
}
