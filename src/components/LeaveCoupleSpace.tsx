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
          Byt partner
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif">Byt partner?</AlertDialogTitle>
          <AlertDialogDescription>
            Du får ett nytt gemensamt utrymme. Er tidigare historik blir kvar men följer inte med.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Avbryt</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSwitchPartner}
            disabled={loading}
          >
            {loading ? 'Skapar…' : 'Skapa nytt utrymme'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
