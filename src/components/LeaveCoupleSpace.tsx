import { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LogOut, Plus } from 'lucide-react';

export default function LeaveCoupleSpace() {
  const { user } = useAuth();
  const { space, refreshSpace } = useCoupleSpace();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Check for active session when component mounts / space changes
  useEffect(() => {
    if (!space?.id) return;
    const check = async () => {
      const { data } = await supabase
        .from('couple_progress')
        .select('current_session')
        .eq('couple_space_id', space.id)
        .maybeSingle();
      setHasActiveSession(!!data?.current_session);
    };
    check();
  }, [space?.id]);

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

      localStorage.removeItem('vi-som-foraldrar-state');
      setShowCompletion(true);
    } finally {
      setLeaving(false);
    }
  };

  const handleCreateNew = () => {
    setShowCompletion(false);
    // Navigate home first, then reload to trigger fresh space creation
    navigate('/', { replace: true });
    // Small delay to ensure navigation completes before reload
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <>
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
            <AlertDialogTitle className="font-serif">Byta partner</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3" asChild>
              <div>
                <p>
                  När du lämnar ert utrymme kan du inte längre se era delade reflektioner här.
                  Du kan skapa ett nytt utrymme och bjuda in en ny partner.
                </p>
                {hasActiveSession && (
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2 border border-amber-200 dark:border-amber-800">
                    Ni har en pågående konversation. Den avslutas för dig om du lämnar.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              disabled={leaving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {leaving ? 'Lämnar…' : 'Lämna utrymmet'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Post-leave completion screen */}
      <Dialog open={showCompletion} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm text-center [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader className="items-center">
            <DialogTitle className="font-serif text-xl">
              Du har lämnat utrymmet.
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Du kan börja om med en ny partner när du är redo.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={handleCreateNew} className="w-full gap-2 mt-2">
            <Plus className="w-4 h-4" />
            Skapa nytt utrymme
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
