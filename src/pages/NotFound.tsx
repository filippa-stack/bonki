import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import bonkiLogo from "@/assets/bonki-logo-transparent.png";
import BonkiButton from "@/components/BonkiButton";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#0B1026',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 48px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 32px)',
        paddingLeft: 32,
        paddingRight: 32,
        zIndex: 99999,
      }}
    >
      {/* Saffron ambient glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 60% 40% at 50% 38%, hsla(40, 78%, 61%, 0.14) 0%, transparent 70%)',
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
          maxWidth: 320,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <img
          src={bonkiLogo}
          alt="Bonki"
          style={{ width: 80, opacity: 0.4 }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            color: '#FDF6E3',
            margin: 0,
            fontWeight: 600,
          }}
        >
          Sidan finns inte
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 14,
            color: 'rgba(253, 246, 227, 0.5)',
            margin: 0,
          }}
        >
          Adressen verkar vara felaktig.
        </p>

        <BonkiButton
          variant="secondary"
          onClick={() => navigate('/')}
        >
          Tillbaka till start
        </BonkiButton>
      </div>
    </div>
  );
};

export default NotFound;
