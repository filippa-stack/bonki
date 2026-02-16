import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpace } from '@/hooks/useCoupleSpace';
import { supabase } from '@/integrations/supabase/client';
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
import { LogOut } from 'lucide-react';

export default function LeaveCoupleSpace() {
  const { user } = useAuth();
  const { space, refreshSpace } = useCoupleSpace();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  if (!user || !space) return null;

  const handleLeave = async () => {
    setLeaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) return;

      const res = await supabase.functions.invoke('leave-couple-space', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: { couple_space_id: space.id },
      });

      if (res.error) {
        console.error('Leave failed:', res.error);
        return;
      }

      // Clear local state and redirect
      localStorage.removeItem('vi-som-foraldrar-state');
      await refreshSpace();
      navigate('/', { replace: true });
      window.location.reload();
    } finally {
      setLeaving(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive/60 hover:text-destructive hover:bg-destructive/5 text-xs gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          Lämna parutrymmet
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">Vill du lämna ert utrymme?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <span className="block">
              Dina egna anteckningar och reflektioner sparas, men du kommer inte längre kunna se delade samtal eller din partners tankar.
            </span>
            <span className="block text-muted-foreground/70">
              Du kan alltid skapa ett nytt utrymme eller bli inbjuden igen.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            disabled={leaving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {leaving ? 'Lämnar…' : 'Lämna'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
