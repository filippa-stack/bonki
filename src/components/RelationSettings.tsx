import { useState, useEffect, useRef } from 'react';
import { useNormalizedSessionContext } from '@/contexts/NormalizedSessionContext';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const REAUTH_WINDOW_MS = 5 * 60 * 1000;

function getSessionAgeMs(accessToken: string | undefined): number {
  if (!accessToken) return Infinity;
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const iatMs = (payload.iat as number) * 1000;
    return Date.now() - iatMs;
  } catch {
    return Infinity;
  }
}

function useCountdown(onZero: () => void): [number | null, () => void, () => void] {
  const [countdown, setCountdown] = useState<number | null>(null);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);
  const onZeroRef = useRef(onZero);
  onZeroRef.current = onZero;

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onZeroRef.current();
      setCountdown(null);
      return;
    }
    ref.current = setInterval(() => {
      setCountdown((c) => (c !== null && c > 0 ? c - 1 : c));
    }, 1000);
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [countdown]);

  const start = () => setCountdown(3);
  const cancel = () => {
    if (ref.current) clearInterval(ref.current);
    setCountdown(null);
  };

  return [countdown, start, cancel];
}

interface RelationSettingsProps {
  onCreateNewSpace?: () => Promise<void> | void;
  onLeavePartner?: () => Promise<void>;
}

