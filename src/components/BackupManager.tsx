import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Archive, Download, Trash2, Plus, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';
import type { Category, Card } from '@/types';

interface Backup {
  id: string;
  name: string;
  created_at: string;
  categories: Json;
  cards: Json;
  background_color: string | null;
}

export default function BackupManager() {
  const { user } = useAuth();
  const { categories, cards, backgroundColor } = useApp();
  const [open, setOpen] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [backupName, setBackupName] = useState('');

  const loadBackups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_backups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBackups(data || []);
    } catch (err) {
      console.error('Failed to load backups:', err);
      toast({
        title: 'Kunde inte ladda säkerhetskopior',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      loadBackups();
    }
  }, [open, user]);

  const createBackup = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const name = backupName.trim() || `Backup ${new Date().toLocaleString('sv-SE')}`;
      
      const { error } = await supabase
        .from('user_backups')
        .insert({
          user_id: user.id,
          name,
          background_color: backgroundColor || null,
          categories: JSON.parse(JSON.stringify(categories)) as Json,
          cards: JSON.parse(JSON.stringify(cards)) as Json,
        });

      if (error) throw error;

      toast({
        title: 'Säkerhetskopia skapad',
        description: name,
      });
      setBackupName('');
      loadBackups();
    } catch (err) {
      console.error('Failed to create backup:', err);
      toast({
        title: 'Kunde inte skapa säkerhetskopia',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const restoreBackup = async (backup: Backup) => {
    if (!user) return;
    
    const confirmed = window.confirm(
      `Vill du återställa "${backup.name}"? Dina nuvarande inställningar kommer att ersättas.`
    );
    if (!confirmed) return;

    setRestoring(backup.id);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          background_color: backup.background_color,
          categories: backup.categories,
          cards: backup.cards,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Återställning klar',
        description: 'Ladda om sidan för att se ändringarna.',
      });
      
      // Reload the page to apply changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error('Failed to restore backup:', err);
      toast({
        title: 'Kunde inte återställa',
        variant: 'destructive',
      });
      setRestoring(null);
    }
  };

  const deleteBackup = async (backup: Backup) => {
    const confirmed = window.confirm(
      `Vill du ta bort "${backup.name}"? Detta kan inte ångras.`
    );
    if (!confirmed) return;

    setDeleting(backup.id);
    try {
      const { error } = await supabase
        .from('user_backups')
        .delete()
        .eq('id', backup.id);

      if (error) throw error;

      toast({
        title: 'Säkerhetskopia borttagen',
      });
      loadBackups();
    } catch (err) {
      console.error('Failed to delete backup:', err);
      toast({
        title: 'Kunde inte ta bort',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Archive className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">Backup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Säkerhetskopior</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Create new backup */}
          <div className="flex gap-2">
            <Input
              placeholder="Namn (valfritt)"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              className="flex-1"
            />
            <Button onClick={createBackup} disabled={creating} size="sm">
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span className="ml-1">Skapa</span>
            </Button>
          </div>

          {/* Backup list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : backups.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Inga säkerhetskopior än
              </p>
            ) : (
              backups.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{backup.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(backup.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => restoreBackup(backup)}
                      disabled={restoring === backup.id}
                      title="Återställ"
                    >
                      {restoring === backup.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => deleteBackup(backup)}
                      disabled={deleting === backup.id}
                      title="Ta bort"
                    >
                      {deleting === backup.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
