import { useState, useEffect, useRef } from 'react';
import { Plus, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const REAUTH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/** Returns the age of the current JWT in ms, or Infinity if unavailable. */
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

/** 3-second countdown hook. Returns [countdown | null, start, cancel]. */
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

export default function RelationSettings({
  onCreateNewSpace,
  onLeavePartner,
}: RelationSettingsProps) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const { appMode, cardId } = useNormalizedSessionContext();
  const hasActiveSession = (appMode === 'SESSION_ACTIVE' || appMode === 'SESSION_WAITING') && !!cardId;

  // ── "Skapa nytt utrymme" dialog state + 3s countdown ──
  const [newSpaceOpen, setNewSpaceOpen] = useState(false);
  const [newSpaceLoading, setNewSpaceLoading] = useState(false);
  const [newSpaceCountdown, startNewSpaceCountdown, cancelNewSpaceCountdown] = useCountdown(
    async () => {
      setNewSpaceOpen(false);
      setNewSpaceLoading(true);
      try { await onCreateNewSpace?.(); } finally { setNewSpaceLoading(false); }
    }
  );

  // ── "Byt partner" dialog state + 3s countdown ──
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [leaveCountdown, startLeaveCountdown, cancelLeaveCountdown] = useCountdown(
    async () => {
      setLeaveDialogOpen(false);
      await triggerLeave();
    }
  );

  // Re-auth OTP dialog
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
    <div className="border-t border-divider">
      {/* Collapsed toggle row */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <span>Relation &amp; utrymme</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="px-6 pb-6 space-y-6">

          {/* ── "Skapa nytt utrymme" ── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-foreground font-medium">Skapa nytt utrymme</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Starta ett nytt kapitel med samma partner. Historiken i det här utrymmet blir kvar här och följer inte med.
              </p>
            </div>

            {/* Controlled AlertDialog so we can lock it open during countdown */}
            <AlertDialog open={newSpaceOpen} onOpenChange={(v) => {
              if (!v) { cancelNewSpaceCountdown(); }
              setNewSpaceOpen(v);
            }}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={newSpaceLoading || hasActiveSession}
                  onClick={() => { if (!hasActiveSession) setNewSpaceOpen(true); }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Skapa nytt utrymme
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-lg">
                    Skapa ett nytt utrymme med samma partner?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
                    Ni får ett nytt tomt utrymme att fortsätta i. Det ni gjort här ligger kvar i det här utrymmet.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel onClick={cancelNewSpaceCountdown}>Avbryt</AlertDialogCancel>
                  <Button
                    variant="default"
                    disabled={newSpaceCountdown !== null && newSpaceCountdown > 0}
                    onClick={() => { if (newSpaceCountdown === null) startNewSpaceCountdown(); }}
                    className="min-w-[200px]"
                  >
                    {newSpaceCountdown !== null && newSpaceCountdown > 0
                      ? `Skapa nytt utrymme (${newSpaceCountdown})`
                      : 'Skapa nytt utrymme'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            {hasActiveSession && (
              <p className="text-[11px] text-muted-foreground/50 leading-snug">
                Ni är mitt i ett samtal. Avsluta det först.
              </p>
            )}
          </div>

          {/* ── AVANCERAT divider ── */}
          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 border-t border-border/30" />
            <span className="text-[10px] tracking-widest text-muted-foreground/40 uppercase font-medium">
              Avancerat
            </span>
            <div className="flex-1 border-t border-border/30" />
          </div>

          {/* ── "Byt partner" — destructive, deep-settings only ── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-destructive/80 font-medium">Byt partner</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Avsluta kopplingen till din nuvarande partner och skapa ett nytt tomt utrymme.
              </p>
            </div>

            <AlertDialog open={leaveDialogOpen} onOpenChange={(v) => {
              if (!v) cancelLeaveCountdown();
              setLeaveDialogOpen(v);
            }}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-destructive/70 hover:text-destructive hover:bg-destructive/5 border border-destructive/20 hover:border-destructive/40"
                  onClick={() => setLeaveDialogOpen(true)}
                >
                  <Unlink className="w-3.5 h-3.5" />
                  Byt partner
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-lg">
                    Byt partner?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
                    Kopplingen till din nuvarande partner avslutas. Det här utrymmet blir kvar som historik för dig, men ni fortsätter inte här tillsammans.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel onClick={cancelLeaveCountdown}>Avbryt</AlertDialogCancel>
                  <Button
                    variant="destructive"
                    disabled={leaveCountdown !== null && leaveCountdown > 0}
                    onClick={() => { if (leaveCountdown === null) startLeaveCountdown(); }}
                    className="min-w-[160px]"
                  >
                    {leaveCountdown !== null && leaveCountdown > 0
                      ? `Byt partner (${leaveCountdown})`
                      : 'Byt partner'}
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

        </div>
      )}

      {/* ── Re-auth OTP dialog ── */}
      <Dialog open={reauthOpen} onOpenChange={(v) => { if (!reauthLoading) setReauthOpen(v); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Bekräfta att det är du</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
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
            <Button
              variant="ghost"
              size="sm"
              disabled={reauthLoading}
              onClick={() => setReauthOpen(false)}
            >
              Avbryt
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={otp.length < 6 || reauthLoading}
              onClick={handleOtpVerify}
            >
              {reauthLoading ? 'Verifierar…' : 'Bekräfta och byt partner'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
