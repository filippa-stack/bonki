import bonkiLogo from '@/assets/bonki-logo-transparent.png';

const KEYFRAMES = `
@keyframes bonkiBreath {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
`;

export default function BonkiLoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0B1026',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />

      {/* Saffron ambient glow */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '340px',
          height: '380px',
          background:
            'radial-gradient(ellipse 70% 60% at 50% 45%, hsla(40, 78%, 61%, 0.14) 0%, hsla(40, 70%, 50%, 0.06) 40%, transparent 75%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <img
          src={bonkiLogo}
          alt=""
          aria-hidden
          style={{
            width: 100,
            height: 'auto',
            animation: 'bonkiBreath 2s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: 24,
            height: 1.5,
            backgroundColor: 'hsla(40, 78%, 61%, 0.3)',
            borderRadius: 1,
            animation: 'bonkiBreath 2s ease-in-out infinite',
          }}
        />
      </div>
    </div>
  );
}
