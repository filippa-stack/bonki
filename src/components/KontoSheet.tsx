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

  // Hämta webbköp dialog state
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkStep, setLinkStep] = useState<'idle' | 'code'>('idle');
  const [linkEmail, setLinkEmail] = useState('');
  const [linkOtp, setLinkOtp] = useState('');
  const [linkSending, setLinkSending] = useState(false);
  const [linkVerifying, setLinkVerifying] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

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

  // ===== Hämta webbköp =====
  const handleOpenLink = () => {
    setLinkStep('idle');
    setLinkEmail('');
    setLinkOtp('');
    setLinkError(null);
    setShowLinkDialog(true);
  };

  const handleLinkDialogChange = (next: boolean) => {
    if (linkSending || linkVerifying) return;
    setShowLinkDialog(next);
    if (!next) {
      setLinkStep('idle');
      setLinkEmail('');
      setLinkOtp('');
      setLinkError(null);
    }
  };

  const handleSendCode = async () => {
    const email = linkEmail.trim().toLowerCase();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setLinkError('Ange en giltig e-postadress.');
      return;
    }
    setLinkError(null);
    setLinkSending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) {
        const msg = (error.message ?? '').toLowerCase();
        if (msg.includes('not found') || msg.includes('signups not allowed') || msg.includes('signup')) {
          setLinkError(
            'Vi hittar inget köp kopplat till den e-postadressen. Kontrollera stavningen, eller prova en annan e-postadress du kan ha använt.'
          );
        } else {
          setLinkError('Något gick fel. Försök igen.');
        }
        return;
      }
      setLinkEmail(email);
      setLinkStep('code');
    } catch (err) {
      console.error('[KontoSheet] signInWithOtp threw', err);
      setLinkError('Något gick fel. Försök igen.');
    } finally {
      setLinkSending(false);
    }
  };

  const handleVerifyAndLink = async () => {
    const otp = linkOtp.trim();
    if (otp.length < 6) {
      setLinkError('Felaktig kod. Försök igen.');
      return;
    }
    setLinkError(null);
    setLinkVerifying(true);

    try {
      // 1. Capture original session BEFORE OTP verification swaps us in.
      const { data: { session: originalSession } } = await supabase.auth.getSession();
      if (!originalSession) {
        setLinkError('Något gick fel. Logga in igen och försök på nytt.');
        return;
      }

      // 2. Verify OTP — this temporarily signs us in as the source user.
      const { data: verifyData, error: verifyErr } = await supabase.auth.verifyOtp({
        email: linkEmail,
        token: otp,
        type: 'email',
      });
      if (verifyErr || !verifyData?.user) {
        setLinkError('Felaktig kod. Försök igen.');
        return;
      }
      const sourceUserId = verifyData.user.id;

      // 3. Restore original session BEFORE invoking the edge function.
      const { error: restoreErr } = await supabase.auth.setSession({
        access_token: originalSession.access_token,
        refresh_token: originalSession.refresh_token,
      });
      if (restoreErr) {
        console.error('[KontoSheet] setSession restore failed', restoreErr);
        await supabase.auth.signOut();
        setLinkError('Något gick fel. Logga in igen och försök på nytt.');
        return;
      }

      // 4. Migrate purchases.
      const { data, error: linkErr } = await supabase.functions.invoke('link-purchases', {
        body: { sourceUserId },
      });
      if (linkErr) {
        console.error('[KontoSheet] link-purchases failed', linkErr);
        setLinkError('Kunde inte hämta köpet. Försök igen eller kontakta support.');
        return;
      }

      const linked = data?.products_linked ?? 0;
      const alreadyOwned = data?.products_already_owned ?? 0;

      if (linked === 0 && alreadyOwned === 0) {
        toast.info('Inga köp att hämta för den e-postadressen.');
      } else if (linked === 0 && alreadyOwned > 0) {
        toast.info('Du har redan tillgång till de köp som finns på den e-postadressen.');
      } else if (linked === 1) {
        toast.success('Vi hämtade ditt köp.');
      } else {
        toast.success(`Vi hämtade ${linked} köp till ditt konto.`);
      }

      setShowLinkDialog(false);
      onClose();

      if (linked > 0) {
        // Reload to refresh useProductAccess everywhere — proven pattern from
        // ProductIntro.tsx after RevenueCat redemption.
        window.location.reload();
      }
    } catch (err) {
      console.error('[KontoSheet] verify+link threw', err);
      setLinkError('Något gick fel. Försök igen.');
    } finally {
      setLinkVerifying(false);
    }
  };

  if (!open && !showDeleteDialog && !showLinkDialog) return null;

  const isNative = Capacitor.isNativePlatform();
  const canSendCode = !!linkEmail.trim() && !linkSending;
  const canVerify = linkOtp.trim().length >= 6 && !linkVerifying;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50" onClick={onClose}>
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'hsla(230, 25%, 5%, 0.55)' }}
          />
          {/* Sheet */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              backgroundColor: '#1A1A2E',
              borderTop: '1px solid rgba(245, 232, 204, 0.08)',
              borderRadius: '20px 20px 0 0',
              // Cap height so destructive actions (Radera konto) cannot hide
              // behind safe-area or the BottomNav (56px + safe-area).
              // Per mem://design/layout/ios-safari-stability use 100vh, never 100dvh.
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              paddingLeft: 'env(safe-area-inset-left, 0px)',
              paddingRight: 'env(safe-area-inset-right, 0px)',
              // Reserve space for BottomNav (56px) + safe-area-inset-bottom,
              // so the last row scrolls clear of the nav on Library/Journal.
              paddingBottom:
                'calc(56px + max(env(safe-area-inset-bottom, 0px), 16px))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Title */}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '22px',
                fontWeight: 500,
                color: '#F5E8CC',
                padding: '24px 24px 8px',
                textAlign: 'left',
                letterSpacing: '-0.005em',
                lineHeight: 1.1,
              }}
            >
              Konto
            </div>

            {/* Email row */}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '13px',
                color: 'rgba(245, 232, 204, 0.65)',
                padding: '0 24px 24px',
              }}
            >
              {user?.email ? `Inloggad som ${user.email}` : 'Inloggad'}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(245, 232, 204, 0.10)' }} />

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
                color: '#F5E8CC',
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
            <div style={{ height: '1px', background: 'rgba(245, 232, 204, 0.10)' }} />

            {/* Mina köp — section visible on all platforms */}
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: '13px',
                letterSpacing: 0,
                color: 'rgba(245, 232, 204, 0.55)',
                padding: '16px 24px 4px',
              }}
            >
              Mina köp
            </div>

            {/* Hämta webbköp — all platforms */}
            <button
              onClick={handleOpenLink}
              className="font-sans"
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#F5E8CC',
                padding: '12px 24px 4px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
              }}
            >
              Hämta webbköp
            </button>
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(245, 232, 204, 0.55)',
                padding: '0 24px 16px',
              }}
            >
              Köpt på bonkiapp.com med en annan e-postadress? Hämta ditt köp hit.
            </div>

            {/* Återställ köp — native only */}
            {isNative && (
              <>
                <button
                  onClick={handleRestorePurchases}
                  disabled={restoringPurchases}
                  className="font-sans"
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#F5E8CC',
                    padding: '12px 24px 4px',
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
                    color: 'rgba(245, 232, 204, 0.55)',
                    padding: '0 24px 16px',
                  }}
                >
                  Har du köpt Bonki på en annan enhet? Återställ dina köp här.
                </div>
              </>
            )}

            {/* Divider */}
            <div style={{ height: '1px', background: 'rgba(245, 232, 204, 0.10)' }} />

            {/* Logga ut */}
            <button
              onClick={handleSignOut}
              className="font-sans"
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: 'rgba(245, 232, 204, 0.85)',
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
                padding: '16px 24px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#C56B6B',
                }}
              >
                Radera konto
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: '11px',
                  color: 'rgba(245, 232, 204, 0.45)',
                  lineHeight: 1.3,
                  marginTop: 2,
                }}
              >
                Permanent. Kan inte ångras.
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Hämta webbköp dialog */}
      <Dialog open={showLinkDialog} onOpenChange={handleLinkDialogChange}>
        <DialogContent
          className="max-w-md"
          style={{
            backgroundColor: '#1A1A2E',
            color: '#F5E8CC',
            border: '1px solid rgba(245, 232, 204, 0.10)',
          }}
        >
          <DialogTitle
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 500,
              color: '#F5E8CC',
              letterSpacing: '-0.005em',
            }}
          >
            Hämta ditt webbköp
          </DialogTitle>
          <DialogDescription
            className="font-sans"
            style={{ fontSize: '14px', color: 'rgba(245, 232, 204, 0.75)', lineHeight: 1.5 }}
          >
            Ange e-postadressen du använde när du köpte. Vi skickar en kod du
            fyller i för att bekräfta att det är ditt köp. Dina nuvarande
            inloggningsuppgifter ändras inte.
          </DialogDescription>

          {linkStep === 'idle' && (
            <div style={{ marginTop: '8px' }}>
              <label
                htmlFor="link-email"
                className="font-sans"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: 'rgba(245, 232, 204, 0.65)',
                  marginBottom: '8px',
                }}
              >
                E-postadress
              </label>
              <input
                id="link-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="din@epost.se"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                disabled={linkSending}
                className="font-sans"
                style={{
                  width: '100%',
                  fontSize: '15px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(245, 232, 204, 0.20)',
                  background: 'rgba(245, 232, 204, 0.06)',
                  color: '#F5E8CC',
                  outline: 'none',
                }}
              />
            </div>
          )}

          {linkStep === 'code' && (
            <div style={{ marginTop: '8px' }}>
              <div
                className="font-sans"
                style={{
                  fontSize: '13px',
                  color: 'rgba(245, 232, 204, 0.75)',
                  marginBottom: '12px',
                }}
              >
                Vi skickade en 6-siffrig kod till{' '}
                <strong style={{ color: '#F5E8CC' }}>{linkEmail}</strong>.
              </div>
              <label
                htmlFor="link-otp"
                className="font-sans"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  color: 'rgba(245, 232, 204, 0.65)',
                  marginBottom: '8px',
                }}
              >
                Kod
              </label>
              <input
                id="link-otp"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={6}
                placeholder="000000"
                value={linkOtp}
                onChange={(e) => setLinkOtp(e.target.value.replace(/\D/g, ''))}
                disabled={linkVerifying}
                className="font-sans"
                style={{
                  width: '100%',
                  fontSize: '17px',
                  letterSpacing: '0.2em',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(245, 232, 204, 0.20)',
                  background: 'rgba(245, 232, 204, 0.06)',
                  color: '#F5E8CC',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSendCode}
                disabled={linkSending}
                className="font-sans"
                style={{
                  marginTop: '10px',
                  fontSize: '13px',
                  color: 'rgba(245, 232, 204, 0.65)',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: linkSending ? 'default' : 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {linkSending ? 'Skickar…' : 'Skicka koden igen'}
              </button>
            </div>
          )}

          {linkError && (
            <div
              className="font-sans"
              style={{
                marginTop: '12px',
                fontSize: '13px',
                color: '#E89B9B',
                lineHeight: 1.4,
              }}
            >
              {linkError}
            </div>
          )}

          <div
            style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
              marginTop: '16px',
            }}
          >
            <button
              onClick={() => handleLinkDialogChange(false)}
              disabled={linkSending || linkVerifying}
              className="font-sans"
              style={{
                fontSize: '15px',
                fontWeight: 500,
                color: '#F5E8CC',
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid rgba(245, 232, 204, 0.20)',
                borderRadius: '8px',
                cursor: linkSending || linkVerifying ? 'default' : 'pointer',
                opacity: linkSending || linkVerifying ? 0.5 : 1,
              }}
            >
              Avbryt
            </button>
            {linkStep === 'idle' ? (
              <button
                onClick={handleSendCode}
                disabled={!canSendCode}
                className="font-sans"
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1A1A2E',
                  padding: '10px 16px',
                  background: '#F5E8CC',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !canSendCode ? 'default' : 'pointer',
                  opacity: !canSendCode ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {linkSending && <Loader2 className="animate-spin" size={14} />}
                Skicka kod
              </button>
            ) : (
              <button
                onClick={handleVerifyAndLink}
                disabled={!canVerify}
                className="font-sans"
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#1A1A2E',
                  padding: '10px 16px',
                  background: '#F5E8CC',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !canVerify ? 'default' : 'pointer',
                  opacity: !canVerify ? 0.5 : 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {linkVerifying && <Loader2 className="animate-spin" size={14} />}
                Hämta köp
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={handleDeleteDialogChange}>
        <DialogContent
          className="max-w-md"
          style={{
            backgroundColor: '#1A1A2E',
            color: '#F5E8CC',
            border: '1px solid rgba(245, 232, 204, 0.10)',
          }}
        >
          <DialogTitle
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '20px',
              fontWeight: 500,
              color: '#F5E8CC',
              letterSpacing: '-0.005em',
            }}
          >
            Radera konto
          </DialogTitle>
          <DialogDescription
            className="font-sans"
            style={{ fontSize: '14px', color: 'rgba(245, 232, 204, 0.75)', lineHeight: 1.5 }}
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
                color: 'rgba(245, 232, 204, 0.65)',
                marginBottom: '8px',
              }}
            >
              Skriv <strong style={{ color: '#F5E8CC' }}>RADERA</strong> för att
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
                border: '1px solid rgba(245, 232, 204, 0.20)',
                background: 'rgba(245, 232, 204, 0.06)',
                color: '#F5E8CC',
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
                color: '#F5E8CC',
                padding: '10px 16px',
                background: 'transparent',
                border: '1px solid rgba(245, 232, 204, 0.20)',
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
                color: '#1A1A2E',
                padding: '10px 16px',
                background: '#C56B6B',
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