export default function RelationSettings({ onCreateNewSpace, onLeavePartner }: RelationSettingsProps) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const { appMode, cardId } = useNormalizedSessionContext();
  const hasActiveSession = (appMode === 'SESSION_ACTIVE' || appMode === 'SESSION_WAITING') && !!cardId;

  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [newSpaceLoading, setNewSpaceLoading] = useState(false);
  const [newSpaceCountdown, startNewSpaceCountdown, cancelNewSpaceCountdown] = useCountdown(
    async () => {
      setNewSpaceOpen(false);
      setNewSpaceLoading(true);
      try { await onCreateNewSpace?.(); } finally { setNewSpaceLoading(false); }
    }
  );

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveCountdown, startLeaveCountdown, cancelLeaveCountdown] = useCountdown(
    async () => {
      setLeaveDialogOpen(false);
      await triggerLeave();
    }
  );

  const [reauthOpen, setReauthOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthSent, setReauthSent] = useState(false);

  const triggerLeave = async () => {
    const ageMs = getSessionAgeMs(session?.access_token);
    if (ageMs <= REAUTH_WINDOW_MS) {
      await onLeavePartner?.();
      return;
    }
    const { error } = await supabase.auth.reauthenticate();
    if (error) {
      toast.error('Kunde inte skicka verifieringskod. Försök igen.');
      return;
    }
    setReauthSent(true);
    setOtp('');
    setReauthOpen(true);
  };

  const handleOtpVerify = async () => {
    if (!session?.user?.email) return;
    setReauthLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: session.user.email,
        token: otp.trim(),
        type: 'reauthentication' as any,
      });
      if (error) {
        toast.error('Fel kod. Kontrollera din e-post och försök igen.');
        return;
      }
      setReauthOpen(false);
      await onLeavePartner?.();
    } finally {
      setReauthLoading(false);
    }
  };

  return (
    <div className="border-t" style={{ borderColor: '#ECEAE5' }}>
      {/* Collapsed toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-sm transition-opacity hover:opacity-70"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        <span>Relation &amp; utrymme</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-6 pb-8 space-y-8">

          {/* Skapa nytt utrymme */}
          <div className="space-y-3">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Skapa nytt utrymme</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Starta ett nytt kapitel med samma partner. Historiken i det här utrymmet blir kvar här och följer inte med.
            </p>

            <AlertDialog open={newSpaceOpen} onOpenChange={(v) => {
              if (!v) cancelNewSpaceCountdown();
              setNewSpaceOpen(v);
            }}>
              <AlertDialogTrigger asChild>
                <button
                  disabled={newSpaceLoading || hasActiveSession}
                  onClick={() => { if (!hasActiveSession) setNewSpaceOpen(true); }}
                  className="text-sm underline underline-offset-4 transition-opacity hover:opacity-70 disabled:opacity-30"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  Skapa nytt utrymme
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-lg">
                    Skapa ett nytt utrymme med samma partner?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm leading-relaxed pt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Ni får ett nytt tomt utrymme att fortsätta i. Det ni gjort här ligger kvar i det här utrymmet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel onClick={cancelNewSpaceCountdown}>Avbryt</AlertDialogCancel>
                  <button
                    disabled={newSpaceCountdown !== null && newSpaceCountdown > 0}
                    onClick={() => { if (newSpaceCountdown === null) startNewSpaceCountdown(); }}
                    className="px-4 py-2 rounded-button text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--color-button-primary)', color: 'var(--color-button-text)' }}
                  >
                    {newSpaceCountdown !== null && newSpaceCountdown > 0
                      ? `Skapa nytt utrymme (${newSpaceCountdown})`
                      : 'Skapa nytt utrymme'}
                  </button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {hasActiveSession && (
              <p className="text-[11px] leading-snug" style={{ color: 'var(--color-text-secondary)', opacity: 0.5 }}>
                Ni är mitt i ett samtal. Avsluta det först.
              </p>
            )}
          </div>

          {/* Avancerat divider — extremely subtle */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t" style={{ borderColor: '#ECEAE5' }} />
            <span className="text-[10px] tracking-widest uppercase" style={{ color: 'var(--color-text-secondary)', opacity: 0.4 }}>
              Avancerat
            </span>
            <div className="flex-1 border-t" style={{ borderColor: '#ECEAE5' }} />
          </div>

          {/* Byt partner — destructive, text-only */}
          <div className="space-y-3">
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>Byt partner</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Avsluta kopplingen till din nuvarande partner och skapa ett nytt tomt utrymme.
            </p>

            <AlertDialog open={leaveDialogOpen} onOpenChange={(v) => {
              if (!v) cancelLeaveCountdown();
              setLeaveDialogOpen(v);
            }}>
              <AlertDialogTrigger asChild>
                <button
                  onClick={() => setLeaveDialogOpen(true)}
                  className="text-sm underline underline-offset-4 transition-opacity hover:opacity-70"
                  style={{ color: '#8B3A3A' }}
                >
                  Byt partner
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-lg">Byt partner?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm leading-relaxed pt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Kopplingen till din nuvarande partner avslutas. Det här utrymmet blir kvar som historik för dig, men ni fortsätter inte här tillsammans.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel onClick={cancelLeaveCountdown}>Avbryt</AlertDialogCancel>
                  <button
                    disabled={leaveCountdown !== null && leaveCountdown > 0}
                    onClick={() => { if (leaveCountdown === null) startLeaveCountdown(); }}
                    className="px-4 py-2 rounded-button text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
                    style={{ color: '#8B3A3A' }}
                  >
                    {leaveCountdown !== null && leaveCountdown > 0
                      ? `Byt partner (${leaveCountdown})`
                      : 'Byt partner'}
                  </button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Re-auth OTP dialog */}
      <Dialog open={reauthOpen} onOpenChange={(v) => { if (!reauthLoading) setReauthOpen(v); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Bekräfta att det är du</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed pt-1" style={{ color: 'var(--color-text-secondary)' }}>
              {reauthSent
                ? 'Vi har skickat en engångskod till din e-postadress. Ange koden nedan för att fortsätta.'
                : 'För att byta partner behöver du bekräfta ditt konto.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-siffrig kod"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center tracking-widest text-lg"
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2">
            <button
              disabled={reauthLoading}
              onClick={() => setReauthOpen(false)}
              className="text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Avbryt
            </button>
            <button
              disabled={otp.length < 6 || reauthLoading}
              onClick={handleOtpVerify}
              className="text-sm font-medium transition-opacity hover:opacity-70 disabled:opacity-40"
              style={{ color: '#8B3A3A' }}
            >
              {reauthLoading ? 'Verifierar…' : 'Bekräfta och byt partner'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
