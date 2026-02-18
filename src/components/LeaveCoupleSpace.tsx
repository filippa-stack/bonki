import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCoupleSpaceContext as useCoupleSpace } from '@/contexts/CoupleSpaceContext';
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
import { toast } from 'sonner';

export default function LeaveCoupleSpace() {
  const { user } = useAuth();
  const { space } = useCoupleSpace();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  if (!user || !space) return null;

  const handleSwitchPartner = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) return;

      const res = await supabase.functions.invoke('leave-and-create-new-space', {
        headers: { Authorization: `Bearer ${accessToken}` },
        body: {},
      });

      if (res.error) {
        console.error('Partner switch failed:', res.error);
        toast.error('Något gick fel. Försök igen.');
        return;
      }

      localStorage.removeItem('vi-som-foraldrar-state');
      toast.success('Nytt utrymme skapat.');
      navigate('/', { replace: true });
      setTimeout(() => window.location.reload(), 100);
    } finally {
      setLoading(false);
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
          Avsluta koppling till partner
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-lg">Avsluta kopplingen?</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed space-y-2 pt-1">
            <span className="block">Du lämnar ert gemensamma utrymme.</span>
            <span className="block">Din partner behåller historiken där.</span>
            <span className="block">Du får skapa eller ansluta till ett nytt utrymme efteråt.</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSwitchPartner}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Avslutar…' : 'Avsluta koppling'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
