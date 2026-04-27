import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { restorePurchases } from '@/lib/revenueCat';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [restoringPurchases, setRestoringPurchases] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleSignOut = async () => {
    onClose();
    await signOut();
    navigate('/login');
  };

  const handleRestorePurchases = async () => {
    if (restoringPurchases) return;
    setRestoringPurchases(true);

    try {
      const result = await restorePurchases();

      if (!result.success) {
        toast.error('Kunde inte återställa köp. Försök igen.');
        return;
      }

      if (result.restoredCount === 0) {
        toast.info('Inga tidigare köp hittades.');
        return;
      }

      toast.success('Dina köp har återställts.');
      setTimeout(() => {
        onClose();
        navigate('/');
      }, 1500);
    } finally {
      setRestoringPurchases(false);
    }
  };

  const handleOpenDelete = () => {
    setDeleteConfirmText('');
    setShowDeleteDialog(true);
  };

  const handleDeleteDialogChange = (next: boolean) => {
    if (deleting) return; // never allow dismissal mid-request
    setShowDeleteDialog(next);
    if (!next) setDeleteConfirmText('');
  };

  const canConfirmDelete = deleteConfirmText.trim() === 'RADERA';

  const handleConfirmDelete = async () => {
    if (!canConfirmDelete || deleting) return;
    setDeleting(true);

    try {
      const { error } = await supabase.functions.invoke('delete-account');

      if (error) {
        console.error('[KontoSheet] delete-account failed', error);
        toast.error(
          'Kunde inte radera kontot. Försök igen eller kontakta support.'
        );
        return;
      }

      toast.success('Ditt konto har raderats.');
      setShowDeleteDialog(false);
      onClose();
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('[KontoSheet] delete-account threw', err);
      toast.error(
        'Kunde inte radera kontot. Försök igen eller kontakta support.'
      );
    } finally {
      setDeleting(false);
    }
  };

  if (!open && !showDeleteDialog) return null;

  const isNative = Capacitor.isNativePlatform();

  return (
    <>
      {open && (
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

            {/* Mina köp — native iOS only */}
            {isNative && (
              <>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#6B5E52',
                    padding: '16px 24px 4px',
                  }}
                >
                  Mina köp
                </div>

                <button
                  onClick={handleRestorePurchases}
                  disabled={restoringPurchases}
                  className="font-sans"
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#2C2420',
                    padding: '12px 24px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: restoringPurchases ? 'default' : 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: restoringPurchases ? 0.6 : 1,
                  }}
                >
                  {restoringPurchases ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Återställer…
                    </>
                  ) : (
                    'Återställ köp'
                  )}
                </button>

                <div
                  style={{
                    fontSize: '13px',
                    color: '#6B5E52',
                    padding: '0 24px 16px',
                  }}
                >
                  Har du köpt Bonki på en annan enhet? Återställ dina köp här.
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: 'hsla(30, 15%, 20%, 0.10)' }} />
              </>
            )}

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
              onClick={handleOpenDelete}
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
              Radera konto
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={handleDeleteDialogChange}>
        <DialogContent
          className="max-w-md"
          style={{
            backgroundColor: '#F7F2EB',
            color: '#2C2420',
            border: '1px solid hsla(30, 15%, 20%, 0.12)',
          }}
        >
          <DialogTitle
            className="font-serif"
            style={{ fontSize: '20px', fontWeight: 600, color: '#2C2420' }}
          >
            Radera konto
          </DialogTitle>
          <DialogDescription
            className="font-sans"
            style={{ fontSize: '14px', color: '#6B5E52', lineHeight: 1.5 }}
          >
            Detta tar bort ditt konto och all din data permanent. Det går inte
            att ångra.
          </DialogDescription>

          <div style={{ marginTop: '8px' }}>
            <label
              htmlFor="delete-confirm"
              className="font-sans"
              style={{
                display: 'block',
                fontSize: '13px',
                color: '#6B5E52',
                marginBottom: '8px',
              }}
            >
              Skriv <strong style={{ color: '#2C2420' }}>RADERA</strong> för att
              bekräfta.
            </label>
            <input
              id="delete-confirm"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              disabled={deleting}
              className="font-sans"
              style={{
                width: '100%',
                fontSize: '15px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid hsla(30, 15%, 20%, 0.20)',
                background: '#FFFEFB',
                color: '#2C2420',
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginTop: '16px',
            }}
          >
            <button
              onClick={() => handleDeleteDialogChange(false)}
              disabled={deleting}
              className="font-sans"
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#2C2420',
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid hsla(30, 15%, 20%, 0.20)',
                borderRadius: '8px',
                cursor: deleting ? 'default' : 'pointer',
                opacity: deleting ? 0.5 : 1,
              }}
            >
              Avbryt
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={!canConfirmDelete || deleting}
              className="font-sans"
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#FFFEFB',
                padding: '10px 16px',
                background: '#8B3A3A',
                border: 'none',
                borderRadius: '8px',
                cursor: !canConfirmDelete || deleting ? 'default' : 'pointer',
                opacity: !canConfirmDelete || deleting ? 0.5 : 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {deleting && <Loader2 className="animate-spin" size={14} />}
              Radera permanent
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
