import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Bottom sheet for account actions. Mirrors the showLogoutSheet pattern in Header.tsx.
 * State is owned by the host page; this component is fully controlled.
 */
export default function KontoSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate('/login');
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'hsla(0, 0%, 0%, 0.25)' }}
      />
      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: '#F7F2EB',
          borderRadius: '16px 16px 0 0',
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 16px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div
          className="font-serif"
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#2C2420',
            padding: '20px 24px 16px',
            textAlign: 'left',
          }}
        >
          Konto
        </div>

        {/* Email row */}
        <div
          style={{
            fontSize: '13px',
            color: '#6B5E52',
            padding: '0 24px 20px',
          }}
        >
          {user?.email ? `Inloggad som ${user.email}` : 'Inloggad'}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'hsla(30, 15%, 20%, 0.10)' }} />

        {/* Integritetspolicy */}
        <button
          onClick={() => {
            onClose();
            navigate('/privacy');
          }}
          className="font-sans"
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: '#2C2420',
            padding: '16px 24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
          }}
        >
          Integritetspolicy
        </button>

        {/* Divider */}
        <div style={{ height: '1px', background: 'hsla(30, 15%, 20%, 0.10)' }} />

        {/* Logga ut */}
        <button
          onClick={handleSignOut}
          className="font-sans"
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: '#8B3A3A',
            padding: '16px 24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
          }}
        >
          Logga ut
        </button>

        {/* Radera konto */}
        <button
          onClick={() => {
            // TODO: wire in Prompt 5
          }}
          className="font-sans"
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: '#8B3A3A',
            opacity: 0.4,
            padding: '16px 24px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
          }}
        >
          Radera konto
        </button>
      </div>
    </div>
  );
}
