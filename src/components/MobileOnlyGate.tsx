import { ReactNode, useState, useMemo, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isDemoMode, isDemoParam, enterDemoMode } from '@/lib/demoMode';

const DESKTOP_ALLOWED_ROUTES = ['/analytics', '/login', '/flowcharts.html', '/kids-family-journey-flowchart.html', '/user-journey-flowchart.html', '/color-palette.html'];

const ADMIN_USER_IDS = [
  'b29f4c84-0426-4b8f-9293-dccf9141a4b5',
  '8105cd94-be94-473e-977a-883e461cfea8',
  '999288dd-b73a-4829-9d0d-72a8b54b6385',
];

/** When inside an iframe (demo simulator), skip the gate entirely */
function isInsideDemoFrame(): boolean {
  if (typeof window === 'undefined') return false;
  try { return window.self !== window.top; } catch { return true; }
}

export default function MobileOnlyGate({ children }: { children: ReactNode }) {

  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const demoActive = isDemoParam() || isDemoMode();
  const insideFrame = isInsideDemoFrame();
  const isDesktopAllowed = !demoActive && DESKTOP_ALLOWED_ROUTES.some(r => location.pathname.startsWith(r));
  const isAdmin = !demoActive && user && ADMIN_USER_IDS.includes(user.id);

  // Build iframe URL: current path + existing params + _frame=1 + demo=1
  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('demo', '1');
    return `${location.pathname}?${params.toString()}`;
  }, [location.pathname, location.search]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Inside the demo iframe — auto-enter demo mode and render content directly
  useEffect(() => {
    if (insideFrame && isDemoParam() && !isDemoMode()) {
      enterDemoMode();
    }
  }, [insideFrame]);

  if (insideFrame) {
    return <>{children}</>;
  }

  if (isDesktopAllowed || isAdmin) {
    return <>{children}</>;
  }

  // Demo mode: show in phone-shaped iframe on desktop so media queries work naturally
  if (demoActive) {
    return (
      <>
        {/* Desktop: phone simulator with iframe */}
        <div className="hidden lg:flex min-h-screen items-center justify-center" style={{ backgroundColor: '#1a1a1a' }}>
          <div className="flex flex-col items-center gap-4">
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Demo – mobilvy
            </span>
            <div
              style={{
                width: 390,
                height: 844,
                borderRadius: 40,
                overflow: 'hidden',
                boxShadow: '0 0 0 8px #333, 0 20px 60px rgba(0,0,0,0.5)',
                position: 'relative',
              }}
            >
              <iframe
                src={iframeSrc}
                title="Demo preview"
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  backgroundColor: '#1A1A2E',
                }}
              />
            </div>
          </div>
        </div>
        {/* Mobile: render normally */}
        <div className="lg:hidden contents">
          {children}
        </div>
      </>
    );
  }

  // No desktop blocker — render content directly
  return <>{children}</>;
}