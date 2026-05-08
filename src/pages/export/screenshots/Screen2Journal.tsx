/**
 * Screen 2 — Era samtal (Journal page). Visual replica with hardcoded
 * demo reflections from src/lib/exportScreenshot/demoJournal.ts.
 */
import { DEMO_REFLECTIONS } from '@/lib/exportScreenshot/demoJournal';

const MIDNIGHT_INK = '#1A1A2E';
const ON_COLOR = '#F5E8CC';
const SAFFRON = '#E9B44C';
const VV_BLUE = '#94BCE1';

export default function Screen2Journal() {
  // Show APRIL entries (the two real ones from Filippa's account).
  const month = 'APRIL 2026';
  const entries = DEMO_REFLECTIONS.filter((r) => r.monthLabel === month);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: MIDNIGHT_INK,
        padding: '170px 56px 0',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
      }}
    >
      {/* Page title */}
      <div style={{ textAlign: 'center' }}>
        <h1
          style={{
            fontFamily: '"Fraunces", serif',
            fontSize: 78,
            fontWeight: 500,
            color: ON_COLOR,
            margin: 0,
            letterSpacing: '-0.005em',
          }}
        >
          Era samtal
        </h1>
        <p style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 28, color: 'rgba(245,232,204,0.7)', margin: '14px 0 0' }}>
          Vad ni burit med er
        </p>
        <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: 28, color: 'rgba(245,232,204,0.85)', margin: '32px 0 0' }}>
          5 reflektioner från 19 samtal sedan februari.
        </p>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 12 }}>
        <Chip label="Alla" />
        <Chip label="Barn" />
        <Chip label="Par" active />
      </div>

      {/* Month divider */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingLeft: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ width: 12, height: 12, borderRadius: 999, background: SAFFRON }} />
          <span style={{ fontFamily: '"Fraunces", serif', fontSize: 26, color: 'rgba(245,232,204,0.85)', letterSpacing: '0.06em' }}>
            {month}
          </span>
        </span>
        <span style={{ fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 24, color: 'rgba(245,232,204,0.55)' }}>
          {entries.length} samtal
        </span>
      </div>

      {/* Entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginLeft: 30 }}>
        {entries.map((e, i) => (
          <ReflectionCard key={i} {...e} />
        ))}
      </div>

      {/* Bottom nav */}
      <BottomNav />
    </div>
  );
}

function Chip({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      style={{
        fontFamily: '"DM Sans", sans-serif',
        fontSize: 28,
        padding: active ? '14px 36px' : '14px 18px',
        borderRadius: 999,
        background: active ? 'rgba(232, 180, 105, 0.22)' : 'transparent',
        color: active ? '#E9C890' : 'rgba(245, 232, 204, 0.55)',
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  );
}

function ReflectionCard({
  product,
  cardTitle,
  date,
  question,
  body,
}: {
  product: string;
  cardTitle: string;
  date: string;
  question: string;
  body: string;
}) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 24,
        padding: '28px 30px 30px',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div>
          <p style={{ margin: 0, fontFamily: '"DM Sans", sans-serif', fontWeight: 600, fontSize: 26, color: VV_BLUE }}>{product}</p>
          <p style={{ margin: '6px 0 0', fontFamily: '"DM Sans", sans-serif', fontSize: 22, color: 'rgba(245,232,204,0.55)' }}>{cardTitle}</p>
        </div>
        <p style={{ margin: 0, fontFamily: '"DM Sans", sans-serif', fontSize: 22, color: 'rgba(245,232,204,0.55)' }}>{date}</p>
      </div>
      <p style={{ margin: '0 0 16px', fontFamily: '"Fraunces", serif', fontStyle: 'italic', fontSize: 26, color: 'rgba(245,232,204,0.92)', lineHeight: 1.35 }}>
        — {question}
      </p>
      <p style={{ margin: 0, fontFamily: '"Fraunces", serif', fontSize: 28, color: '#E9C890', lineHeight: 1.45 }}>{body}</p>
    </div>
  );
}

function BottomNav() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 160,
        background: 'rgba(11, 16, 38, 0.95)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingTop: 24,
        fontFamily: '"DM Sans", sans-serif',
        fontSize: 18,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        fontWeight: 600,
      }}
    >
      <NavItem icon="library" label="Biblioteket" color="rgba(245,232,204,0.55)" />
      <NavItem icon="home" label="Hem" color="rgba(245,232,204,0.55)" />
      <NavItem icon="book" label="Era samtal" color="#E85D2C" />
    </div>
  );
}

function NavItem({ icon, label, color }: { icon: 'library' | 'home' | 'book'; label: string; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color }}>
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {icon === 'library' && (
          <>
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </>
        )}
        {icon === 'home' && (
          <>
            <path d="M3 11l9-8 9 8" />
            <path d="M5 10v10h14V10" />
          </>
        )}
        {icon === 'book' && (
          <>
            <path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4z" />
            <path d="M20 4h-7a3 3 0 00-3 3v13a2 2 0 012-2h8z" />
          </>
        )}
      </svg>
      <span>{label}</span>
    </div>
  );
}
