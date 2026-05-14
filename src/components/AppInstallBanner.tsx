import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

const APP_STORE_URL = 'https://apps.apple.com/se/app/bonki/id6762758746';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.bonkistudio.bonkiapp';
const DISMISSED_KEY = 'app-install-dismissed';

const MIDNIGHT_INK = '#1A1A2E';
const LANTERN_GLOW = '#FDF6E3';
const BONKI_ORANGE = '#E85D2C';

const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const isIOS = /iPhone|iPad|iPod/.test(userAgent) && !(typeof window !== 'undefined' && (window as any).MSStream);
const isAndroid = /Android/.test(userAgent);
const isMobile = isIOS || isAndroid;

export default function AppInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (!isMobile) return;
    if (typeof localStorage !== 'undefined' && localStorage.getItem(DISMISSED_KEY)) return;

    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (Capacitor.isNativePlatform()) return null;
  if (!isMobile) return null;
  if (!visible) return null;

  const storeUrl = isIOS ? APP_STORE_URL : PLAY_STORE_URL;
  const ctaLabel = isIOS ? 'Hämta i App Store' : 'Hämta på Google Play';

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, '1');
    } catch {}
    setVisible(false);
  };

  const openStore = () => {
    window.open(storeUrl, '_blank', 'noopener,noreferrer');
    dismiss();
  };

  return (
    <div
      role="region"
      aria-label="App install"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        backgroundColor: MIDNIGHT_INK,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: 1.3,
          color: LANTERN_GLOW,
        }}
      >
        Ladda ner appen för bästa upplevelsen
      </span>

      <button
        onClick={openStore}
        style={{
          flexShrink: 0,
          padding: '6px 14px',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '999px',
          border: 'none',
          cursor: 'pointer',
          backgroundColor: BONKI_ORANGE,
          color: '#FFFFFF',
          letterSpacing: '0.2px',
          fontFamily: 'inherit',
        }}
      >
        {ctaLabel}
      </button>

      <button
        onClick={dismiss}
        aria-label="Stäng"
        style={{
          flexShrink: 0,
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: LANTERN_GLOW,
          opacity: 0.6,
          fontSize: '18px',
          lineHeight: 1,
          padding: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}
