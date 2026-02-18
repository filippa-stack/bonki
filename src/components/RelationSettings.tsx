import { useState, useEffect, useRef } from 'react';
import { Plus, Unlink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
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

interface RelationSettingsProps {
  onCreateNewSpace?: () => void;
  onLeavePartner?: () => Promise<void>;
}

export default function RelationSettings({
  onCreateNewSpace,
  onLeavePartner,
}: RelationSettingsProps) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);

  // Leave confirmation dialog (controlled so we can keep it open during countdown)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Re-auth OTP dialog state
  const [reauthOpen, setReauthOpen] = useState(false);
  const [otp, setOtp] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthSent, setReauthSent] = useState(false);

  // Countdown effect — fires leave logic when it reaches 0
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setLeaveDialogOpen(false);
      handleLeaveConfirm();
      return;
    }
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c !== null && c > 0 ? c - 1 : c));
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [countdown]);

  const startCountdown = () => setCountdown(3);

  const cancelCountdown = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(null);
    setLeaveDialogOpen(false);
  };

  // Called when user confirms in the first AlertDialog
  const handleLeaveConfirm = async () => {
    const ageMs = getSessionAgeMs(session?.access_token);

    if (ageMs <= REAUTH_WINDOW_MS) {
      // Session is fresh — execute directly
      await onLeavePartner?.();
      return;
    }

    // Session is stale — trigger re-auth OTP
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

          {/* ── Secondary action: Create new space ── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-foreground font-medium">Skapa nytt gemensamt utrymme</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Ni får en ny tom plats att börja på. Er tidigare historik finns kvar i det gamla utrymmet.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  Skapa nytt utrymme
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-lg">
                    Skapa ett nytt gemensamt utrymme?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-1">
                    <span className="block">Ni får en ny tom plats att börja på.</span>
                    <span className="block">Er tidigare samtalshistorik finns kvar i ert nuvarande utrymme men följer inte med.</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                  <AlertDialogAction onClick={onCreateNewSpace}>
                    Skapa nytt utrymme
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-border/40" />

          {/* ── Destructive action: Leave partner ── */}
          <div className="space-y-3">
            <div>
              <p className="text-sm text-destructive/80 font-medium">Avsluta koppling till partner</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Du lämnar ert gemensamma utrymme. Din partner får behålla historiken där.
              </p>
            </div>
            <AlertDialog open={leaveDialogOpen} onOpenChange={(v) => {
              if (!v) cancelCountdown();
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
                  Avsluta koppling
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-serif text-lg">
                    Avsluta kopplingen?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-1">
                    <span className="block">Du lämnar ert gemensamma utrymme.</span>
                    <span className="block">Din partner behåller historiken där.</span>
                    <span className="block">Du får skapa eller ansluta till ett nytt utrymme efteråt.</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-2">
                  <AlertDialogCancel onClick={cancelCountdown}>Avbryt</AlertDialogCancel>
                  <Button
                    variant="destructive"
                    disabled={countdown !== null && countdown > 0}
                    onClick={() => {
                      if (countdown === null) startCountdown();
                    }}
                    className="min-w-[180px]"
                  >
                    {countdown !== null && countdown > 0
                      ? `Avslutar om ${countdown}…`
                      : 'Avsluta koppling'}
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
            <DialogTitle className="font-serif text-lg">Bekräfta din identitet</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
              {reauthSent
                ? 'Vi har skickat en engångskod till din e-postadress. Ange koden nedan för att fortsätta.'
                : 'Anger engångskod för att bekräfta åtgärden.'}
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
              {reauthLoading ? 'Verifierar…' : 'Bekräfta och avsluta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
